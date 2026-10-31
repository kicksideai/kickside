-- component: the client library for opening components with access validation.
-- It wraps the component_service contract (actor-validated paths) and the
-- component_reader (system-level paths). Every function returns (value, error?);
-- errors are structured via the global errors module and never raised.

local contract = require("contract")
local security = require("security")
local sql = require("sql")
local component_reader = require("component_reader")
local component_types = require("component_types")
local access_policy = require("access_policy")
local ops = require("component_ops")
local teardown = require("teardown")
local autoinit = require("autoinit")
local envelope = require("envelope")
local error_envelope = require("error_envelope")
local component_command = require("component_command")
local context_policy = require("context_policy")

local ACCESS = component_types.ACCESS
local identity_access = require("identity_access")
local validate_identity_authorizer_admin = identity_access.validate_identity_authorizer_admin
local validate_principal_access = identity_access.validate_principal_access
local get_identity_receipt = identity_access.get_identity_receipt
local get_component_service = context_policy.get_component_service
local current_runtime_identity = context_policy.current_runtime_identity
local open_contract_instance = context_policy.open_contract_instance
local result_error = context_policy.result_error
local open = context_policy.open
local open_by_meta = context_policy.open_by_meta
local validate_access = context_policy.validate_access
local normalize_required_access = context_policy.normalize_required_access
local resolve_access_context = context_policy.resolve_access_context
local get_context_by_meta = context_policy.get_context_by_meta

-- Get a component's private context by ID with access validation.
local function get_context(component_id: string, required_access: integer): (component_types.JsonMap?, error?)
    if not component_id or component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end
    local access_mask, access_mask_err = normalize_required_access(required_access, nil)
    if access_mask_err or not access_mask then
        return nil, access_mask_err
    end

    local access_result, access_err = resolve_access_context(component_id, access_mask, true)
    if access_err then
        return nil, access_err
    end

    local user_access = access_result.access_level or 0
    if not access_policy.has_all(user_access, access_mask) then
        return nil, (errors.new({ message = "insufficient access to component", kind = errors.PERMISSION_DENIED }) :: error)
    end

    local context = (access_result.context or {}) :: component_types.JsonMap
    context.component_id = component_id
    return context, nil
end

-- Get a component's private context by ID without actor validation. Reads
-- directly from the database, suitable for system-level / background workers.
local function get_private_context(component_id: string): (component_types.JsonMap?, error?)
    if not component_id or component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end

    local result, read_err = component_reader.new()
        :with_components(component_id)
        :include_options({ private_context = true, meta = false })
        :one()
    if read_err then
        return nil, read_err
    end
    if not result then
        return nil, (errors.new({ message = "component not found", kind = errors.NOT_FOUND }) :: error)
    end

    local context = result.private_context or {}
    context.component_id = component_id
    return context, nil
end

-- Open a component by ID without actor validation. Reads impl_id and private
-- context directly from the database, then opens the contract instance.
-- Suitable for system-level / background workers.
local function open_private(component_id: string, target_contract_id: string?): (component_types.ContractInstance?, error?)
    if not component_id or component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end

    local result, read_err = component_reader.new()
        :with_components(component_id)
        :include_options({ private_context = true, meta = false })
        :one()
    if read_err then
        return nil, read_err
    end
    if not result then
        return nil, (errors.new({ message = "component not found", kind = errors.NOT_FOUND }) :: error)
    end

    local context = result.private_context or {}
    context.component_id = component_id

    return open_contract_instance(result.impl_id :: string, context, target_contract_id, nil, nil)
end

-- Read-port: query components via the access-filtered contract method. The
-- filter is the flat DTO (see the contract definition); the read is scoped to
-- the current actor by default and widening is capability-gated server-side.
-- Returns the component rows array.
local function query(filter: component_types.QueryFilter?): (component_types.ComponentRow[]?, error?)
    local service, service_err = get_component_service()
    if service_err or not service then
        return nil, service_err
    end

    local result, call_err = service:query(filter or {})
    if call_err then
        return nil, envelope.call_error(call_err, "query_components")
    end
    local result_err = result_error(result, "query_components")
    if result_err then
        return nil, result_err
    end

    return (result.components or {}) :: component_types.ComponentRow[], nil
end

