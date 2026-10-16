-- Automation type catalog: type binding resolution, declared actions and
-- lifecycle methods, public-state schemas of a type, view components, and
-- list_types.

local automation_types = require("types")
local support = require("engine_support")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines this part's engine functions on M; P
-- carries the private helpers the engine parts share.
function part.attach(M: any, dependencies: any, P: any): ()
    local AUTOMATION_TYPE = support.AUTOMATION_TYPE
    local automation_error = support.automation_error
    local LIFECYCLE_METHODS = support.LIFECYCLE_METHODS
    local declared_action_name = support.declared_action_name
    local entry_contracts = support.entry_contracts
    local GENERIC_ACTIONS = support.GENERIC_ACTIONS

    -- Find the first method target id matching `method_name` across the
    -- binding's contracts. Returns (target_id, contract_id) or (nil, nil).
    function M.find_method(entry: any, method_name: string): (string?, string?)
        for _, c in ipairs(entry_contracts(entry :: automation_types.RegistryEntry?)) do
            local methods = c.methods or {}
            local target = methods[method_name]
            if type(target) == "string" then return target, tostring(c.contract or "") end
        end
        return nil, nil
    end

    -- Return the contract id that declares the given method, or nil if no
    -- contract on this binding declares it.
    function M.contract_for_method(entry: any, method_name: string): string?
        local _, contract_id = M.find_method(entry, method_name)
        return contract_id
    end

    -- Resolve a public action declared by meta.actions. Contracts provide method
    -- targets, but metadata decides which methods are callable through the generic
    -- action API/UI.
    function M.resolve_action(entry: any, method_name: string, include_generic: boolean?): automation_types.AutomationAction?
        if type(method_name) ~= "string" or method_name == "" or LIFECYCLE_METHODS[method_name] then return nil end
        if GENERIC_ACTIONS[method_name] and include_generic ~= true then return nil end
        if type(entry) ~= "table" then return nil end
        local meta = entry.meta
        if type(meta) ~= "table" or type(meta.actions) ~= "table" then return nil end

        for _, spec in ipairs(meta.actions :: { any }) do
            local name = declared_action_name(spec)
            if name == method_name then
                local target_id, contract_id = M.find_method(entry, method_name)
                if type(target_id) == "string" and type(contract_id) == "string" and contract_id ~= "" then
                    return {
                        name = method_name,
                        contract = contract_id,
                        target = target_id,
                    }
                end
                return nil
            end
        end
        return nil
    end

    -- Walk the binding's public action declarations. Result is a sorted array of
    -- { name, contract, target } records. Undeclared contract methods stay private.
    function M.collect_actions(entry: any, include_generic: boolean?): {automation_types.AutomationAction}
        local actions: {automation_types.AutomationAction} = {}
        local seen: { [string]: boolean } = {}
        local meta = type(entry) == "table" and entry.meta or nil
        local declarations = type(meta) == "table" and meta.actions or nil
        if type(declarations) ~= "table" then return actions end
        for _, spec in ipairs(declarations :: { any }) do
            local name = declared_action_name(spec)
            if name and not seen[name] and not LIFECYCLE_METHODS[name] then
                local action = M.resolve_action(entry, name, include_generic)
                if action then
                    actions[#actions + 1] = action
                    seen[name] = true
                end
            end
        end
        table.sort(actions, function(a: automation_types.AutomationAction, b: automation_types.AutomationAction) return a.name < b.name end)
        return actions
    end

    -- Only executable bindings own drives; create-only provider adapters offer
    -- setup views, not a control surface. Return fresh descriptors to callers.
    local function collect_controls(entry: any): {automation_types.AutomationControl}
        local controls: {automation_types.AutomationControl} = {}
        if entry.kind ~= "contract.binding" then return controls end
        for _, spec in pairs(support.DRIVE_CONTROLS) do
            controls[#controls + 1] = {
                name = spec.name, request_id_required = spec.request_id_required,
                keys_required = spec.keys_required,
            }
        end
        table.sort(controls, function(a: automation_types.AutomationControl, b: automation_types.AutomationControl): boolean
            return a.name < b.name
        end)
        return controls
    end

    -- True if the lifecycle table contains `method_name`.
    function M.is_lifecycle(method_name: string): boolean
        return LIFECYCLE_METHODS[method_name] == true
    end

    -- True if the wanted class string appears in the meta.class field. Accepts
    -- both string and array shapes; empty filter matches everything.
    function M.class_matches(meta_class: automation_types.ClassValue?, wanted: string?): boolean
        if wanted == nil or wanted == "" then return true end
        if type(meta_class) == "string" then return meta_class == wanted end
        if type(meta_class) == "table" then
            for _, c in ipairs(meta_class :: any) do
                if c == wanted then return true end
            end
        end
        return false
    end

    -- All contract.binding ids carrying meta.type=kickside.automation, regardless
    -- of class or announced flag. This is the discriminator for "is an umbrella
    -- instance" — reading by impl id (rather than by a meta.class value) is what
    -- lets list_installed see umbrellas of every class instead of only the literal
    -- "automation" class. Resolved from the registry so the set has no hardcoding.
    local function automation_binding_ids(): ({string}?, any)
        local registry = dependencies.registry :: automation_types.RegistryModule
        local entries, err = registry.find({
            [".kind"] = "contract.binding",
            ["meta.type"] = AUTOMATION_TYPE,
        })
        if err then return nil, automation_error("automation types unavailable", errors.UNAVAILABLE, err) end
        local ids: {string} = {}
        for _, e in ipairs(entries or {}) do
            if type(e.id) == "string" then ids[#ids + 1] = e.id end
        end
        return ids
    end

    -- Resolve automation type binding ids by a binding-meta filter (e.g.
    -- { provider = "discord" }), always scoped to meta.type = automation.
    -- Provider-neutral and registry-resolved, so callers (gateway hubs) never
    -- hardcode an app-namespaced binding id to find their own automation types.
    local function binding_ids_by_meta(type_meta: any): ({string}?, any)
        local registry = dependencies.registry :: automation_types.RegistryModule
        local query: Map = { [".kind"] = "contract.binding", ["meta.type"] = AUTOMATION_TYPE }
        if type(type_meta) == "table" then
            for k, v in pairs(type_meta :: Map) do
                if type(k) == "string" and k ~= "" then query["meta." .. k] = v end
            end
        end
        local entries, err = registry.find(query)
        if err then return nil, automation_error("automation types unavailable", errors.UNAVAILABLE, err) end
        local ids: {string} = {}
        for _, e in ipairs(entries or {}) do
            if type(e.id) == "string" then ids[#ids + 1] = e.id end
        end
        return ids
    end

    -- Resolve an automation type's public_state_schema from its binding impl id.
    -- Shared by the single-component read path (public_state_component) and the
    -- list projection (list_installed), so schema resolution has one authority.
    -- Returns (schema_or_nil, err). A missing schema is nil without an error: a
    -- type may declare no public state.
    local function public_state_schema_for_impl(registry: automation_types.RegistryModule, impl_id: string): (any?, error?)
        if type(impl_id) ~= "string" or impl_id == "" then return nil, errors.new({ kind = errors.NOT_FOUND, message = "automation not found" }) end
        local entry, get_err = registry.get(impl_id)
        if get_err and not errors.is(get_err, errors.NOT_FOUND) then return nil, get_err end
        if type(entry) ~= "table" or entry.kind ~= "contract.binding" or (entry.meta or {}).type ~= AUTOMATION_TYPE then
            return nil, (errors.new({ kind = errors.UNAVAILABLE, retryable = false,
                message = "Automation type unavailable: " .. impl_id,
                details = { reason = "type_unavailable", impl_id = impl_id } }) :: error)
        end
        local meta: Map = entry.meta or {}
        return meta.public_state_schema, nil
    end

    local function public_state_component(component: automation_types.ComponentModule, registry: automation_types.RegistryModule, component_id: string, access_mask: integer?): (any?, automation_types.ComponentRow?, any)
        local rows, query_err = component.query({
            component_ids = { component_id },
            include = { access = true, meta = true },
            access_mask = access_mask or component.ACCESS.WRITE,
        })
        if query_err then return nil, nil, query_err end
        local row = rows and rows[1]
        if not row or type(row.impl_id) ~= "string" or row.impl_id == "" then
            return nil, nil, "automation not found"
        end
        local schema, schema_err = public_state_schema_for_impl(registry, row.impl_id)
        if schema_err then return nil, nil, schema_err end
        return schema, row :: automation_types.ComponentRow, nil
    end

    local function action_required_access(component: automation_types.ComponentModule, method_name: string): integer
        if method_name == "status" or method_name == "health" then return component.ACCESS.READ end
        if method_name == "set_execution_identity" then return component.ACCESS.ADMIN end
        return component.ACCESS.WRITE
    end

    -- Resolve a view.component registry id to its public-facing fields.
    -- The frontend needs `tag_name` plus the static bundle location
    -- (`base_path`/`entry_point`, or `url`) to dynamically import + mount the
    -- component. Resolution delegates to the canonical wippy.views component
    -- registry (which enforces meta.type == view.component); unresolved or
    -- non-view-component ids return nil so callers can ignore them.
    local function resolve_view_component(component_id: string?): automation_types.ViewComponent?
        if not component_id or component_id == "" then return nil end
        local view_components = dependencies.view_components
        if not view_components then return nil end
        local rec, _ = (view_components :: any).get(component_id)
        if type(rec) ~= "table" then return nil end
        local r = rec :: Map
        return {
            id       = tostring(r.id or ""),
            name     = tostring(r.name or r.id or ""),
            title    = tostring(r.title or r.name or r.id or ""),
            tag_name = tostring(r.tag_name or ""),
            base_path = tostring(r.base_path or ""),
            entry_point = tostring(r.entry_point or ""),
            url      = tostring(r.url or ""),
        } :: automation_types.ViewComponent
    end

    -- Enrich an automation type's `meta.component` block with resolved
    -- view.component records keyed by the nested create/manage slot. Frontend
    -- renders by reading `component.create_ui` etc. without needing its own
    -- registry lookup or hard-coded id→url map.
    local function enrich_component_block(meta_component: any): Map?
        if type(meta_component) ~= "table" then return nil end
        local out: Map = {}
        for k, v in pairs(meta_component :: Map) do out[k] = v end
        local create_ui_id: string? = nil
        local manage_ui_id: string? = nil
        local raw_create = (meta_component :: any).create
        local raw_manage = (meta_component :: any).manage
        local create_view = type(raw_create) == "table" and (raw_create :: any).view or nil
        local manage_view = type(raw_manage) == "table" and (raw_manage :: any).view or nil
        if type(create_view) == "string" then
            create_ui_id = create_view
        end
        if type(manage_view) == "string" then
            manage_ui_id = manage_view
        end
        local create_ui = resolve_view_component(create_ui_id)
        local manage_ui = resolve_view_component(manage_ui_id)
        if create_ui then out.create_ui = create_ui end
        if manage_ui then out.manage_ui = manage_ui end
        return out
    end

    -- list_types: enumerate installable automation types from the registry.
    -- opts: { class? = "automation"|"knowledge"|..., category? = string }
    function M.list_types(opts: automation_types.ListTypesOptions?): ({automation_types.AutomationType}?, error?)
        opts = opts or {}
        local registry = dependencies.registry :: automation_types.RegistryModule

        -- Provider-owned catalog adapters may be registry.entry declarations with
        -- a component create view, while executable automation implementations are
        -- contract bindings. Query the shared metadata discriminator here and let
        -- the catalog-entry guard below admit only those two supported shapes.
        local all_entries, err = registry.find({ ["meta.type"] = AUTOMATION_TYPE })
        if err then return nil, err end

        local class_filter = opts.class
        local category_filter = opts.category

        local types: {automation_types.AutomationType} = {}
        for _, entry in ipairs(all_entries or {}) do
            local typed_entry = entry :: automation_types.RegistryEntry
            local meta: Map = typed_entry.meta or {}
            local kind = tostring((typed_entry :: any).kind or "")
            local create = type(meta.component) == "table" and (meta.component :: any).create or nil
            local catalog_entry = kind == "contract.binding"
                or (kind == "registry.entry" and type(create) == "table" and type((create :: any).view) == "string")
            if catalog_entry
                and M.class_matches(meta.class, class_filter)
                and (category_filter == nil or category_filter == "" or meta.category == category_filter)
            then
                types[#types + 1] = {
                    id             = typed_entry.id,
                    name           = typed_entry.id,
                    title          = meta.title or typed_entry.id,
                    description    = meta.comment or "",
                    icon           = meta.icon or "",
                    category       = meta.category or "",
                    class          = meta.class :: automation_types.ClassValue?,
                    primary        = meta.primary == true,
                    -- An unannounced kind is a real type with real rows; it is simply
                    -- not offered in the install catalog.
                    installable    = meta.announced ~= false,
                    reconfigurable = meta.reconfigurable == true,
                    exportable     = meta.exportable == true,
                    inputs         = meta.inputs,
                    component      = enrich_component_block(meta.component),
                    source         = meta.source,
                    public_state_schema = meta.public_state_schema,
                    delete_options = meta.delete_options,
                    actions        = M.collect_actions(typed_entry),
                    controls       = collect_controls(typed_entry),
                }
            end
        end
        table.sort(types, function(a: automation_types.AutomationType, b: automation_types.AutomationType) return (a.title or "") < (b.title or "") end)
        return types, nil
    end

    P.action_required_access = action_required_access
    P.automation_binding_ids = automation_binding_ids
    P.binding_ids_by_meta = binding_ids_by_meta
    P.enrich_component_block = enrich_component_block
    P.public_state_component = public_state_component
    P.public_state_schema_for_impl = public_state_schema_for_impl
end

return part
