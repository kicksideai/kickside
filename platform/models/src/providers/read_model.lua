-- Registry read-model for provider adapters and profile presets. Projects the
-- llm.provider, provider_profile_editor, and provider_profile_preset registry
-- entries into the shapes the admin settings surface consumes. Pure registry
-- reads -- no DB, no cache.

local registry = require("registry")
local models_types = require("models_types")
local provider_registry = require("provider_registry")

local M = {}

function M.adapters(): { any }
    local editor_entries = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = models_types.PROVIDER_EDITOR_TYPE,
    }) or {}
    local editors_by_provider = {}
    for _, entry in ipairs(editor_entries) do
        local data = entry.data or {}
        if type(data.provider_id) == "string" and data.provider_id ~= "" then
            editors_by_provider[data.provider_id] = {
                tag_name = data.tag_name,
                base_path = data.base_path,
                entry_point = data.entry_point,
            }
        end
    end

    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = models_types.PROVIDER_TYPE,
    })
    if err or not entries then return {} end
    local out = {}
    for _, entry in ipairs(entries) do
        local meta = entry.meta or {}
        local driver = entry.data and entry.data.driver or {}
        local editor = editors_by_provider[entry.id] or {}
        table.insert(out, {
            id = entry.id,
            name = meta.title or entry.id,
            title = meta.title or entry.id,
            description = meta.comment or "",
            tags = meta.tags or {},
            driver_id = driver.id,
            discoverable = provider_registry.adapter_for(entry.id) ~= nil,
            profile_editor_tag = editor.tag_name,
            profile_editor_base_path = editor.base_path,
            profile_editor_entry_point = editor.entry_point,
        })
    end
    table.sort(out, function(a, b) return tostring(a.title) < tostring(b.title) end)
    return out
end

function M.presets(): { any }
    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = models_types.PROVIDER_PRESET_TYPE,
    })
    if err or not entries then return {} end
    local out = {}
    for _, entry in ipairs(entries) do
        local meta = entry.meta or {}
        local data = entry.data or {}
        table.insert(out, {
            id = entry.id,
            key = data.key or entry.id,
            title = data.title or meta.title or data.key or entry.id,
            description = meta.comment or "",
            icon = data.icon,
            provider_id = data.provider_id,
            config = data.config or {},
            profile_editor_tag = data.profile_editor_tag,
            order = tonumber(data.order) or 100,
            onboarding = data.onboarding ~= false,
        })
    end
    table.sort(out, function(a, b)
        local ao = tonumber(a.order) or 100
        local bo = tonumber(b.order) or 100
        if ao ~= bo then return ao < bo end
        return tostring(a.title) < tostring(b.title)
    end)
    return out
end

return M
