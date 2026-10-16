-- Rules shared by the component client, service readers, and persist writer.
local component_types = require("component_types")
local security = require("security")
local component_reader = require("component_reader")
local access_policy = require("access_policy")
local envelope = require("envelope")
local error_envelope = require("error_envelope")
local contract = require("contract")
local read_port = require("read_port")
local execution_identity = require("execution_identity")

local M = {}
local OWNED = { _portable_input = true, _execution_identity = true, _rollback = true }

local function framework_system_actor(): boolean
    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    return execution_identity.is_maintenance_key(actor_id)
        and security.can("component.context.read_system", "kickside.component:context") == true
end

local function domain_failure(err: any): any
    local result = envelope.from_error(err)
    if result.kind == errors.PERMISSION_DENIED or result.kind == errors.NOT_FOUND then
        result.error_kind = "access"
    elseif result.kind == errors.INVALID then
        result.error_kind = "declaration"
    else
        result.error_kind = "infrastructure"
    end
    return result
end

local function denied(message: string): any
    local result = envelope.fail(message, errors.PERMISSION_DENIED)
    result.error_kind = "access"
    return result
end

local function invalid(message: string): any
    local result = envelope.fail(message, errors.INVALID)
    result.error_kind = "declaration"
    return result
end

function M.is_runtime_owned(key: any): boolean
    return OWNED[key] == true
end

function M.validate_public(value: any, delete_keys: any?): error?
    if type(value) ~= "table" then
        return (errors.new({ message = "private context must be an object", kind = errors.INVALID }) :: error)
    end
    for key in pairs(value) do
        if OWNED[key] then
            return (errors.new({ message = "runtime-owned context key: " .. key, kind = errors.PERMISSION_DENIED }) :: error)
        end
    end
    if delete_keys ~= nil then
        if type(delete_keys) ~= "table" then
            return (errors.new({ message = "delete_keys must be an array", kind = errors.INVALID }) :: error)
        end
        for _, key in ipairs(delete_keys) do
            if OWNED[key] then
                return (errors.new({ message = "runtime-owned context key: " .. key, kind = errors.PERMISSION_DENIED }) :: error)
            end
        end
    end
    return nil
end

function M.preserve_runtime_keys(stored: { [string]: any }, incoming: { [string]: any }): { [string]: any }
    local merged: { [string]: any } = {}
    for key, value in pairs(incoming) do merged[key] = value end
    for key in pairs(OWNED) do merged[key] = stored[key] end
    return merged
end

function M.redact(context: any, access_mask: integer): any
    if type(context) ~= "table" then return context end
    if math.floor(access_mask / component_types.ACCESS.ADMIN) % 2 == 1 then return context end
    local visible: { [string]: any } = {}
    for key, value in pairs(context) do
        if not OWNED[key] then visible[key] = value end
    end
    return visible
end

function M.redact_for_actor(context: any, access_mask: integer): any
    if framework_system_actor() then return context end
    return M.redact(context, access_mask)
end

local function access_request(request: any): (string?, integer?, boolean?, error?)
    if type(request) ~= "table" then
        return nil, nil, nil, (errors.new({ message = "Invalid request: must be a table", kind = errors.INVALID }) :: error)
    end
    local mask, mask_err = access_policy.normalize_access_mask(request.access_mask, component_types.ACCESS.READ)
    if mask_err then return nil, nil, nil, errors.wrap(mask_err, "Failed to normalize access context mask") end
    if not mask or mask <= 0 then
        return nil, nil, nil, (errors.new({ message = "access_mask must be an integer between 1 and 15", kind = errors.INVALID }) :: error)
    end
    local actor, actor_err = security.actor()
    if actor_err then return nil, nil, nil, errors.wrap(actor_err, "Failed to resolve access context actor") end
    if not actor then
        return nil, nil, nil, (errors.new({ message = "No authenticated actor found", kind = errors.PERMISSION_DENIED }) :: error)
    end
    local actor_id, actor_id_err = actor:id()
    if actor_id_err then return nil, nil, nil, errors.wrap(actor_id_err, "Failed to resolve access context actor ID") end
    if type(actor_id) ~= "string" or actor_id == "" then
        return nil, nil, nil, (errors.new({ message = "Invalid actor ID", kind = errors.PERMISSION_DENIED }) :: error)
    end
    return actor_id, mask, request.include_context == true, nil
end

local function response(component: any, include_context: boolean): any
    local mask = tonumber(component.access_level) or 0
    local out: { [string]: any } = {
        id = component.component_id,
        context = include_context and M.redact_for_actor(component.private_context or {}, mask) or {},
        context_included = include_context,
        access_level = mask,
        impl_id = component.impl_id,
        success = true,
    }
    if include_context then out.context_revision = component.context_revision end
    return out
