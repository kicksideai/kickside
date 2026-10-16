-- Existing component retention slot publishes durable identity audits and
-- compacts only acknowledged history. Core append and component acknowledgment
-- use separate transactions; a lost acknowledgment replays one stable event.
local sql = require("sql")
local time = require("time")
local component_types = require("component_types")
local lifecycle = require("component_lifecycle")
local audit_policy = require("audit_policy")
local error_envelope = require("error_envelope")

local M = {}
local AUDIT = "kickside_execution_identity_audit"

local function failure(message: string, cause: any): error
    if type(cause) == "userdata" then return errors.wrap(cause :: error, message) end
    return errors.new({message = message, kind = errors.INTERNAL, retryable = false,
        details = {code = "component_audit_retention_response"}})
end

local function affected(result: any, err: any, message: string): (integer?, error?)
    local count = result and tonumber(result.rows_affected)
    if err or count == nil then return nil, failure(message, err or "missing affected-row count") end
    return count :: integer, nil
end

local function publish(limit: integer): (integer?, error?)
    local db, open_err = sql.get(component_types.db_id())
    if open_err or not db then return nil, failure("identity audit publication database unavailable", open_err) end
    local rows, read_err = db:query("SELECT a.component_id,a.identity_generation,a.record_json,c.impl_id"
        .. " FROM " .. AUDIT .. " a JOIN kickside_components c ON c.component_id=a.component_id"
        .. " WHERE a.published_at IS NULL ORDER BY a.created_at,a.component_id,a.identity_generation LIMIT $1", { limit })
    local scan_err: error? = nil
    if read_err or type(rows) ~= "table" then scan_err = failure("identity audit publication scan failed", read_err) end
    scan_err = error_envelope.cleanup(function(): (any, error?) return db:release() end, scan_err, "release audit publication database")
    if scan_err then return nil, scan_err end
    local count = 0
    for _, row in ipairs(rows :: { any }) do
        local proof, publish_err = lifecycle.publish_audit({
            component_id = tostring(row.component_id), impl_id = tostring(row.impl_id),
            identity_generation = tonumber(row.identity_generation), record_json = tostring(row.record_json),
        })
        if publish_err or not proof then return nil, publish_err or failure("identity audit publisher returned no proof", row.component_id) end
        local ack_db, ack_open_err = sql.get(component_types.db_id())
        if ack_open_err or not ack_db then return nil, failure("identity audit acknowledgment database unavailable", ack_open_err) end
        local result, ack_err = ack_db:execute("UPDATE " .. AUDIT .. " SET published_at=$1"
            .. " WHERE component_id=$2 AND identity_generation=$3 AND published_at IS NULL",
            { time.now():utc():format_rfc3339(), row.component_id, row.identity_generation })
        local changed, proof_err = affected(result, ack_err, "identity audit publication acknowledgment failed")
        proof_err = error_envelope.cleanup(function(): (any, error?) return ack_db:release() end, proof_err, "release audit acknowledgment database")
        if proof_err then return nil, proof_err end
        count = count + (changed :: integer)
    end
    return count, nil
end

local function prune_one(db: any, id: string, cutoff: string, limit: integer): (integer?, error?)
    local tx, begin_err = db:begin()
    if begin_err or not tx then return nil, failure("identity audit prune transaction failed", begin_err) end
    local locked, lock_err = tx:execute("UPDATE kickside_components SET context_revision=context_revision WHERE component_id=$1", { id })
    local held, hold_err = affected(locked, lock_err, "identity audit component lock failed")
    if hold_err then
        return nil, error_envelope.cleanup(function(): (any, error?) return tx:rollback() end, hold_err, "rollback audit prune")
    end
    if held == 0 then
        local rollback_err = error_envelope.cleanup(function(): (any, error?) return tx:rollback() end, nil, "rollback empty audit prune")
        if rollback_err then return nil, rollback_err end
        return 0, nil
    end
    local rows, read_err = tx:query("SELECT identity_generation FROM " .. AUDIT
        .. " WHERE component_id=$1 AND published_at IS NOT NULL AND created_at<=$2"
        .. " AND identity_generation<>(SELECT identity_generation FROM kickside_components WHERE component_id=$1)"
        .. " ORDER BY identity_generation LIMIT $3", { id, cutoff, limit })
    if read_err or type(rows) ~= "table" then
        return nil, error_envelope.cleanup(function(): (any, error?) return tx:rollback() end,
            failure("identity audit prune page failed", read_err), "rollback audit prune")
    end
    local count = #rows
    if count > 0 then
        local params: { any } = { id, cutoff }
        local marks: { string } = {}
        for _, row in ipairs(rows :: { any }) do
            params[#params + 1] = row.identity_generation
            marks[#marks + 1] = "$" .. tostring(#params)
        end
        local deleted, delete_err = tx:execute("DELETE FROM " .. AUDIT
            .. " WHERE component_id=$1 AND created_at<=$2 AND published_at IS NOT NULL"
            .. " AND identity_generation<>(SELECT identity_generation FROM kickside_components WHERE component_id=$1)"
            .. " AND identity_generation IN (" .. table.concat(marks, ",") .. ")", params)
        local removed, remove_err = affected(deleted, delete_err, "identity audit prune delete failed")
        if remove_err or removed ~= count then
            return nil, error_envelope.cleanup(function(): (any, error?) return tx:rollback() end,
                remove_err or failure("identity audit prune physical count changed", nil), "rollback audit prune")
        end
    end
    local committed, commit_err = tx:commit()
    if commit_err or committed ~= true then return nil, failure("identity audit prune commit failed", commit_err) end
    return count, nil
end

function M.run(limit: integer): (any?, error?)
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 100 then
        return nil, (errors.new({ message = "identity audit retention limit must be 1..100",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local policy, policy_err = audit_policy.policy()
    if policy_err or not policy then return nil, policy_err or failure("identity audit policy returned no result", nil) end
    local p = policy :: any
    local published, publish_err = publish(limit)
    if publish_err then return nil, publish_err end
    local db, open_err = sql.get(component_types.db_id())
    if open_err or not db then return nil, failure("identity audit retention database unavailable", open_err) end
    local cutoff = time.now():utc():add(-p.history_days * 24 * time.HOUR):format_rfc3339()
    local owners, owners_err = db:query("SELECT DISTINCT a.component_id FROM " .. AUDIT .. " a"
        .. " JOIN kickside_components c ON c.component_id=a.component_id"
        .. " WHERE a.published_at IS NOT NULL AND a.created_at<=$1 AND a.identity_generation<>c.identity_generation"
        .. " ORDER BY a.component_id LIMIT $2",
        { cutoff, limit })
    if owners_err or type(owners) ~= "table" then
        return nil, error_envelope.cleanup(function(): (any, error?) return db:release() end,
            failure("identity audit prune owner scan failed", owners_err), "release audit retention database")
    end
    local pruned = 0
    for _, row in ipairs(owners :: { any }) do
        local removed, prune_err = prune_one(db, tostring(row.component_id), cutoff, limit - pruned)
        if prune_err then
            return nil, error_envelope.cleanup(function(): (any, error?) return db:release() end, prune_err, "release audit retention database")
        end
        pruned = pruned + (removed :: integer)
        if pruned >= limit then break end
    end
    local release_err = error_envelope.cleanup(function(): (any, error?) return db:release() end, nil, "release audit retention database")
    if release_err then return nil, release_err end
    return { published = published, pruned = pruned }, nil
end

return M
