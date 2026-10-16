local http_client = require("http_client")
local json = require("json")
local common = require("discovery_common")
local mapper = require("model_mapper")

local M = {}

M.provider_ids = {
    common.PROVIDERS.OPENAI,
    common.PROVIDERS.OPENAI_COMPAT,
    common.PROVIDERS.OPENAI_COMPAT_PLAIN,
}

-- OpenAI's /v1/models reports bare ids with no capability metadata, so the
-- first-party reasoning families are recognized by id: the o-series and the
-- gpt-5 series take reasoning effort and reject classic sampling parameters
-- (temperature/top_p), while chat-tuned variants keep sampling semantics. A
-- card missing the reasoning capability sends temperature and every call
-- fails with a permanent 400. Applies to the first-party provider only: a
-- compatible endpoint may serve any model under any name, so there the ids
-- carry no meaning and explicit metadata alone decides.
local function is_reasoning_family(model_id: string): boolean
    local id = model_id:lower()
    if id:find("chat", 1, true) then return false end
    if id:match("^o%d") then return true end
    if id:match("^gpt%-5") then return true end
    return false
end

function M.capabilities(model_id: string, item: any, profile: any): { string }
    local out = mapper.infer_capabilities(model_id, item)
    local provider_id = type(profile) == "table" and tostring(profile.provider_id or "") or ""
    if provider_id == common.PROVIDERS.OPENAI
        and common.table_has(out, "generate")
        and is_reasoning_family(model_id) then
        common.add_unique(out, "reasoning")
    end
    return out
end

local function auth_headers(profile: any): { [string]: string }
    local api_key = common.resolve_value(
        profile,
        "api_key",
        profile.provider_id == common.PROVIDERS.OPENAI and "OPENAI_API_KEY" or "OPENAI_COMPAT_API_KEY"
    )
    local headers: { [string]: string } = { ["Content-Type"] = "application/json" }
    if api_key and api_key ~= "" then headers["Authorization"] = "Bearer " .. tostring(api_key) end

    local organization = common.resolve_value(
        profile,
        "organization",
        profile.provider_id == common.PROVIDERS.OPENAI and "OPENAI_ORGANIZATION" or "OPENAI_COMPAT_ORGANIZATION"
    )
    if organization and organization ~= "" then headers["OpenAI-Organization"] = organization end
    return headers
end

function M.fetch(profile: any): ({ any }?, string?)
    local headers = auth_headers(profile)

    local base_url = common.configured_base_url(profile, "https://api.openai.com/v1")
    local response, err = http_client.get(common.join_endpoint(base_url, "/models"), {
        headers = headers,
        timeout = common.timeout(profile, 30),
    })
    if err then return nil, common.scrub_message(err) end

    local parsed, perr = common.decode_response(response, "model list failed")
    if not parsed then return nil, perr end
    return common.model_rows(parsed)
end

local function test_model(profile: any, opts: any): string
    if type(opts) == "table" and type(opts.model) == "string" and opts.model ~= "" then
        return opts.model
    end
    local config = type(profile) == "table" and profile.config or {}
    if type(config.test_model) == "string" and config.test_model ~= "" then return config.test_model end
    return ""
end

local function auto_test_model(rows: any): string
    if type(rows) ~= "table" then return "" end
    local fallback = ""
    for _, item in ipairs(rows) do
        local id = ""
        if type(item) == "table" then
            id = tostring(item.id or item.name or item.model or "")
        elseif type(item) == "string" then
            id = item
        end
        if type(id) == "string" and id ~= "" then
            if fallback == "" then fallback = id end
            local lower = id:lower()
            if not lower:find("embed", 1, true) and not lower:find("embedding", 1, true) then
                return id
            end
        end
    end
    return fallback
end

function M.test(profile: any, opts: any): (any?, string?)
    local model = test_model(profile, opts)
    if model == "" then
        local rows, err = M.fetch(profile)
        if err then return nil, err end
        model = auto_test_model(rows)
        if model ~= "" then
            opts = { model = model }
            return M.test(profile, opts)
        end
        return {
            success = true,
            mode = "models",
            count = #(rows or {}),
            message = "Authenticated model-list request succeeded, but no model was available for generation probe",
        }
    end

    local base_url = common.configured_base_url(profile, "https://api.openai.com/v1")
    local response, err = http_client.post(common.join_endpoint(base_url, "/chat/completions"), {
        headers = auth_headers(profile),
        timeout = common.timeout(profile, 30),
        body = json.encode({
            model = model,
            messages = {
                { role = "user", content = "ping" },
            },
            max_tokens = 1,
            temperature = 0,
            stream = false,
        }),
    })
    if err then return nil, "chat completion probe failed: " .. common.scrub_message(err) end
    local status = tonumber(response and response.status_code)
    if not status or status < 200 or status >= 300 then
        return nil, common.response_error(response, "chat completion probe failed")
    end

    return {
        success = true,
        mode = "chat_completions",
        model = model,
        message = "Generation probe succeeded for " .. model,
        status_code = status,
    }
end

return M
