-- Automation actions: the live type-to-action composition, call_action,
-- reconfigure, uninstall/delete, and automation ownership of resources.

local automation_types = require("types")
local support = require("engine_support")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines this part's engine functions on M; P
-- carries the private helpers the engine parts share.
function part.attach(M: any, dependencies: any, P: any): ()
    local AUTOMATION_TYPE = support.AUTOMATION_TYPE
    local GENERIC_ACTIONS = support.GENERIC_ACTIONS
    local trim = support.trim

    -- ─── the live type→action composition ───────────────────────────────────────
    --
    -- call_action's allowlist is the set of public actions the CURRENT type entry
    -- declares in meta.actions, each resolved to its { contract, target }. A hub
    -- install that adds an action to a type (e.g. `rewind` on a sync type) has to
    -- become callable without a restart, so the allowlist is never read from a
    -- one-off registry.get whose per-process view of that entry is frozen. It is
    -- served from a composition rebuilt whenever the registry version changes:
    -- O(types) on a version bump, O(1) per call. This mirrors build_catalog — the
    -- same double-token discipline the port catalog already runs on.

    type TypeActionView = {
        actions: { [string]: automation_types.AutomationAction },
        reconfigurable: boolean,
    }

    -- Every contract.binding carrying meta.type = kickside.automation is an
    -- automation type; an instance is callable through call_action iff its impl
    -- entry is one.
    local function build_type_composition(): ({ [string]: TypeActionView }?, any)
        local registry = dependencies.registry :: automation_types.RegistryModule
        local by_id: { [string]: TypeActionView } = {}
        local entries, err = registry.find({ [".kind"] = "contract.binding", ["meta.type"] = AUTOMATION_TYPE })
        if err then return nil, err end
        for _, entry in ipairs(entries or {}) do
            local id = type(entry) == "table" and (entry :: any).id or nil
            if type(id) == "string" and id ~= "" then
                local actions: { [string]: automation_types.AutomationAction } = {}
                for _, action in ipairs(M.collect_actions(entry, true)) do
                    actions[action.name] = action
                end
                local meta = type(entry.meta) == "table" and entry.meta or {}
                by_id[id :: string] = { actions = actions, reconfigurable = meta.reconfigurable == true }
            end
        end
        return by_id, nil
    end

    -- One immutable composition per registry version, gated by the same version
    -- token as the port catalog. A change racing the build discards it and the
    -- next caller rebuilds against the newer view, so a removed action fails
    -- closed. A nil token (a runtime without current_version) builds per call —
    -- the pre-composition behavior, never a clock-emulated freshness.
    local composition_snapshot: Map = {}

    -- rebuild_type_composition builds the composition and republishes the
    -- snapshot when the registry version held still during the build.
    function M.rebuild_type_composition(): ({ [string]: TypeActionView }?, any)
        local token, token_err = P.registry_version_token()
        if token_err then return nil, token_err end
        local by_id, err = build_type_composition()
        if err then return nil, err end
        if token ~= nil then
            local after, after_err = P.registry_version_token()
            if after_err then return nil, after_err end
            if after == token then
                composition_snapshot.token = token
                composition_snapshot.by_id = by_id
            end
        end
        return by_id, nil
    end

    -- type_action_view returns the CURRENT public-action allowlist for a type impl
    -- id, rebuilding only when the registry version moved. O(1) on the hot path.
    local function type_action_view(impl_id: string): (TypeActionView?, any)
        local token, token_err = P.registry_version_token()
        if token_err then return nil, token_err end
        if token ~= nil and composition_snapshot.token == token and composition_snapshot.by_id ~= nil then
            return (composition_snapshot.by_id :: { [string]: TypeActionView })[impl_id], nil
        end
        local by_id, err = M.rebuild_type_composition()
        if err then return nil, err end
        return by_id[impl_id], nil
    end

    -- invoke_kind_action runs a kind action as an internal engine step. Generic
    -- names use this only for reconfigure; external calls always enter the
    -- reserved generic action route first.
    local function invoke_kind_action(component_id: string, method_name: string, args: any,
        action: automation_types.AutomationAction): (any?, any)
        local component = dependencies.component :: automation_types.ComponentModule
        local action_contract = trim(action.contract)
        if action_contract == "" then
            return nil, errors.new({ message = "action contract is not declared", kind = errors.INVALID })
        end
        local instance, open_err = component.open(component_id, component.ACCESS.WRITE, action_contract)
        if open_err then return nil, open_err end
        if not instance then return nil, errors.new({ message = "automation not found", kind = errors.NOT_FOUND }) end
        local fn = instance[method_name]
        if type(fn) ~= "function" then
            return nil, errors.new({ message = "method '" .. method_name .. "' could not be resolved on instance", kind = errors.INVALID })
        end
        return fn(instance, args)
    end

    function M.generic_reconfigure(component_id: string, args: any): (any?, any)
        local component = dependencies.component :: automation_types.ComponentModule
        local rows, query_err = component.query({ component_ids = { component_id }, access_mask = component.ACCESS.WRITE, include = { meta = true } })
        if query_err then return nil, query_err end
        local row = rows and rows[1]
        if not row then
            return nil, errors.new({kind = errors.NOT_FOUND, retryable = false, message = "automation not found",
                details = {code = "automation_not_found", field = "id"}})
        end
        if type(row.impl_id) ~= "string" or row.impl_id == "" then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "automation not found",
                details = {code = "automation_implementation_missing", field = "impl_id"}})
        end
        local view, view_err = type_action_view(row.impl_id :: string)
        if view_err then return nil, view_err end
        if not view then return nil, errors.new({ message = "component is not an automation", kind = errors.INVALID }) end
        if not view.reconfigurable then return nil, errors.new({ message = "automation type does not support reconfigure", kind = errors.INVALID }) end
        local action = view.actions.reconfigure
        if not action then return nil, errors.new({ message = "automation type has no reconfigure action", kind = errors.INVALID }) end
        local a: Map = type(args) == "table" and args or {}
        if type(a.declaration) ~= "table" then return nil, errors.new({ message = "declaration is required", kind = errors.INVALID }) end
        return invoke_kind_action(component_id, "reconfigure", a.declaration, action)
    end

    -- HTTP and action calls share the frozen generic `{declaration}` route.
    function M.reconfigure(component_id: string, input: any): (automation_types.CallActionResult?, error?)
        if type(component_id) ~= "string" or component_id == "" then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "id is required",
                details = {code = "automation_id_required", field = "id"}})
        end
        return M.call_action(component_id, "reconfigure", { declaration = type(input) == "table" and input or {} })
    end

    -- uninstall: delete the umbrella component; its deletable callback fences
    -- drives, replays rollback once, and clears the other owned stores.
    --
    -- options (optional table) is forwarded to every cleanup step as
    -- args._delete_options. Bindings declare which keys they understand via
    -- meta.delete_options (so the frontend can render a per-type confirm UI).
    function M.uninstall(component_id: string, options: any): (automation_types.UninstallResult?, any)
        if type(component_id) ~= "string" or component_id == "" then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "id is required",
                details = {code = "automation_id_required", field = "id"}})
        end
        local component = dependencies.component :: automation_types.ComponentModule

        -- System read of the umbrella's private context (holds the _rollback chain).
        -- Access is enforced separately by the DELETE gate below, so this read is the
        -- trusted system path rather than the actor-filtered read-port.
        local pc, read_err = component.get_private_context(component_id)
        if read_err then return nil, read_err end
        if pc == nil then
            return nil, errors.new({ message = "automation not found", kind = errors.NOT_FOUND, retryable = false })
        end
        if type(pc) ~= "table" then
            return nil, errors.new({ message = "automation private context returns no object", kind = errors.INTERNAL, retryable = true })
        end

        local _, admin_err = component.validate_access(component_id, component.ACCESS.ADMIN)
        if admin_err then return nil, admin_err end

        -- Cleanup is destructive, so check DELETE before invoking the component
        -- service. The service repeats that gate before its deletable callback.
        local _, access_err = component.validate_access(component_id, component.ACCESS.DELETE)
        if access_err then
            return nil, access_err
        end

        local private_context = pc :: automation_types.AutomationPrivateContext
        local rollback: { automation_types.RollbackStep } = private_context._rollback or {}
        local svc, svc_err = component.get_service()
        if svc_err then return nil, svc_err end
        if not svc then
            return nil, errors.new({ message = "component service returns no value", kind = errors.INTERNAL, retryable = true })
        end
        local request: Map = { component_id = component_id }
        if type(options) == "table" then request.delete_options = options :: Map end
        local del_result, del_err = svc:delete(request)
        if del_err then return nil, del_err end
        if type(del_result) ~= "table" or type(del_result.success) ~= "boolean" then
            return nil, errors.new({ message = "delete_component returns no terminal verdict", kind = errors.INTERNAL, retryable = true })
        end
        if del_result.success ~= true then
            local failure = del_result :: any
            return nil, errors.new({ message = "delete_component: " .. tostring(failure.error or "failed"),
                kind = failure.kind or errors.INTERNAL, retryable = failure.retryable == true,
                details = failure.details or { cleanup_pending = failure.cleanup_pending,
                    discarded = failure.discarded } })
        end

        return ({
            id = component_id,
            replayed = #rollback,
            replay_failed = 0,
            discarded = del_result.discarded,
            status = del_result.status,
            in_progress = del_result.in_progress,
            deleted = del_result.deleted,
            cleanup_pending = del_result.cleanup_pending,
            retryable = del_result.retryable,
            kind = del_result.kind,
            details = del_result.details,
        } :: automation_types.UninstallResult), nil
    end

    -- delete_automation is the shared API dispatch point. Binding artifacts do not
    -- carry the installable Automation component rollback ledger, so they enter their own
    -- component-kind teardown; installable Automation components retain uninstall's
    -- rollback-before-unregister behavior unchanged.
    function M.delete_automation(component_id: string, options: any): (Map?, error?)
        local id = trim(component_id)
        if id == "" then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "id is required",
                details = {code = "automation_id_required", field = "id"}})
        end
        local component = dependencies.component :: automation_types.ComponentModule

        local rows, query_err = component.query({
            component_ids = { id },
            include = { meta = true },
            access_mask = component.ACCESS.DELETE,
        })
        if query_err then return nil, query_err end
        local row = rows and rows[1]
        if not row then
            local _, access_err = component.validate_access(id, component.ACCESS.DELETE)
            if access_err then return nil, access_err end
            return nil, errors.new({ message = "automation not found: " .. id, kind = errors.NOT_FOUND })
        end

        local uninstalled, uninstall_err = M.uninstall(id, options)
        if uninstall_err then return nil, uninstall_err end
        if type(uninstalled) ~= "table" then
            return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "automation uninstall failed",
                details = {code = "automation_uninstall_result_missing", field = "result"}})
        end
        return uninstalled :: Map, nil
    end

    local function owned_resource_state_keys(meta: Map, resource_kind: string): { string }
        local out: { string } = {}
        local specs = meta.owned_resources
        if type(specs) ~= "table" then return out end
        for _, spec in ipairs(specs :: { any }) do
            if type(spec) == "table" then
                local s = spec :: automation_types.OwnedResourceSpec
                if s.kind == resource_kind and type(s.state_key) == "string" and s.state_key ~= "" then
                    out[#out + 1] = s.state_key
                end
            end
        end
        return out
    end

    -- find_owner_by_resource: locate the umbrella automation instance that declares
    -- ownership of `resource_kind` and whose private state contains `resource_id`
    -- under the declared state key. Resource modules ask by kind/id only; private
    -- state key names are owned by automation type metadata (`meta.owned_resources`).
    function M.find_owner_by_resource(resource_kind: string, resource_id: string): (string?, any)
        if type(resource_kind) ~= "string" or resource_kind == "" then return nil, nil end
        if type(resource_id) ~= "string" or resource_id == "" then return nil, nil end

        local registry = dependencies.registry :: automation_types.RegistryModule
        local entries, entries_err = registry.find({
            [".kind"] = "contract.binding",
            ["meta.type"] = AUTOMATION_TYPE,
        })
        if entries_err then return nil, entries_err end

        local impl_ids: { string } = {}
        local keys_by_impl: { [string]: { string } } = {}
        for _, entry in ipairs(entries or {}) do
            local typed_entry = entry :: automation_types.RegistryEntry
            local id = typed_entry.id
            local keys = owned_resource_state_keys(typed_entry.meta or {}, resource_kind)
            if type(id) == "string" and id ~= "" and #keys > 0 then
                impl_ids[#impl_ids + 1] = id
                keys_by_impl[id] = keys
            end
        end
        if #impl_ids == 0 then return nil, nil end

        local component = dependencies.component :: automation_types.ComponentModule

        -- System-wide reverse lookup across every owner's umbrellas: a trusted
        -- (unscoped) read, since teardown must find the owner regardless of caller.
        local components, list_err = component.list_system({
            impl_ids = impl_ids,
            include = { private_context = true },
        })
        if list_err then return nil, list_err end
        for _, c in ipairs((components or {}) :: { automation_types.ComponentRow }) do
            local pc: Map = c.private_context or {}
            local keys = keys_by_impl[c.impl_id]
            if keys then
                for _, key in ipairs(keys) do
                    if pc[key] == resource_id then
                        return tostring(c.component_id), nil
                    end
                end
            end
        end
        return nil, nil
    end

    -- call_action: dispatch a binding method declared in meta.actions.
    -- component.open auto-loads private_context as ctx for the dispatched method.
    function M.call_action(component_id: string, method_name: string, args: any): (automation_types.CallActionResult?, error?)
        if type(component_id) ~= "string" or component_id == "" then
            return nil, errors.new({ message = "id is required", kind = errors.INVALID })
        end
        if type(method_name) ~= "string" or method_name == "" then
            return nil, errors.new({ message = "method is required", kind = errors.INVALID })
        end
        if M.is_lifecycle(method_name) then
            return nil, errors.new({
                message = "lifecycle method '" .. method_name .. "' is not callable as an action",
                kind = errors.INVALID,
            })
        end
        local component = dependencies.component :: automation_types.ComponentModule

        local required_access = P.action_required_access(component, method_name)
        local component_rows, access_err = component.query({
            component_ids = { component_id },
            access_mask = required_access,
            include = { meta = true },
        })
        local component_row = component_rows and component_rows[1]
        if access_err then return nil, access_err end
        if not component_row then
            return nil, errors.new({ message = "automation not found", kind = errors.NOT_FOUND })
        end
        if not component_row.impl_id then
            return nil, errors.new({ message = "automation implementation is not declared", kind = errors.INVALID })
        end

        -- The allowlist reflects the CURRENT type declaration, served from the live
        -- composition: presence keyed by impl id already proves the entry is an
        -- automation of an accepted meta.type, and the resolved action carries the
        -- fresh { contract, target } even when a per-process registry.get is stale.
        local view, view_err = type_action_view(component_row.impl_id :: string)
        if view_err then return nil, view_err end
        if not view then
            return nil, errors.new({ message = "component is not an automation", kind = errors.INVALID })
        end
        -- Generic names are reserved even when a kind declares a method with
        -- the same name. Such methods are never a private control path.
        if GENERIC_ACTIONS[method_name] then
            local result, generic_err = M.generic_action(component_id, method_name, args)
            if generic_err ~= nil then return nil, generic_err end
            return ({ id = component_id, method = method_name, result = result }) :: automation_types.CallActionResult, nil
        end
        local action = view.actions[method_name]
        if not action then
            return nil, errors.new({
                message = "method '" .. method_name .. "' is not declared as a public automation action",
                kind = errors.INVALID,
            })
        end

        local result, call_err = invoke_kind_action(component_id, method_name, type(args) == "table" and args or {}, action)
        if call_err ~= nil then return nil, call_err end
        return ({ id = component_id, method = method_name, result = result }) :: automation_types.CallActionResult, nil
    end
end

return part
