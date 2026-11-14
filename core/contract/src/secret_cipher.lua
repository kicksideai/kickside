-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local crypto = require("crypto")
local base64 = require("base64")
local env = require("env")

local M = {}

function M.decode_key(hex: string): (string?, error?)
    if #hex ~= 64 or hex:find("[^%x]") then
        return nil, (errors.new({kind = errors.INVALID,
            message = "encryption key must contain 64 hexadecimal characters"}) :: error)
    end
    local bytes: {string} = {}
    for i = 1, #hex, 2 do
        bytes[#bytes + 1] = string.char(tonumber(hex:sub(i, i + 1), 16) :: integer)
    end
    return table.concat(bytes), nil
end

-- This library runs in the importing entry's frame. The importing owner must
-- hold env.get on its declared env.variable; Contract itself holds no key grant.
function M.load_key(variable_id: string): (string?, error?)
    local hex, read_err = env.get(variable_id)
    if read_err then return nil, read_err end
    if type(hex) ~= "string" then
        return nil, (errors.new({kind = errors.INVALID,
            message = "encryption key is missing"}) :: error)
    end
    return M.decode_key(hex)
end

M.encrypt = crypto.encrypt.aes
M.decrypt = crypto.decrypt.aes

function M.seal(plaintext: string, key: string, aad: string?): (string?, error?)
    local ciphertext, err = M.encrypt(plaintext, key, aad)
    if err then return nil, err end
    return base64.encode(ciphertext :: string)
end

function M.open(ciphertext: string, key: string, aad: string?): (string?, error?)
    local decoded, err = base64.decode(ciphertext)
    if err then return nil, err end
    return M.decrypt(decoded, key, aad)
end

return M
