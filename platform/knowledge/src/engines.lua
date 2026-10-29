-- KB engine discovery + routing.
--
-- A KB engine is a registry.entry with meta.type = KB_ENGINE_TYPE. Each engine
-- module self-declares one entry per kb_type it provides. The knowledge control
-- plane resolves the impl binding and store contract for a kb_type from these
-- entries instead of hardcoding a kb_type → impl map, so a new engine ships its
-- routing + UI purely by adding an entry.
--
-- The library lazy-requires `registry` (the importing entry must list it in
-- `modules`) and `view_components` (the wippy.views:component_registry import),
-- which resolves declared create/manage view ids to their mountable records.

-- Registry meta.type that marks a KB engine declaration, and the icon used when
-- an engine entry supplies none. These are the engine-discovery protocol this
-- library owns; kept local so engines.lua carries no module imports and never
-- collides on a transitive `consts` alias when pooled alongside the component
-- service.
local KB_ENGINE_TYPE = "kickside.kb_engine"
local DEFAULT_KB_ICON = "tabler:books"

local M = {}

-- Normalize a discovered engine entry into the shape every caller consumes. The
-- registry entry id is exposed as `engine_id` for diagnostics.
--
--   impl_id        component impl binding a KB of this type registers under; it
--                  is also the embeddable binding used for component-bound
--                  embed/ingest dispatch.
--   embed_binding  the binding exposing embed_content/embed_reference. Today it
--                  equals impl_id; carried explicitly so the control plane never
--                  re-derives an engine name from impl_id.
--   query_binding  the binding exposing query() for retrieval/recall.
--   maintenance_binding  the binding exposing the whole-KB maintenance verbs;
--                  absent on an engine that offers no maintenance.
--   store_contract the control-plane store contract for this engine's rows.
--   store_binding  the binding of store_contract that serves this engine's rows;
--                  empty opens the contract's default binding.
--   is_default     default engine used when create callers omit kb_type.
--   accepts_files  admits upload references without extracted text.
-- Badge tones map to the semantic palette in CSS; an engine that declares an
-- unknown tone falls back to neutral so registry data can never inject a raw color.
local VALID_TONE: { [string]: boolean } = {
    primary = true, success = true, info = true,
    warning = true, danger = true, help = true, neutral = true,
}

-- Resolve a declared create/manage view to the mountable WC tag the frontend
-- loads. The declaration domain is the view.component REGISTRY ID -- the same
-- domain automation kinds and the create-view resolver use -- resolved through
-- wippy.views:component_registry.get, which enforces meta.type == view.component.
-- A binding declaring a bare tag is a validation error, not a silent nil.
local function resolve_view_tag(declared: any): (any, string?)
    if declared == nil or declared == "" then return nil, nil end
    if type(declared) ~= "string" or not (declared :: string):find(":", 1, true) then
        return nil, "declares '" .. tostring(declared) .. "'; component views must be view.component registry ids"
    end
    local view_components = require("view_components")
    local rec, err = view_components.get(declared)
    if err or type(rec) ~= "table" then
        return nil, "declares unresolvable view.component '" .. tostring(declared) .. "': " .. tostring(err)
    end
    local tag = (rec :: any).tag_name
    if type(tag) ~= "string" or tag == "" then
        return nil, "view.component '" .. tostring(declared) .. "' declares no tag_name"
    end
    return tag, nil
end

local function badge_of(m: any, label: any, icon: any): any
    local ui: any = m.ui
    local b: any = type(ui) == "table" and ui.badge or nil
    if type(b) ~= "table" then return nil end
    local tone = (type(b.tone) == "string" and VALID_TONE[b.tone]) and b.tone or "neutral"
    return { label = b.label or label, icon = b.icon or icon, tone = tone }
end

local function shape(entry: any): (any, string?)
    local m: any = entry.meta or {}
    local ui: any = type(m.ui) == "table" and m.ui or {}
    local label = m.title or m.kb_type
    local icon = m.icon or DEFAULT_KB_ICON
    -- Create/manage views live in the nested component block (component.create.view /
    -- component.manage.view), the same shape every component kind declares. The
    -- declared value is a view.component registry id; the surfaced create_ui_id /
    -- manage_ui_id carry the resolved WC tag the frontend mounts.
    local comp: any = type(m.component) == "table" and m.component or {}
    local comp_create: any = type(comp.create) == "table" and comp.create or {}
    local comp_manage: any = type(comp.manage) == "table" and comp.manage or {}
    local create_tag, create_err = resolve_view_tag(comp_create.view)
    if create_err then return nil, "create view " .. create_err end
    local manage_tag, manage_err = resolve_view_tag(comp_manage.view)
    if manage_err then return nil, "manage view " .. manage_err end
    -- A contract.binding engine may omit meta.impl_id and BE its own impl: the
    -- entry id is the binding a KB of this type registers under. registry.entry
    -- engines keep declaring impl_id explicitly.
    local impl_id = m.impl_id
    if type(impl_id) ~= "string" or impl_id == "" then impl_id = entry.id end
    return {
        engine_id = entry.id,
        kb_type = m.kb_type,
        label = label,
        description = m.comment or "",
        icon = icon,
        badge = badge_of(m, label, icon),
        impl_id = impl_id,
        embed_binding = m.embed_binding or impl_id,
        query_binding = m.query_binding,
        maintenance_binding = m.maintenance_binding,
        config_maintenance = m.config_maintenance,
        store_contract = m.store_contract,
        store_binding = m.store_binding,
        is_default = m.default == true,
        is_graph = m.is_graph == true,
        accepts_files = m.accepts_files == true,
        create_ui_id = create_tag,
        manage_ui_id = manage_tag,
        -- Optional view modes the manage UI renders for this type. The host owns
        -- the toggle and passes the chosen mode id to the WC via config.view; a
        -- type that declares none renders the default single manage surface.
        manage_views = type(comp_manage.views) == "table" and comp_manage.views or nil,
        default_config = m.default_config,
        config_schema = m.config_schema,
        stats_spec = type(ui) == "table" and ui.stats or nil,
        -- The read-model projections a KB of this type provisions on its primary
        -- thread. Surfaced verbatim so the control plane can auto-apply them at
        -- create time via the kind binding's declared projection set (like
        -- inbox/skills), instead of an imperative ensure_* per KB.
        projections = type(m.projections) == "table" and m.projections or nil,
    }
