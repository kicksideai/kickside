-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local env = require("env")
local uuid = require("uuid")
local json = require("json")
local cipher = require("secret_cipher")
local types = require("component_types")
local persisted_json = require("persisted_json")
local document = require("secrets_document")

local M = {}
local PREFIX = document.PREFIX
local initialized = false
local cached_key: string? = nil
local cached_error: error? = nil

local function key(): (string?, error?)
    if initialized then return cached_key, cached_error end
    initialized = true
    local variable, read_err = env.get("kickside.component.env:encryption_key")
    local hex: string? = nil
    if not read_err and type(variable) == "string" and variable ~= "" then
        hex, read_err = env.get(variable)
    end
    if not read_err and type(hex) == "string" then cached_key, read_err = cipher.decode_key(hex) end
    if read_err or not cached_key then
        cached_error = errors.new({kind = errors.UNAVAILABLE, retryable = false,
            message = "component secrets encryption key is missing or malformed",
            details = {code = "component_secrets_key"}})
    end
    return cached_key, cached_error
end

function M.encode(component_id: string, value: types.JsonMap, declarations: {types.SecretField}, generation: integer?, incarnation: string?): (string?, error?)
    local id, id_err = uuid.format(component_id, "standard")
    if id_err then return nil, id_err end
    local k, key_err = key()
    if key_err then return nil, key_err end
    local plaintext, json_err = json.encode(value)
    if json_err then return nil, json_err end
    local header, header_err = document.header(declarations, generation, incarnation)
    if header_err then return nil, header_err end
    local sealed, seal_err = cipher.seal(plaintext, k :: string, PREFIX .. id .. ":" .. (header :: string))
    if seal_err then return nil, seal_err end
    return PREFIX .. (header :: string) .. ":" .. (sealed :: string), nil
end

function M.decode(component_id: string, raw: string?, generation: integer?, incarnation: string?): (types.JsonMap?, error?)
    local id, id_err = uuid.format(component_id, "standard")
    if id_err then return nil, id_err end
    local k, key_err = key()
    if key_err then return nil, key_err end
    if raw == nil then return {}, nil end
    local _, header, sealed, inspect_err = document.inspect(raw, generation, incarnation)
    if inspect_err then return nil, inspect_err end
    local plaintext, decrypt_err = cipher.open(sealed :: string, k :: string, PREFIX .. id .. ":" .. (header :: string))
    if decrypt_err then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "cannot decrypt component secrets", details = {code = "component_secrets_cannot_decrypt"}})
    end
    return persisted_json.decode_table(plaintext, "component.secrets")
end

return M
