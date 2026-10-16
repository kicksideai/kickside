local run_status = require("run_status")
-- Bounded owner-local retention. The Jobs worker pool supplies the exact
-- policy deadline; every delete remains in the Jobs persistence owner.
local M = {}
local sql = require("sql")
local time = require("time")
local cfg = require("config")
local clock = require("clock")
local thread_teardown = require("thread_teardown")
local sql_boundary = require("sql_boundary")

local function bounded(limit: integer?, maximum: integer): integer
    return math.max(0, math.min(maximum, limit or maximum))
end

local function response_error(field: string): error
    return errors.new({message = "retention response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_retention_response", field = field}})
end

local function affected(result: any, name: string, maximum: integer): (integer?, error?)
    return sql_boundary.bounded_row_count(result, nil, name, name .. ".count", maximum, response_error)
end

local function scope(thread_id: string?, first: integer, all_threads: boolean?): (string, { any })
    if all_threads == true then return "1=1", {} end
    if thread_id == nil then return "owner_kind <> 'thread'", {} end
    return "owner_kind = 'thread' AND owner_id = $" .. tostring(first), { thread_id }
end

local function placeholders(first: integer, n: integer): string
    local out: { string } = {}
    for i = 1, n do out[i] = "$" .. tostring(first + i - 1) end
    return table.concat(out, ",")
end

local function prelock_ids(tx: any, dbtype: string, table_name: string, ids: { string }): error?
    if dbtype ~= sql.type.POSTGRES then return nil end
    table.sort(ids)
    local previous = ""
    for _, id in ipairs(ids) do
        if id ~= previous then
            local _, err = tx:query("SELECT id FROM " .. table_name .. " WHERE id=$1 FOR UPDATE", { id })
            if err then return errors.wrap(err, table_name .. " prune prelock") end
            previous = id
        end
    end
    return nil
end

