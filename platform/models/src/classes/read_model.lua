-- Registry read-model for model-class tiers. Projects the model_class registry
-- entries into declarative metadata (title / description / icon / weight) callers
-- sort by. Classes are assigned to models via the card class field; this only
-- describes them. Pure registry reads -- no DB, no cache.

local registry = require("registry")
local models_types = require("models_types")

local M = {}

-- weight orders the tiers from fastest/lightest (low) to most capable (high) so
-- callers can sort.
function M.model_classes(): { any }
    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = models_types.MODEL_CLASS_TYPE,
    })
    if err or not entries then return {} end
    local out = {}
    for _, entry in ipairs(entries) do
        local meta = entry.meta or {}
        table.insert(out, {
            name = meta.key or entry.id,
            title = meta.title or meta.key or entry.id,
            description = meta.comment or "",
            icon = meta.icon,
            weight = tonumber(meta.weight) or 100,
            capability = meta.capability,
        })
    end
    return out
end

return M