end

-- The two component_service read bindings point here. Redaction happens before
-- the service result leaves the component module, including direct callers that
-- do not use component.lua's client wrapper.
function M.get_access_context(request: any): any
    if type(request) ~= "table" or type(request.component_id) ~= "string" or request.component_id == "" then
        return invalid("component_id is required and must be a non-empty string")
    end
    local actor_id, mask, include_context, request_err = access_request(request)
    if request_err then return domain_failure(request_err) end
    local reader = component_reader.new()
        :with_user(actor_id)
        :with_components(request.component_id)
        :with_access_mask(mask)
        :include_options({ meta = false, private_context = include_context, access_level = true })
    local component, read_err = reader:one()
    if read_err then return domain_failure(read_err) end
    if not component then return denied("Component not found or access denied") end
    return response(component, include_context == true)
end

function M.get_access_context_by_meta(request: any): any
    if type(request) ~= "table" or type(request.meta) ~= "table" then
        return invalid("meta is required and must be a non-empty table")
    end
    local has_filter = false
    for key, value in pairs(request.meta) do
        if type(key) ~= "string" or type(value) ~= "string" then
            return invalid("meta must contain string key-value pairs only")
        end
        has_filter = true
    end
    if not has_filter then return invalid("meta is required and must be a non-empty table") end
    local actor_id, mask, include_context, request_err = access_request(request)
    if request_err then return domain_failure(request_err) end
    local reader = component_reader.new()
        :with_user(actor_id)
        :with_meta(request.meta)
        :with_access_mask(mask)
        :include_options({ meta = false, private_context = include_context, access_level = true })
        :limit(2)
    local components, read_err = reader:all()
    if read_err then return domain_failure(read_err) end
    if not components or #components == 0 then
        return denied("No component found matching the specified metadata and access requirements")
    end
    if #components > 1 then
        return invalid("Multiple components found matching the specified metadata. Use get_access_context with a specific component_id instead")
    end
    return response(components[1], include_context == true)
end

function M.query_components(filter: component_types.QueryFilter?): any
    local reader, build_err = read_port.build(filter)
    if build_err then return domain_failure(build_err) end
    reader = read_port.shape(reader, filter)
    local include = type(filter) == "table" and type(filter.include) == "table" and filter.include or {}
    if include.private_context == true then
        reader = reader:include_options({ access_level = true })
    end
    local components, read_err = reader:all()
    if read_err then return domain_failure(read_err) end
    local actor = security.actor()
    local actor_id = actor and actor:id() or ""
    local system_actor = framework_system_actor()
    local target_is_current = type(filter) == "table"
        and (filter.actor_id == nil or filter.actor_id == actor_id)
        and filter.scope ~= component_types.SCOPES.ALL
    for _, component in ipairs(components or {}) do
        if include.private_context == true then
            local mask = (target_is_current and (tonumber(component.access_level) or 0) or 0) :: integer
            if not system_actor then
                component.private_context = M.redact(component.private_context, mask)
            end
            if include.access ~= true then component.access_level = nil end
        end
    end
    return { success = true, components = components or {} }
end

-- Contract ids the client talks to.
local COMPONENT_SERVICE = component_types.CONTRACTS.SERVICE
local DEFAULT_CONTRACT = "kickside.contract:component"

-- Access level bitmask (re-exported so callers reference component.ACCESS.*).
local ACCESS = component_types.ACCESS

local function result_error(result: any, operation: string): error?
    local err = envelope.error_of(result :: component_types.ServiceEnvelope, operation)
    if err and type(result) == "table" and type(result.error_kind) == "string" then
        local encoded = error_envelope.encode(err)
        encoded.details = encoded.details or {}
        encoded.details.error_kind = result.error_kind
        return errors.new(encoded)
    end
    return err
end

local function normalize_required_access(value: any, default_value: integer?): (integer?, error?)
    local normalized, access_err = access_policy.normalize_access_mask(value, default_value)
    if access_err then return nil, errors.wrap(access_err, "Failed to normalize required component access") end
    if not normalized or normalized <= ACCESS.NONE then
        return nil, (errors.new({
            message = "access level must be an integer between " .. tostring(ACCESS.READ) .. " and " .. tostring(ACCESS.FULL),
            kind = errors.INVALID,
        }) :: error)
    end
    return normalized, nil
end