local function prune_owned(db: any, thread_id: string?, cutoff: string, runs: boolean,
        limit: integer?, all_threads: boolean?): (integer?, error?)
    if limit == 0 then return 0, nil end
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return nil, policy_err end
    local batch = bounded(limit, (policy :: any).retention_batch)
    if batch == 0 then return 0, nil end
    local dbtype, type_err = db:type()
    if type_err then return nil, errors.wrap(type_err, "job prune dialect") end
    local table_name = runs and "kickside_job_run" or "kickside_job"
    local settled = runs and run_status.terminal_predicate()
        or "status IN ('done','dead','cancelled')"
    local predicate, params = scope(thread_id, 1, all_threads)
    params[#params + 1] = cutoff
    local cutoff_arg = "$" .. tostring(#params)
    params[#params + 1] = batch
    local limit_arg = "$" .. tostring(#params)
    local no_runs = runs and "" or " AND NOT EXISTS (SELECT 1 FROM kickside_job_run r WHERE r.job_id=kickside_job.id)"
    local cols = runs and "id,job_id" or "id"
    local rows, read_err = db:query("SELECT " .. cols .. " FROM " .. table_name .. " WHERE " .. predicate
        .. " AND " .. settled .. " AND finished_at IS NOT NULL AND finished_at < " .. cutoff_arg
        .. no_runs .. " ORDER BY finished_at,id LIMIT " .. limit_arg, params)
    if read_err then return nil, errors.wrap(read_err, "job prune candidates") end
    if type(rows) ~= "table" then return nil, response_error("candidates.rows") end
    if #rows == 0 then return 0, nil end
    local tx, begin_err = sql_boundary.begin(db, "job prune transaction", "transaction", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction") end
    local job_ids: { string } = {}
    local run_ids: { string } = {}
    for _, row in ipairs(rows) do
        if runs then
            job_ids[#job_ids + 1] = tostring(row.job_id)
            run_ids[#run_ids + 1] = tostring(row.id)
        else
            job_ids[#job_ids + 1] = tostring(row.id)
        end
    end
    local job_lock_err = prelock_ids(tx, tostring(dbtype), "kickside_job", job_ids)
    if job_lock_err then return nil, sql_boundary.rollback(tx, job_lock_err, "retention rollback failed") end
    local run_lock_err = prelock_ids(tx, tostring(dbtype), "kickside_job_run", run_ids)
    if run_lock_err then return nil, sql_boundary.rollback(tx, run_lock_err, "retention rollback failed") end

    local args: { any } = { cutoff }
    for _, row in ipairs(rows) do args[#args + 1] = row.id end
    local deleted, delete_err = tx:execute("DELETE FROM " .. table_name .. " WHERE finished_at < $1"
        .. " AND " .. settled .. " AND id IN (" .. placeholders(2, #rows) .. ")"
        .. no_runs, args)
    if delete_err then return nil, sql_boundary.rollback(tx, errors.wrap(delete_err, "job prune delete"), "retention rollback failed") end
    local total, proof_err = affected(deleted, "job prune delete", batch)
    if proof_err then return nil, sql_boundary.rollback(tx, proof_err, "retention rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "job prune commit") end
    return total :: integer, nil
end

function M.prune_runs(db: any, thread_id: string?, cutoff: string, limit: integer?,
        all_threads: boolean?): (integer?, error?)
    return prune_owned(db, thread_id, cutoff, true, limit, all_threads)
end

function M.prune_jobs(db: any, thread_id: string?, cutoff: string, limit: integer?,
        all_threads: boolean?): (integer?, error?)
    return prune_owned(db, thread_id, cutoff, false, limit, all_threads)
end

-- Worker identities are process-local; an absent heartbeat older than the
-- default jobs window cannot resume. The existing last_seen_at index bounds
-- candidate selection even after many process restarts.
function M.prune_workers(db: any, cutoff: string, limit: integer?): (integer?, error?)
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return nil, policy_err end
    local batch = math.min((policy :: any).retention_batch,
        math.max(1, math.floor(tonumber(limit) or (policy :: any).retention_batch)))
    local result, err = db:execute([[WITH expired AS (
        SELECT id FROM kickside_job_worker WHERE last_seen_at < $1
        ORDER BY last_seen_at,id LIMIT $2
    ) DELETE FROM kickside_job_worker WHERE id IN (SELECT id FROM expired)
      AND last_seen_at < $1]], { cutoff, batch })
    if err then return nil, errors.wrap(err, "stale worker heartbeats") end
    return affected(result, "stale worker heartbeats", batch)
end

-- A wake row has no deliverable demand after its last pending/running
-- subscriber leaves. An unacknowledged generation with no subscriber and no
-- continuation has no recovery target; keeping it would leak one row per key.
function M.prune_wake_fanout(db: any, limit: integer?): (integer?, error?)
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return nil, policy_err end
    local batch = math.min((policy :: any).retention_batch,
        math.max(1, math.floor(tonumber(limit) or (policy :: any).retention_batch)))
    local dbtype, type_err = db:type()
    if type_err then return nil, errors.wrap(type_err, "orphan wake dialect") end
    -- A wake publisher locks the same row before it can queue its continuation.
    -- Skip rows it owns so a stale candidate snapshot cannot delete new demand.
    local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE OF f SKIP LOCKED" or ""
    local result, err = db:execute([[WITH expired AS (
        SELECT f.key FROM kickside_wake_fanout f
        WHERE NOT EXISTS (SELECT 1 FROM kickside_job j WHERE j.wake_key = f.key
            AND j.status IN ('pending','running'))
        ORDER BY f.key LIMIT $1]] .. lock .. [[
    ) DELETE FROM kickside_wake_fanout WHERE key IN (SELECT key FROM expired)
      AND NOT EXISTS (SELECT 1 FROM kickside_job j
        WHERE j.wake_key = kickside_wake_fanout.key
          AND j.status IN ('pending','running'))]], { batch })
    if err then return nil, errors.wrap(err, "orphan wake rows") end
    return affected(result, "orphan wake rows", batch)
end

local function days_before(dbtype: string, duration_ms: integer): string
    return clock.format(time.now():add(-duration_ms * time.MILLISECOND), dbtype)
end

local function prune_thread_cleanup_receipts(db: any, cutoff: string, limit: integer,
        dbtype: string): (integer?, error?)
    local tx, begin_err = sql_boundary.begin(db, "thread cleanup receipt prune begin failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction") end
    local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE SKIP LOCKED" or ""
    local rows, read_err = tx:query("SELECT thread_id,page_seq FROM kickside_job_thread_cleanup_receipt"
        .. " WHERE acknowledged_at IS NOT NULL AND acknowledged_at < $1"
        .. " ORDER BY acknowledged_at,thread_id,page_seq LIMIT $2" .. lock, { cutoff, limit })
    if read_err then return nil, sql_boundary.rollback(tx,
        errors.wrap(read_err, "thread cleanup receipt prune selection failed"), "retention rollback failed") end
    if type(rows) ~= "table" then return nil, sql_boundary.rollback(tx,
        response_error("candidates.rows"), "retention rollback failed") end
    local total = 0
    for _, row in ipairs(rows) do
        local result, delete_err = tx:execute([[DELETE FROM kickside_job_thread_cleanup_receipt
            WHERE thread_id=$1 AND page_seq=$2 AND acknowledged_at IS NOT NULL AND acknowledged_at < $3]],
            { row.thread_id, row.page_seq, cutoff })
        if delete_err then return nil, sql_boundary.rollback(tx, errors.wrap(delete_err, "thread cleanup receipt prune delete failed"), "retention rollback failed") end
        local count, proof_err = affected(result, "thread cleanup receipt prune", 1)
        if proof_err then return nil, sql_boundary.rollback(tx, proof_err, "retention rollback failed") end
        total = total + (count :: integer)
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "thread cleanup receipt prune commit failed") end
    return total, nil
end

local function prune_completed_thread_fences(db: any, cutoff: string, limit: integer,
        dbtype: string): (integer?, error?)
    local tx, begin_err = sql_boundary.begin(db, "thread cleanup fence prune begin failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction") end
    local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE SKIP LOCKED" or ""
    local rows, read_err = tx:query([[SELECT f.thread_id FROM kickside_job_thread_cleanup f
        WHERE f.completed_at < $1
          AND NOT EXISTS (SELECT 1 FROM kickside_job_thread_cleanup_receipt r
              WHERE r.thread_id=f.thread_id AND r.acknowledged_at IS NULL)
          AND NOT EXISTS (SELECT 1 FROM kickside_job j WHERE j.owner_kind='thread' AND j.owner_id=f.thread_id)
          AND NOT EXISTS (SELECT 1 FROM kickside_job_run r WHERE r.owner_kind='thread' AND r.owner_id=f.thread_id)
        ORDER BY f.completed_at,f.thread_id LIMIT $2]] .. lock, { cutoff, limit })
    if read_err then return nil, sql_boundary.rollback(tx,
        errors.wrap(read_err, "thread cleanup fence prune selection failed"), "retention rollback failed") end
    if type(rows) ~= "table" then return nil, sql_boundary.rollback(tx,
        response_error("candidates.rows"), "retention rollback failed") end
    local total = 0
    for _, row in ipairs(rows) do
        local result, delete_err = tx:execute([[DELETE FROM kickside_job_thread_cleanup
            WHERE thread_id=$1 AND completed_at < $2
              AND NOT EXISTS (SELECT 1 FROM kickside_job_thread_cleanup_receipt r
                  WHERE r.thread_id=$1 AND r.acknowledged_at IS NULL)]], { row.thread_id, cutoff })
        if delete_err then return nil, sql_boundary.rollback(tx, errors.wrap(delete_err, "thread cleanup fence prune delete failed"), "retention rollback failed") end
        local count, proof_err = affected(result, "thread cleanup fence prune", 1)
        if proof_err then return nil, sql_boundary.rollback(tx, proof_err, "retention rollback failed") end
        total = total + (count :: integer)
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "thread cleanup fence prune commit failed") end
    return total, nil
end

-- One bounded pass over each Jobs-owned retained table. Repeated exact policy
-- deadlines drain older batches without an idle polling loop.
function M.sweep(db: any, dbtype: string): (table?, error?)
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return nil, policy_err end
    local batch = (policy :: any).retention_batch :: integer
    local job_cutoff = days_before(dbtype, (policy :: any).retention_jobs_ms)
    local run_cutoff = days_before(dbtype, (policy :: any).retention_job_runs_ms)
    local receipt_cutoff = days_before(dbtype, (policy :: any).retention_thread_cleanup_receipts_ms)
    local runs, runs_err = M.prune_runs(db, nil, run_cutoff, batch, true)
    if runs_err then return nil, runs_err end
    local jobs, jobs_err = M.prune_jobs(db, nil, job_cutoff, batch, true)
    if jobs_err then return nil, jobs_err end
    local workers, workers_err = M.prune_workers(db, job_cutoff, batch)
    if workers_err then return nil, workers_err end
    local wake_rows, wake_err = M.prune_wake_fanout(db, batch)
    if wake_err then return nil, wake_err end
    local cleanup_receipts, receipts_err = prune_thread_cleanup_receipts(db, receipt_cutoff, batch, dbtype)
    if receipts_err then return nil, receipts_err end
    local leftovers, leftovers_err = thread_teardown.reclaim_completed(db, dbtype, (policy :: any).thread_cleanup_batch)
    if leftovers_err then return nil, leftovers_err end
    local cleanup_fences, fences_err = prune_completed_thread_fences(db, receipt_cutoff, batch, dbtype)
    if fences_err then return nil, fences_err end
    return {
        jobs = jobs :: integer, job_runs = runs :: integer,
        workers = workers :: integer, wake_rows = wake_rows :: integer,
        thread_cleanup_receipts = cleanup_receipts :: integer,
        thread_cleanup_fences = cleanup_fences :: integer,
        thread_cleanup_leftovers = leftovers :: integer,
    }, nil
end

return M
