local env = require("env")
local json = require("json")

local M = {}

M.PROVIDERS = {
    OPENAI = "wippy.llm.openai:provider",
    OPENAI_COMPAT = "wippy.llm.openai_compat:provider",
    OPENAI_COMPAT_PLAIN = "kickside.models:openai_compat_plain.provider",
    ANTHROPIC = "wippy.llm.claude:provider",
    GOOGLE_GENAI = "wippy.llm.google.generative_ai:provider",
    BEDROCK = "wippy.llm.bedrock:provider",
}

function M.trim_slash(url: any): string
    return tostring(url or ""):gsub("/+$", "")
end

function M.table_has(list: any, value: string): boolean
    if type(list) ~= "table" then return false end
    for _, item in ipairs(list) do
        if item == value then return true end
    end
    return false
end

function M.add_unique(list: { string }, value: string)
    if value ~= "" and not M.table_has(list, value) then
        table.insert(list, value)
    end
end

function M.env_value(ref: any): string?
    if type(ref) ~= "string" or ref == "" then return nil end
    local value = env.get(ref)
    if value and value ~= "" then return value end
    return nil
end

function M.resolve_value(profile: any, key: string, default_env: string?): string?
    local secret = type(profile) == "table" and profile.secret_config or {}
    local config = type(profile) == "table" and profile.config or {}
    if type(secret[key]) == "string" and secret[key] ~= "" then
        return tostring(secret[key])
    end
    if type(config[key]) == "string" and config[key] ~= "" then
        return tostring(config[key])
    end
    local from_ref = M.env_value(config[key .. "_env"])
    if from_ref then return from_ref end
    if default_env then return M.env_value(default_env) end
    return nil
end

function M.numeric_config(profile: any, key: string, fallback: number): number
    local config = type(profile) == "table" and profile.config or {}
    local direct = tonumber(config[key])
    if direct then return direct end
    local from_ref = M.env_value(config[key .. "_env"])
    if from_ref then
        local n = tonumber(from_ref)
        if n then return n end
    end
    return fallback
end

function M.timeout(profile: any, fallback: number?): string
    return tostring(M.numeric_config(profile, "timeout", fallback or 30)) .. "s"
end

function M.configured_base_url(profile: any, fallback: string): string
    local config = type(profile) == "table" and profile.config or {}
    if type(config.model_list_url) == "string" and config.model_list_url ~= "" then
        return M.trim_slash(config.model_list_url)
    end
    if type(config.base_url) == "string" and config.base_url ~= "" then
        return M.trim_slash(config.base_url)
    end
    return M.trim_slash(fallback)
end

function M.join_endpoint(base_url: string, path: string): string
    local base = M.trim_slash(base_url)
    if base:match("/v1$") and path:sub(1, 3) == "/v1" then
        path = path:sub(4)
    end
    return base .. path
end

local function uri_encode(value: any): string
    return tostring(value):gsub("([^A-Za-z0-9%-%._~])", function(c)
        return string.format("%%%02X", string.byte(c))
    end)
end

function M.append_query(url: string, params: any): string
    local parts = {}
    for k, v in pairs(params or {}) do
        if v ~= nil and tostring(v) ~= "" then
            table.insert(parts, uri_encode(k) .. "=" .. uri_encode(v))
        end
    end
    table.sort(parts)
    if #parts == 0 then return url end
    local sep = url:find("?", 1, true) and "&" or "?"
    return url .. sep .. table.concat(parts, "&")
end

local function first_string(value: any, keys: { string }): string?
    if type(value) ~= "table" then return nil end
    for _, key in ipairs(keys) do
        local candidate = value[key]
        if type(candidate) == "string" and candidate ~= "" then return candidate end
    end
    return nil
end

local function provider_error(parsed: any): string?
    if type(parsed) ~= "table" then return nil end
    if type(parsed.error) == "string" and parsed.error ~= "" then return parsed.error end
    if type(parsed.error) == "table" then
        return first_string(parsed.error, { "message", "detail", "description", "code", "type" })
    end
    return first_string(parsed, { "error_description", "message", "detail", "reason" })
end

function M.scrub_message(value: any): string
    local s = tostring(value or "")
    s = s:gsub("[Bb]earer%s+[^%s,\"'}]+", "Bearer [redacted]")
    s = s:gsub("([Aa][Pp][Ii][-_]?[Kk][Ee][Yy]%s*[=:]%s*)[^%s,\"'}]+", "%1[redacted]")
    s = s:gsub("([Tt][Oo][Kk][Ee][Nn]%s*[=:]%s*)[^%s,\"'}]+", "%1[redacted]")
    if #s > 700 then s = s:sub(1, 697) .. "..." end
    return s
end

function M.response_error(response: any, label: string?): string
    local prefix = label or "provider request failed"
    local status = response and tonumber(response.status_code)
    if status then prefix = prefix .. " (HTTP " .. tostring(status) .. ")" end

    local body = response and response.body or nil
    if type(body) == "string" and body ~= "" then
        local parsed = json.decode(body)
        local message = provider_error(parsed)
        if not message then
            message = body:gsub("%s+", " ")
            if #message > 260 then message = message:sub(1, 257) .. "..." end
        end
        if message and message ~= "" then
            return prefix .. ": " .. M.scrub_message(message)
        end
    end

    return prefix
end

function M.decode_response(response: any, label: string?): (any?, string?)
    if not response then return nil, "empty response" end
    local status = tonumber(response.status_code)
    if not status or status < 200 or status >= 300 then
        return nil, M.response_error(response, label)
    end
    local parsed, perr = json.decode(response.body or "")
    if perr then return nil, "failed to parse model list: " .. tostring(perr) end
    return parsed
end

function M.as_array(value: any): { any }
    local out: { any } = {}
    if type(value) ~= "table" then return out end
    for _, item in ipairs(value) do
        table.insert(out, item)
    end
    return out
end

function M.model_rows(parsed: any): { any }
    if type(parsed) ~= "table" then return {} end
    if type(parsed.data) == "table" then return M.as_array(parsed.data) end
    if type(parsed.models) == "table" then return M.as_array(parsed.models) end
    if #parsed > 0 then return M.as_array(parsed) end
    return {}
end

function M.has_modality(list: any, value: string): boolean
    if type(list) ~= "table" then return false end
    local needle = value:lower()
    for _, item in ipairs(list) do
        if tostring(item):lower() == needle then return true end
    end
    return false
end

function M.supported_action(item: any, action: string): boolean
    local list = item.supportedActions or item.supported_actions
    if type(list) ~= "table" then return false end
    for _, value in ipairs(list) do
        if tostring(value) == action then return true end
    end
    return false
end

return M
