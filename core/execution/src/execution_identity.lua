local production_security = require("security")
local production_funcs = require("funcs")
local production_contract = require("contract")

-- One execution identity (IDENTITY-1 v2). The selected principal is stable;
-- Users admission stays live; credential restrictions narrow current group authority.
-- capture records an authenticated selection, resolve authorizes it through the
-- Users-owned scope resolver on every boundary; bind/run_as use that frame.
-- no subject overrides, no ambient fallthrough.
local identity_restrictions = require("identity_restrictions")
local authority_snapshot = require("authority_snapshot")

local function construct(dependencies: any): any
local security = dependencies.security or production_security
local funcs = dependencies.funcs or production_funcs
local contract = dependencies.contract or production_contract
local M = {}

M.VERSION = 2

-- Canonical private_context key for a component's v2 execution identity.
M.CONTEXT_KEY = "_execution_identity"

-- Persisted columns: actor_id is the derived runtime key owned solely by
-- to_row/from_row; actor_context encodes the whole v2 object.
M.COLUMNS = { ID = "actor_id", CONTEXT = "actor_context" }

M.KIND = { USER = "user", GROUP = "group", SERVICE = "service" }

-- The one delegation action string (IDENTITY-1 §2.1). Every delegation
-- policy check names this constant from the owner, never a local copy.
M.DELEGATE_ACTION = "security.actor.delegate"

-- Reserved actor-key spellings (IDENTITY-1 §1): groups and services carry a
-- kind prefix; framework maintenance actors carry the system prefix and are
-- never selectable principals. Every key is spelled and read through the owner.
local GROUP_KEY_PREFIX = "principal:group:"
local SERVICE_KEY_PREFIX = "principal:service:"
local MAINTENANCE_KEY_PREFIX = "system:"

-- Deferred execution (a projection tick, a job round): the trusted owner entry
-- that loads a stored identity resolves it under its own worker frame. The frame
-- must hold this action on the owner entry id; the Users resolver then checks
-- the recorded authorizer and principal, never the worker's own authority.
M.DEFERRED_ACTION = "kickside.execution.defer"

local SCOPE_RESOLVER = "kickside.contract:scope_resolver"
local CREATE_ACTION = "security.actor.create"

type Map = { [string]: any }

type Principal = { kind: string, id: string }
type AuthorizerPrincipal = { kind: string, id: string }

type ExecutionIdentity = {
    version: number,
    principal: Principal,
    authorized_by: AuthorizerPrincipal,
    component_id: string?,
    credential_id: string?,
    link_id: string?,
    captured_at: string,
}

-- Runtime seams, swapped in tests so resolve/bind is verified without a live
-- security registry.

local failure = require("identity_failure")

local function dependency_failure(err: any, context: string, kind: string, error_kind: string, retryable: boolean): error
    if type(err) == "userdata" then return err :: error end
    return failure(context .. ": " .. tostring(err), kind, error_kind, retryable)
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

