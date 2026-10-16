local http_client = require("http_client")
local common = require("discovery_common")

local M = {}

M.provider_ids = { common.PROVIDERS.GOOGLE_GENAI }

function M.fetch(profile: any): ({ any }?, string?)
    local api_key = common.resolve_value(profile, "api_key", "GEMINI_API_KEY")
    if not api_key then return nil, "Gemini API key is required" end

    local base_url = common.configured_base_url(profile, "https://generativelanguage.googleapis.com/v1beta/models")
    local url = common.append_query(base_url, { pageSize = 1000 })
    local response, err = http_client.get(url, {
        headers = { ["x-goog-api-key"] = api_key },
        timeout = common.timeout(profile, 30),
    })
    if err then return nil, tostring(err) end

    local parsed, perr = common.decode_response(response)
    if not parsed then return nil, perr end
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

return M
