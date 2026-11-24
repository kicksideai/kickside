-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- A provider profile whose API key comes from KICKSIDE_PLATFORM_LLM_API_KEY uses
-- the key of the platform that deployed this instance. Calls through it stop at
-- KICKSIDE_PLATFORM_TOKEN_MONTHLY_CAP tokens per calendar month (UTC); without a
-- cap the profile is disabled.
local env = require("env")
local sql = require("sql")
local time = require("time")
local models_types = require("models_types")

local M = {}

M.KEY_ENV = "KICKSIDE_PLATFORM_LLM_API_KEY"
M.CAP_ENV = "KICKSIDE_PLATFORM_TOKEN_MONTHLY_CAP"
M.PROFILE_NAME = "KickSide platform"

local PROVIDERS = {
    { prefix = "sk-ant-", provider_id = "wippy.llm.claude:provider" },
    { prefix = "AIza", provider_id = "wippy.llm.google.generative_ai:provider" },
    { prefix = "sk-", provider_id = "wippy.llm.openai:provider" },
}

local function trim(value: any): string
    return (tostring(value or ""):gsub("^%s+", ""):gsub("%s+$", ""))
end

function M.is_platform(profile: any): boolean
    local config = type(profile) == "table" and type(profile.config) == "table" and profile.config or {}
    return trim(config.api_key_env) == M.KEY_ENV
end

local OFFICIAL_HOSTS = {
    ["api.anthropic.com"] = true,
    ["api.openai.com"] = true,
    ["generativelanguage.googleapis.com"] = true,
}

-- The platform key goes only to a provider's own API host.
function M.custom_endpoint(profile: any): boolean
    local config = type(profile) == "table" and type(profile.config) == "table" and profile.config or {}
    for _, key in ipairs({ "base_url", "model_list_url" }) do
        local value = config[key]
        if type(value) == "string" and value ~= "" then
            local authority = value:lower():match("^https://([^/?#]+)")
            local host = authority and not authority:find("@", 1, true) and authority:gsub(":443$", "") or nil
            if not host or not OFFICIAL_HOSTS[host] then return true end
        elseif value ~= nil then
            return true
        end
    end
    local headers = config.headers
    return type(headers) == "table" and next(headers) ~= nil
end

function M.provider_for_key(key: any): string?
    if type(key) ~= "string" then return nil end
    for _, row in ipairs(PROVIDERS) do
        if key:sub(1, #row.prefix) == row.prefix then return row.provider_id end
    end
    return nil
end

function M.month_start(now: any): string
    local utc = (now or time.now()):utc()
    return string.format("%04d-%02d-01T00:00:00Z", utc:year(), utc:month())
end

function M.cap(raw: any): number?
    local value = tonumber(trim(raw))
    if not value or value <= 0 or value ~= math.floor(value) then return nil end
    return value
end

-- One aggregate over the usage rows recorded since `since` (RFC3339, as stored).
function M.used_tokens(db_id: string, since: string): (number?, any?)
    local db, err = sql.get(db_id)
    if err or not db then return nil, err or "usage database unavailable" end
    local rows, query_err = db:query(
        "SELECT COALESCE(SUM(prompt_tokens + completion_tokens), 0) AS total FROM token_usage WHERE timestamp >= $1",
        { since })
    db:release()
    if query_err then return nil, query_err end
    return tonumber(rows and rows[1] and rows[1].total) or 0
end

local function payment_required(message: string, details: any?): error
    local out = { error_type = "payment_required" }
    for key, value in pairs(details or {}) do out[key] = value end
    return (errors.new({ kind = errors.PERMISSION_DENIED, retryable = false, message = message, details = out }) :: error)
end

-- Returns nil when the call may go on, or a payment_required error.
-- options: cap (raw string), used (since) -> tokens, now (time).
function M.check(profile: any, options: any?): error?
    if not M.is_platform(profile) then return nil end
    local opts = options or {}
    if M.custom_endpoint(profile) then
        return payment_required("The platform model key works only with the provider's own endpoint. Add your own API key in Models.")
    end
    local raw_cap = opts.cap
    if raw_cap == nil then raw_cap = env.get(M.CAP_ENV) end
    local cap = M.cap(raw_cap)
    if not cap then
        return payment_required("Platform model access is not available. Add your own API key in Models.")
    end
    local since = M.month_start(opts.now)
    local used, used_err
    if opts.used then
        used, used_err = opts.used(since)
    else
        used, used_err = M.used_tokens(models_types.db_id(), since)
    end
    if used_err or not used then
        return (errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = "Platform model usage is unavailable" }) :: error)
    end
    if used >= cap then
        return payment_required("This workspace used its included platform tokens for this month. Add your own API key in Models to continue.",
            { cap = cap, used = used })
    end
    return nil
end

return M
