local http_client = require("http_client")
local common = require("discovery_common")
local sigv4 = require("sigv4")

local M = {}

M.provider_ids = { common.PROVIDERS.BEDROCK }

local function extract_host(url: string): string?
    return tostring(url):match("^https?://([^/]+)")
end

local function default_base_url(profile: any, region: string): string
    local configured = common.configured_base_url(profile, "")
    if configured ~= "" then return configured:gsub("bedrock%-runtime%.", "bedrock.") end
    return "https://bedrock." .. region .. ".amazonaws.com"
end

function M.fetch(profile: any): ({ any }?, string?)
    local region = common.resolve_value(profile, "region", "AWS_REGION")
        or common.resolve_value(profile, "aws_region", "AWS_DEFAULT_REGION")
        or "us-east-1"
    local access_key = common.resolve_value(profile, "access_key", "AWS_ACCESS_KEY_ID")
    local secret_key = common.resolve_value(profile, "secret_key", "AWS_SECRET_ACCESS_KEY")
    local session_token = common.resolve_value(profile, "session_token", "AWS_SESSION_TOKEN")
    if not access_key or not secret_key then
        return nil, "AWS access key and secret key are required for Bedrock discovery"
    end

    local base_url = default_base_url(profile, region)
    local host = extract_host(base_url)
    if not host then return nil, "invalid Bedrock endpoint" end

    local query: any = {}
    local provider = profile.config and profile.config.bedrock_provider
    if type(provider) == "string" and provider ~= "" then query.byProvider = provider end
    local signed_headers, sign_err = sigv4.sign_request({
        method = "GET",
        host = host,
        uri = "/foundation-models",
        query_params = query,
        headers = { ["accept"] = "application/json" },
        body = "",
        region = region,
        service = "bedrock",
        access_key = access_key,
        secret_key = secret_key,
        session_token = session_token,
    })
    if not signed_headers then return nil, "Bedrock request signing failed: " .. tostring(sign_err) end

    local request_headers: { [string]: string } = {}
    for k, v in pairs(signed_headers) do
        request_headers[tostring(k)] = tostring(v)
    end

    local response, err = http_client.get(common.append_query(base_url .. "/foundation-models", query), {
        headers = request_headers,
        timeout = common.timeout(profile, 30),
    })
    if err then return nil, tostring(err) end

    local parsed, perr = common.decode_response(response)
    if not parsed then return nil, perr end
    if type(parsed.modelSummaries) == "table" then return common.as_array(parsed.modelSummaries) end
    return {}
end

function M.capabilities(_model_id: string, item: any): { string }
    local out: { string } = {}
    if common.has_modality(item.outputModalities, "TEXT") then common.add_unique(out, "generate") end
    if common.has_modality(item.outputModalities, "EMBEDDING") then common.add_unique(out, "embed") end
    if #out == 0 then common.add_unique(out, "generate") end
    return out
end

return M
