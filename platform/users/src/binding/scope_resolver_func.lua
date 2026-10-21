local funcs = require("funcs")
local security = require("security")
local execution_identity = require("execution_identity")
local component = require("component")

-- kickside.contract:scope_resolver v2 (IDENTITY-1). Users owns live existence,
-- membership and delegation; core owns actor/scope construction.
--
-- Protected explicit path input: {principal, authorized_by?, execution_root?,
-- deferred_owner?}. deferred_owner marks a trusted owner entry resolving a
-- stored identity under its worker frame (resolve_deferred).
-- Every caller supplies an explicit principal.
--
-- Success returns {principal, actor_id, groups, scope_name, meta}. Failures
-- return (nil, typed_error) and never fall through to a stale snapshot.
local M = {}

local SUBJECT_LOOKUP = "kickside.users.binding:subject_lookup"

type Principal = { kind: string, id: string }

local function security_module()
    return (M :: any)._security or security
end

local function funcs_module()
    return (M :: any)._funcs or funcs
end

-- Group execution-scope catalog seam. Production reads the trusted
-- assignable-scope catalog; until F wires that import, the seam default
-- denies (fail-closed). Tests inject doubles. Returns (scope_name?, err?).
local function group_scope(group_id: string): (string?, error?)
    local override = (M :: any)._group_scope
    if type(override) == "function" then
        local name, name_err = override(group_id)
        if type(name) == "string" and name ~= "" then return name, nil end
        if name_err ~= nil then return nil, name_err end
    end
    return nil, (errors.new({
        message = "group execution catalog is not wired for " .. group_id,
        kind = errors.PERMISSION_DENIED,
        details = { error_kind = "subject" },
    }) :: error)
end

-- Managed service catalog seam. Default-deny until the catalog lands:
-- unknown/inactive service never falls back to a user.
local function service_record(service_id: string): (any?, error?)
    local override = (M :: any)._service_record
    if type(override) == "function" then
        local record, record_err = override(service_id)
        if type(record) == "table" then return record, nil end
        if record_err ~= nil then return nil, record_err end
    end
    return nil, (errors.new({
        message = "service principals are default-deny until the managed catalog lands: " .. service_id,
        kind = errors.PERMISSION_DENIED,
        details = { error_kind = "subject" },
    }) :: error)
end

local function failure(message: string, kind: string, error_kind: string, retryable: boolean): error
    return (errors.new({
        message = message,
        kind = kind,
        retryable = retryable,
        details = { error_kind = error_kind },
    }) :: error)
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- Every identity primitive (KIND, DELEGATE_ACTION, actor_key,
-- principal_of_key, is_maintenance_key, check_principal, is_valid_id,
-- same_principal, check_grant, utc_now, delegation encoding) lives only in
-- kickside.execution:execution_identity (IDENTITY-1 §2.1); this module
-- imports the owner and never reimplements one.

-- Privileged subject read through the Users-owned seam. Returns the lookup
-- row or (nil, typed_error); infrastructure stays typed and retryable.
local function lookup_subject(subject_id: string, authority_only: boolean?): (any?, error?)
    local resolved, call_err = funcs_module().new():call(SUBJECT_LOOKUP, { subject_id = subject_id, authority_only = authority_only == true })
    if call_err ~= nil then return nil, call_err :: error end
    if type(resolved) ~= "table" then
        return nil, failure("subject lookup failed for " .. subject_id, errors.UNAVAILABLE, "infrastructure", true)
    end
    local row = resolved :: any
    if row.error ~= nil then
        local detail = row.error
        local kind = type(detail) == "table" and (detail :: any).kind or nil
        local error_kind = row.error_kind == "infrastructure" and "infrastructure" or "subject"
        if error_kind == "infrastructure" then
            if kind ~= errors.INTERNAL and kind ~= errors.UNAVAILABLE and kind ~= errors.TIMEOUT then
                kind = errors.UNAVAILABLE
            end
            return nil, failure("subject lookup failed: " .. tostring(
                type(detail) == "table" and (detail :: any).message or detail),
                kind :: string, "infrastructure", row.retriable ~= false)
        end
        -- The execution boundary normalizes deterministic missing-principal
        -- refusal to PERMISSION_DENIED; the public error never reveals whether
        -- the account exists.
        if kind ~= errors.PERMISSION_DENIED then
            kind = errors.PERMISSION_DENIED
        end
        return nil, failure("subject lookup failed: " .. tostring(
            type(detail) == "table" and (detail :: any).message or detail),
            kind :: string, "subject", false)
    end
    return row, nil
