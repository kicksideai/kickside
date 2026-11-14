local crypto = require("crypto")
local base64 = require("base64")
local json = require("json")
local env = require("env")

local READ_PURPOSE = "upload.read"
local DEFAULT_READ_TTL_SECONDS = 300
local MAX_READ_TTL_SECONDS = 3600

-- Convert hex string to bytes
local function hex_decode(hex_str)
    if not hex_str or #hex_str % 2 ~= 0 then
        return nil, "Invalid hex string"
    end

    local bytes = ""
    for i = 1, #hex_str, 2 do
        local hex_byte = hex_str:sub(i, i + 1)
        local byte_val = tonumber(hex_byte, 16)
        if not byte_val then
            return nil, "Invalid hex character"
        end
        bytes = bytes .. string.char(byte_val)
    end
    return bytes
end

-- Get encryption key from environment
local function get_encryption_key()
    local key_hex = env.get("ENCRYPTION_KEY")
    if not key_hex then
        error("ENCRYPTION_KEY environment variable is required but not set")
    end

    local key, err = hex_decode(key_hex)
    if err then
        error("Failed to decode encryption key: " .. err)
    end

    if #key ~= 16 and #key ~= 24 and #key ~= 32 then
        error("Encryption key must be 16, 24, or 32 bytes after decoding, got " .. #key)
    end

    return key
end

local function base64url_encode(raw: string): (string?, string?)
    local encoded, err = base64.encode(raw)
    if err or not encoded then
        return nil, "Base64 encode failed: " .. tostring(err)
    end
    return ((encoded :: string):gsub("%+", "-"):gsub("/", "_"):gsub("=", "")), nil
end

local function base64url_decode(token_part: any): (string?, string?)
    if type(token_part) ~= "string" or token_part == "" then
        return nil, "Invalid token format"
    end
    local encoded = (token_part :: string):gsub("-", "+"):gsub("_", "/")
    local rem = #encoded % 4
    if rem == 2 then
        encoded = encoded .. "=="
    elseif rem == 3 then
        encoded = encoded .. "="
    elseif rem ~= 0 then
        return nil, "Invalid token format"
    end
    local decoded, err = base64.decode(encoded)
    if err or not decoded then
        return nil, "Invalid token format"
    end
    return decoded :: string, nil
end

local function constant_time_eq(a: any, b: any): boolean
    if type(a) ~= "string" or type(b) ~= "string" then return false end
    if #a ~= #b then return false end
    local diff = 0
    for i = 1, #a do
        diff = diff + math.abs(string.byte(a, i) - string.byte(b, i))
    end
    return diff == 0
end

local function sign(value: string): string
    return crypto.hmac.sha256(get_encryption_key(), value)
end

-- Pack a short-lived bearer capability for reading one upload, optionally one
-- artifact. The token is URL-safe and signed, not stored; uploads endpoints remain
-- the authority that turns it into bytes.
local function pack_read(params)
    if type(params) ~= "table" then
        return nil, "Parameters must be provided as a table"
    end
    if type(params.upload_id) ~= "string" or params.upload_id == "" then
        return nil, "upload_id is required"
    end
    local ttl = tonumber(params.expires_in or params.ttl_seconds or DEFAULT_READ_TTL_SECONDS) or DEFAULT_READ_TTL_SECONDS
    ttl = math.floor(ttl)
    if ttl <= 0 then return nil, "expires_in must be positive" end
    if ttl > MAX_READ_TTL_SECONDS then ttl = MAX_READ_TTL_SECONDS end

    local now = os.time()
    local payload = {
        purpose = READ_PURPOSE,
        upload_id = params.upload_id,
        artifact_id = params.artifact_id,
        audience = params.audience,
        issued_at = now,
        expires_at = now + ttl,
    }
    local payload_json, jerr = json.encode(payload)
    if jerr or not payload_json then
        return nil, "Failed to encode payload: " .. tostring(jerr)
    end
    local encoded, berr = base64url_encode(payload_json :: string)
    if not encoded then return nil, berr end
    return encoded .. "." .. sign(encoded), nil
end

local function unpack_read(token: string?, expected: any?)
    if type(token) ~= "string" or token == "" then return nil, "No token provided" end
    local payload_part, sig_part = token:match("^([A-Za-z0-9_-]+)%.([0-9a-fA-F]+)$")
    if not payload_part or not sig_part then
        return nil, "Invalid token format"
    end
    if not constant_time_eq(string.lower(sig_part), string.lower(sign(payload_part))) then
        return nil, "Invalid upload token signature"
    end
    local payload_json, derr = base64url_decode(payload_part)
    if not payload_json then return nil, derr end
    local payload, jerr = json.decode(payload_json)
    if jerr or type(payload) ~= "table" then
        return nil, "Malformed token payload: " .. tostring(jerr)
    end
    if payload.purpose ~= READ_PURPOSE then
        return nil, "Invalid upload token purpose"
    end
    if type(payload.upload_id) ~= "string" or payload.upload_id == "" then
        return nil, "Invalid upload token upload_id"
    end
    local expires_at = tonumber(payload.expires_at) or 0
    if expires_at <= os.time() then
        return nil, "Token expired"
    end
    if type(expected) == "table" then
        if type(expected.upload_id) == "string" and expected.upload_id ~= "" and expected.upload_id ~= payload.upload_id then
            return nil, "Upload token does not match upload"
        end
        if expected.artifact_id == false and payload.artifact_id ~= nil then
            return nil, "Upload token does not match artifact"
        end
        if type(expected.artifact_id) == "string" and expected.artifact_id ~= "" and payload.artifact_id ~= expected.artifact_id then
            return nil, "Upload token does not match artifact"
        end
    end
    return payload, nil
end

-- Pack upload completion token from parameters
local function pack(params)
    if type(params) ~= "table" then
        return nil, "Parameters must be provided as a table"
    end

    if type(params.upload_id) ~= "string" or params.upload_id == "" then
        return nil, errors.new({ message = "upload_id is required", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end

    if not params.function_id then return nil, "function_id is required" end
    if not params.actor_id then return nil, "actor_id is required" end
    if not params.actor_context then return nil, "actor_context is required" end

    local payload = {
        upload_id = params.upload_id,
        function_id = params.function_id,
        on_error_id = params.on_error_id,
        params = params.params,
        actor_id = params.actor_id,
        actor_context = params.actor_context,
        trace_context = params.trace_context or (type(params.params) == "table" and params.params.trace_context or nil),
        issued_at = os.time(),
    }

    local json_data, err = json.encode(payload)
    if err then
        return nil, "Failed to encode payload: " .. err
    end

    local encryption_key = get_encryption_key()

    local encrypted, err = crypto.encrypt.aes(json_data, encryption_key :: string)
    if err then
        return nil, "Encryption error: " .. err
    end

    return base64.encode(encrypted)
end

-- Unpack and validate upload completion token
local function unpack(token: string?)
    if not token then return nil, "No token provided" end

    local encrypted_data = base64.decode(token)
    if not encrypted_data then
        return nil, "Invalid token format"
    end

    local encryption_key = get_encryption_key()

    local json_data, err = crypto.decrypt.aes(encrypted_data, encryption_key :: string)
    if err then
        return nil, "Invalid upload token: " .. err
    end

    local payload, err = json.decode(json_data)
    if err then
        return nil, "Malformed token payload: " .. err
    end
    if type(payload) ~= "table" or type(payload.upload_id) ~= "string" or payload.upload_id == "" then
        return nil, errors.new({ message = "upload token is missing upload_id", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end

    local current_time = os.time()
    local issued_at = payload.issued_at or 0
    local token_age = current_time - issued_at

    if token_age > 86400 then
        return nil, "Token expired"
    end

    return payload
end

return {
    pack = pack,
    unpack = unpack,
    pack_read = pack_read,
    unpack_read = unpack_read,
}
