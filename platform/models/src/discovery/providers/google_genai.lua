local http_client = require("http_client")
local json = require("json")
local common = require("discovery_common")

local M = {}

M.provider_ids = { common.PROVIDERS.GOOGLE_GENAI }

function M.fetch(profile: any, require_list: boolean?): ({ any }?, string?, any?)
    local api_key = common.resolve_value(profile, "api_key", "GEMINI_API_KEY")
    if not api_key then return nil, "Gemini API key is required" end

    local base_url = common.configured_base_url(profile, "https://generativelanguage.googleapis.com/v1beta/models")
    local url = common.append_query(base_url, { pageSize = 1000 })
    local response, err = http_client.get(url, {
        headers = { ["x-goog-api-key"] = api_key },
        timeout = common.timeout(profile, 30),
    })
    if err then return nil, common.transport_error(err) end

    local parsed, perr, diagnostics = common.decode_response(response, nil, require_list)
    if not parsed then return nil, perr, diagnostics end
    if type(parsed.models) == "table" then return common.as_array(parsed.models) end
    return common.model_rows(parsed)
end

function M.model_id(item: any): string?
    local raw_id = item.id or item.name or item.model or item.modelId
    if type(raw_id) ~= "string" or raw_id == "" then return nil end
    return tostring(raw_id):gsub("^models/", "")
end

function M.capabilities(_model_id: string, item: any): { string }
    local out: { string } = {}
    if common.supported_action(item, "generateContent") then common.add_unique(out, "generate") end
    if common.supported_action(item, "embedContent") then common.add_unique(out, "embed") end
    if #out == 0 then common.add_unique(out, "generate") end
    return out
end

local function probe_model(rows: { any }): string
    local first = ""
    for _, item in ipairs(rows) do
        local id = type(item) == "table" and common.supported_action(item, "generateContent") and M.model_id(item) or nil
        if id then
            if first == "" then first = id end
            if id:find("flash", 1, true) then return id end
        end
    end
    return first
end

-- A one-token generation: listing models does not need billing, generating does.
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
    local api_key = common.resolve_value(profile, "api_key", "GEMINI_API_KEY")
    if not api_key then return nil, "Gemini API key is required" end
    local base_url = common.configured_base_url(profile, "https://generativelanguage.googleapis.com/v1beta/models")
    if not base_url:match("/models$") then base_url = base_url .. "/models" end
    local response, err = http_client.post(base_url .. "/" .. (model:gsub("^models/", "")) .. ":generateContent", {
        headers = { ["x-goog-api-key"] = api_key, ["Content-Type"] = "application/json" },
        timeout = common.timeout(profile, 30),
        body = json.encode({
            contents = { { parts = { { text = "ping" } } } },
            generationConfig = { maxOutputTokens = 1 },
        }),
    })
    if err then return nil, common.transport_error(err, "generation probe failed") end
    local status = tonumber(response and response.status_code)
    if not status or status < 200 or status >= 300 then
        return nil, common.response_error(response, "generation probe failed")
    end
    return { success = true, mode = "generate_content", model = model, count = count,
        message = "Generation probe succeeded for " .. model, status_code = status }
end

return M
