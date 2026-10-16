local openai_like = require("openai_like_provider")
local anthropic = require("anthropic_provider")
local google_genai = require("google_genai_provider")
local bedrock = require("bedrock_provider")

local M = {}

local adapters_by_provider = {}

local function register(adapter: any)
    for _, provider_id in ipairs(adapter.provider_ids or {}) do
        adapters_by_provider[provider_id] = adapter
    end
end

register(openai_like)
register(anthropic)
register(google_genai)
register(bedrock)

function M.adapter_for(provider_id: string): any?
    return adapters_by_provider[provider_id]
end

return M
