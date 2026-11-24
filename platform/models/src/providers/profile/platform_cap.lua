-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- A provider profile whose API key comes from KICKSIDE_PLATFORM_LLM_API_KEY uses
-- the key of the platform that deployed this instance. Only calls through such a
-- profile are counted, per calendar month (UTC), and they stop at
-- KICKSIDE_PLATFORM_TOKEN_MONTHLY_CAP tokens; without a cap the profile is disabled.
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

function M.month(now: any): string
    local utc = (now or time.now()):utc()
    return string.format("%04d-%02d", utc:year(), utc:month())
end

function M.cap(raw: any): number?
    local value = tonumber(trim(raw))
    if not value or value <= 0 or value ~= math.floor(value) then return nil end
    return value
end

function M.used_tokens(db_id: string, month: string): (number?, any?)
    local db, err = sql.get(db_id)
    if err or not db then return nil, err or "models database unavailable" end
    local rows, query_err = db:query("SELECT tokens FROM kickside_model_platform_usage WHERE month = $1", { month })
    db:release()
    if query_err then return nil, query_err end
    return tonumber(rows and rows[1] and rows[1].tokens) or 0
end

function M.record(db_id: string, month: string, tokens: number): (boolean, any?)
    if tokens <= 0 then return true end
    local db, err = sql.get(db_id)
    if err or not db then return false, err or "models database unavailable" end
    local _, exec_err = db:execute([[
        INSERT INTO kickside_model_platform_usage (month, tokens) VALUES ($1, $2)
        ON CONFLICT (month) DO UPDATE SET tokens = kickside_model_platform_usage.tokens + excluded.tokens
    ]], { month, math.floor(tokens) })
    db:release()
    if exec_err then return false, exec_err end
    return true
end

-- Prompt, completion, and thinking tokens of one provider result.
function M.result_tokens(result: any): number
    local tokens = type(result) == "table" and type(result.tokens) == "table" and result.tokens or {}
    local total = 0
    for _, key in ipairs({ "prompt_tokens", "completion_tokens", "thinking_tokens" }) do
        local value = tonumber(tokens[key])
        if value and value > 0 then total = total + value end
    end
    return total
end

local function payment_required(message: string, details: any?): error
    local out = { error_type = "payment_required" }
    for key, value in pairs(details or {}) do out[key] = value end
    return (errors.new({ kind = errors.PERMISSION_DENIED, retryable = false, message = message, details = out }) :: error)
end

-- Adds a successful call's tokens to this month's platform usage.
function M.account(profile: any, result: any, now: any?): (boolean, any?)
    if not M.is_platform(profile) then return true end
    return M.record(models_types.db_id(), M.month(now), M.result_tokens(result))
end

-- Returns nil when the call may go on, or a payment_required error.
-- options: cap (raw string), used (month) -> tokens, now (time).
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
    local month = M.month(opts.now)
    local used, used_err
    if opts.used then
        used, used_err = opts.used(month)
    else
        used, used_err = M.used_tokens(models_types.db_id(), month)
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
