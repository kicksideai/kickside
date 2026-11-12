-- Declarative inbox item types. A module registers a registry.entry with
-- meta.type = inbox.item_type carrying its render metadata; this discovers them so
-- the UI can map an item's item_type to the web component that renders it. Adding
-- an item type is a registry change — no edit to the inbox or its UI.

local registry = require("registry")
local inbox_types = require("inbox_types")

local M = {}

local function render_descriptor(entry: any): any?
    if type(entry) ~= "table" then return nil end
    local m = type((entry :: any).meta) == "table" and (entry :: any).meta or {}
    if type(m.value) ~= "string" or m.value == "" then return nil end
    return {
        value = m.value,
        name = m.title or m.name or m.value,
        icon = m.icon or "tabler:inbox",
        color = m.color,
        category = m.category or "general",
        severity = m.severity,
        component_tag = m.component_tag,
        component_base_path = m.component_base_path,
        actions = type(m.actions) == "table" and m.actions or nil,
        action_owner = m.action_owner == "component" and "component" or nil,
    }
end

local function execution_descriptor(entry: any): any?
    local item = render_descriptor(entry)
    if not item then return nil end
    local m = type((entry :: any).meta) == "table" and (entry :: any).meta or {}
    item.on_validate = type(m.on_validate) == "string" and m.on_validate ~= "" and m.on_validate or nil
    item.on_resolve = type(m.on_resolve) == "string" and m.on_resolve ~= "" and m.on_resolve or nil
    return item
end

-- all returns the declared item types as render descriptors, keyed nowhere (an
-- array) — { value, name, icon, color, category, severity, component_tag,
-- component_base_path, action_owner }. action_owner is emitted only for the
-- canonical value "component"; absence means the Inbox host owns pending actions.
-- name carries the declared human title so the UI never shows the machine value
-- as the item-type label.
function M.all(): any
    local entries, err = registry.find({ ["meta.type"] = inbox_types.ITEM_TYPE_DEF })
    local out: { any } = {}
    if err or type(entries) ~= "table" then return out end
    for _, entry in ipairs(entries) do
        local item = render_descriptor(entry)
        if item then out[#out + 1] = item end
    end
    return out
end

-- Resolve the one canonical declaration used for executable resolution
-- bindings. Public item metadata is never consulted for function targets.
function M.get(value: string): (any?, any?)
    if type(value) ~= "string" or value == "" then return nil, "item type is required" end
    local entries, err = registry.find({ ["meta.type"] = inbox_types.ITEM_TYPE_DEF })
    if err then return nil, tostring(err) end
    local found: any? = nil
    for _, entry in ipairs(type(entries) == "table" and entries or {}) do
        local item = execution_descriptor(entry)
        if item and item.value == value then
            if found then return nil, "multiple inbox.item_type declarations use value " .. value end
            found = item
        end
    end
    if not found then return nil, errors.new({ kind = errors.NOT_FOUND, message = "unknown inbox item type: " .. value }) end
    return found, nil
end

return M
