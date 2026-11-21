-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- An admitted custodian has an immutable incarnation and a committed delete
-- mark. Its ordinary Job enrolls exact direct children in durable pages.
local sql = require("sql")
local custody = require("custody")
local ops = require("component_ops")
local persisted_json = require("persisted_json")
local json = require("json")
local admission = require("delete_admission")
local placement = require("placement")
local error_envelope = require("error_envelope")

local M = {}
local PAGE = 24

type Executor = sql.DB | sql.Transaction

local function conflict(code: string, message: string): error
    return errors.new({kind = errors.CONFLICT, message = message, retryable = false, details = {code = code}})
end

local function direct(db: Executor, id: string, incarnation: string, limit: integer, after: string?): ({any}?, error?)
    local query = [[SELECT component_id,impl_id,parent_id,secrets_incarnation,custody_legacy,deleting_at,delete_intent
        FROM kickside_components WHERE owner_type='component' AND owner_id=$1 AND owner_incarnation=$2]]
    if after then
        return db:query(query .. " AND component_id>$3 ORDER BY component_id LIMIT $4", {id, incarnation, after, limit})
    end
    return db:query(query .. " ORDER BY component_id LIMIT $3", {id, incarnation, limit})
end

-- The ordinary placement policy waits for placed children. A cross edge may
-- conflict with custody order, so require every live placement child to be a
-- direct custody child. Explicit rerooting keeps independent placements.
function M.validate_placement(db: Executor, row: any, child_policy: string?): error?
    if child_policy == "reparent_root" then return nil end
    local children, err = db:query([[SELECT 1 FROM kickside_components WHERE parent_id=$1 AND deleting_at IS NULL
        AND CASE WHEN owner_type='component' AND owner_id=$2 AND owner_incarnation=$3 THEN 0 ELSE 1 END=1 LIMIT 1]],
        {row.component_id, row.component_id, row.secrets_incarnation})
    if err then return err end
    if children[1] then
        return conflict("independent_component_placement", "component has independent live children; pass child_policy=reparent_root or move them first")
    end
    return nil
end

local function child_intent(row: any, parent: any): (any?, error?)
    if not row.deleting_at then return nil, nil end
    local intent, err = persisted_json.decode_table(row.delete_intent, "component.delete_intent")
    if err or not intent or not intent.job_id or (intent.child_policy or "") ~= (parent.child_policy or "") then
        return nil, conflict("custody_delete_intent_conflict", "component has an incompatible dependant deletion in progress")
    end
    return intent, nil
end

local function validate_child(db: Executor, row: any, parent: any): error?
    if tonumber(row.custody_legacy) ~= 0 or type(row.secrets_incarnation) ~= "string" then
        return custody.unresolved()
    end
    if row.deleting_at then
        local _, err = child_intent(row, parent)
        return err
    end
    return M.validate_placement(db, row, parent.child_policy)
end

local function same_page(original: {any}, current: {any}): boolean
    if #original ~= #current then return false end
    for index, row in ipairs(original) do
        local candidate = current[index]
        if row.component_id ~= candidate.component_id or row.secrets_incarnation ~= candidate.secrets_incarnation
            or row.deleting_at ~= candidate.deleting_at or row.delete_intent ~= candidate.delete_intent
            or row.impl_id ~= candidate.impl_id then return false end
    end
    return true
end

local function save(tx: sql.Transaction, row: any, intent: table): error?
    local encoded, encode_err = json.encode(intent)
    if encode_err then return encode_err end
    local changed, write_err = tx:execute([[UPDATE kickside_components SET delete_intent=$1
        WHERE component_id=$2 AND secrets_incarnation=$3 AND delete_intent=$4]],
        {encoded, row.component_id, row.secrets_incarnation, row.delete_intent})
    if write_err then return write_err end
    if not changed or tonumber(changed.rows_affected) ~= 1 then
        return conflict("custody_delete_intent_changed", "component deletion progress changed")
    end
    return nil
end

