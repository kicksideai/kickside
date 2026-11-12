local crypto = require("crypto")
local base64 = require("base64")

local M = {}

function M.decode_key(hex: string): (string?, error?)
    if #hex ~= 64 or hex:find("[^%x]") then
        return nil, (errors.new({kind = errors.INVALID,
            message = "encryption key must contain 64 hexadecimal characters"}) :: error)
    end
    local bytes: {string} = {}
    for i = 1, 64, 2 do
        bytes[#bytes + 1] = string.char(tonumber(hex:sub(i, i + 1), 16) :: integer)
    end
    return table.concat(bytes), nil
end

function M.encrypt(plaintext: string, key: string, aad: string?): (string?, error?)
    return crypto.encrypt.aes(plaintext, key, aad)
end

function M.decrypt(ciphertext: string, key: string, aad: string?): (string?, error?)
    return crypto.decrypt.aes(ciphertext, key, aad)
end

function M.seal(plaintext: string, key: string, aad: string?): (string?, error?)
    local ciphertext, err = M.encrypt(plaintext, key, aad)
    if err then return nil, err end
    return base64.encode(ciphertext)
end

function M.open(ciphertext: string, key: string, aad: string?): (string?, error?)
    local decoded, err = base64.decode(ciphertext)
    if err then return nil, err end
    return M.decrypt(decoded, key, aad)
end

return M