-- Read-port: count components via the access-filtered contract method. Same
-- scope/gate as query.
local function count(filter: { [string]: any }?): (integer?, error?)
    local service, service_err = get_component_service()
    if service_err or not service then
        return nil, service_err
    end

    local result, call_err = service:count(filter or {})
    if call_err then
        return nil, envelope.call_error(call_err, "count_components")
    end
    local result_err = envelope.error_of(result :: component_types.ServiceEnvelope, "count_components")
    if result_err then
        return nil, result_err
    end

    return result.count or 0, nil
end

-- Trusted system read: list components without actor scoping, reading directly
-- from the database. Suitable for system-level / background workers that perform
-- reverse lookups across every user's components (mirrors get_private_context /
-- open_private — same trust tier, NOT a public access-checked path). `filter`
-- accepts impl_ids, component_ids, meta, parent_id, path_prefix, include
-- (meta / private_context), limit, offset, and order_by ({field,direction}).
local function list_system(filter: component_types.QueryFilter?): (component_types.ComponentRow[]?, error?)
    local f: component_types.QueryFilter = filter or {}
    local reader: any = component_reader.new()

    if type(f.component_ids) == "table" and #f.component_ids > 0 then
        reader = reader:with_components(f.component_ids)
    end
    if type(f.impl_ids) == "table" and #f.impl_ids > 0 then
        reader = reader:with_impl_ids(f.impl_ids)
    end
    if f.match_ids ~= nil then
        local selected, match_err = reader:with_id_match(f.match_ids)
        if match_err then return nil, match_err end
        reader = selected
    end
    if type(f.meta) == "table" then
        reader = reader:with_meta(f.meta)
    end
    if f.parent_id ~= nil then
        reader = reader:with_parent(f.parent_id :: string)
    end
    if type(f.path_prefix) == "string" and f.path_prefix ~= "" then
        reader = reader:with_path_prefix(f.path_prefix)
    end
    if type(f.include) == "table" then
        local inc: any = f.include
        reader = reader:include_options({ meta = inc.meta, private_context = inc.private_context })
    end
    if type(f.order_by) == "table" and type(f.order_by.field) == "string" then
        reader = reader:order_by(f.order_by.field, f.order_by.direction)
    end
    if type(f.limit) == "number" and f.limit > 0 then
        reader = reader:limit(f.limit, type(f.offset) == "number" and f.offset or 0)
    end

    local rows, err = reader:all()
    return rows :: component_types.ComponentRow[]?, err
end