end

M.lookup_subject = lookup_subject

-- Derive the ambient caller's principal. Groups and framework maintenance
-- actors never authorize.
local function caller_principal(): (Principal?, error?)
    local sec = security_module()
    local actor = sec.actor()
    local raw_id = actor and actor:id() or nil
    local actor_id = trim(raw_id)
    if actor_id == "" then
        return nil, failure("an authenticated actor is required", errors.PERMISSION_DENIED, "access", false)
    end
    if execution_identity.is_maintenance_key(actor_id) then
        return nil, failure("framework maintenance actors never authorize execution", errors.PERMISSION_DENIED, "access", false)
    end
    local keyed, key_err = execution_identity.principal_of_key(actor_id)
    if key_err or not keyed then return nil, key_err end
    if (keyed :: Principal).kind == execution_identity.KIND.GROUP then
        return nil, failure("groups do not authorize execution", errors.PERMISSION_DENIED, "access", false)
    end
    return keyed, nil
end

-- Delegation is a native policy decision in the recorded authorizer's current
-- Users-derived scope. Registry records are declarations, never grants by
-- themselves; the worker frame cannot answer this question.
local function live_delegation(principal: Principal, authorizer: Principal, authorizer_row: any, root: string?): error?
    if authorizer.kind ~= execution_identity.KIND.USER then
        return failure("recorded authorizer has no Users-derived delegation authority",
            errors.PERMISSION_DENIED, "subject", false)
    end
    local roots: { string } = {}
    if root and root ~= "" then roots = { root, "*" } else roots = { "*" } end
    local resources: { string } = {}
    for _, anchor in ipairs(roots) do
        resources[#resources + 1] = execution_identity.delegation_bytes(principal.kind, principal.id, anchor)
    end
    local evaluator = (M :: any)._evaluate_live_scope or execution_identity.evaluate_live_scope
    local decision, evaluate_err = evaluator({
        principal = { kind = authorizer.kind, id = authorizer.id },
        actor_id = execution_identity.actor_key(authorizer),
        scope_name = (authorizer_row :: any).scope_name,
        scope_groups = (authorizer_row :: any).scope_groups,
        meta = (authorizer_row :: any).meta,
    }, execution_identity.DELEGATE_ACTION, resources)
    if evaluate_err then return evaluate_err end
    if decision ~= "allow" then
        return failure("delegation is not live for " .. principal.kind .. ":" .. principal.id, errors.PERMISSION_DENIED, "subject", false)
    end
    return nil
end

local function resolve_user(principal: Principal, looked_up: any?, authority_only: boolean?): (any?, error?)
    local row = looked_up
    if row == nil then
        local lookup_err
        row, lookup_err = lookup_subject(principal.id, authority_only)
        if lookup_err then return nil, lookup_err end
    end
    local groups: { string } = {}
    if type((row :: any).groups) == "table" then
        for _, g in ipairs((row :: any).groups) do
            if type(g) == "string" and g ~= "" then groups[#groups + 1] = g end
        end
    end
    local scope_id = trim(row.scope_name)
    if trim(scope_id) == "" then
        return nil, failure("user has no executable scope", errors.PERMISSION_DENIED, "subject", false)
    end
    local scope_groups: { string } = {scope_id}
    if row.scope_groups ~= nil then
        if type(row.scope_groups) ~= "table" or #row.scope_groups == 0 then
            return nil, failure("subject lookup returns invalid scope groups", errors.UNAVAILABLE, "infrastructure", false)
        end
        local count = #row.scope_groups
        local present = 0
        for index, group in pairs(row.scope_groups) do
            if type(index) ~= "number" or index % 1 ~= 0 or index < 1 or index > count
                or type(group) ~= "string" or trim(group) == "" then
                return nil, failure("subject lookup returns invalid scope groups", errors.UNAVAILABLE, "infrastructure", false)
            end
            present = present + 1
        end
        if present ~= count then
            return nil, failure("subject lookup returns invalid scope groups", errors.UNAVAILABLE, "infrastructure", false)
        end
        scope_groups = row.scope_groups
    end
    local meta = type((row :: any).meta) == "table" and (row :: any).meta or {}
    return {
        principal = { kind = execution_identity.KIND.USER, id = principal.id },
        authority_epochs = row.authority_epochs, initial_authority_epochs = row.initial_authority_epochs,
        actor_id = execution_identity.actor_key(principal),
        groups = groups,
        scope_name = scope_id,
        scope_groups = scope_groups,
        meta = {
            user_id = principal.id,
            email = (meta :: any).email,
            full_name = (meta :: any).full_name,
            status = (meta :: any).status,
        },
    }, nil
end

local function resolve_group(principal: Principal, caller: Principal): (any?, error?)
    local caller_row, caller_err = lookup_subject(caller.id)
    if caller_err then return nil, caller_err end
    local member = false
    if type((caller_row :: any).groups) == "table" then
        for _, g in ipairs((caller_row :: any).groups) do
            if g == principal.id then member = true break end
        end
    end
    if caller.kind ~= execution_identity.KIND.USER or not member then
        return nil, failure("group execution requires active membership in " .. principal.id, errors.PERMISSION_DENIED, "subject", false)
    end
    local scope_name, catalog_err = group_scope(principal.id)
    if catalog_err or not scope_name then return nil, catalog_err end
    return {
        principal = { kind = execution_identity.KIND.GROUP, id = principal.id },
        actor_id = execution_identity.actor_key(principal),
        groups = {},
        scope_name = scope_name,
        meta = { group_id = principal.id, status = "active" },
    }, nil
end

local function resolve_service(principal: Principal): (any?, error?)
    local record, record_err = service_record(principal.id)
    if record_err then return nil, record_err end
    local scope_name = trim(type(record) == "table" and (record :: any).execution_scope or "")
    if scope_name == "" then
        return nil, failure("service has no executable scope: " .. principal.id, errors.PERMISSION_DENIED, "subject", false)
    end
    return {
        principal = { kind = execution_identity.KIND.SERVICE, id = principal.id },
        actor_id = execution_identity.actor_key(principal),
        groups = {},
        scope_name = scope_name,
        meta = { service_id = principal.id, status = "active" },
    }, nil
end

local function resolve_principal(principal: Principal, caller: Principal, looked_up: any?, authority_only: boolean?): (any?, error?)
    if principal.kind == execution_identity.KIND.USER then return resolve_user(principal, looked_up, authority_only) end
    if principal.kind == execution_identity.KIND.GROUP then return resolve_group(principal, caller) end
    return resolve_service(principal)
end

-- Deferred resolution of a stored identity by its trusted owner entry. The
-- calling frame is a worker, not a principal: it must hold
-- kickside.execution.defer on the owner entry id. Authority comes from the
-- record: the recorded authorizer must still be live, a principal other than
-- the authorizer needs a live delegation grant record, and a group principal
-- needs the authorizer's live membership.
local function resolve_deferred(principal: Principal, authorized_by: any, root: string?, component_root: string?, deferred_owner: any, authority_only: boolean?): (any?, error?)
    local owner = trim(deferred_owner)
    if owner == "" then
        return nil, failure("deferred_owner must name the trusted owner entry", errors.INVALID, "declaration", false)
    end
    if security_module().can(execution_identity.DEFERRED_ACTION, owner) ~= true then
        return nil, failure("caller is not a trusted deferred owner for " .. owner, errors.PERMISSION_DENIED, "access", false)
    end
    if type(authorized_by) ~= "table" then
        return nil, failure("deferred resolution requires the recorded authorizer", errors.INVALID, "declaration", false)
    end
    local authorizer = authorized_by :: Principal
    local authorizer_row: any = nil
    if authorizer.kind == execution_identity.KIND.USER then
        local lookup_err: error?
        authorizer_row, lookup_err = lookup_subject(authorizer.id, authority_only == true and execution_identity.same_principal(principal, authorizer))
        if lookup_err then return nil, lookup_err end
    else
        local _, service_err = service_record(authorizer.id)
        if service_err then return nil, service_err end
    end
    if component_root ~= nil then
        local checker = (M :: any)._root_admin or component.validate_identity_authorizer_admin
        local allowed, access_err = checker(component_root, authorizer,
            authorizer_row and (authorizer_row :: any).groups or nil)
        if access_err then
            return nil, failure("root ADMIN check failed: " .. tostring(access_err),
                errors.UNAVAILABLE, "infrastructure", true)
        end
        if allowed ~= true then
            return nil, failure("recorded authorizer no longer has root ADMIN", errors.PERMISSION_DENIED, "access", false)
        end
    end
    if not execution_identity.same_principal(principal, authorizer) then
        if not authorizer_row then
            return nil, failure("recorded authorizer has no Users-derived delegation authority",
                errors.PERMISSION_DENIED, "subject", false)
        end
        local delegation_err = live_delegation(principal, authorizer, authorizer_row, root)
        if delegation_err then return nil, delegation_err end
    end
    local result, resolve_err = resolve_principal(principal, authorizer,
        execution_identity.same_principal(principal, authorizer) and authorizer_row or nil, authority_only)
    if resolve_err or not result then return nil, resolve_err end
    if not execution_identity.same_principal((result :: any).principal, principal) then
        return nil, failure("principal mismatch in resolver response", errors.PERMISSION_DENIED, "subject", false)
    end
    if authorizer_row and not execution_identity.same_principal(principal, authorizer) then
        for _, field in ipairs({"authority_epochs", "initial_authority_epochs"}) do
            local extra = authorizer_row[field]
            if extra ~= nil then
                local combined = table.create(0, 1)
                for key, value in pairs(result[field] or {}) do combined[key] = value end
                for key, value in pairs(extra) do combined[key] = value end
                result[field] = combined
            end
        end
    end
    return result, nil
end

function M.resolve(args: any): (any?, error?)
    if type(args) ~= "table" or (args :: any).principal == nil then
        return nil, failure("principal is required", errors.INVALID, "declaration", false)
    end
    local principal, principal_err = execution_identity.check_principal((args :: any).principal, "principal")
    if principal_err or not principal then return nil, principal_err end
    if (principal :: Principal).kind ~= execution_identity.KIND.USER then
        return nil, failure("only user principals may be selected for execution", errors.PERMISSION_DENIED, "subject", false)
    end
    local authorized_by: any = nil
    if (args :: any).authorized_by ~= nil then
        local authorizer, authorizer_err = execution_identity.check_principal((args :: any).authorized_by, "authorized_by")
        if authorizer_err or not authorizer then return nil, authorizer_err end
        if (authorizer :: any).kind == execution_identity.KIND.GROUP then
            return nil, failure("authorized_by must be a user or service principal", errors.INVALID, "declaration", false)
        end
        authorized_by = authorizer
    end
    local root: string? = nil
    local component_root: string? = nil
    if (args :: any).execution_root ~= nil then
        local raw_root = (args :: any).execution_root
        if type(raw_root) == "table" then
            local owner_id = trim((raw_root :: any).owner_id)
            local record_id = trim((raw_root :: any).record_id)
            if owner_id == "" or record_id == "" then
                return nil, failure("execution_root needs owner_id and record_id", errors.INVALID, "declaration", false)
            end
            if owner_id == "kickside.component" then
                root = record_id
                component_root = record_id
            else
                root = owner_id .. "/" .. record_id
            end
        elseif type(raw_root) == "string" and raw_root ~= "" then
            root = raw_root
        else
            return nil, failure("invalid execution_root", errors.INVALID, "declaration", false)
        end
    end
    local deferred_owner = (args :: any).deferred_owner
    if deferred_owner ~= nil then
        return resolve_deferred(principal :: Principal, authorized_by, root, component_root, deferred_owner, (args :: any).authority_only == true)
    end
    local caller, caller_err = caller_principal()
    if caller_err or not caller then return nil, caller_err end
    local authorizer = authorized_by or caller
    if not execution_identity.same_principal(authorizer, caller) then
        return nil, failure("authorized_by must be the authenticated caller", errors.PERMISSION_DENIED, "access", false)
    end
    if not execution_identity.same_principal(principal, authorizer) then
        if (authorizer :: Principal).kind ~= execution_identity.KIND.USER then
            return nil, failure("authorizer has no Users-derived delegation authority",
                errors.PERMISSION_DENIED, "subject", false)
        end
        local authorizer_row, lookup_err = lookup_subject((authorizer :: Principal).id)
        if lookup_err or not authorizer_row then return nil, lookup_err end
        local delegation_err = live_delegation(principal, authorizer :: Principal, authorizer_row, root)
        if delegation_err then return nil, delegation_err end
    end
    local result, resolve_err = resolve_principal(principal, caller)
    if resolve_err or not result then return nil, resolve_err end
    local answered = (result :: any).principal
    if not execution_identity.same_principal(answered, principal) then
        return nil, failure("principal mismatch in resolver response", errors.PERMISSION_DENIED, "subject", false)
    end
    return result, nil
end

return M
