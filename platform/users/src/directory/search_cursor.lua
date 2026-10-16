local json = require("json")
local base64 = require("base64")
local M = {}

local function invalid(): error
    return (errors.new({ kind = errors.INVALID, message = "invalid principal search cursor" }) :: error)
end

local function nonempty(value: any): boolean
    return type(value) == "string" and value ~= ""
end

function M.decode(raw: any, query: string, want: any): (any?, error?)
    if raw == nil or raw == "" then return nil, nil end
    if type(raw) ~= "string" then return nil, invalid() end
    local unpacked, unpack_err = base64.decode(raw)
    if unpack_err or type(unpacked) ~= "string" then return nil, invalid() end
    local value, decode_err = json.decode(unpacked)
    if decode_err or type(value) ~= "table" then return nil, invalid() end
    if value.version ~= 1 or value.query ~= query or value.users ~= want.user or value.groups ~= want.group then
        return nil, invalid()
    end
    if value.plane == "user" then
        local after = value.user_after
        if not want.user or type(after) ~= "table" or not nonempty(after.created_at) or not nonempty(after.user_id) then
            return nil, invalid()
        end
    elseif value.plane == "group" then
        if not want.group or type(value.group_after) ~= "string" then return nil, invalid() end
    else
        return nil, invalid()
    end
    return value, nil
end

function M.encode(position: any, query: string, want: any): (string?, error?)
    position.version, position.query = 1, query
    position.users, position.groups = want.user, want.group
    local encoded, encode_err = json.encode(position)
    if encode_err or type(encoded) ~= "string" then
        return nil, (errors.new({ kind = errors.INTERNAL, message = "principal cursor encoding: " .. tostring(encode_err) }) :: error)
    end
    local packed, pack_err = base64.encode(encoded)
    if pack_err or type(packed) ~= "string" then
        return nil, (errors.new({ kind = errors.INTERNAL, message = "principal cursor encoding: " .. tostring(pack_err) }) :: error)
    end
    return packed, nil
end

return M
