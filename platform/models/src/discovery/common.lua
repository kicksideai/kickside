local env = require("env")
local json = require("json")
local http_errors = require("http_errors")
local llm_mapper = require("llm_mapper")
local llm_output = require("llm_output")
local llm_transport = require("llm_transport")

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

-- The first *_env reference of the profile config, in key order, whose variable
-- does not resolve to a value, described with the reason; nil when all resolve.
function M.unresolved_env(profile: any): string?
    local config = type(profile) == "table" and profile.config or {}
    local keys = {}
    for key, value in pairs(config) do
        if type(key) == "string" and key:match("_env$") and type(value) == "string" and value ~= "" then keys[#keys + 1] = key end
    end
    table.sort(keys)
    for _, key in ipairs(keys) do
        local name = config[key]
        local value, err = env.get(name)
        if err then return key .. " " .. name .. " does not resolve: " .. tostring(err) end
        if type(value) ~= "string" or value == "" then return key .. " " .. name .. " does not resolve: the variable holds no value" end
    end
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

function M.timeout(profile: any, fallback: number?): string
    local config = type(profile) == "table" and profile.config or {}
    local seconds = config.timeout
        or llm_transport.timeout_seconds(M.env_value(config.timeout_env))
        or fallback or 30
    return string.format("%.0fms", math.max(1, math.floor(seconds * 1000)))
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

function M.scrub_message(value: any): string
    local s = tostring(value or "")
    s = s:gsub("[Bb]earer%s+[^%s,\"'}]+", "Bearer [redacted]")
    s = s:gsub("([Aa][Pp][Ii][-_]?[Kk][Ee][Yy]%s*[=:]%s*)[^%s,\"'}]+", "%1[redacted]")
    s = s:gsub("([Tt][Oo][Kk][Ee][Nn]%s*[=:]%s*)[^%s,\"'}]+", "%1[redacted]")
    if #s > 700 then s = s:sub(1, 697) .. "..." end
    return s
end

function M.failure_message(label: string, diagnostics: any): string
    if not diagnostics then return label end
    local fields = {}
    if diagnostics.kind then table.insert(fields, diagnostics.kind) end
    if diagnostics.code then table.insert(fields, diagnostics.code) end
    if diagnostics.retryable ~= nil then
        table.insert(fields, "retryable=" .. tostring(diagnostics.retryable))
    end
    if diagnostics.status_code then table.insert(fields, "HTTP " .. tostring(diagnostics.status_code)) end
    return label .. " (" .. table.concat(fields, ", ") .. ")"
end

function M.transport_error(err: any, label: string?): (string, any?)
    local _, classification = http_errors.classify(err)
    local diagnostics = classification.kind and {
        kind = classification.kind, retryable = classification.retryable,
    } or nil
    return M.failure_message(label or "provider request failed", diagnostics), diagnostics
end

M.ERROR_TYPES = {
    NO_CREDITS = "insufficient_credits",
    INVALID_KEY = "invalid_key",
    RATE_LIMITED = "rate_limited",
}

-- Provider error bodies carry error.type/code/message (Anthropic, OpenAI) or
-- error.status/details[].reason (Google). The status code alone cannot tell an
-- empty balance from a bad key: Anthropic answers 400 and OpenAI 429.
function M.classify_response(status: number?, body: any): string?
    local parsed = type(body) == "string" and json.decode(body) or nil
    local err = type(parsed) == "table" and type(parsed.error) == "table" and parsed.error or {}
    local code = tostring(err.code or ""):lower()
    local kind = tostring(err.type or err.status or ""):lower()
    local message = tostring(err.message or ""):lower()
    local reasons = {}
    for _, detail in ipairs(type(err.details) == "table" and err.details or {}) do
        if type(detail) == "table" and detail.reason then reasons[tostring(detail.reason)] = true end
    end

    if status == 402 or code == "insufficient_quota" or kind == "insufficient_quota"
        or message:find("credit balance is too low", 1, true) then
        return M.ERROR_TYPES.NO_CREDITS
    end
    if status == 401 or status == 403 or reasons.API_KEY_INVALID or kind == "authentication_error"
        or code == "invalid_api_key" then
        return M.ERROR_TYPES.INVALID_KEY
    end
    if status == 429 then return M.ERROR_TYPES.RATE_LIMITED end
    return nil
end

function M.response_error(response: any, label: string?): (string, any?)
    local status = response and tonumber(response.status_code)
    local diagnostics = nil
    if status then
        local error_type = llm_mapper.classify_error({status_code = status})
        local mapping = llm_output.ERROR_KIND_MAP[error_type]
        diagnostics = {kind = mapping.kind, retryable = mapping.retryable, status_code = status,
            error_type = M.classify_response(status, response.body)}
    end
    return M.failure_message(label or "provider request failed", diagnostics), diagnostics
end

-- Validate the original JSON when an authoritative list is requested. Lua tables
-- alone cannot distinguish an empty array from an empty object.
local model_array = { type = "array", items = { type = "object" } }
local list_schema = { anyOf = { model_array, {
    type = "object", properties = { data = model_array, models = model_array },
    anyOf = { { required = { "data" } }, { required = { "models" } } },
} } }
local bedrock_schema = { type = "object", required = { "modelSummaries" },
    properties = { modelSummaries = model_array } }

function M.decode_response(response: any, label: string?, require_list: boolean?, bedrock: boolean?): (any?, string?, any?)
    if not response then return nil, "empty response" end
    local status = tonumber(response.status_code)
    if not status or status < 200 or status >= 300 then
        return nil, M.response_error(response, label)
    end
    local parsed, perr = json.decode(response.body or "")
    if perr then
        local _, diagnostics = M.transport_error(perr)
        diagnostics = diagnostics or {}
        diagnostics.status_code = status
        return nil, "failed to parse model list", diagnostics
    end
    if require_list and not json.validate_string(bedrock and bedrock_schema or list_schema, response.body) then
        return nil, "provider returned an invalid model list"
    end
    if require_list and type(parsed) == "table" and (parsed.has_more == true
            or (type(parsed.nextPageToken) == "string" and parsed.nextPageToken ~= "")) then
        return nil, "provider returned a partial model list"
    end
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
    local list = item.supportedGenerationMethods or item.supported_generation_methods or item.supportedActions or item.supported_actions
    if type(list) ~= "table" then return false end
    for _, value in ipairs(list) do
        if tostring(value) == action then return true end
    end
    return false
end

return M
