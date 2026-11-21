-- The lifecycle projection retires the exact dependants named by a typed
-- report. The cursor advances after physical retirement or after a historical
-- report is preserved for custody review.

local component = require("component")
local custody = require("custody")
local disposition = require("custody_disposition")
local component_teardown = require("component_teardown")
local consts = require("lifecycle_consts")
local persisted_json = require("persisted_json")
local registry = require("registry")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local execution_identity = require("execution_identity")
local component_envelope = require("component_envelope")

local M = {}

-- Bound on nested-ownership recursion: a guard against a pathological ownership cycle,
-- far above any real component tree depth.
local MAX_DEPTH = 64
local MAX_COMPONENTS_PER_TICK = 50
local CLEANUP_META_TYPE = "kickside.lifecycle.principal_cleanup"

local function cleanup_error(message: string, cause: any?): error
    if type(cause) == "userdata" then
        return (errors.wrap(cause, message) :: error)
    end
    return (errors.new({ message = message .. (cause ~= nil and (": " .. tostring(cause)) or ""),
        kind = errors.INTERNAL, retryable = true }) :: error)
end

-- Delete children before their owning parent. If a page or child cleanup
-- fails, the parent still names the unfinished subtree on the next tick.
local function reap_owner(owner: any, depth: integer, budget: { remaining: integer, deleted: integer }, principal_root: any?): error?
    if depth > MAX_DEPTH then return cleanup_error("component ownership depth exceeds " .. tostring(MAX_DEPTH)) end
    local rows, list_err = component.list_lifecycle_dependants(owner, math.max(1, budget.remaining))
    if list_err or type(rows) ~= "table" then return cleanup_error("component owner scan failed", list_err or "no rows result") end
    if budget.remaining == 0 and #rows > 0 then
        return cleanup_error("component owner cleanup has another bounded page", owner.id)
    end
    local pending_error: error? = nil
    for _, row in ipairs(rows :: { any }) do
        local cid = (row :: any).component_id
        if type(cid) ~= "string" or cid == "" then return cleanup_error("component owner scan returned an invalid id") end
        local incarnation = row.secrets_incarnation
        if type(incarnation) ~= "string" or incarnation == "" then
            return cleanup_error("component owner scan returned an invalid incarnation")
        end
        local root = principal_root
        if owner.type == "principal" then root = {id = cid, incarnation = incarnation, owner = owner} end
        local child_err = reap_owner({type = "component", id = cid, incarnation = incarnation}, depth + 1, budget, root)
        if child_err then
            if not component_teardown.cleanup_pending(child_err) then return child_err end
            pending_error = pending_error or child_err
        else
            if budget.remaining == 0 then
                return cleanup_error("component owner cleanup has another bounded page", owner.id)
            end
            local ok, delete_err = component.system_delete(cid :: string, "reparent_root",
                {owner = owner, incarnation = incarnation, principal_root = principal_root})
            if delete_err or ok ~= true then
                if not component_teardown.cleanup_pending(delete_err) then
                    return cleanup_error("component owner delete failed for " .. cid, delete_err or "no deletion proof")
                end
                pending_error = pending_error or delete_err
            else
                budget.deleted = budget.deleted + 1
            end
            budget.remaining = budget.remaining - 1
        end
    end
    if budget.remaining == 0 then
        local more, more_err = component.list_lifecycle_dependants(owner, 1)
        if more_err or type(more) ~= "table" then return cleanup_error("component owner continuation scan failed", more_err or "no rows result") end
        if #more > 0 then return cleanup_error("component owner cleanup has another bounded page", owner.id) end
    end
    return pending_error
end

local function cleanup_target(entry: any): string
    if type(entry) ~= "table" then return "" end
    if type((entry :: any).target) == "string" and (entry :: any).target ~= "" then
        return (entry :: any).target :: string
    end
    if type((entry :: any).id) == "string" then return (entry :: any).id :: string end
    return ""
end

