-- Orphan adoption under the caller's component transaction. A component that
-- no principal holds access to (every grant reaching it names a framework
-- maintenance actor) is taken by an instance operator: the operator gains a
-- full direct grant, becomes the recorded owner and the component's execution
-- principal, and the identity audit records the adoption with the prior
-- access list. Authorization of the operator happens before the transaction.
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local component_types = require("component_types")
local access_ops = require("access_ops")
local context_ops = require("context_ops")
local declaration_fence = require("declaration_fence")
local identity = require("identity_ops")
local audit_policy = require("audit_policy")
local execution_identity = require("execution_identity")
local error_envelope = require("error_envelope")

local M = {}

M.REQUEST_PREFIX = "adopt:"

type Principal = { kind: string, id: string }
type Grant = { subject_type: string, subject_id: string, access_mask: integer, component_id: string }

local function failure(message: string, kind: string, error_kind: string): error
    return (errors.new({ message = message, kind = kind, retryable = false,
        details = { error_kind = error_kind } }) :: error)
end

-- Every grant reaching the component: its own and each strict ancestor's.
local function reaching_grants_tx(tx: any, component_id: string): ({ Grant }?, error?)
    local rows, err = tx:query("SELECT g.subject_type, g.subject_id, g.access_mask, g.component_id FROM "
        .. component_types.TABLES.ACCESS .. " g WHERE g.component_id = $1"
        .. " UNION ALL SELECT g.subject_type, g.subject_id, g.access_mask, g.component_id FROM "
        .. component_types.TABLES.ANCESTOR .. " a JOIN " .. component_types.TABLES.ACCESS
        .. " g ON g.component_id = a.ancestor_id WHERE a.component_id = $2 AND a.depth > 0",
        { component_id, component_id })
    if err then
        return nil, error_envelope.wrap(err, "failed to read component access", {error_kind = "infrastructure"})
    end
    local out: { Grant } = {}
    for _, row in ipairs(rows or {}) do
        out[#out + 1] = {
            subject_type = tostring(row.subject_type),
            subject_id = tostring(row.subject_id),
            access_mask = math.floor(tonumber(row.access_mask) or 0) :: integer,
            component_id = tostring(row.component_id),
        }
    end
    table.sort(out, function(a: Grant, b: Grant): boolean
        if a.component_id ~= b.component_id then return a.component_id < b.component_id end
        if a.subject_type ~= b.subject_type then return a.subject_type < b.subject_type end
        return a.subject_id < b.subject_id
    end)
    return out, nil
end

-- A grant whose subject is not a framework maintenance actor is held by a
-- principal (a user, group or service), which owns the component.
local function principal_held(grants: { Grant }): Grant?
    for _, grant in ipairs(grants) do
        if grant.subject_type ~= component_types.SUBJECT_TYPES.USER
            or not execution_identity.is_maintenance_key(grant.subject_id) then
            return grant
        end
    end
    return nil
end

local function record_owner_tx(tx: any, component_id: string, owner_id: string, now_ts: string): error?
    local updated, update_err = sql.builder.update(component_types.TABLES.META)
        :set("value", owner_id)
        :set("updated_at", now_ts)
        :where("component_id = ?", component_id)
        :where("key = ?", component_types.OWNER_META_KEY)
        :run_with(tx):exec()
    if update_err then
        return error_envelope.wrap(update_err, "failed to record owner", {error_kind = "infrastructure"})
    end
    if tonumber(updated and updated.rows_affected) == 0 then
        local _, insert_err = sql.builder.insert(component_types.TABLES.META):set_map({
            meta_id = uuid.v7(),
            component_id = component_id,
            key = component_types.OWNER_META_KEY,
            value = owner_id,
            created_at = now_ts,
            updated_at = now_ts,
        }):run_with(tx):exec()
        if insert_err then
            return error_envelope.wrap(insert_err, "failed to record owner", {error_kind = "infrastructure"})
        end
    end
    return nil
end

-- adopt_tx(tx, db, component_id, adopter) -> ({ component_id, adopted_by,
-- identity_generation, request_id, prior_access }?, err?). adopter is the
-- authorized operator's user principal.
function M.adopt_tx(tx: any, db: any, component_id: string, adopter: Principal): (any?, error?)
    local state, state_err = context_ops.lock_and_read_identity_tx(tx, component_id)
    if state_err or not state then return nil, state_err end
    local fence_owner, fence_err = declaration_fence.owner(tx, component_id)
    if fence_err then return nil, fence_err end
    if fence_owner ~= nil then
        return nil, failure("component is owned by its declaration owner " .. tostring(fence_owner),
            errors.CONFLICT, "access")
    end
    local prior, prior_err = reaching_grants_tx(tx, component_id)
    if prior_err or not prior then return nil, prior_err end
    local held = principal_held(prior :: { Grant })
    if held then
        return nil, failure("component has a principal owner (" .. held.subject_type .. ":" .. held.subject_id
            .. "); only a component no principal holds access to can be adopted", errors.CONFLICT, "access")
    end

    local _, grant_err = access_ops.grant_access(tx, db, {
        type = component_types.COMMAND_TYPES.GRANT_ACCESS,
        payload = {
            component_id = component_id,
            subject_id = adopter.id,
            subject_type = component_types.SUBJECT_TYPES.USER,
            access_mask = component_types.ACCESS.FULL,
        },
    })
    if grant_err then return nil, grant_err end

    local now_ts = execution_identity.utc_now()
    local owner_err = record_owner_tx(tx, component_id, adopter.id, now_ts)
    if owner_err then return nil, owner_err end

    local old_record = (state :: any).context._execution_identity
    local old_principal = "none"
    if type(old_record) == "table" and type((old_record :: any).principal) == "table" then
        old_principal = tostring((old_record :: any).principal.kind) .. ":" .. tostring((old_record :: any).principal.id)
    end
    local canonical = identity.canonical_identity(adopter, adopter, component_id, now_ts)
    local request_id = M.REQUEST_PREFIX .. uuid.v7()
    local generation = ((state :: any).generation :: integer) + 1
    local record, encode_err = json.encode({
        outcome = "adopted",
        component_id = component_id,
        authorizer = adopter.kind .. ":" .. adopter.id,
        new_principal = adopter.kind .. ":" .. adopter.id,
        old_principal = old_principal,
        identity_hash = canonical,
        request_id = request_id,
        adopted_at = now_ts,
        prior_access = prior,
    })
    if encode_err then return nil, error_envelope.wrap(encode_err, "failed to encode adoption audit", {error_kind = "infrastructure"}) end
    if type(record) ~= "string" then
        return nil, failure("failed to encode adoption audit", errors.INTERNAL, "infrastructure")
    end
    local size_err = audit_policy.check_row(component_id, record :: string, "adopt_component")
    if size_err then return nil, size_err end
    local _, write_err = context_ops.write_identity_tx(tx, component_id, state, {
        version = execution_identity.VERSION,
        principal = { kind = adopter.kind, id = adopter.id },
        authorized_by = { kind = adopter.kind, id = adopter.id },
        component_id = component_id,
        captured_at = now_ts,
    }, canonical)
    if write_err then return nil, write_err end
    local audit_err = context_ops.audit_row_tx(tx, component_id, generation, request_id, record :: string)
    if audit_err then return nil, audit_err end

    return {
        component_id = component_id,
        adopted_by = adopter.id,
        identity_generation = generation,
        request_id = request_id,
        prior_access = prior,
    }, nil
end

return M
