local registry_models = require("registry_models")
local models_repo = require("models_repo")
local catalog_card_policy = require("catalog_card_policy")

local M = {}

local function non_empty_list(value: any): boolean
    return type(value) == "table" and #value > 0
end

-- The saved provider entry carries only what the DB row stores. When it names the
-- same provider and provider model as a registry entry, that entry's other fields
-- (route facts such as `sampling`) and options stay, with the saved values on top.
-- A changed provider id or provider model replaces the entry as saved.
local function merge_overlay_providers(base_providers: any, overlay_providers: any): any
    if overlay_providers == nil then return base_providers end
    local saved = type(overlay_providers) == "table" and overlay_providers[1] or nil
    if type(base_providers) ~= "table" or type(saved) ~= "table" then return overlay_providers end
    for _, registry_provider in ipairs(base_providers) do
        if type(registry_provider) == "table"
            and registry_provider.id == saved.id
            and registry_provider.provider_model == saved.provider_model then
            local entry = {}
            for k, v in pairs(registry_provider) do entry[k] = v end
            for k, v in pairs(saved) do entry[k] = v end
            local options = {}
            for k, v in pairs(type(registry_provider.options) == "table" and registry_provider.options or {}) do options[k] = v end
            for k, v in pairs(type(saved.options) == "table" and saved.options or {}) do options[k] = v end
            entry.options = options
            return { entry }
        end
    end
    return overlay_providers
end

local function merge_registry_overlay(base: any, overlay: any): any
    if type(base) ~= "table" or type(overlay) ~= "table" then return overlay end
    local merged = {}
    for k, v in pairs(base) do merged[k] = v end
    for k, v in pairs(overlay) do merged[k] = v end
    merged.providers = merge_overlay_providers(base.providers, overlay.providers)

    -- Inherit the registry base list only when the overlay does not carry the
    -- field at all. An overlay that provides an explicit (even empty) list is the
    -- user's saved intent -- so clearing every class/capability sticks instead of
    -- the base list being merged back.
    if overlay.class == nil and non_empty_list(base.class) then
        merged.class = base.class
    end
    if overlay.capabilities == nil and non_empty_list(base.capabilities) then
        merged.capabilities = base.capabilities
    end
    return merged
end

local function by_name_map(): ({ [string]: any }?, any?)
    local map = {}
    local registry_cards = registry_models.get_all() or {}
    for _, card in ipairs(registry_cards) do
        card.source = "registry"
        card.enabled = true
        map[card.name] = card
    end
    local overlays, err = models_repo.list_card_overlays()
    if err then return nil, err end
    for _, card in ipairs(overlays) do
        map[card.name] = merge_registry_overlay(map[card.name], card)
    end
    return map
end

local function sorted_values(map: any): { any }
    local out = {}
    for _, card in pairs(map) do
        if card.enabled ~= false then table.insert(out, card) end
    end
    table.sort(out, function(a, b) return tostring(a.name) < tostring(b.name) end)
    return out
end

-- Every card including disabled ones, for the admin surface (so a disabled model
-- stays listed and can be re-enabled). Runtime resolution uses sorted_values.
local function sorted_all(map: any): { any }
    local out = {}
    for _, card in pairs(map) do table.insert(out, card) end
    table.sort(out, function(a, b) return tostring(a.name) < tostring(b.name) end)
    return out
end

function M.get_all(): ({ any }?, any?)
    local map, err = by_name_map()
    if err then return nil, err end
    return sorted_values(map)
end

function M.get_all_public(): ({ any }?, any?)
    local out = {}
    -- Admin surface lists every model, disabled included, so a disabled one stays
    -- visible and can be toggled back on.
    local map, err = by_name_map()
    if err then return nil, err end
    for _, card in ipairs(sorted_all(map)) do
        table.insert(out, catalog_card_policy.public_card(card))
    end
    return out
end

function M.get_by_name(name: string): (any?, any?)
    if not name or name == "" then return nil, "Model name is required" end
    local map, err = by_name_map()
    if err then return nil, err end
    local card = map[name]
    if card and card.error then return nil, card.error end
    if not card or card.enabled == false then return nil, "No model found with name: " .. name end
    return card
end

local function class_cards(cards: { any }, class_name: string): { any }
    local out = {}
    for _, card in ipairs(cards) do
        for _, cls in ipairs(card.class or {}) do
            if cls == class_name then
                table.insert(out, card)
                break
            end
        end
    end
    table.sort(out, function(a, b)
        return (tonumber(a.priority) or 0) > (tonumber(b.priority) or 0)
    end)
    return out
end

function M.get_by_class(class_name: string): ({ any }?, any?)
    if not class_name or class_name == "" then return {}, "Class name is required" end
    local cards, err = M.get_all()
    if err then return nil, err end
    return class_cards(cards :: { any }, class_name)
end

function M.resolve(model_identifier: string): (any?, any?)
    if not model_identifier or model_identifier == "" then return nil, "Model is required" end
    local map, err = by_name_map()
    if err then return nil, err end
    local class_name = model_identifier:match("^class:(.+)")
    if not class_name then
        local card = map[model_identifier]
        if card and card.error then return nil, card.error end
        if card and card.enabled ~= false then return card end
    end
    local class_models = class_cards(sorted_values(map), class_name or model_identifier)
    if #class_models > 0 then return class_models[1] end
    if class_name then return nil, "No models found for class: " .. class_name end
    return nil, "Model or class not found: " .. model_identifier
end

function M.get_all_classes(): ({ any }?, any?)
    local map = {}
    local cards, err = M.get_all()
    if err then return nil, err end
    for _, card in ipairs(cards) do
        for _, class_name in ipairs(card.class or {}) do
            map[class_name] = map[class_name] or { name = class_name, title = class_name, description = "" }
        end
    end
    local out = {}
    for _, row in pairs(map) do table.insert(out, row) end
    table.sort(out, function(a, b) return tostring(a.name) < tostring(b.name) end)
    return out
end

return M
