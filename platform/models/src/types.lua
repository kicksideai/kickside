local registry = require("registry")

local M = {}

M.DB_CONFIG = "kickside.models:db_config"
M.CACHE_ID = "kickside.models:cache"
M.CACHE_KEY = "snapshot"

M.PROVIDER_TYPE = "llm.provider"
M.MODEL_TYPE = "llm.model"
M.PROVIDER_EDITOR_TYPE = "kickside.models:provider_profile_editor"
M.PROVIDER_PRESET_TYPE = "kickside.models:provider_profile_preset"
M.MODEL_CLASS_TYPE = "kickside.models:model_class"

M.SOURCE_REGISTRY = "registry"
M.SOURCE_DISCOVERED = "discovered"
M.SOURCE_MANUAL = "manual"
M.SOURCE_OVERLAY = "overlay"

M.DEFAULT_PROVIDER = "wippy.llm.openai_compat:provider"

-- Topic a provider profile write broadcasts to. Provider-owned background
-- services (e.g. the Vertex token supervisor) subscribe and self-filter by
-- provider; the write path never targets a service by provider name.
M.PROFILE_CHANGED_TOPIC = "kickside.models.profile.changed"

-- Process registry name: the id of the service entry subscribing to PROFILE_CHANGED_TOPIC.
M.VERTEX_TOKEN_SUPERVISOR_PROCESS = "kickside.models.providers.google_vertex:vertex_token_supervisor.service"

function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

function M.slug(value: any): string
    local s = tostring(value or ""):lower()
    s = s:gsub("[^%w%-_%.]+", "-")
    s = s:gsub("%-+", "-")
    s = s:gsub("^%-+", ""):gsub("%-+$", "")
    if s == "" then return "profile" end
    return s
end

function M.limits_configured(max_tokens: any, output_tokens: any, capabilities: any): boolean
    if (tonumber(max_tokens) or 0) <= 0 then return false end
    if type(capabilities) ~= "table" then return false end
    for _, capability in ipairs(capabilities) do
        if capability == "generate" then
            return (tonumber(output_tokens) or 0) > 0
        end
    end
    return true
end

return M
