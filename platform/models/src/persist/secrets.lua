local secret_cipher = require("secret_cipher")

local M = {}

local function key(): (string?, string?)
    local key, err = secret_cipher.load_key("kickside.models.env:encryption_key")
    if err then return nil, tostring(err) end
    return key
end

function M.encrypt(plaintext: any): (string?, string?)
    local k, kerr = key()
    if not k then return nil, kerr end
    local enc, err = secret_cipher.seal(tostring(plaintext), k)
    if err then return nil, "encrypt failed: " .. tostring(err) end
    return enc
end

function M.decrypt(ciphertext: any): (string?, string?)
    if ciphertext == nil or ciphertext == "" then return "" end
    local k, kerr = key()
    if not k then return nil, kerr end
    local dec, err = secret_cipher.open(tostring(ciphertext), k)
    if err then return nil, "decrypt failed: " .. tostring(err) end
    return dec
end

return M
