-- Navigation assembly: contributed surfaces merged with admin system controls.
--
-- Nav items reach this library from ONE kind of source: a kickside.ui:nav_provider
-- implementation. The registry scan for declared ui.nav_item entries is itself such
-- a provider (kickside.ui:registry_nav_provider, asked first by priority), so a
-- module that knows its surfaces only at runtime contributes them the same way a
-- YAML declaration does. On top of the collected items the admin's system controls
-- (kickside.ui settings: layout, overrides, categories, custom_items) reshape the
-- navigation — reorder, hide, recategorize, add custom categories and pages.
-- effective() returns the merged, grouped, ordered result the UI renders.

local ui_types = require("ui_types")

local M = {}

local function safe_string(value: any, fallback: string, max_len: integer?): string
    if type(value) ~= "string" or value == "" then return fallback end
    if max_len and #value > max_len then return string.sub(value, 1, max_len) end
    return value
end

local function safe_key(value: any, fallback: string): string
    if type(value) == "string" and string.match(value, "^[%w][%w_.:-]*$") then return value end
    return fallback
end

local function safe_icon(value: any): string
    if type(value) == "string" and string.match(value, "^[%w_-]+:[%w_.-]+$") then return value end
    return "tabler:square"
end

local function safe_path(value: any): string
    if type(value) ~= "string" or value == "" or #value > 256 then return "/" end
    if string.sub(value, 1, 1) ~= "/" then return "/" end
    if string.sub(value, 1, 2) == "//" or string.find(value, "\\", 1, true) or string.find(value, "://", 1, true) then
        return "/"
    end
    if string.match(value, "[%z\1-\31\127]") then return "/" end
    return value
end

local function safe_component_tag(value: any): string
    if type(value) == "string"
        and #value <= 80
        and string.match(value, "^[a-z][a-z0-9]*%-[a-z0-9][a-z0-9%-]*$")
        and string.match(value, "%-$") == nil then
        return value
    end
    return ""
end

type Item = {
    id: string,
    label: string,
    icon: string,
    path: string,
    route_name: string,
    category: string,
    order: number,
    source: string,
    hidden: boolean,
    provider: string?,
    -- How the SPA renders the surface, mirroring ui.settings_tab: "surface"
    -- resolves a renderer the app bundle ships (by `surface`, default route_name);
    -- "component" mounts the registry-declared web component `component_tag`, so a
    -- module-owned surface needs no app code. Optional: an item that declares none
    -- defaults to a surface keyed by its route_name.
    render: string?,
    surface: string?,
    component_tag: string?,
    -- Optional live badge bound to a component-meta field. Declared here (pure
    -- normalization, like icon/path); the value/tone are filled by nav_badges after
    -- the merge so effective() takes no component dependency.
    badge: ui_types.Badge?,
}

type Category = {
    key: string,
    label: string,
    icon: string?,
    order: number,
    collapsed: boolean,
    items: { Item },
}

type CategorySpec = {
    key: string,
    label: string,
    icon: string?,
    order: number,
    collapsed: boolean,
}

local function build_item(raw: { [string]: any }, id: string, source: string, provider: string?): Item
    return {
        id = id,
        label = safe_string(raw.title or raw.label, "", 80),
        icon = safe_icon(raw.icon),
        path = safe_path(raw.path),
        route_name = safe_key(raw.route_name, ""),
        category = safe_key(raw.category or raw.section, ""),
        order = tonumber(raw.order) or ui_types.DEFAULT_ORDER,
        source = source,
        hidden = false,
        provider = provider,
        render = (raw.render == "component") and "component" or "surface",
        surface = safe_key(raw.surface or raw.route_name, ""),
        component_tag = safe_component_tag(raw.component_tag),
        badge = ui_types.normalize_badge(raw.badge),
    }
end

function M.normalize_category(raw: any): CategorySpec?
    if type(raw) ~= "table" then return nil end
    local c = raw :: { [string]: any }
    local key = safe_key(c.key, "")
    if key == "" then return nil end
    local icon = safe_icon(c.icon)
    return {
        key = key,
        label = safe_string(c.title or c.label, key, 80),
        icon = (icon ~= "tabler:square") and icon or nil,
        order = tonumber(c.order) or ui_types.DEFAULT_ORDER,
        collapsed = c.collapsed == true,
    }
end

-- `source` is supplied by the collector from the binding identity, never read
-- from untrusted provider output. A dynamic provider cannot present its item as
-- a declaration merely by returning source = "declared".
function M.normalize_provided(raw: any, provider: string, source: string?): Item?
    if type(raw) ~= "table" then return nil end
    local r = raw :: { [string]: any }
    local id = safe_key(r.id, "")
    if id == "" or #id > 120 then return nil end
    if type(r.path) ~= "string" or safe_path(r.path) ~= r.path then return nil end
    local trusted_source = source == "declared" and "declared" or "provider"
    local item = build_item(r, id, trusted_source, provider)
    if item.label == "" then return nil end
    return item
end

-- normalize_custom coerces an admin-declared custom item into the Item shape.
local function normalize_custom(raw: any): Item?
    if type(raw) ~= "table" then return nil end
    local r = raw :: { [string]: any }
    local path = safe_path(r.path)
    local id = (type(r.id) == "string" and r.id ~= "") and (r.id :: string)
        or ((type(r.route_name) == "string" and r.route_name ~= "") and (r.route_name :: string) or path)
    if type(r.label) ~= "string" or r.label == "" then return nil end
    local item = build_item(r, safe_string(id, path, 80), "custom", nil)
    item.path = path
    return item
