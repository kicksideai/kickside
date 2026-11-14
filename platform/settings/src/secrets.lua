-- Encryption for secret settings. A definition with value_type 'secret' has its
-- value stored AES-encrypted at rest, using the same ENCRYPTION_KEY (64 hex /
-- 32 bytes, AES-256) the rest of the platform uses for credentials. The key is
-- read from the environment and hex-decoded to raw bytes for crypto.encrypt.aes.

local crypto = require("crypto")
local base64 = require("base64")
local env = require("env")

local M = {}

M.KEY_MISSING = "ENCRYPTION_KEY environment variable not set"

-- key returns the 32 raw bytes of ENCRYPTION_KEY, or (nil, error). The env value
-- is 64 hex characters; AES needs the decoded bytes.
local function key(): (string?, string?)
    local hex, err = env.get("ENCRYPTION_KEY")
    if err then return nil, "failed to read ENCRYPTION_KEY: " .. tostring(err) end
    if not hex or hex == "" then return nil, M.KEY_MISSING end
    if #hex ~= 64 then return nil, "ENCRYPTION_KEY must be 64 hex characters (32 bytes)" end

    local bytes = ""
    for i = 1, #hex, 2 do
        local byte = tonumber(hex:sub(i, i + 1), 16)
        if not byte then return nil, "ENCRYPTION_KEY contains invalid hex characters" end
        bytes = bytes .. string.char(byte :: integer)
    end
    return bytes
end

-- encrypt returns the AES ciphertext of a plaintext string, or (nil, error).
function M.encrypt(plaintext: any): (string?, string?)
    local k, kerr = key()
    if not k then return nil, kerr end
    local enc, err = crypto.encrypt.aes(tostring(plaintext), k)
    if err then return nil, "encrypt failed: " .. tostring(err) end
    -- base64 so the ciphertext is valid UTF-8 text on both SQLite and Postgres.
    return base64.encode(enc)
end

-- decrypt returns the plaintext for an AES ciphertext, or (nil, error).
function M.decrypt(ciphertext: any): (string?, string?)
    if ciphertext == nil or ciphertext == "" then return "" end
    local k, kerr = key()
    if not k then return nil, kerr end
    local decoded, derr = base64.decode(tostring(ciphertext))
    if derr then return nil, "decrypt failed: invalid base64: " .. tostring(derr) end
    local dec, err = crypto.decrypt.aes(decoded, k)
    if err then return nil, "decrypt failed: " .. tostring(err) end
    return dec
end

return M
