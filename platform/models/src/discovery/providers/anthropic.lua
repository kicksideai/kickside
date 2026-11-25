local http_client = require("http_client")
local json = require("json")
local common = require("discovery_common")

local M = {}

M.provider_ids = { common.PROVIDERS.ANTHROPIC }

local function request_headers(profile: any): { [string]: string }?
    local api_key = common.resolve_value(profile, "api_key", "ANTHROPIC_API_KEY")
    if not api_key then return nil end
    return {
        ["x-api-key"] = api_key,
        ["anthropic-version"] = common.resolve_value(profile, "api_version", "ANTHROPIC_API_VERSION") or "2023-06-01",
        ["content-type"] = "application/json",
    }
end

function M.fetch(profile: any): ({ any }?, string?, any?)
    local headers = request_headers(profile)
    if not headers then return nil, "Anthropic API key is required" end
    local base_url = common.configured_base_url(profile, "https://api.anthropic.com")
    local response, err = http_client.get(common.join_endpoint(base_url, "/v1/models"), {
        headers = headers,
        timeout = common.timeout(profile, 30),
    })
    if err then return nil, common.transport_error(err) end

    local parsed, perr, diagnostics = common.decode_response(response)
    if not parsed then return nil, perr, diagnostics end
    return common.model_rows(parsed)
end

local function probe_model(rows: { any }): string
    local first = ""
    for _, item in ipairs(rows) do
        local id = type(item) == "table" and tostring(item.id or "") or ""
        if id ~= "" then
            if first == "" then first = id end
            if id:find("haiku", 1, true) then return id end
        end
    end
    return first
end

-- A one-token generation: a model list succeeds without credits, a message does not.
function M.test_generation(profile: any, opts: any): (any?, string?, any?)
    local config = type(profile) == "table" and profile.config or {}
    local model = type(opts) == "table" and type(opts.model) == "string" and opts.model or ""
    if model == "" and type(config.test_model) == "string" then model = config.test_model end
    local count = nil
    if model == "" then
        local rows, err, diagnostics = M.fetch(profile)
        if not rows then return nil, err, diagnostics end
        count = #rows
        model = probe_model(rows)
        if model == "" then
            return { success = true, mode = "models", count = count,
                message = "Authenticated model-list request succeeded, but no model was available for generation probe" }
        end
    end
    local headers = request_headers(profile)
    if not headers then return nil, "Anthropic API key is required" end
    local base_url = common.configured_base_url(profile, "https://api.anthropic.com")
    local response, err = http_client.post(common.join_endpoint(base_url, "/v1/messages"), {
        headers = headers,
        timeout = common.timeout(profile, 30),
        body = json.encode({ model = model, max_tokens = 1, messages = { { role = "user", content = "ping" } } }),
    })
    if err then return nil, common.transport_error(err, "message probe failed") end
    local status = tonumber(response and response.status_code)
    if not status or status < 200 or status >= 300 then
        return nil, common.response_error(response, "message probe failed")
    end
    return { success = true, mode = "messages", model = model, count = count,
        message = "Generation probe succeeded for " .. model, status_code = status }
end

return M
