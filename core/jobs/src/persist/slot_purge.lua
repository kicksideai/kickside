local run_status = require("run_status")
local sql = require("sql")
local cfg = require("config")
local lifecycle = require("lifecycle")
local sql_boundary = require("sql_boundary")

local M = {}

local function response_error(field: string): error
    return errors.new({message = "slot purge response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_slot_purge_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

local function with_db(fn: (sql.DB, string) -> (any?, error?)): (any?, error?)
    local db, db_err = sql.get(cfg.db_id())
    if db_err then return nil, errors.wrap(db_err, "jobs db unavailable") end
    if not db then return nil, response_error("database") end
    local dbtype, type_err = db:type()
    if type_err then
        db:release()
        return nil, errors.wrap(type_err, "jobs db type unavailable")
    end
    if dbtype ~= sql.type.SQLITE and dbtype ~= sql.type.POSTGRES then
        db:release()
        return nil, response_error("database.type")
    end
    local result, err = fn(db, dbtype)
    db:release()
    return result, err
end

local function commit(tx: sql.Transaction): error?
    local _, err = tx:commit()
    if err then return errors.wrap(err, "slot owner purge commit failed") end
    return nil
end

-- Delete a retained slot and its terminal history in bounded pages.
function M.purge_slot(params: table): (integer?, error?)
    local p = type(params) == "table" and params or nil
    if not p then
        return nil, (errors.new({ message = "purge_slot requires namespace, scope and key",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    for _, field in ipairs({ "namespace", "scope", "key" }) do
        local value = p[field]
        if type(value) ~= "string" or value == "" then
            return nil, (errors.new({ message = "purge_slot requires namespace, scope and key",
                kind = errors.INVALID, retryable = false }) :: error)
        end
    end
    local namespace = p.namespace
    local scope = p.scope
    local key = p.key
    if type(namespace) ~= "string" or type(scope) ~= "string" or type(key) ~= "string" then
        return nil, (errors.new({ message = "purge_slot requires namespace, scope and key",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local identity_params: lifecycle.IdentityParams = {
        job_identity = {
            namespace = namespace,
            scope = scope,
            key = key,
        },
    }
    local identity, identity_err = lifecycle.identity_parts(identity_params, "")
    if identity_err then return nil, identity_err end
    if not identity then
        return nil, (errors.new({ message = "slot owner identity could not be encoded",
            kind = errors.INTERNAL, retryable = false }) :: error)
    end
    return with_db(function(db: sql.DB, dbtype: string): (any?, error?)
        local tx, begin_err = sql_boundary.begin(db, "slot owner purge begin failed", "transaction", response_error)
        if begin_err or not tx then return nil, begin_err or response_error("transaction") end
        local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
        local rows, read_err = tx:query("SELECT id FROM kickside_job WHERE job_identity=$1 AND slot"
            .. " ORDER BY id LIMIT 1", { identity })
        local row_err = rows_error(rows, read_err, "slot owner purge lock failed", "slot.rows")
        if row_err then return nil, sql_boundary.rollback(tx, row_err, "slot purge rollback failed") end
        if #rows == 0 then
            local commit_err = commit(tx)
            if commit_err then return nil, commit_err end
            return 0, nil
        end
        local job_id = rows[1].id
        local locked, job_lock_err = tx:query("SELECT id,status FROM kickside_job WHERE id=$1" .. lock, { job_id })
        local lock_err = rows_error(locked, job_lock_err, "slot owner purge job lock failed", "job.rows")
        if lock_err then return nil, sql_boundary.rollback(tx, lock_err, "slot purge rollback failed") end
        if #locked == 0 then
            local commit_err = commit(tx)
            if commit_err then return nil, commit_err end
            return 0, nil
        end
        if locked[1].status == "running" then
            local pending = errors.new({ message = "slot cleanup awaits the running lease",
                kind = errors.CONFLICT, retryable = true, details = { cleanup_pending = true, wait_for = "lease_release" } })
            return nil, sql_boundary.rollback(tx, pending, "slot purge rollback failed")
        end
        local settled = run_status.terminal_predicate()
        local run_ids, run_read_err = tx:query("SELECT id FROM kickside_job_run WHERE job_id=$1 AND "
            .. settled .. " ORDER BY id LIMIT 100", { job_id })
        local selection_err = rows_error(run_ids, run_read_err, "slot run-history selection failed", "runs.rows")
        if selection_err then return nil, sql_boundary.rollback(tx, selection_err, "slot purge rollback failed") end
        if dbtype == sql.type.POSTGRES then
            for _, run_row in ipairs(run_ids) do
                local _, run_lock_err = tx:query("SELECT id FROM kickside_job_run WHERE id=$1 FOR UPDATE", { run_row.id })
                if run_lock_err then return nil, sql_boundary.rollback(tx,
                    errors.wrap(run_lock_err, "slot run-history lock failed"), "slot purge rollback failed") end
            end
        end
        local runs, runs_err = tx:execute([[WITH doomed AS (
            SELECT id FROM kickside_job_run WHERE job_id=$1 AND ]] .. settled .. [[ ORDER BY id LIMIT 100
        ) DELETE FROM kickside_job_run WHERE id IN (SELECT id FROM doomed) AND ]] .. settled, { job_id })
        local deleted_runs, page_err = sql_boundary.bounded_row_count(runs, runs_err,
            "slot run-history page failed", "runs.count", 100, response_error)
        if page_err then return nil, sql_boundary.rollback(tx, page_err, "slot purge rollback failed") end
        local remaining, remain_err = tx:query(
            "SELECT id FROM kickside_job_run WHERE job_id=$1 LIMIT 1", { job_id })
        local continuation_err = rows_error(remaining, remain_err, "slot run-history continuation read failed", "remaining.rows")
        if continuation_err then return nil, sql_boundary.rollback(tx, continuation_err, "slot purge rollback failed") end
        local count = 0
        if #remaining == 0 then
            local result, delete_err = tx:execute(
                "DELETE FROM kickside_job WHERE id=$1 AND job_identity=$2 AND slot", { job_id, identity })
            local deleted, count_err = sql_boundary.single_row_count(result, delete_err,
                "slot owner purge failed", "job.count", response_error)
            if count_err then return nil, sql_boundary.rollback(tx, count_err, "slot purge rollback failed") end
            if deleted == nil then return nil, sql_boundary.rollback(tx, response_error("job.count"), "slot purge rollback failed") end
            count = deleted
        end
        local next_slot, next_err = tx:query(
            "SELECT id FROM kickside_job WHERE job_identity=$1 AND slot LIMIT 1", { identity })
        local next_read_err = rows_error(next_slot, next_err, "slot owner continuation read failed", "next.rows")
        if next_read_err then return nil, sql_boundary.rollback(tx, next_read_err, "slot purge rollback failed") end
        local commit_err = commit(tx)
        if commit_err then return nil, commit_err end
        if #next_slot > 0 then
            return nil, (errors.new({ message = "slot owner cleanup has another bounded page",
                kind = errors.CONFLICT, retryable = true,
                details = { cleanup_pending = true, deleted_runs = deleted_runs,
                    needs_continue = deleted_runs > 0,
                    wait_for = deleted_runs == 0 and "run_history_settlement" or nil } }) :: error)
        end
        return count, nil
    end)
end


return M
