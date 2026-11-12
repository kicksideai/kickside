local secret_cipher = require("secret_cipher")
local base64 = require("base64")
local env = require("env")

local M = {}

local function key(): (string?, string?)
    local hex, err = env.get("ENCRYPTION_KEY")
    if err then return nil, "failed to read ENCRYPTION_KEY: " .. tostring(err) end
    if not hex or hex == "" then return nil, "ENCRYPTION_KEY environment variable not set" end
    if #hex ~= 64 then return nil, "ENCRYPTION_KEY must be 64 hex characters" end

    local decoded, decode_err = secret_cipher.decode_key(hex)
    if decode_err then return nil, "ENCRYPTION_KEY contains invalid hex characters" end
    return decoded
end

function M.encrypt(plaintext: any): (string?, string?)
    local k, kerr = key()
    if not k then return nil, kerr end
    local enc, err = secret_cipher.encrypt(tostring(plaintext), k)
    if err then return nil, "encrypt failed: " .. tostring(err) end
    -- base64 so the ciphertext is valid UTF-8 text on both SQLite and Postgres
    -- (PG rejects invalid byte sequences in text columns).
    return base64.encode(enc)
end

function M.decrypt(ciphertext: any): (string?, string?)
    if ciphertext == nil or ciphertext == "" then return "" end
    local k, kerr = key()
    if not k then return nil, kerr end
    local decoded, derr = base64.decode(tostring(ciphertext))
    if derr then return nil, "decrypt failed: invalid base64: " .. tostring(derr) end
    local dec, err = secret_cipher.decrypt(decoded, k)
    if err then return nil, "decrypt failed: " .. tostring(err) end
    return dec
end

return M
