local M = {}

local CREDENTIAL_PATCH_ERROR = "connection credentials cannot be patched through this endpoint; reconnect or recreate the connection"

local function add_meta_field(fields: { [string]: any }, key: string, value: any): string?
    if value == nil then
        return nil
    end
    if type(value) ~= "string" or value == "" then
        return key .. " must be a non-empty string"
    end
    fields[key] = value
    return nil
end

function M.fields(body: any): ({ [string]: any }?, string?)
    if type(body) ~= "table" then
        return nil, "invalid json"
    end
    if body.private_context ~= nil or body.private_context_patch ~= nil or body.auth ~= nil then
        return nil, CREDENTIAL_PATCH_ERROR
    end

    local fields: { [string]: any } = {}
    local err = add_meta_field(fields, "title", body.name)
    if err then return nil, err end
    err = add_meta_field(fields, "title", body.title)
    if err then return nil, err end

    return fields, nil
end

M.CREDENTIAL_PATCH_ERROR = CREDENTIAL_PATCH_ERROR

return M
