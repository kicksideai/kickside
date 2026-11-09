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
local thread_fence = require("thread_fence")

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
    if #ids == 0 then return nil end
    local _, err = tx:query("SELECT id FROM " .. table_name .. " WHERE id IN ("
        .. placeholders(1, #ids) .. ") ORDER BY id FOR UPDATE", ids)
    if err then return errors.wrap(err, table_name .. " prune prelock") end
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
    local cols = runs and "id,job_id,owner_kind,owner_id" or "id,owner_kind,owner_id"
    local source = table_name
    local ordered = "finished_at,id"
    if dbtype == sql.type.SQLITE and all_threads == true then
        -- The global ordered read stays bounded before planner statistics exist.
        ordered = "finished_at,rowid"
        source = source .. " INDEXED BY " .. (runs and "idx_job_run_global_retention" or "idx_job_global_retention")
    end
    local rows, read_err = db:query("SELECT " .. cols .. " FROM " .. source .. " WHERE " .. predicate
        .. " AND " .. settled .. " AND finished_at IS NOT NULL AND finished_at < " .. cutoff_arg
        .. no_runs .. " ORDER BY " .. ordered .. " LIMIT " .. limit_arg, params)
    if read_err then return nil, errors.wrap(read_err, "job prune candidates") end
    if type(rows) ~= "table" then return nil, response_error("candidates.rows") end
    if #rows == 0 then return 0, nil end
    local tx, begin_err = sql_boundary.begin(db, "job prune transaction", "transaction", response_error)
    if begin_err then return nil, begin_err end
    if not tx then return nil, response_error("transaction") end
    local job_ids: { string } = {}
    local run_ids: { string } = {}
    local thread_ids: { string } = {}
    for _, row in ipairs(rows) do
        if row.owner_kind == "thread" then
            if type(row.owner_id) ~= "string" or row.owner_id == "" then
                return nil, sql_boundary.rollback(tx, response_error("candidates.owner"), "retention rollback failed")
            end
            thread_ids[#thread_ids + 1] = row.owner_id
        end
        if runs then
            job_ids[#job_ids + 1] = tostring(row.job_id)
            run_ids[#run_ids + 1] = tostring(row.id)
        else
            job_ids[#job_ids + 1] = tostring(row.id)
        end
    end
    -- Match claim/cleanup lock order before retiring any thread-owned row.
    -- A candidate may be gone after waiting; the bounded DELETE counts reality.
    if #thread_ids > 0 then
        local fences, fence_err = thread_fence.lock_many(tx, thread_ids)
        if fence_err then return nil, sql_boundary.rollback(tx, fence_err, "retention rollback failed") end
        if type(fences) ~= "table" then return nil, sql_boundary.rollback(tx,
            response_error("thread_fences"), "retention rollback failed") end
    end
    local job_lock_err = prelock_ids(tx, tostring(dbtype), "kickside_job", job_ids)
    if job_lock_err then return nil, sql_boundary.rollback(tx, job_lock_err, "retention rollback failed") end
    local run_lock_err = prelock_ids(tx, tostring(dbtype), "kickside_job_run", run_ids)
    if run_lock_err then return nil, sql_boundary.rollback(tx, run_lock_err, "retention rollback failed") end

    local args: { any } = { cutoff }
    for _, row in ipairs(rows) do args[#args + 1] = row.id end
    local delete_source = table_name
    local selected = "id IN (" .. placeholders(2, #rows) .. ")"
    if dbtype == sql.type.SQLITE then
        -- Selected rowids keep the DELETE off scans of every terminal row
        -- through the status index.
        delete_source = delete_source .. " NOT INDEXED"
        selected = "rowid IN (SELECT rowid FROM " .. table_name .. " WHERE " .. selected .. ")"
    end
    local deleted, delete_err = tx:execute("DELETE FROM " .. delete_source .. " WHERE finished_at < $1"
        .. " AND " .. settled .. " AND " .. selected .. no_runs, args)
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
local function prune_heartbeats(db: any, cutoff: string, limit: integer?,
        table_name: string, key: string, eligibility: string): (integer?, error?)
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return nil, policy_err end
    local batch = math.min((policy :: any).retention_batch,
        math.max(1, math.floor(tonumber(limit) or (policy :: any).retention_batch)))
    local predicate = "last_seen_at < $1" .. eligibility
    local result, err = db:execute("WITH expired AS (SELECT " .. key .. " FROM " .. table_name
        .. " WHERE " .. predicate .. " ORDER BY last_seen_at LIMIT $2) DELETE FROM " .. table_name
        .. " WHERE " .. key .. " IN (SELECT " .. key .. " FROM expired) AND " .. predicate, { cutoff, batch })
    if err then return nil, errors.wrap(err, "stale worker heartbeats") end
    return affected(result, "stale worker heartbeats", batch)
end

function M.prune_workers(db: any, cutoff: string, limit: integer?): (integer?, error?)
    return prune_heartbeats(db, cutoff, limit, "kickside_job_worker", "id",
        " AND NOT EXISTS (SELECT 1 FROM kickside_job_worker_pulse p"
            .. " WHERE p.worker_id=kickside_job_worker.id AND p.last_seen_at >= $1)")
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

-- One bounded pass over each Jobs-owned retained table. Full batch counts
-- keep the worker pool retention deadline due until the backlog drains.
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
    local pulses, pulses_err = prune_heartbeats(db, job_cutoff, batch, "kickside_job_worker_pulse", "worker_id", "")
    if pulses_err then return nil, pulses_err end
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
        workers = workers :: integer, worker_pulses = pulses :: integer, wake_rows = wake_rows :: integer,
        thread_cleanup_receipts = cleanup_receipts :: integer,
        thread_cleanup_fences = cleanup_fences :: integer,
        thread_cleanup_leftovers = leftovers :: integer,
    }, nil
end

return M
