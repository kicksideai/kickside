local http_client = require("http_client")
local common = require("discovery_common")

local M = {}

M.provider_ids = { common.PROVIDERS.ANTHROPIC }

function M.fetch(profile: any): ({ any }?, string?)
    local api_key = common.resolve_value(profile, "api_key", "ANTHROPIC_API_KEY")
    if not api_key then return nil, "Anthropic API key is required" end

    local headers: { [string]: string } = {
        ["x-api-key"] = api_key,
        ["anthropic-version"] = common.resolve_value(profile, "api_version", "ANTHROPIC_API_VERSION") or "2023-06-01",
    }
    local base_url = common.configured_base_url(profile, "https://api.anthropic.com")
    local response, err = http_client.get(common.join_endpoint(base_url, "/v1/models"), {
        headers = headers,
        timeout = common.timeout(profile, 30),
    })
    if err then return nil, tostring(err) end

    local parsed, perr = common.decode_response(response)
    if not parsed then return nil, perr end
    return common.model_rows(parsed)
end

return M