-- resolve_path_prefixes: a system read (no actor, no access filter) returning the
-- stored placement path for each component id. For trusted callers that need
-- reject-only subtree-narrowing data without a user actor -- e.g. an MCP credential
-- confined to a whitelist, resolved on a public unauthenticated endpoint. This only
-- ever narrows; the real access grant is still enforced downstream by the access
-- checks. The component module owns the path encoding + dialect, so callers never
-- touch the components table directly. Returns (prefixes, err); a missing component
-- simply contributes no prefix, so a fully-stale whitelist yields {} (deny-all).
local function resolve_path_prefixes(component_ids: { string }): ({ string }?, error?)
    if type(component_ids) ~= "table" or #component_ids == 0 then
        return {}, nil
    end
    local reader: any = component_reader.new()
        :with_components(component_ids)
        :include_options({ meta = false, placement = true })
    local rows, err = reader:all()
    if err then
        return nil, err
    end
    local prefixes: { string } = {}
    for _, r in ipairs((rows or {}) :: { any }) do
        local p = (r :: any).path
        if type(p) == "string" and p ~= "" then
            prefixes[#prefixes + 1] = p :: string
        end
    end
    return prefixes, nil
end

-- List components a SPECIFIC subject can access (their grants + groups resolved
-- by the read port), with meta. For trusted callers that must list on behalf of
-- a user other than the ambient actor — the access seam stays inside this module.
-- `filter` accepts impl_ids, meta (default true), limit, offset.
local function list_for_subject(subject_id: string, filter: component_types.QueryFilter?): (component_types.ComponentRow[]?, error?)
    if not subject_id or subject_id == "" then
        return nil, (errors.new({ message = "subject id is required", kind = errors.INVALID }) :: error)
    end
    local f: component_types.QueryFilter = filter or {}
    local reader: any = component_reader.new()
    reader = reader:with_user(subject_id)
    if type(f.impl_ids) == "table" and #f.impl_ids > 0 then
        reader = reader:with_impl_ids(f.impl_ids)
    end
    reader = reader:include_options({ meta = f.meta ~= false, private_context = false })
    if type(f.limit) == "number" and f.limit > 0 then
        reader = reader:limit(f.limit, type(f.offset) == "number" and f.offset or 0)
    end
    local rows, err = reader:all()
    return rows :: component_types.ComponentRow[]?, err
end

-- List the access grants on a component (ADMIN-gated server-side) for the share
-- UI. Returns (grants array { { subject_id, access_mask, owner } }, owner_id?).
local function list_access(component_id: string): (component_types.AccessGrant[]?, string?, error?)
    if not component_id or component_id == "" then
        return nil, nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end
    local service, service_err = get_component_service()
    if service_err or not service then
        return nil, nil, service_err
    end
    local result, call_err = service:list_access({ component_id = component_id })
    if call_err then
        return nil, nil, envelope.call_error(call_err, "list_access")
    end
    local result_err = envelope.error_of(result :: component_types.ServiceEnvelope, "list_access")
    if result_err then
        return nil, nil, result_err
    end
    return (result.access or {}) :: component_types.AccessGrant[], (result.owner :: string?), nil
end

-- Adopt a component no principal holds access to, as the current operator.
-- Returns the service result { component_id, adopted_by, identity_generation,
-- request_id, prior_access } or the typed refusal.
local function adopt(component_id: string): (component_types.JsonMap?, error?)
    if not component_id or component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end
    local service, service_err = get_component_service()
    if service_err or not service then
        return nil, service_err
    end
    local result, call_err = service:adopt({ component_id = component_id })
    if call_err then
        return nil, envelope.call_error(call_err, "adopt")
    end
    local result_err = envelope.error_of(result :: component_types.ServiceEnvelope, "adopt")
    if result_err then
        return nil, result_err
    end
    return result :: component_types.JsonMap, nil
end

-- List a component's stored grants at system level (no access gate), for trusted
-- callers that resolve ownership outside a request actor -- e.g. a teardown handler
-- deciding whether a deleted user was a component's sole owner. Excludes system:*
-- infrastructure grants. Returns the grant rows { subject_id, subject_type, access_mask }.
local function list_grants_system(component_id: string): ({ any }?, error?)
    local grants, err = ops.list_access(component_id)
    return grants :: { any }?, err
end

-- The effective component grants of a typed principal {kind, id} on each of
-- resource_ids, as { [resource_id] = mask }, at system level (no access gate),
-- for trusted callers that authorize resource use under an execution
-- identity. A resource the principal holds nothing on is absent.
local function notify_access(component_id: string, topic: string?, data: component_types.JsonMap?, opts: component_types.JsonMap?): (component_types.JsonMap?, error?)
    local meta_service = require("meta_service")
    return meta_service.notify_access(component_id, topic, data, opts)
end

local function singleton_component_id(owner_id: string, class: string): string?
    if owner_id == "" or class == "" then return nil end
    return autoinit.component_id(owner_id, class) :: string
end

-- Owner is the ambient security-frame actor (a missing actor is an error, not a skip).
local function emit_singleton_event(class: string, event: { [string]: any }): (any?, error?)
    if type(event) ~= "table" then return nil, (errors.new({ message = "event table is required", kind = errors.INVALID }) :: error) end
    local event_type = type(event.type) == "string" and event.type or ""
    if class == "" or event_type == "" then return nil, (errors.new({ message = "class and event.type are required", kind = errors.INVALID }) :: error) end

    local actor, scope, ctx_err = current_runtime_identity()
    if ctx_err or not actor or not scope then return nil, ctx_err end
    local component_id = singleton_component_id(tostring(actor:id()), class)
    if not component_id then return nil, (errors.new({ message = "actor identity is required", kind = errors.INVALID }) :: error) end

    local threads_contract, contract_err = contract.get("kickside.core:threads")
    threads_contract, contract_err = error_envelope.binding(threads_contract, contract_err, "with_actor",
        "threads contract unavailable", "component_binding_response")
    if contract_err then return nil, contract_err end
    local actor_bound, actor_err = (threads_contract :: any):with_actor(actor)
    actor_bound, actor_err = error_envelope.binding(actor_bound, actor_err, "with_scope",
        "threads contract actor binding failed", "component_binding_response")
    if actor_err then return nil, actor_err end
    local scope_bound, scope_err = (actor_bound :: any):with_scope(scope)
    scope_bound, scope_err = error_envelope.binding(scope_bound, scope_err, "open",
        "threads contract scope binding failed", "component_binding_response")
    if scope_err then return nil, scope_err end
    local threads, open_err = (scope_bound :: any):open()
    threads, open_err = error_envelope.binding(threads, open_err, "emit",
        "threads contract open failed", "component_binding_response")
    if open_err then return nil, open_err end

    return threads:emit({
        component_id = component_id,
        type = event_type,
        body = event.body,
        impl_id = event.impl_id,
        thread_class = event.thread_class,
        trace_context = event.trace_context,
        external = type(event.external) == "table" and event.external or {
            external_source = event.external_source,
            external_id = event.external_id,
            external_version = event.external_version,
        },
    })
end

-- system_delete tears down a component as the trusted lifecycle engine: it runs the
-- impl's deletable cleanup and unregisters the row through the SHARED teardown core,
-- WITHOUT an actor access gate. This is the delete-side sibling of the trusted reads
-- (list_system / list_for_subject): the access seam stays inside this module and only
-- in-process system callers use it -- the lifecycle reaper reaping a deleted owner's
-- components. Request paths must use the access-gated component_service `delete`.
-- Idempotent: an already-removed component is a successful no-op, so a retried reap
-- never errors. The deletable runs under the ambient (system) actor + scope.
-- A live delete lease returns (false, nil, true); its holder completes the work.
local function system_delete(component_id: string, child_policy: string?): (boolean, error?, boolean?)
    if type(component_id) ~= "string" or component_id == "" then
        return false, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end

    -- Trusted read of impl + private context, mirroring list_system (no actor scoping).
    local component, read_err = component_reader.new()
        :with_components(component_id)
        :include_options({ meta = false, private_context = true })
        :one()
    if read_err then
        return false, envelope.call_error(read_err, "system_delete read failed")
    end
    if not component then
        return true, nil
    end

    local preflight_ok, preflight_step, preflight_err, owns_fence, lease_token = teardown.begin_delete(component_id, nil, child_policy)
    if not preflight_ok then
        if preflight_step == "busy" and preflight_err == nil then return false, nil, true end
        return false, envelope.call_error(preflight_err, "system_delete preflight (" .. tostring(preflight_step) .. ")")
    end

    -- Same cascade as the gated delete (teardown.run_deletable + unregister); the only
    -- difference is the nil gate_user_id, so no DELETE access check is applied. A declared
    -- deletable that fails to open or clean up is a hard stop: unregistering now would
    -- orphan its side data, so the reap fails and the reaper's durable retry re-runs it.
    local declared, cleanup_success, cleanup_err = teardown.run_deletable(component, security.actor(), security.scope(), component_id, nil, lease_token)
    if declared and not cleanup_success then
        cleanup_err = teardown.retain_failed_delete(cleanup_err, owns_fence)
        if teardown.cleanup_pending(cleanup_err) then
            local release_err = teardown.release_delete(component_id, lease_token :: string)
            if release_err then return false, error_envelope.wrap_secondary(release_err, cleanup_err, "release component delete lease") end
            return false, cleanup_err
        end
        local abandon_err = teardown.abandon_delete(component_id, lease_token :: string)
        if abandon_err then
            cleanup_err = error_envelope.wrap_secondary(abandon_err, cleanup_err, "the delete mark stays")
        end
        return false, envelope.call_error(cleanup_err, "system_delete deletable cleanup failed")
    end
    local released, step, err = teardown.unregister(component_id, child_policy, lease_token :: string)
    if step == "purge" and released ~= nil then
        -- The component is released; only the thread reap failed. The release
        -- stands — an unreferenced thread is inert and its events age out under
        -- retention — and the reap error is surfaced for the caller's log.
        if type(err) == "userdata" then return true, err end
        return true, (errors.new({ message = "released; thread reap failed: " .. tostring(err), kind = errors.INTERNAL }) :: error)
    end
    if step == "pending" then return false, err end
    if step then
        return false, envelope.call_error(err, "system_delete unregister (" .. step .. ")")
    end
    return true, nil
end

-- set_meta(component_id, fields, opts?) -> (true) | (false, err). The canonical public
-- meta updater: partial upsert of render/read-model fields through the secured
-- component service. Runs under the ambient actor; components never pick actors.
-- Private component state uses PATCH_CONTEXT/SET_CONTEXT instead.
local function set_meta(component_id: string, fields: { [string]: any }, opts: { [string]: any }?): (boolean, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return false, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    if type(fields) ~= "table" then
        return false, (errors.new({ message = "fields table is required", kind = errors.INVALID }) :: error)
    end

    local request: { [string]: any } = { component_id = component_id, fields = fields }
    if type(opts) == "table" then
        local opts_map = opts :: { [string]: any }
        if opts_map.delete_keys ~= nil then
            request.delete_keys = opts_map.delete_keys
        end
        if opts_map.trusted_runtime == true then request.trusted_runtime = true end
    end

    local service, service_err = get_component_service()
    if service_err or not service then
        return false, service_err
    end
    local result, call_err = service:set_meta(request)
    if call_err then
        return false, envelope.call_error(call_err, "set_meta")
    end
    local rerr = envelope.error_of(result :: component_types.ServiceEnvelope, "set_meta")
    if rerr then return false, rerr end

    return true, nil
end

-- Framework runtime projections may refresh public metadata after validating
-- their durable owner record. The service checks a scoped security capability.
local function set_runtime_meta(component_id: string, fields: { [string]: any }): (boolean, error?)
    return set_meta(component_id, fields, { trusted_runtime = true })
end

-- update(component_id, commands, opts?) -> (result) | (nil, err). Applies SET_CONTEXT /
-- PATCH_CONTEXT / SET_META commands atomically through the secured component service
-- under the ambient actor. result.context_revision is the revision after the batch.
local function update(component_id: string, commands: { any }, opts: component_types.UpdateOptions?): (component_types.UpdateResult?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    if type(commands) ~= "table" or #commands == 0 then
        return nil, (errors.new({ message = "commands must be a non-empty array", kind = errors.INVALID }) :: error)
    end

    if opts ~= nil then
        if type(opts) ~= "table" then
            return nil, (errors.new({ message = "update options must be an object", kind = errors.INVALID }) :: error)
        end
        for key in pairs(opts) do
            if key ~= "expected_revision" then
                return nil, (errors.new({ message = "unknown update option: " .. tostring(key), kind = errors.INVALID }) :: error)
            end
        end
    end
    local request: { [string]: any } = { component_id = component_id, commands = commands,
        expected_revision = opts and opts.expected_revision }

    local service, service_err = get_component_service()
    if service_err or not service then
        return nil, service_err
    end
    local result, call_err = service:update(request)
    if call_err then
        return nil, envelope.call_error(call_err, "update")
    end
    local rerr = envelope.error_of(result :: component_types.ServiceEnvelope, "update")
    if rerr then return nil, rerr end

    return result :: component_types.UpdateResult, nil
end

return {
    ACCESS = ACCESS,
    open = open,
    open_by_meta = open_by_meta,
    open_private = open_private,
    validate_access = validate_access,
    validate_identity_authorizer_admin = validate_identity_authorizer_admin,
    validate_principal_access = validate_principal_access,
    get_service = get_component_service,
    get_context = get_context,
    get_context_by_meta = get_context_by_meta,
    get_private_context = get_private_context,
    get_identity_receipt = get_identity_receipt,
    query = query,
    count = count,
    list_system = list_system,
    resolve_path_prefixes = resolve_path_prefixes,
    list_for_subject = list_for_subject,
    list_access = list_access,
    adopt = adopt,
    list_grants_system = list_grants_system,
    principal_masks_system = ops.principal_masks,
    component_owner = ops.component_owner,
    component_owner_record = ops.component_owner_record,
    notify_access = notify_access,
    singleton_component_id = singleton_component_id,
    emit_singleton_event = emit_singleton_event,
    set_meta = set_meta,
    set_runtime_meta = set_runtime_meta,
    update = update,
    set_execution_identity = component_command.set_execution_identity,
    apply_declaration = component_command.apply_declaration,
    system_delete = system_delete,
    -- fence(tx, component_id, db_id) -> err?. The existence fence for a consumer's
    -- write to the backing data it keeps for a component. Call it first inside the
    -- transaction that writes: it answers nil while the component exists and no
    -- delete of it has begun, and a NOT_FOUND error once it is gone or being deleted,
    -- in which case the caller writes nothing. Precondition: the transaction is on the
    -- component database; db_id names the database it was begun on and is checked
    -- against the component's own (INVALID when they differ). On PostgreSQL the
    -- component row stays share-locked until the transaction ends. No access check:
    -- the caller is already authorized for its own write.
    fence = ops.fence,
}