local function current_runtime_identity(): (any?, any?, error?)
    local actor, actor_err = security.actor()
    if actor_err then return nil, nil, errors.wrap(actor_err, "Failed to resolve component access actor") end
    if not actor then
        return nil, nil, (errors.new({ message = "component access requires an actor", kind = errors.PERMISSION_DENIED }) :: error)
    end
    local scope, scope_err = security.scope()
    if scope_err then return nil, nil, errors.wrap(scope_err, "Failed to resolve component access scope") end
    if not scope then
        return nil, nil, (errors.new({ message = "component access requires a security scope", kind = errors.PERMISSION_DENIED }) :: error)
    end
    return actor, scope, nil
end

-- Open the actor-validated component service contract.
local function get_component_service(): (component_types.ServiceInstance?, error?)
    local actor, scope, ctx_err = current_runtime_identity()
    if ctx_err or not actor or not scope then
        return nil, ctx_err
    end

    local component_service_contract, err = contract.get(COMPONENT_SERVICE)
    component_service_contract, err = error_envelope.binding(component_service_contract, err, "with_actor",
        "failed to get component service", "component_binding_response")
    if err then return nil, err end
    local actor_bound, actor_err = (component_service_contract :: any):with_actor(actor)
    actor_bound, actor_err = error_envelope.binding(actor_bound, actor_err, "with_scope",
        "failed to bind component service actor", "component_binding_response")
    if actor_err then return nil, actor_err end
    local opener, scope_err = (actor_bound :: any):with_scope(scope)
    opener, scope_err = error_envelope.binding(opener, scope_err, "open",
        "failed to bind component service scope", "component_binding_response")
    if scope_err then return nil, scope_err end
    local service, service_err = (opener :: any):open()
    service, service_err = error_envelope.binding(service, service_err, nil,
        "failed to open component service", "component_binding_response")
    if service_err then return nil, service_err end

    return service :: component_types.ServiceInstance?, nil
end

-- Open a contract instance bound to impl_id with the component context.
local function open_contract_instance(
    impl_id: string,
    context: component_types.JsonMap,
    target_contract_id: string?,
    actor: any?,
    scope: any?
): (component_types.ContractInstance?, error?)
    local contract_to_open = target_contract_id or DEFAULT_CONTRACT

    local target_contract, contract_err = contract.get(contract_to_open)
    local needs_frame = actor ~= nil or scope ~= nil
    target_contract, contract_err = error_envelope.binding(target_contract, contract_err, needs_frame and "with_actor" or "open",
        "failed to get contract '" .. contract_to_open .. "'", "component_binding_response")
    if contract_err then return nil, contract_err end
    local opener = target_contract
    if needs_frame then
        if not actor or not scope then
            return nil, (errors.new({ message = "component contract open requires actor and scope together", kind = errors.INVALID }) :: error)
        end
        local actor_bound, actor_err = (target_contract :: any):with_actor(actor)
        actor_bound, actor_err = error_envelope.binding(actor_bound, actor_err, "with_scope",
            "failed to bind component instance actor", "component_binding_response")
        if actor_err then return nil, actor_err end
        local scope_bound, scope_err = (actor_bound :: any):with_scope(scope)
        opener, scope_err = error_envelope.binding(scope_bound, scope_err, "open",
            "failed to bind component instance scope", "component_binding_response")
        if scope_err then return nil, scope_err end
    end
    local instance, instance_err = (opener :: any):open(impl_id, context)
    instance, instance_err = error_envelope.binding(instance, instance_err, nil,
        "failed to open component instance", "component_binding_response")
    if instance_err then return nil, instance_err end

    if target_contract_id and not contract.is(instance, target_contract_id) then
        return nil, (errors.new({ message = "component does not implement target contract '" .. tostring(target_contract_id) .. "'", kind = errors.INVALID }) :: error)
    end

    return instance :: component_types.ContractInstance?, nil
end

-- Resolve the actor's access context for a component via the service. Private
-- context is opt-in and access_mask is enforced server-side before it is read.
local function resolve_access_context(component_id: string, required_access: integer?, include_context: boolean?): (component_types.AccessContextResult?, error?)
    local service, service_err = get_component_service()
    if service_err or not service then
        return nil, service_err
    end
    local access_mask, access_mask_err = normalize_required_access(required_access, ACCESS.READ)
    if access_mask_err then
        return nil, access_mask_err
    end

    local access_result, access_err = service:get_access_context({
        component_id = component_id,
        access_mask = access_mask,
        include_context = include_context == true,
    })
    if access_err then
        return nil, envelope.call_error(access_err, "get_access_context")
    end

    local result_err = result_error(access_result, "get_access_context")
    if result_err then
        return nil, result_err
    end

    if include_context == true then
        access_result.context = M.redact_for_actor(access_result.context, access_result.access_level or 0)
    end

    return access_result :: component_types.AccessContextResult, nil
end

