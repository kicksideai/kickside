-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local security = require("security")
local base64 = require("base64")
local json = require("json")
local fields = require("secret_fields")
local types = require("component_types")

local M = {}
M.PREFIX = "kickside.component.secrets:v1:aes-256-gcm:"

local function invalid(): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "unsupported component secrets envelope", details = {code = "component_secrets_envelope"}})
end

-- Path names are public metadata; the exact serialized header is authenticated
-- with the component id as AAD. Masked readers never need the installation key.
function M.header(declarations: {types.SecretField}): (string?, error?)
    local validation_err = fields.validate(declarations)
    if validation_err then return nil, validation_err end
    local encoded, encode_err = json.encode(declarations)
    if encode_err then return nil, encode_err end
    return base64.encode(encoded :: string)
end

function M.inspect(raw: string): ({types.SecretField}?, string?, string?, error?)
    if raw:sub(1, #M.PREFIX) ~= M.PREFIX then return nil, nil, nil, invalid() end
    local separator = raw:find(":", #M.PREFIX + 1, true)
    if separator == nil or separator == #raw then return nil, nil, nil, invalid() end
    local header = raw:sub(#M.PREFIX + 1, separator - 1)
    local decoded, decode_err = base64.decode(header)
    if decode_err then return nil, nil, nil, invalid() end
    local declarations, parse_err = json.decode(decoded :: string)
    if parse_err then return nil, nil, nil, invalid() end
    local validation_err = fields.validate(declarations)
    if validation_err then return nil, nil, nil, invalid() end
    return declarations :: {types.SecretField}, header, raw:sub(separator + 1), nil
end

function M.paths(raw: string?): ({types.SecretField}?, error?)
    if raw == nil then return {}, nil end
    local declarations, _, _, inspect_err = M.inspect(raw)
    return declarations, inspect_err
end

function M.encode(component_id: string, value: types.JsonMap, declarations: {types.SecretField}): (string?, error?)
    return funcs.call("kickside.component.system:seal_secrets", component_id, value, declarations)
end

function M.decode(component_id: string, raw: string?): (types.JsonMap?, error?)
    return funcs.call("kickside.component.system:open_secrets", component_id, raw)
end

function M.write_paths(impl_id: string, previous: string?): (types.SecretField[]?, error?)
    local declarations, declaration_err = fields.for_impl(impl_id)
    if declaration_err then return nil, declaration_err end
    local stored, stored_err = M.paths(previous)
    if stored_err then return nil, stored_err end
    return fields.combine(declarations :: types.SecretField[], stored :: types.SecretField[])
end

function M.prepare(component_id: string, impl_id: string, value: types.JsonMap, previous: string?): (types.JsonMap?, types.SecretWrite?, error?)
    local declarations, declaration_err = M.write_paths(impl_id, previous)
    if declaration_err then return nil, nil, declaration_err end
    if #declarations == 0 then return value, nil, nil end
    local visible, secrets, split_err = fields.partition(declarations, value)
    if split_err then return nil, nil, split_err end
    local encrypted, encrypt_err = M.encode(component_id, secrets :: types.JsonMap, declarations :: {types.SecretField})
    if encrypt_err then return nil, nil, encrypt_err end
    return visible, {encrypted = encrypted}, nil
end

-- Called only by component-owned runtime entry points, after the existing read.
function M.finish_runtime_read(row: types.ComponentRow): error?
    local allowed, permission_err = security.can("component.secrets.read", row.impl_id)
    if permission_err then return permission_err end
    if allowed ~= true then
        local masked, paths, mask_err = fields.external(row.impl_id, row.private_context or {}, row.secret_fields)
        if mask_err then return mask_err end
        row.private_context, row.secret_fields = masked, paths
    elseif #(row.secret_fields or {}) == 0 then
        local declarations, declaration_err = fields.for_impl(row.impl_id)
        if declaration_err then return declaration_err end
        if #declarations > 0 then
            local _, _, validation_err = fields.partition(declarations, row.private_context or {})
            if validation_err then return validation_err end
            local _, key_err = M.decode(row.component_id, nil)
            if key_err then return key_err end
            row.secret_fields = declarations
        end
    end
    return nil
end

return M
