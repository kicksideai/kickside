local openrouter = require("reference_openrouter")

-- Composition root for the model-metadata reference port. Discovery depends on
-- this abstraction, not on any concrete source, so additional catalogs (e.g.
-- models.dev, a static map) can be added here without touching the orchestrator.
-- Sources are tried in order and merged per field; the first source to supply a
-- field wins. A missing entry is optional; source failures stop discovery.
local M = {}

local sources: { any } = { openrouter }

-- lookup returns { context_length?, output_tokens?, pricing? } gathered across
-- sources, or nil when none has anything for this model.
function M.lookup(provider_id: string, provider_model: string): (any?, any?)
    local merged: any = nil
    for _, src in ipairs(sources) do
        local result, err = src.lookup(provider_id, provider_model)
        if err then return nil, err end
        if type(result) == "table" then
            merged = merged or {}
            if merged.context_length == nil and result.context_length ~= nil then
                merged.context_length = result.context_length
            end
            if merged.output_tokens == nil and result.output_tokens ~= nil then
                merged.output_tokens = result.output_tokens
            end
            if merged.pricing == nil and result.pricing ~= nil then
                merged.pricing = result.pricing
            end
        end
    end
    return merged
end

return M
