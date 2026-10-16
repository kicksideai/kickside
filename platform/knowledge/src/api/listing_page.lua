local json = require("json")
local base64 = require("base64")
type Map = { [string]: any }
local M = {}
local PAGE = 200
local MAX_RESPONSE = 2000

local function invalid_cursor(): error
    return errors.new({ kind = errors.INVALID, message = "invalid knowledge continuation cursor" })
end

local function position(cursor: any, query: string): (integer?, error?)
    if cursor == nil or cursor == "" then return 0, nil end
    if type(cursor) ~= "string" then return nil, invalid_cursor() end
    local raw, decode_err = base64.decode(cursor)
    if decode_err or type(raw) ~= "string" then return nil, invalid_cursor() end
    local value, parse_err = json.decode(raw)
    if parse_err or type(value) ~= "table" then return nil, invalid_cursor() end
    local decoded = value :: Map
    local offset = decoded.offset
    if decoded.version ~= 1 or decoded.query ~= query or type(offset) ~= "number"
        or offset < 0 or offset % 1 ~= 0 or offset > 9007199254740991 then
        return nil, invalid_cursor()
    end
    return math.tointeger(offset), nil
end

local function continuation(offset: integer, query: string): (string?, any?)
    local raw, encode_err = json.encode({ version = 1, offset = offset, query = query })
    if encode_err then return nil, encode_err end
    if type(raw) ~= "string" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "knowledge cursor encoding returns no value" })
    end
    local encoded, pack_err = base64.encode(raw)
    if pack_err then return nil, pack_err end
    if type(encoded) ~= "string" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "knowledge cursor packing returns no value" })
    end
    return encoded, nil
end

local function read(query: any, filter: Map): ({ Map }?, any?)
    local page, err = query(filter)
    if err then return nil, err end
    if type(page) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "knowledge component query returns no rows result" })
    end
    return page, nil
end

local function selected(query: any, impl_ids: { string }, ids: Map): (Map?, any?)
    local wanted: { string } = {}
    for id in pairs(ids) do wanted[#wanted + 1] = id end
    table.sort(wanted)
    local components: { Map } = {}
    for start = 1, #wanted, PAGE do
        local batch: { string } = {}
        for i = start, math.min(#wanted, start + PAGE - 1) do batch[#batch + 1] = wanted[i] end
        local page, err = read(query, { impl_ids = impl_ids, component_ids = batch,
            include = { meta = true }, order_by = { field = "created_at", direction = "DESC" }, limit = #batch })
        if err then return nil, err end
        for _, row in ipairs(page or {}) do components[#components + 1] = row end
    end
    table.sort(components, function(a: Map, b: Map): boolean
        local a_at, b_at = tostring(a.created_at or ""), tostring(b.created_at or "")
        if a_at == b_at then return tostring(a.component_id) > tostring(b.component_id) end
        return a_at > b_at
    end)
    return { components = components, has_more = false }, nil
end

function M.collect(query: any, impl_ids: { string }, options: Map): (Map?, any?)
    local search = options.query or ""
    local offset, cursor_err = position(options.cursor, search)
    if cursor_err then return nil, cursor_err end
    if options.ids and options.cursor ~= nil and options.cursor ~= "" then return nil, invalid_cursor() end
    if #impl_ids == 0 then return { components = {}, has_more = false }, nil end
    if options.ids then return selected(query, impl_ids, options.ids) end
    local limit = options.limit or MAX_RESPONSE
    local components: { Map } = {}
    local scanned = offset :: integer
    while true do
        local page, err = read(query, { impl_ids = impl_ids, include = { meta = true },
            order_by = { field = "created_at", direction = "DESC" }, limit = PAGE, offset = scanned })
        if err then return nil, err end
        local batch = page or {}
        for i, row in ipairs(batch) do
            local meta = type(row.meta) == "table" and row.meta or {}
            local matches = search == "" or string.find(string.lower(meta.title or ""), search, 1, true) ~= nil
                or string.find(string.lower(meta.comment or ""), search, 1, true) ~= nil
            if matches then
                if #components == limit then
                    local cursor, encode_err = continuation(scanned + i - 1, search)
                    if encode_err then return nil, encode_err end
                    return { components = components, has_more = true, cursor = cursor }, nil
                end
                components[#components + 1] = row
            end
        end
        scanned = scanned + #batch
        if #batch < PAGE then return { components = components, has_more = false }, nil end
    end
end
return M
