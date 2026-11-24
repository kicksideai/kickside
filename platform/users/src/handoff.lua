-- One-time sign-in tokens issued by the platform that deployed this instance.
-- Token: base64url(payload) "." base64url(HMAC-SHA256(secret, base64url(payload))).
local base64 = require("base64")
local crypto = require("crypto")
local json = require("json")

local M = {}

M.MAX_AHEAD_SECONDS = 300
M.MAX_TOKEN_LENGTH = 2048
M.MIN_NONCE_BYTES = 16
M.MAX_NONCE_LENGTH = 128

local function decode_base64url(value: string): string?
    if value == "" or value:find("[^%w%-_]") then return nil end
    local standard = value:gsub("-", "+"):gsub("_", "/")
    local remainder = #standard % 4
    if remainder == 1 then return nil end
    if remainder > 0 then standard = standard .. string.rep("=", 4 - remainder) end
    local decoded, err = base64.decode(standard)
    if err then return nil end
    return decoded
end

local function to_hex(raw: string): string
    return (raw:gsub(".", function(c) return string.format("%02x", string.byte(c)) end))
end

-- Returns the verified claims {email, exp, nonce}, or nil and a reason code.
function M.verify(token: any, secret: any, now: number)
    if type(secret) ~= "string" or secret == "" then return nil, "not_configured" end
    if type(token) ~= "string" or token == "" or #token > M.MAX_TOKEN_LENGTH then return nil, "malformed" end
    local encoded, signature = token:match("^([%w%-_]+)%.([%w%-_]+)$")
    if not encoded or not signature then return nil, "malformed" end

    local presented = decode_base64url(signature)
    local expected, hmac_err = crypto.hmac.sha256(secret, encoded)
    if not presented or hmac_err or not expected then return nil, "bad_signature" end
    if not crypto.constant_time_compare(to_hex(presented), expected) then return nil, "bad_signature" end

    local raw = decode_base64url(encoded)
    if not raw then return nil, "malformed" end
    local payload, decode_err = json.decode(raw)
    if decode_err or type(payload) ~= "table" then return nil, "malformed" end

    local email, exp, nonce = payload.email, payload.exp, payload.nonce
    if type(email) ~= "string" or email == "" then return nil, "malformed" end
    if type(exp) ~= "number" or exp ~= math.floor(exp) then return nil, "malformed" end
    if type(nonce) ~= "string" or #nonce > M.MAX_NONCE_LENGTH then return nil, "malformed" end
    local nonce_bytes = decode_base64url(nonce)
    if not nonce_bytes or #nonce_bytes < M.MIN_NONCE_BYTES then return nil, "malformed" end

    if exp <= now then return nil, "expired" end
    if exp > now + M.MAX_AHEAD_SECONDS then return nil, "too_far_ahead" end
    return { email = email, exp = exp, nonce = nonce }
end

return M