local function run_principal_cleanups(principal: any): error?
    local entries, find_err = registry.find({ ["meta.type"] = CLEANUP_META_TYPE })
    if find_err then
        return (errors.wrap(find_err, "principal cleanup discovery failed") :: error)
    end
    for _, entry in ipairs(entries or {}) do
        local target = cleanup_target(entry)
        local kind = entry.meta and entry.meta.principal_kind or "user"
        if target ~= "" and kind == principal.kind then
            local result, call_err = funcs.call(target, {
                principal_id = principal.id,
                principal_kind = principal.kind,
                user_id = principal.kind == "user" and principal.id or nil,
            })
            if call_err then
                return (errors.wrap(call_err, "principal cleanup failed (" .. target .. ")") :: error)
            end
            if type(result) == "table" and (result :: any).success == false then
                return component_envelope.error_of(result, target, "principal cleanup failed (" .. target .. ")")
            end
        end
    end
    return nil
end

local function reap_principal(ev: any, payload: any, subject_id: string, budget: any): error?
    local recorded, record_err = disposition.exists(ev)
    if record_err or recorded then return record_err end
    if payload.principal_kind == nil then
        return disposition.record(ev, subject_id, nil, "missing_principal_kind", nil)
    end
    local principal, principal_err = execution_identity.check_principal(
        {kind = payload.principal_kind, id = subject_id}, "lifecycle event principal")
    if principal_err then return principal_err end
    if principal.kind == "user" then
        local witness, witness_err = custody.review_witness(principal.id)
        if witness_err then return witness_err end
        if witness then
            return disposition.record(ev, subject_id, principal.kind, "retained_unresolved_custody", witness)
        end
    end
    local reap_err = reap_owner({type = "principal", kind = principal.kind, id = principal.id}, 0, budget)
    if reap_err then return reap_err end
    return run_principal_cleanups(principal)
end

-- run is the func:// projection worker entry. input.events holds the prefetched batch;
-- input.range.to_seq is the cursor advance. Returns the patched body + the new last_seq.
local function run(input: table): (table?, error?)
    local input_tbl: table = type(input) == "table" and input or {}
    local actor = security.actor()
    if actor == nil or not execution_identity.is_maintenance_key(actor:id()) then
        return nil, (errors.new({ message = "lifecycle reaper requires a framework caller",
            kind = errors.PERMISSION_DENIED }) :: error)
    end
    if input_tbl.thread_id ~= consts.thread_id() then
        return nil, (errors.new({ message = "lifecycle reaper input is not from the system lifecycle thread",
            kind = errors.PERMISSION_DENIED }) :: error)
    end
    local events: { any } = type(input_tbl.events) == "table" and input_tbl.events or {}
    local range: table = type(input_tbl.range) == "table" and input_tbl.range or {}
    local projection: table = type(input_tbl.projection) == "table" and input_tbl.projection or {}
    local body: table = type(projection.body) == "table" and projection.body or {}

    local budget = { remaining = MAX_COMPONENTS_PER_TICK, deleted = 0 }
    for _, ev in ipairs(events) do
        local etype = type((ev :: any).type) == "string" and (ev :: any).type or ""
        if etype == consts.EVENT.PRINCIPAL_DELETED or etype == consts.EVENT.COMPONENT_DELETED then
            local payload, decode_err = persisted_json.decode_table((ev :: any).body, "lifecycle.event.body")
            if decode_err then return nil, decode_err end
            local owner_id = payload.subject_id
            if type(owner_id) ~= "string" or owner_id == "" then
                return nil, (errors.new({ message = "lifecycle event subject_id must be a non-empty string",
                    kind = errors.INVALID }) :: error)
            end
            if etype == consts.EVENT.PRINCIPAL_DELETED then
                local reap_err = reap_principal(ev, payload, owner_id, budget)
                if reap_err then return nil, reap_err end
            elseif payload.incarnation == nil then
                local store_err = disposition.record(ev, owner_id, nil, "missing_component_incarnation", nil)
                if store_err then return nil, store_err end
            else
                if not uuid.validate(owner_id) or type(payload.incarnation) ~= "string" or not uuid.validate(payload.incarnation) then
                    return nil, errors.new({message = "component report requires a component id and incarnation", kind = errors.INVALID})
                end
                local reap_err = reap_owner({type = "component", id = owner_id, incarnation = payload.incarnation}, 0, budget)
                if reap_err then return nil, reap_err end
            end
        end
    end

    local stats: table = type(body.stats) == "table" and body.stats or {}
    stats.reaped = (tonumber(stats.reaped) or 0) + budget.deleted
    body.stats = stats

    return {
        body = body,
        last_seq = tonumber(range.to_seq) or nil,
    }
end

M.run = run

return M
