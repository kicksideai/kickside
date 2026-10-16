local json = require("json")
local base64 = require("base64")
local canonical_json = require("canonical_json")
local M = {}

local function invalid(collection: string): error
    return (errors.new({ kind = errors.INVALID,
        message = collection .. "_cursor is not a cursor this thread listing issues" }) :: error)
end

local function is_string(value: any): boolean
    return type(value) == "string" and value ~= ""
end

function M.decode(raw: any, thread_id: string, collection: string): (table?, error?)
    if raw == nil or raw == "" then return nil, nil end
    if type(raw) ~= "string" then return nil, invalid(collection) end
    local unpacked, unpack_err = base64.decode(raw)
    if unpack_err or type(unpacked) ~= "string" then return nil, invalid(collection) end
    local value, decode_err = json.decode(unpacked)
    if decode_err or type(value) ~= "table" then return nil, invalid(collection) end
    local token = value :: table
    if token.version ~= 1 or token.thread_id ~= thread_id or token.collection ~= collection
        or type(token.position) ~= "table" then return nil, invalid(collection) end
    local position = token.position :: table
    if collection == "projections" then
        if not is_string(position.kind) or not is_string(position.projection_key) then return nil, invalid(collection) end
    elseif collection == "cursors" then
        if not is_string(position.id) then return nil, invalid(collection) end
    else
        return nil, invalid(collection)
    end
    return position, nil
end

local function encode(position: any, thread_id: string, collection: string): (string?, error?)
    local text, encode_err = canonical_json.encode({ version = 1, thread_id = thread_id,
        collection = collection, position = position })
    if encode_err then return nil, encode_err end
    local packed, pack_err = base64.encode(text :: string)
    if pack_err then return nil, pack_err end
    if type(packed) ~= "string" then
        return nil, (errors.new({ kind = errors.INTERNAL, message = "projection cursor packing returns no value" }) :: error)
    end
    return packed, nil
end

function M.response(thread_id: string, projections: table[], cursors: table[],
    projections_page: any, cursors_page: any): (table?, error?)
    local result: { [string]: any } = { thread_id = thread_id,
        projections = projections, cursors = cursors, count = #cursors }
    for _, pair in ipairs({ { "projections", projections_page }, { "cursors", cursors_page } }) do
        local collection, page = pair[1] :: string, pair[2]
        if type(page) ~= "table" or type(page.has_more) ~= "boolean"
            or (page.has_more and type(page.next_after) ~= "table") then
            return nil, (errors.new({ kind = errors.INTERNAL, message = "projection listing returns no page verdict" }) :: error)
        end
        result[collection .. "_has_more"] = page.has_more
        if page.has_more then
            local token, encode_err = encode(page.next_after, thread_id, collection)
            if encode_err then return nil, encode_err end
            result[collection .. "_cursor"] = token
        end
    end
    return result, nil
end
return M