-- Every child is itself advanced by the same worker. The parent's durable
-- keyset position and the next set of Jobs commit together. Membership cannot
-- grow after the parent mark. A concurrent child finishing merely restarts
-- from the recorded cursor, which cannot skip an undispatched row.
function M.dispatch(db: sql.DB, row: any, intent: any): (boolean?, error?)
    local original, page_err = direct(db, row.component_id, row.secrets_incarnation, PAGE, intent.children_after)
    if page_err or not original then return nil, page_err end
    for _, child in ipairs(original) do
        local err = validate_child(db, child, intent)
        if err then return nil, err end
        if not child.deleting_at then
            local admission_err = admission.validate({component_id = child.component_id, impl_id = child.impl_id,
                child_policy = intent.child_policy})
            if admission_err then
                return nil, conflict("custody_dependant_refused", "a custody dependant is not ready for deletion")
            end
        end
    end
    local dialect, dialect_err = db:type()
    if dialect_err or not dialect then return nil, dialect_err end
    local tx, begin_err = db:begin()
    if begin_err or not tx then return nil, begin_err end
    local function abort(primary: error?): (boolean?, error?)
        local err = error_envelope.cleanup(function(): (any, error?) return tx:rollback() end, primary, "rollback custody deletion page")
        if err then return nil, err end
        return false, nil
    end
    local lock_err = placement.lock_tree(tx)
    if lock_err then return abort(lock_err) end
    local locked, row_err = tx:execute([[UPDATE kickside_components SET context_revision=context_revision
        WHERE component_id=$1 AND secrets_incarnation=$2 AND delete_intent=$3 AND deleting_at IS NOT NULL]],
        {row.component_id, row.secrets_incarnation, row.delete_intent})
    if row_err then return abort(row_err) end
    if not locked or tonumber(locked.rows_affected) ~= 1 then return abort(nil) end
    local current, read_err = direct(tx, row.component_id, row.secrets_incarnation, PAGE, intent.children_after)
    if read_err or not current then return abort(read_err) end
    if not same_page(original, current) then return abort(nil) end
    for _, child in ipairs(current) do
        local err = validate_child(tx, child, intent)
        if err then return abort(err) end
        local child_state, intent_err = child_intent(child, intent)
        if intent_err then return abort(intent_err) end
        if not child_state then
            local mark_err = ops.mark_deleting_tx(tx, child.component_id, true)
            if mark_err then return abort(mark_err) end
            child_state = {child_policy = intent.child_policy, incarnation = child.secrets_incarnation, custody = true}
        end
        local _, enqueue_err = ops.enroll_delete_tx(tx, tostring(dialect), child.component_id, child_state)
        if enqueue_err then return abort(enqueue_err) end
    end
    if #current < PAGE then
        intent.children_after = nil
        intent.children_dispatched = true
    else
        intent.children_after = current[#current].component_id
    end
    local progress_err = save(tx, row, intent)
    if progress_err then return abort(progress_err) end
    local _, commit_err = tx:commit()
    if commit_err then return abort(commit_err) end
    return true, nil
end

-- Physical absence is the success condition, regardless of Jobs status.
function M.ready(db: Executor, id: string, incarnation: string): (boolean?, error?)
    local children, err = direct(db, id, incarnation, 1)
    if err or not children then return nil, err end
    if not children[1] then return true, nil end
    local intent, decode_err = persisted_json.decode_table(children[1].delete_intent, "component.delete_intent")
    if decode_err then return nil, decode_err end
    if intent and intent.job_id then
        local jobs, job_err = db:query("SELECT status FROM kickside_job WHERE id=$1", {intent.job_id})
        if job_err then return nil, job_err end
        local status = jobs[1] and jobs[1].status
        if status == "pending" or status == "running" then return false, nil end
    end
    -- A child may commit unregister between our two reads.
    local child = children[1]
    local remaining, remaining_err = db:query([[SELECT 1 FROM kickside_components
        WHERE component_id=$1 AND secrets_incarnation=$2]], {child.component_id, child.secrets_incarnation})
    if remaining_err then return nil, remaining_err end
    if not remaining[1] then return false, nil end
    return nil, errors.new({kind = errors.INVALID, retryable = false,
        message = "custody_dependency_failed: a custody dependant did not retire; retry the deletion",
        details = {code = "custody_dependency_failed"}})
end

return M