-- Validate access to a component without opening it. Returns the actor's access
-- level when it satisfies required_access, else (0, error).
local function validate_access(component_id: string, required_access: integer): (integer, error?)
    if not component_id or component_id == "" then
        return 0, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end
    local access_mask, access_mask_err = normalize_required_access(required_access, nil)
    if access_mask_err or not access_mask then
        return 0, access_mask_err
    end

    local access_result, access_err = resolve_access_context(component_id, access_mask, false)
    if access_err then
        return 0, access_err
    end

    local user_access = access_result.access_level or 0
    if access_policy.has_all(user_access, access_mask) then
        return user_access, nil
    end
    return 0, (errors.new({ message = "insufficient access to component", kind = errors.PERMISSION_DENIED }) :: error)
end

-- Open a component by ID with access validation.
local function open(component_id: string, required_access: integer, target_contract_id: string?): (component_types.ContractInstance?, error?)
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

    local context = access_result.context or {}
    context.component_id = component_id

    local actor, scope, ctx_err = current_runtime_identity()
    if ctx_err then return nil, ctx_err end
    return open_contract_instance(access_result.impl_id :: string, context, target_contract_id, actor, scope)
end

-- Validate that meta_filters is a non-empty string->string map.
local function validate_meta_filters(meta_filters: { [string]: string }?): error?
    if not meta_filters or type(meta_filters) ~= "table" then
        return (errors.new({ message = "metadata filters are required and must be a table", kind = errors.INVALID }) :: error)
    end
    local has_filters = false
    for key, value in pairs(meta_filters) do
        if type(key) ~= "string" or type(value) ~= "string" then
            return (errors.new({ message = "metadata filters must be string key-value pairs", kind = errors.INVALID }) :: error)
        end
        has_filters = true
    end
    if not has_filters then
        return (errors.new({ message = "at least one metadata filter is required", kind = errors.INVALID }) :: error)
    end
    return nil
end

-- Resolve a single component's access context by metadata filters via the service.
local function resolve_access_context_by_meta(meta_filters: component_types.MetadataMap, required_access: integer, include_context: boolean?): (component_types.AccessContextResult?, error?)
    local access_mask, access_mask_err = normalize_required_access(required_access, nil)
    if access_mask_err or not access_mask then
        return nil, access_mask_err
    end

    local service, service_err = get_component_service()
    if service_err or not service then
        return nil, service_err
    end

    local access_result, access_err = service:get_access_context_by_meta({
        meta = meta_filters,
        access_mask = access_mask,
        include_context = include_context == true,
    })
    if access_err then
        return nil, envelope.call_error(access_err, "get_access_context_by_meta")
    end

    local result_err = result_error(access_result, "get_access_context_by_meta")
    if result_err then
        return nil, result_err
    end

    if include_context == true then
        access_result.context = M.redact_for_actor(access_result.context, access_result.access_level or 0)
    end

    return access_result :: component_types.AccessContextResult, nil
end

-- Find and open a single component by metadata filters.
local function open_by_meta(meta_filters: component_types.MetadataMap, required_access: integer, target_contract_id: string?): (component_types.ContractInstance?, error?)
    local filters_err = validate_meta_filters(meta_filters)
    if filters_err then
        return nil, filters_err
    end
    local access_mask, access_mask_err = normalize_required_access(required_access, nil)
    if access_mask_err or not access_mask then
        return nil, access_mask_err
    end

    local access_result, access_err = resolve_access_context_by_meta(meta_filters, access_mask, true)
    if access_err then
        return nil, access_err
    end

    local actor, scope, ctx_err = current_runtime_identity()
    if ctx_err then return nil, ctx_err end
    return open_contract_instance(access_result.impl_id :: string, (access_result.context or {}) :: component_types.JsonMap, target_contract_id, actor, scope)
end

-- Get a component's private context by metadata filters with access validation.
local function get_context_by_meta(meta_filters: component_types.MetadataMap, required_access: integer): (component_types.JsonMap?, error?)
    local filters_err = validate_meta_filters(meta_filters)
    if filters_err then
        return nil, filters_err
    end
    local access_mask, access_mask_err = normalize_required_access(required_access, nil)
    if access_mask_err or not access_mask then
        return nil, access_mask_err
    end

    local access_result, access_err = resolve_access_context_by_meta(meta_filters, access_mask, true)
    if access_err then
        return nil, access_err
    end

    return (access_result.context or {}) :: component_types.JsonMap, nil
end

M.get_component_service = get_component_service
M.current_runtime_identity = current_runtime_identity
M.open_contract_instance = open_contract_instance
M.result_error = result_error
M.open = open
M.open_by_meta = open_by_meta
M.validate_access = validate_access
M.normalize_required_access = normalize_required_access
M.resolve_access_context = resolve_access_context
M.get_context_by_meta = get_context_by_meta

return M
