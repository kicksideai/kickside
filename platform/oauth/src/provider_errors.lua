local json = require("json")

local M = {}

M.MAX_TOKEN_LENGTH = 8192

local MAX_PROVIDER_CODE_LENGTH = 128
local MAX_PARSE_BODY_LENGTH = 32768

function M.safe_code(value: any): string?
    if type(value) ~= "string" or value == "" or #value > MAX_PROVIDER_CODE_LENGTH then
        return nil
    end
    if not value:match("^[%w%._%-:]+$") then
        return nil
    end
    return value
end

function M.response_body_len(response: any): integer
    if type(response) == "table" and type(response.body) == "string" then
        return #response.body
    end
    return 0
end

function M.from_body(body: any): string?
    if type(body) ~= "string" or body == "" or #body > MAX_PARSE_BODY_LENGTH then
        return nil
    end
    local decoded = json.decode(body)
    if type(decoded) == "table" then
        return M.safe_code((decoded :: any).error)
    end
    return nil
end

-- Only a rejected refresh grant requires user consent again. Rate limits,
-- server failures, malformed responses and client configuration errors do not
-- establish that the user's refresh token has been revoked.
function M.requires_reauth(status_code: number, provider_code: string?): boolean
    return status_code < 500 and status_code ~= 429 and provider_code == "invalid_grant"
end

function M.http_failure(prefix: string, status_code: any, provider_code: string?): string
    local msg = prefix .. ": HTTP " .. tostring(status_code or "unknown")
    if provider_code then
        msg = msg .. " (" .. provider_code .. ")"
    end
    return msg
end

function M.provider_error(prefix: string, provider_code: any): string
    local safe = M.safe_code(provider_code)
    if safe then
        return prefix .. ": " .. safe
    end
    return prefix
end

return M