end

-- Resolve a dotted path (e.g. "document_count") against a public meta/count table.
local function resolve_path(raw: any, path: any): any
    if type(raw) ~= "table" or type(path) ~= "string" then return nil end
    local cur: any = raw
    for seg in string.gmatch(path, "[^.]+") do
        if type(cur) ~= "table" then return nil end
        cur = cur[seg]
    end
    return cur
end

-- format_stats: build {icon,value,label} stat items from an engine's declared
-- stats spec (meta.ui.stats) and a public meta/count table — so the API never
-- branches on kb_type to label counts. The UI renders the icon + grouped value
-- and keeps the noun (label) for the hover/aria title. Entries with a `min` are hidden below that
-- threshold.
function M.format_stats(raw: any, spec: any): any
    local items: {any} = {}
    if type(spec) ~= "table" then return items end
    for _, st in ipairs(spec) do
        local v = resolve_path(raw, st.path)
        local n = tonumber(v) or 0
        if n >= (st.min or 0) then
            local noun = (n == 1) and st.singular or st.plural
            items[#items + 1] = { icon = st.icon, value = n, label = tostring(noun) }
        end
    end
    return items
end

-- apply_default_config: merge an engine's declared default_config under a
-- caller/store config without mutating either table. Descriptor defaults are the
-- canonical source for engine behavior; persisted rows only carry overrides.
function M.apply_default_config(config: any, engine: any): any
    local out: { [string]: any } = {}
    local defaults = type(engine) == "table" and engine.default_config or nil
    if type(defaults) == "table" then
        for k, v in pairs(defaults) do
            out[k] = v
        end
    end
    if type(config) == "table" then
        for k, v in pairs(config) do
            out[k] = v
        end
    end
    return out
end

-- list: every installed KB engine, in declared order then by label. Returns
-- ({engine}, err). An engine missing kb_type/impl_id/store_contract is skipped
-- because it cannot route a create.
-- The registry kinds a KB engine declaration can take. A plain registry.entry
-- routes to a SEPARATE impl binding (meta.impl_id); a contract.binding both
-- declares the engine AND carries the component contracts + the projection set a
-- KB provisions on create -- the same shape inbox/skills kinds use. Discovering
-- both keeps every installed engine visible while a kind can graduate to the
-- declarative form without a routing change.
local ENGINE_KINDS = { "registry.entry", "contract.binding" }

function M.list(): ({any}, error?)
    local registry = require("registry")
    local out: {any} = {}
    local seen: { [string]: boolean } = {}
    for _, kind in ipairs(ENGINE_KINDS) do
        local entries, err = registry.find({
            [".kind"] = kind,
            ["meta.type"] = KB_ENGINE_TYPE,
        })
        if err then return {}, errors.wrap(err, "engine discovery failed") end
        for _, e in ipairs(entries or {}) do
            local eng, shape_err = shape(e)
            if shape_err then
                return {}, errors.new({ kind = errors.INTERNAL, message = "engine " .. tostring((e :: any).id) .. " " .. shape_err })
            end
            if not seen[tostring(eng.engine_id)]
                and type(eng.kb_type) == "string" and eng.kb_type ~= ""
                and type(eng.impl_id) == "string" and eng.impl_id ~= ""
                and type(eng.store_contract) == "string" and eng.store_contract ~= "" then
                seen[tostring(eng.engine_id)] = true
                out[#out + 1] = eng
            end
        end
    end
    table.sort(out, function(a: any, b: any): boolean
        return tostring(a.label) < tostring(b.label)
    end)
    return out, nil
end

function M.default(): (any, error?)
    local engines, err = M.list()
    if err then return nil, err end
    for _, e in ipairs(engines) do
        if e.is_default == true then return e, nil end
    end
    if #engines == 1 then return engines[1], nil end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "no default knowledge engine installed" })
end

-- resolve: the engine for a kb_type, or (nil, err) when none is installed. The
-- error names the type so the UI/API can surface a clear "no engine" message.
function M.resolve(kb_type: any): (any, error?)
    if type(kb_type) ~= "string" or kb_type == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "kb_type is required" })
    end
    local engines, err = M.list()
    if err then return nil, err end
    for _, e in ipairs(engines) do
        if e.kb_type == kb_type then return e, nil end
    end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "no knowledge engine installed for kb_type '" .. kb_type .. "'" })
end

-- by_impl: the engine whose impl_id matches a KB component's impl_id, or nil.
-- Lets a call-site that already holds a component route to the right engine
-- (embed_binding/query_binding/kb_type) without naming any engine. Returns
-- (nil, nil) when no engine matches so callers can fall back to a default.
function M.by_impl(impl_id: any): (any, error?)
    if type(impl_id) ~= "string" or impl_id == "" then
        return nil, nil
    end
    local engines, err = M.list()
    if err then return nil, err end
    for _, e in ipairs(engines) do
        if e.impl_id == impl_id then return e, nil end
    end
    return nil, nil
end

return M
