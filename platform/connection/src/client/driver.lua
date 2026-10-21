local json = require("json")
local base64 = require("base64")
local uuid = require("uuid")
local hash = require("hash")
local http = require("http")
local schema = require("schema")
local types = require("types")
local M = {}

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, message = message})
end

function M.encode(value: string): string
    return (value:gsub("[^%w%-%_%.%~]", function(c: string): string return string.format("%%%02X", string.byte(c)) end))
end

local function pick(params: types.Object, names: { string }?): types.Object
    local result: types.Object = {}
    for _, name in ipairs(names or {}) do if params[name] ~= nil then result[name] = params[name] end end
    return result
end

-- Dropbox content APIs carry JSON in an HTTP header and require ASCII there.
-- Escape UTF-8 code points, including surrogate pairs for non-BMP filenames.
local function header_json(value: types.Object): string
    local encoded = json.encode(value) :: string
    return (encoded:gsub("[\194-\244][\128-\191]*", function(sequence: string): string
        local first = string.byte(sequence, 1)
        local code = first % (2 ^ (7 - #sequence))
        for index = 2, #sequence do code = code * 64 + string.byte(sequence, index) - 128 end
        if code < 65536 then return string.format("\\u%04x", code) end
        code = code - 65536
        return string.format("\\u%04x\\u%04x", 55296 + math.floor(code / 1024), 56320 + code % 1024)
    end):gsub("\127", "\\u007f"))
end

local function query_parts(parts: { string }, name: string, value: unknown, array_format: string?)
    if type(value) == "table" then
        for key, child in pairs(value) do
            local suffix = type(key) == "number" and (type(child) == "table" and "[" .. tostring(key - 1) .. "]" or (array_format == "repeat" and "" or "[]"))
                or "[" .. tostring(key) .. "]"
            query_parts(parts, name .. suffix, child, array_format)
        end
    else parts[#parts + 1] = M.encode(name) .. "=" .. M.encode(tostring(value)) end
end

-- Called only with provider-owned configuration, never a tool-supplied route.
function M.prepare(config: types.Config, operation: types.Operation, params: types.Object): (types.Request?, error?)
    if not schema.json(params) then return nil, invalid("params must contain bounded JSON values") end
    local validation = schema.validate(params, operation.schema)
    if validation then return nil, invalid(validation) end
    local values: types.Object = {}
    for key, value in pairs(operation.defaults or {}) do values[key] = value end
    for key, value in pairs(params) do values[key] = value end
    local endpoint = config.endpoints[operation.endpoint or "api"]
    if not endpoint or not http.valid_endpoint(endpoint) or endpoint:find("?", 1, true) then
        return nil, invalid("Invalid configured provider endpoint")
    end
    local path = operation.path:gsub("{([%w_]+)}", function(key: string): string
        return M.encode(tostring(values[key] or ""))
    end)
    local parts: { string } = {}
    for key, value in pairs(pick(values, operation.query)) do query_parts(parts, key, value, config.query_array_format) end
    table.sort(parts)
    local headers = {Accept = "application/json", ["Content-Type"] = "application/json"}
    for key, value in pairs(config.headers or {}) do headers[key] = value end
    for key, value in pairs(operation.headers or {}) do headers[key] = value end
    for field, header in pairs(operation.header_fields or {}) do
        if values[field] ~= nil then
            local value = tostring(values[field])
            if value:find("[%c]") then return nil, invalid("Invalid header field " .. field) end
            headers[header] = value
        end
    end
    local request: types.Request = {method = operation.method, url = endpoint:gsub("/$", "") .. path,
        headers = headers, raw = operation.mode == "download"}
    if #parts > 0 then request.url = request.url .. "?" .. table.concat(parts, "&") end
    local body = pick(values, operation.body)
    local body_schema: types.Schema = operation.schema
    local nulls: types.Object? = nil
    if operation.clear_parent and type(values.clear_fields) == "table" then
        local fields: types.Object = {}
        local parent = operation.clear_parent == "" and values or values[operation.clear_parent]
        for _, field in ipairs(values.clear_fields :: {string}) do
            if type(parent) == "table" and (parent :: types.Object)[field] ~= nil then
                return nil, invalid("A field cannot be set and cleared in the same operation")
            end
            fields[field] = true
        end
        if operation.clear_parent == "" then nulls = fields
        else
            nulls = {[operation.clear_parent] = fields}
            if body[operation.clear_parent] == nil then body[operation.clear_parent] = {} end
        end
    end
    if operation.document then
        body = {query = operation.document, variables = body}
        body_schema = {type = "object", properties = {query = {type = "string"}, variables = operation.schema}}
        if nulls then nulls = {variables = nulls} end
    end
    if operation.mode == "upload" or operation.mode == "box_part" then
        local encoded = values.content_base64
        if type(encoded) ~= "string" then return nil, invalid("content_base64 is required") end
        local content, decode_err = base64.decode(encoded)
        if decode_err or not content then return nil, invalid("Invalid base64 file content") end
        if #content > 8388608 then return nil, invalid("Upload exceeds the 8 MiB single-request limit") end
        request.body = content
        headers["Content-Type"] = "application/octet-stream"
        if operation.mode == "box_part" then
            local offset, total = tonumber(values.offset) or 0, tonumber(values.total_size) or 0
            if #content == 0 or offset + #content > total then return nil, invalid("Upload part range is outside the file") end
            headers["Content-Range"] = "bytes " .. tostring(offset) .. "-" .. tostring(offset + #content - 1) .. "/" .. tostring(total)
            local digest, digest_err = hash.sha1(content, true)
            if digest_err or not digest then return nil, errors.new({kind = errors.INTERNAL, message = "Cannot calculate upload digest"}) end
            headers.Digest = "sha=" .. base64.encode(digest)
        else headers["Dropbox-API-Arg"] = header_json(pick(values, operation.argument)) end
    elseif operation.mode == "multipart" or operation.mode == "notion_upload" then
        local content, decode_err = base64.decode(tostring(values.content_base64 or ""))
        if decode_err or not content then return nil, invalid("Invalid base64 file content") end
        if #content > 8388608 then return nil, invalid("Upload exceeds the 8 MiB single-request limit") end
        local boundary = "kickside-" .. tostring(uuid.v4())
        local attributes: types.Object = {name = values.name, parent = {id = values.parent_id}}
        if values.name == nil then attributes = {} end
        local prefix = operation.mode == "multipart" and ("--" .. boundary .. "\r\nContent-Disposition: form-data; name=\"attributes\"\r\nContent-Type: application/json\r\n\r\n"
            .. (json.encode(attributes) :: string) .. "\r\n") or ""
        if operation.mode == "notion_upload" and values.part_number then
            prefix = "--" .. boundary .. "\r\nContent-Disposition: form-data; name=\"part_number\"\r\n\r\n" .. tostring(values.part_number) .. "\r\n"
        end
        request.body = prefix .. "--" .. boundary
            .. "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"upload\"\r\nContent-Type: application/octet-stream\r\n\r\n"
            .. content .. "\r\n--" .. boundary .. "--\r\n"
        headers["Content-Type"] = "multipart/form-data; boundary=" .. boundary
    elseif operation.mode == "download" and operation.argument then
        headers["Dropbox-API-Arg"] = header_json(pick(values, operation.argument))
        request.body = ""
        headers["Content-Type"] = "application/octet-stream"
    elseif operation.mode == "null" then request.body = "null"
    elseif operation.mode == "box_commit" then
        local digest = values.sha1_base64
        if type(digest) ~= "string" then return nil, invalid("Whole-file SHA-1 digest is required") end
        local decoded, digest_err = base64.decode(digest)
        if digest_err or not decoded or #decoded ~= 20 then return nil, invalid("Invalid whole-file SHA-1 digest") end
        headers.Digest = "sha=" .. digest
        request.body = schema.encode(body, body_schema, nulls)
    elseif operation.body_root then request.body = schema.encode(values[operation.body_root],
        operation.schema.properties and operation.schema.properties[operation.body_root])
    elseif operation.method ~= "GET" and operation.method ~= "DELETE" then
        request.body = schema.encode(body, body_schema, nulls)
    end
    return request, nil
end

-- Credential fields are removed recursively from both successful API payloads
-- and GraphQL errors. This never mutates the provider's decoded object.
function M.sanitize(value: unknown, depth: number?): unknown
    local level = depth or 0
    if level > 32 then return nil end
    if type(value) ~= "table" then return value end
    local result: types.Object = {}
    for key, child in pairs(value) do
        local name = tostring(key):lower():gsub("[%-%_]", "")
        if name ~= "accesstoken" and name ~= "refreshtoken" and name ~= "apikey" and name ~= "clientsecret"
            and name ~= "authorization" and name ~= "password" and name ~= "setcookie" then
            result[key] = M.sanitize(child, level + 1)
        end
    end
    return result
end

function M.new(config: types.Config, dependencies: types.Object?): types.Driver
    local deps = dependencies or {}
    local client = (deps.client or http.new(deps)) :: types.Client
    local driver = {}

    function driver.run(action: string, params: types.Object?, selected: string?, write: boolean, deadline: string?): (types.Result?, error?)
        local operation = config.operations[action]
        if not operation or operation.write ~= write then return nil, invalid("Action is not available on this capability") end
        local request, validation_err = M.prepare(config, operation, params or {})
        if not request then return nil, validation_err end
        local connection, connect_err = client.connect(config.provider, selected, write, deadline, config.api_key_scheme)
        if not connection then return nil, connect_err end
        local result, request_err = client.request(connection, request)
        if not result then return nil, request_err end
        if result.success and operation.document and type(result.data) == "table" then
            local payload = result.data :: types.Object
            -- GraphQL can return errors with HTTP 200, including partial data.
            if payload.errors ~= nil then
                return {success = false, status_code = result.status_code, error = "GraphQL operation failed",
                    data = M.sanitize({errors = payload.errors})}
            end
            local data = payload.data
            if type(data) ~= "table" then return nil, errors.new({kind = errors.INTERNAL, message = "GraphQL response is missing data"}) end
            result.data = operation.extract and (data :: types.Object)[operation.extract] or data
        end
        if result.success and type(result.data) == "table" then
            local data = result.data :: types.Object
            if operation.cursor_field then
                local cursor = data[operation.cursor_field]
                if type(cursor) == "string" and cursor ~= "" then result.next_cursor = cursor
                elseif type(cursor) == "number" then result.next_cursor = tostring(cursor) end
            end
            if operation.has_more_field then
                result.has_more = data[operation.has_more_field] == true
                if not result.has_more then result.next_cursor = nil end
            end
            if type(data.pageInfo) == "table" then
                local page = data.pageInfo :: types.Object
                result.has_more = page.hasNextPage == true
                if result.has_more and type(page.endCursor) == "string" then result.next_cursor = page.endCursor end
            end
            -- Box supports marker pagination; an empty marker terminates it.
            if type(data.next_marker) == "string" and data.next_marker ~= "" then result.next_cursor = data.next_marker end
            if operation.offset_page and type(data.entries) == "table" and type(data.total_count) == "number" then
                local offset = tonumber(data.offset) or tonumber(params and params.offset) or 0
                local count = #(data.entries :: {unknown})
                result.has_more = count > 0 and offset + count < data.total_count
                if result.has_more then result.next_cursor = tostring(offset + count) end
            end
        end
        result.data = M.sanitize(result.data)
        return result, nil
    end
    return driver :: types.Driver
end
return M