end

local function dedupe(items: { Item }): { Item }
    local out: { Item } = {}
    local seen_route: { [string]: boolean } = {}
    local seen_path: { [string]: boolean } = {}
    for _, it in ipairs(items) do
        local route = it.route_name or ""
        local path = it.path or ""
        local taken = (route ~= "" and seen_route[route] == true) or (path ~= "" and seen_path[path] == true)
        if not taken then
            if route ~= "" then seen_route[route] = true end
            if path ~= "" then seen_path[path] = true end
            out[#out + 1] = it
        end
    end
    return out
end

-- apply_override mutates an item with the admin override matching its route_name
-- or id, marking item.hidden so the caller can drop or surface it.
local function apply_override(item: Item, overrides: any): ()
    if type(overrides) ~= "table" then return end
    local o = overrides[item.route_name] or overrides[item.id]
    if type(o) ~= "table" then return end
    local ov = o :: { [string]: any }
    if ov.hidden == true then item.hidden = true end
    if ov.order ~= nil and tonumber(ov.order) then item.order = tonumber(ov.order) :: number end
    if type(ov.category) == "string" then item.category = safe_key(ov.category, item.category) end
    if type(ov.label) == "string" and ov.label ~= "" then item.label = safe_string(ov.label, item.label, 80) end
    if type(ov.icon) == "string" and ov.icon ~= "" then item.icon = safe_icon(ov.icon) end
end

local function sort_items(items: { Item }): ()
    table.sort(items, function(a: Item, b: Item): boolean
        if a.order == b.order then return a.label < b.label end
        return a.order < b.order
    end)
end

-- effective merges the contributed items + admin custom_items, applies overrides,
-- and groups into ordered categories.
--   cfg            — the resolved kickside.ui settings ({ layout, overrides,
--                    categories, custom_items }).
--   items          — normalized items collected from the nav providers, already in
--                    priority order. Tests inject them directly. Absent means an
--                    empty nav, NOT a registry scan: the caller owns the source, so
--                    a failed fan-out surfaces as an error instead of silently
--                    falling back to a different source.
--   include_hidden — keep hidden-flagged items (for the management UI).
--   categories     — categories contributed by modules/providers, in declaration
--                    shape or already normalized (normalize_category is idempotent);
--                    the admin's own categories win on a key conflict.
function M.effective(cfg: any, items: { Item }?, include_hidden: boolean?, categories: { any }?): any
    cfg = (type(cfg) == "table") and cfg or {}
    local layout = (cfg.layout == ui_types.LAYOUT.HORIZONTAL) and ui_types.LAYOUT.HORIZONTAL
        or ui_types.DEFAULT_LAYOUT

    -- Collect contributed + custom items, then resolve collisions first-wins.
    local collected: { Item } = {}
    for _, it in ipairs(items or {}) do collected[#collected + 1] = it end
    if type(cfg.custom_items) == "table" then
        for _, raw in ipairs(cfg.custom_items :: { any }) do
            local ci = normalize_custom(raw)
            if ci then collected[#collected + 1] = ci end
        end
    end
    collected = dedupe(collected)

    -- Apply overrides (sets item.hidden), then drop hidden unless asked to keep.
    local visible: { Item } = {}
    for _, it in ipairs(collected) do
        apply_override(it, cfg.overrides)
        if include_hidden or not it.hidden then visible[#visible + 1] = it end
    end
    sort_items(visible)

    -- Build the category index: the admin's categories first (they own the final
    -- label/order), then the ones modules and providers contribute.
    local cat_by_key: { [string]: Category } = {}
    local cat_order: { Category } = {}
    local function add_category(spec: CategorySpec): ()
        if cat_by_key[spec.key] then return end
        local cat: Category = {
            key = spec.key,
            label = spec.label,
            icon = spec.icon,
            order = spec.order,
            collapsed = spec.collapsed,
            items = {},
        }
        cat_by_key[spec.key] = cat
        cat_order[#cat_order + 1] = cat
    end
    if type(cfg.categories) == "table" then
        for _, raw in ipairs(cfg.categories :: { any }) do
            local spec = M.normalize_category(raw)
            if spec then add_category(spec) end
        end
    end
    for _, raw in ipairs(categories or {}) do
        local spec = M.normalize_category(raw)
        if spec then add_category(spec) end
    end

    -- The root bucket holds uncategorized items; it renders first, untitled.
    local root: Category = { key = "", label = "", icon = nil, order = -1, collapsed = false, items = {} }
    cat_by_key[""] = root

    -- Place each visible item, synthesizing a category for any unknown key.
    for _, it in ipairs(visible) do
        local key = it.category or ""
        local cat = cat_by_key[key]
        if not cat then
            cat = { key = key, label = key, icon = nil, order = ui_types.DEFAULT_ORDER, collapsed = false, items = {} }
            cat_by_key[key] = cat
            cat_order[#cat_order + 1] = cat
        end
        cat.items[#cat.items + 1] = it
    end

    -- Assemble ordered, non-empty categories: root first, then by order.
    table.sort(cat_order, function(a: Category, b: Category): boolean
        if a.order == b.order then return a.label < b.label end
        return a.order < b.order
    end)
    local out_categories: { Category } = {}
    if #root.items > 0 then out_categories[#out_categories + 1] = root end
    for _, cat in ipairs(cat_order) do
        if #cat.items > 0 then out_categories[#out_categories + 1] = cat end
    end

    return {
        layout = layout,
        categories = out_categories,
        items = visible,
    }
end

M.Item = Item
M.CategorySpec = CategorySpec

return M