function M.scope_from_groups(groups: any, extra_policy_ids: any?): (any?, error?)
    if type(groups) ~= "table" or (#groups == 0 and extra_policy_ids == nil) then
        return nil, failure("scope groups must be a non-empty array", errors.PERMISSION_DENIED, "subject", false)
    end
    local policies: { any } = {}
    local seen: { [string]: boolean } = {}
    if #groups == 1 and extra_policy_ids == nil then return security.named_scope(groups[1]) end
    for _, name in ipairs(groups :: { any }) do
        if type(name) ~= "string" or name == "" then
            return nil, failure("scope group must be a non-empty string", errors.PERMISSION_DENIED, "subject", false)
        end
        local scope, err = security.named_scope(name)
        if err or not scope then
            return nil, failure("could not recover scope " .. name .. ": " .. tostring(err),
                errors.PERMISSION_DENIED, "subject", false, err)
        end
        for _, policy in ipairs(scope:policies()) do
            local id = policy:id()
            if not seen[id] then
                seen[id] = true
                policies[#policies + 1] = policy
            end
        end
    end
    for _, id in ipairs(extra_policy_ids or {}) do
        if type(id) ~= "string" or id == "" then
            return nil, failure("scope policy must be a non-empty id", errors.PERMISSION_DENIED, "subject", false)
        end
        if not seen[id] then
            local policy, err = security.policy(id)
            if err or not policy then
                return nil, failure("could not recover restriction policy " .. id .. ": " .. tostring(err),
                    errors.PERMISSION_DENIED, "subject", false, err)
            end
            seen[id] = true
            policies[#policies + 1] = policy
        end
    end
    return security.new_scope(policies), nil
end

-- Evaluate native policy declarations under an already-authorized descriptor.
-- This preserves any group and restriction policies supplied by authorize and
-- never opens the Users resolver, so a worker frame cannot become authority.
function M.evaluate_live_scope(authorized: any, action: any, resources: any): (string?, error?)
    if type(authorized) ~= "table" then
        return nil, failure("live authority descriptor is required", errors.INVALID, "declaration", false)
    end
    local descriptor = authorized :: Map
    local principal, principal_err = M.check_principal(descriptor.principal, "authorizer")
    if principal_err or not principal then return nil, principal_err end
    if (principal :: Principal).kind == M.KIND.GROUP then
        return nil, failure("groups do not evaluate live execution authority", errors.PERMISSION_DENIED, "subject", false)
    end
    local actor_id = descriptor.actor_id
    if actor_id ~= M.actor_key(principal :: Principal) then
        return nil, failure("live authority actor does not match authorizer", errors.PERMISSION_DENIED, "subject", false)
    end
    local scope_name = descriptor.scope_name
    if type(scope_name) ~= "string" or scope_name == "" then
        return nil, failure("authorizer has no live scope", errors.PERMISSION_DENIED, "subject", false)
    end
    local meta = descriptor.meta
    if type(meta) ~= "table" then
        return nil, failure("authorizer has no live metadata", errors.PERMISSION_DENIED, "subject", false)
    end
    if type(action) ~= "string" or action == "" then
        return nil, failure("authority action is required", errors.INVALID, "declaration", false)
    end
    if type(resources) ~= "table" or #resources == 0 then
        return nil, failure("authority resources are required", errors.INVALID, "declaration", false)
    end
    local actor, actor_err = security.new_actor(actor_id, meta)
    if actor_err or not actor then
        return nil, failure("could not build authorizer actor: " .. tostring(actor_err),
            errors.PERMISSION_DENIED, "subject", false, actor_err)
    end
    local scope, scope_err
    if descriptor.scope_groups ~= nil then
        scope, scope_err = M.scope_from_groups(descriptor.scope_groups, descriptor.scope_policy_ids)
    else
        scope, scope_err = security.named_scope(scope_name)
    end
    if scope_err or not scope then
        return nil, failure("could not recover authorizer scope " .. scope_name .. ": " .. tostring(scope_err),
            errors.PERMISSION_DENIED, "subject", false, scope_err)
    end
    local allowed, denied = false, false
    for _, resource in ipairs(resources :: { any }) do
        if type(resource) ~= "string" or resource == "" then
            return nil, failure("authority resource is required", errors.INVALID, "declaration", false)
        end
        local decision = scope:evaluate(actor, action, resource)
        if decision == "deny" then denied = true end
        if decision == "allow" then allowed = true end
    end
    if denied then return "deny", nil end
    if allowed then return "allow", nil end
    return "undefined", nil
end

-- is_valid_id(id) -> boolean. Canonical principal ids carry no colon or
-- whitespace, so no id can spell a reserved actor key. Single definition;
-- every principal check in the tree funnels through here.
function M.is_valid_id(id: any): boolean
    if type(id) ~= "string" or id == "" then return false end
    if id:find(":", 1, true) or id:find("%s") then return false end
    return true
end

local function is_valid_kind(kind: any): boolean
    return kind == M.KIND.USER or kind == M.KIND.GROUP or kind == M.KIND.SERVICE
end

-- check_principal(value, field) -> (Principal?, err?). The one {kind, id}
-- validation. Single definition; identity_ops and scope_resolver import it.
function M.check_principal(value: any, field: string): (Principal?, error?)
    if type(value) ~= "table" then
        return nil, failure(field .. " must be a {kind, id} principal", errors.INVALID, "declaration", false)
    end
    local principal = value :: Principal
    if not is_valid_kind(principal.kind) then
        return nil, failure(field .. " has an unsupported principal kind", errors.INVALID, "declaration", false)
    end
    if not M.is_valid_id(principal.id) then
        return nil, failure(field .. " has an invalid principal id", errors.INVALID, "declaration", false)
    end
    return { kind = principal.kind, id = principal.id }, nil
end

-- same_principal(a, b) -> boolean. Typed principal equality. Single
-- definition; callers compare (kind, id) pairs through here, never through
-- a local copy.
function M.same_principal(a: any, b: any): boolean
    return type(a) == "table" and type(b) == "table" and a.kind == b.kind and a.id == b.id
end

-- actor_key(principal) -> string. Users keep their bare canonical id for
-- existing data; groups/services use deterministic reserved keys. ACLs compare
-- (kind, id), never this spelling.
function M.actor_key(principal: Principal): string
    if principal.kind == M.KIND.GROUP then return GROUP_KEY_PREFIX .. principal.id end
    if principal.kind == M.KIND.SERVICE then return SERVICE_KEY_PREFIX .. principal.id end
    return principal.id
end

-- is_maintenance_key(actor_id) -> boolean. Framework maintenance actors keep
-- their service identity outside the user-facing lifecycle.
function M.is_maintenance_key(actor_id: any): boolean
    return type(actor_id) == "string"
        and actor_id:sub(1, #MAINTENANCE_KEY_PREFIX) == MAINTENANCE_KEY_PREFIX
end

-- principal_of_key(actor_id) -> (Principal?, err?). The inverse of actor_key:
-- reads a runtime actor key back into its typed principal. A maintenance key,
-- an unknown prefix or an invalid id refuses as INVALID/declaration; callers
-- apply their own kind policy (for example, groups never authorize).
function M.principal_of_key(actor_id: any): (Principal?, error?)
    if type(actor_id) ~= "string" or actor_id == "" then
        return nil, failure("actor key is required", errors.INVALID, "declaration", false)
    end
    if M.is_maintenance_key(actor_id) then
        return nil, failure("framework maintenance actors are never principals", errors.INVALID, "declaration", false)
    end
    local candidate: Principal = { kind = M.KIND.USER, id = actor_id }
    if actor_id:sub(1, #GROUP_KEY_PREFIX) == GROUP_KEY_PREFIX then
        candidate = { kind = M.KIND.GROUP, id = actor_id:sub(#GROUP_KEY_PREFIX + 1) }
    elseif actor_id:sub(1, #SERVICE_KEY_PREFIX) == SERVICE_KEY_PREFIX then
        candidate = { kind = M.KIND.SERVICE, id = actor_id:sub(#SERVICE_KEY_PREFIX + 1) }
    end
    return M.check_principal(candidate, "actor key")
end

-- validate(identity) -> (ok, err?). The v2 schema invariant: any other version
-- or a mismatched row refuses.
function M.validate(identity: any): (boolean, error?)
    if type(identity) ~= "table" then return false, failure("identity must be a table", errors.INVALID, "declaration", false) end
    local id = identity :: ExecutionIdentity
    if (tonumber(id.version) or 0) ~= M.VERSION then return false, failure("unsupported execution identity version", errors.INVALID, "declaration", false) end
    local principal, principal_err = M.check_principal(id.principal, "principal")
    if principal_err or not principal then return false, failure("invalid principal", errors.INVALID, "declaration", false, principal_err) end
    if type(id.authorized_by) ~= "table" then return false, failure("missing authorized_by", errors.INVALID, "declaration", false) end
    local authorizer = id.authorized_by :: AuthorizerPrincipal
    if authorizer.kind ~= M.KIND.USER and authorizer.kind ~= M.KIND.SERVICE then
        return false, failure("authorized_by must be a user or service principal", errors.INVALID, "declaration", false)
    end
    if not M.is_valid_id(authorizer.id) then return false, failure("invalid authorized_by id", errors.INVALID, "declaration", false) end
    for _, field in ipairs({ "component_id", "credential_id", "link_id" }) do
        local value = (id :: Map)[field]
        if value ~= nil and (type(value) ~= "string" or value == "") then
            return false, failure("invalid " .. field, errors.INVALID, "declaration", false)
        end
    end
    if type(id.captured_at) ~= "string" or id.captured_at == "" then return false, failure("missing captured_at", errors.INVALID, "declaration", false) end
    return true, nil
end

-- utc_now() -> canonical UTC stamp for captured_at/created_at. Single
-- definition; persist writers and the resolver stamp through the owner.
function M.utc_now(): string
    local stamped = os.date("!%Y-%m-%dT%H:%M:%SZ", os.time())
    if type(stamped) == "string" and stamped ~= "" then return stamped end
    return "1970-01-01T00:00:00Z"
end

local DERIVED_INPUT_FIELDS = { "authorized_by", "credential_id", "link_id", "captured_at", "version" }

local function ambient_caller(): (Principal?, error?, Map?, string?)
    local actor = security.actor()
    local actor_id = actor and trim(actor:id()) or ""
    if actor_id == "" then
        return nil, failure("an authenticated actor is required to capture an execution identity", errors.PERMISSION_DENIED, "access", false)
    end
    if M.is_maintenance_key(actor_id) then
        return nil, failure("framework maintenance actors are never selectable principals", errors.INVALID, "declaration", false)
    end
    local meta: Map = {}
    if actor.meta then
        local ok_meta, raw = true, nil
        if type(actor.meta) == "function" then
            raw = actor:meta()
        end
        if type(raw) == "table" then meta = raw :: Map end
        if not ok_meta then meta = {} end
    end
    local declared = meta.principal
    if type(declared) == "table" then
        local principal, principal_err = M.check_principal(declared, "principal")
        if principal_err then return nil, principal_err end
        return principal, nil, meta, actor_id
    end
    local keyed, key_err = M.principal_of_key(actor_id)
    if key_err or not keyed then return nil, key_err end
    if (keyed :: Principal).kind == M.KIND.GROUP then
        return nil, failure("groups do not capture execution identity", errors.PERMISSION_DENIED, "access", false)
    end
    return keyed, nil, meta, actor_id
end

-- A resolved identity is carried as one server-written value in the execution
-- frame. Nested work retains its original admission rather than turning the
-- selected actor into a new authorizer.
local function admitted_identity(caller: Principal, actor_id: string, meta: Map): (ExecutionIdentity?, error?)
    local inherited = meta.execution_identity
    if inherited == nil then return nil, nil end
    local valid, validation_err = M.validate(inherited)
    if not valid then
        return nil, failure("invalid admitted execution identity: " .. tostring(validation_err),
            errors.PERMISSION_DENIED, "subject", false, validation_err)
    end
    local admitted = inherited :: ExecutionIdentity
    if M.actor_key(admitted.principal) ~= actor_id or not M.same_principal(caller, admitted.principal) then
        return nil, failure("admitted execution identity does not match the ambient actor",
            errors.PERMISSION_DENIED, "subject", false)
    end
    return admitted, nil
end

-- capture(input?) -> (ExecutionIdentity?, err?). Internal authenticated
-- admission: principal defaults to self; only principal and component_id may
-- be supplied. authorized_by names the ambient caller. Recording is not
-- authorization: resolve enforces may_act_as before anything executes.
function M.capture(input: any?): (ExecutionIdentity?, error?)
    local args: Map = {}
    if input ~= nil then
        if type(input) ~= "table" then
            return nil, failure("capture input must be a table", errors.INVALID, "declaration", false)
        end
        args = input :: Map
        for _, field in ipairs(DERIVED_INPUT_FIELDS) do
            if args[field] ~= nil then
                return nil, failure(field .. " is server-derived and cannot be supplied", errors.INVALID, "declaration", false)
            end
        end
    end
    local caller, caller_err, caller_meta, actor_id = ambient_caller()
    if caller_err or not caller then return nil, caller_err end
    local inherited: Map = caller_meta or {}
    local admitted, admitted_err = admitted_identity(caller :: Principal, actor_id :: string, inherited)
    if admitted_err then return nil, admitted_err end
    local authority: Map = admitted and (admitted :: Map) or inherited
    local principal: Principal = admitted and (admitted :: ExecutionIdentity).principal or (caller :: Principal)
    if args.principal ~= nil then
        local selected, selected_err = M.check_principal(args.principal, "principal")
        if selected_err or not selected then return nil, selected_err end
        if admitted and not M.same_principal(selected, principal)
            and not M.same_principal((admitted :: ExecutionIdentity).authorized_by, caller :: Principal) then
            return nil, failure("capture cannot replace the admitted principal", errors.PERMISSION_DENIED, "subject", false)
        end
        principal = selected :: Principal
    end
    for _, field in ipairs({ "component_id", "credential_id", "link_id" }) do
        local value = authority[field]
        if value ~= nil and (type(value) ~= "string" or value == "") then
            return nil, failure("invalid inherited " .. field, errors.PERMISSION_DENIED, "subject", false)
        end
    end
    local component_id: string? = authority.component_id
    if args.component_id ~= nil then
        if type(args.component_id) ~= "string" or args.component_id == "" then
            return nil, failure("invalid component_id", errors.INVALID, "declaration", false)
        end
        if component_id ~= nil and component_id ~= args.component_id then
            return nil, failure("capture cannot replace the inherited component root", errors.PERMISSION_DENIED, "subject", false)
        end
        component_id = args.component_id
    end
    local identity: ExecutionIdentity = {
        version = M.VERSION,
        principal = principal,
        authorized_by = admitted and {
            kind = (admitted :: ExecutionIdentity).authorized_by.kind,
            id = (admitted :: ExecutionIdentity).authorized_by.id,
        } or { kind = (caller :: Principal).kind, id = (caller :: Principal).id },
        component_id = component_id,
        credential_id = authority.credential_id,
        link_id = authority.link_id,
        captured_at = M.utc_now(),
    }
    return identity, nil
end

local function open_resolver(): (any?, error?)
    local resolver_contract, contract_err = contract.get(SCOPE_RESOLVER)
    if contract_err or not resolver_contract then
        return nil, dependency_failure(contract_err, "scope resolver unavailable", errors.UNAVAILABLE, "infrastructure", true)
    end
    local actor, actor_err = security.actor()
    if not actor then
        return nil, failure("an authenticated frame is required to resolve execution identity: " .. tostring(actor_err),
            errors.UNAVAILABLE, "infrastructure", true, actor_err)
    end
    local scope, scope_err = security.scope()
    if not scope then
        return nil, failure("security scope is unavailable: " .. tostring(scope_err), errors.UNAVAILABLE, "infrastructure", true, scope_err)
    end
    local actor_bound, actor_bind_err = (resolver_contract :: any):with_actor(actor)
    if actor_bind_err or not actor_bound then
        return nil, dependency_failure(actor_bind_err, "scope resolver actor binding denied",
            errors.PERMISSION_DENIED, "access", false)
    end
    local scope_bound, scope_bind_err = actor_bound:with_scope(scope)
    if scope_bind_err or not scope_bound then
        return nil, dependency_failure(scope_bind_err, "scope resolver scope binding denied",
            errors.PERMISSION_DENIED, "access", false)
    end
    local resolver, open_err = scope_bound:open()
    if open_err or not resolver then
        return nil, dependency_failure(open_err, "scope resolver open failed", errors.UNAVAILABLE, "infrastructure", true)
    end
    return resolver, nil
end

-- authorize checks live Users authority and credential/link restrictions without
-- constructing an execution frame. opts carries {execution_root?, deferred_owner?}.
function M.authorize(identity: any, opts: any?): (any?, error?)
    local ok, verr = M.validate(identity)
    if not ok then
        return nil, verr
    end
    local id = identity :: ExecutionIdentity
    local root: any = id.component_id and { owner_id = "kickside.component", record_id = id.component_id } or nil
    local deferred_owner: string? = nil
    if type(opts) == "table" then
        if (opts :: Map).execution_root ~= nil then
            local supplied = (opts :: Map).execution_root
            if id.component_id ~= nil then
                local same = supplied == id.component_id
                    or (type(supplied) == "table" and supplied.owner_id == "kickside.component"
                        and supplied.record_id == id.component_id)
                if not same then
                    return nil, failure("execution root cannot replace the stored component",
                        errors.PERMISSION_DENIED, "subject", false)
                end
            elseif type(supplied) == "string" and supplied ~= "" then
                -- A root named by id is a component; the resolver checks root ADMIN.
                root = { owner_id = "kickside.component", record_id = supplied }
            else
                root = supplied
            end
        end
        local owner = (opts :: Map).deferred_owner
        if owner ~= nil then
            if type(owner) ~= "string" or trim(owner) == "" then
                return nil, failure("deferred_owner must name the trusted owner entry", errors.INVALID, "declaration", false)
            end
            deferred_owner = trim(owner)
        end
    end
    local restrictions, restriction_err = identity_restrictions.load(id, funcs)
    if restriction_err or not restrictions then return nil, restriction_err end
    local resolver, open_err = open_resolver()
    if open_err or not resolver then return nil, open_err end
    local params, resolve_err = resolver:resolve({
        principal = { kind = id.principal.kind, id = id.principal.id },
        authorized_by = { kind = id.authorized_by.kind, id = id.authorized_by.id },
        execution_root = root,
        deferred_owner = deferred_owner,
        authority_only = restrictions.authority ~= nil,
    })
    if resolve_err then return nil, resolve_err end
    if type(params) ~= "table" then
        return nil, failure("scope resolver returned no params", errors.UNAVAILABLE, "infrastructure", true)
    end
    local answered = (params :: Map).principal
    if type(answered) ~= "table"
        or (answered :: Principal).kind ~= id.principal.kind
        or (answered :: Principal).id ~= id.principal.id then
        return nil, failure("scope resolver principal mismatch", errors.PERMISSION_DENIED, "subject", false)
    end
    local actor_id = tostring((params :: Map).actor_id or "")
    if actor_id ~= M.actor_key(id.principal) then
        return nil, failure("scope resolver actor mismatch", errors.PERMISSION_DENIED, "subject", false)
    end
    local scope_name = tostring((params :: Map).scope_name or "")
    if scope_name == "" then
        return nil, failure("scope resolver returned no scope", errors.PERMISSION_DENIED, "subject", false)
    end
    if restrictions.scope_name ~= nil then scope_name = restrictions.scope_name end
    local meta: Map = {}
    if type((params :: Map).meta) == "table" then meta = (params :: Map).meta :: Map end
    if id.principal.kind == M.KIND.USER then
        if type((params :: Map).groups) ~= "table" then
            return nil, failure("scope resolver returned no live groups", errors.PERMISSION_DENIED, "subject", false)
        end
        meta.security_groups = (params :: Map).groups
    end
    if restrictions.credential_id ~= nil then
        local valid, epoch_err = authority_snapshot.check_epochs(
            restrictions.authority and restrictions.authority.epochs,
            params.authority_epochs, params.initial_authority_epochs)
        if not valid then return nil, epoch_err end
    end
    meta.authority_epochs = params.authority_epochs
    meta.credential_id = restrictions.credential_id
    meta.link_id = restrictions.link_id
    meta.component_id = id.component_id
    meta.access_filter = restrictions.access_filter
    meta.principal = { kind = id.principal.kind, id = id.principal.id }
    if id.principal.kind == M.KIND.USER then
        meta.user_id = id.principal.id
    else
        meta.user_id = nil
    end
    meta.execution_identity = {
        version = M.VERSION,
        principal = { kind = id.principal.kind, id = id.principal.id },
        authorized_by = { kind = id.authorized_by.kind, id = id.authorized_by.id },
        component_id = id.component_id,
        credential_id = id.credential_id,
        link_id = id.link_id,
        captured_at = id.captured_at,
    }
    local scope_groups = nil
    if restrictions.scope_policy_ids ~= nil then
        scope_groups = (params :: Map).scope_groups or { (params :: Map).scope_name }
    elseif restrictions.scope_name == nil then
        scope_groups = (params :: Map).scope_groups
    end
    local policy_ids = restrictions.scope_policy_ids
    return { principal = { kind = id.principal.kind, id = id.principal.id },
        actor_id = actor_id, scope_name = scope_name, scope_groups = scope_groups,
        scope_policy_ids = policy_ids, authority_epochs = params.authority_epochs,
        initial_authority_epochs = params.initial_authority_epochs, meta = meta }, nil
end

-- Durable delegations retain an issuance audit and epoch fence.
function M.capture_authority(identity: any): (any?, error?)
    local authorized, authorization_err = M.authorize(identity)
    if authorization_err or not authorized then return nil, authorization_err end
    local actor = security.actor()
    if not actor or actor:id() ~= authorized.actor_id then
        return nil, failure("issuing actor does not match delegated principal", errors.PERMISSION_DENIED, "subject", false)
    end
    local meta = actor:meta() or {}
    local valid, epoch_err = authority_snapshot.check_epochs(meta.authority_epochs,
        authorized.authority_epochs, authorized.initial_authority_epochs)
    if not valid then return nil, epoch_err end
    local scope = security.scope()
    if not scope then return nil, failure("issuing scope is unavailable", errors.PERMISSION_DENIED, "subject", false) end
    local policy_ids: {string} = {}
    for _, policy in ipairs(scope:policies()) do policy_ids[#policy_ids + 1] = policy:id() end
    local groups = {}
    if meta.security_groups ~= nil then
        if type(meta.security_groups) ~= "table" then
            return nil, failure("issuing groups must be an array", errors.PERMISSION_DENIED, "subject", false)
        end
        for key, group in pairs(meta.security_groups) do groups[key] = group end
    end
    local snapshot = {policy_ids = policy_ids, groups = groups, epochs = authorized.authority_epochs}
    local snapshot_valid, snapshot_err = authority_snapshot.validate(snapshot)
    if not snapshot_valid then return nil, snapshot_err end
    return snapshot, nil
end

-- resolve constructs the execution frame after canonical authorization and the
-- actor-create grant check. Declaration ACL checks use authorize directly.
function M.resolve(identity: any, opts: any?): (any?, error?)
    local authorized, authorization_err = M.authorize(identity, opts)
    if authorization_err or not authorized then return nil, authorization_err end
    local actor_id = authorized.actor_id
    if security.can(CREATE_ACTION, actor_id) ~= true then
        return nil, failure("actor creation is not granted for " .. actor_id, errors.PERMISSION_DENIED, "access", false)
    end
    local meta = authorized.meta
    local scope_name = authorized.scope_name
    local actor, actor_err = security.new_actor(actor_id, meta)
    if actor_err or not actor then
        return nil, failure("could not build actor " .. actor_id .. ": " .. tostring(actor_err), errors.PERMISSION_DENIED, "subject", false, actor_err)
    end
    local scope, scope_err
    if authorized.scope_groups ~= nil then
        scope, scope_err = M.scope_from_groups(authorized.scope_groups, authorized.scope_policy_ids)
    else
        scope, scope_err = security.named_scope(scope_name)
    end
    if scope_err or not scope then
        return nil, failure("could not recover scope " .. scope_name .. ": " .. tostring(scope_err),
            errors.PERMISSION_DENIED, "subject", false, scope_err)
    end
    return { principal = authorized.principal,
        actor = actor, scope = scope, scope_name = scope_name, meta = meta }, nil
end

-- bind(identity, opts?) -> (funcs_builder?, err?). One scoped builder; each
-- grant step is checked separately so a removed grant is a typed denial,
-- never a nil dereference or a service restart loop.
function M.bind(identity: any, opts: any?): (any?, error?)
    local resolved, resolve_err = M.resolve(identity, opts)
    if resolve_err or not resolved then return nil, resolve_err end
    local builder, builder_err = funcs.new()
    if builder_err or not builder then
        return nil, failure("funcs builder is unavailable: " .. tostring(builder_err), errors.UNAVAILABLE, "infrastructure", true, builder_err)
    end
    local with_actor, actor_err = builder:with_actor((resolved :: Map).actor)
    if actor_err or not with_actor then
        return nil, failure("funcs actor grant failed: " .. tostring(actor_err), errors.PERMISSION_DENIED, "access", false, actor_err)
    end
    local with_scope, scope_err = with_actor:with_scope((resolved :: Map).scope)
    if scope_err or not with_scope then
        return nil, failure("funcs scope grant failed: " .. tostring(scope_err), errors.PERMISSION_DENIED, "access", false, scope_err)
    end
    return with_scope, nil
end

-- run_as(identity, fn_id, args, opts?) -> (result?, err?). The structured
-- carrier reaches the caller unmodified; nothing is stringified before
-- classification.
function M.run_as(identity: any, fn_id: string, args: any, opts: any?): (any?, error?)
    if type(fn_id) ~= "string" or fn_id == "" then
        return nil, failure("fn_id is required", errors.INVALID, "declaration", false)
    end
    local builder, bind_err = M.bind(identity, opts)
    if bind_err or not builder then return nil, bind_err end
    return builder:call(fn_id, args)
end


require("identity_codec")(M, failure)

M.new = construct
return M
end

return construct({ security = production_security, funcs = production_funcs, contract = production_contract })
