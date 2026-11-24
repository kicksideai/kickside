local sql = require("sql")

local cfg = require("config")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local reclaim = require("reclaim")
local enqueue = require("lifecycle_enqueue")
local wake = require("wake")
local slot_purge = require("slot_purge")
local clock = require("clock")
local completion = require("completion")
local lease_status = require("lease_status")
local retention = require("retention")
local thread_teardown = require("thread_teardown")
local thread_fence = require("thread_fence")
local api_scope = require("api_scope")
local lease_release = require("lease_release")
local claim = require("claim")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local sql_boundary = require("sql_boundary")
local proc_supervisor = require("proc_supervisor")

local runtime_policy = require("runtime_policy")
local jobs = {}

local function response_error(field: string): error
    return errors.new({message = "Jobs database scope response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_scope_response", field = field}})
end

local function release(db: sql.DB, primary: error?): (error?, boolean)
    local _, err = db:release()
    if not err then return primary, false end
    if primary then return error_envelope.wrap_secondary(err, primary, "Jobs database release failed"), true end
    return errors.wrap(err, "Jobs database release failed"), true
end

local function with_db(fn: (sql.DB, string) -> (any?, error?), mutating: boolean?): (any?, error?)
    local db, db_err = sql.get(cfg.db_id())
    if db_err then return nil, errors.wrap(db_err, "Jobs database unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    local raw_dbtype, type_err = db:type()
    if type_err then
        local final = release(db, errors.wrap(type_err, "Jobs database type unavailable"))
        return nil, final
    end
    if type(raw_dbtype) ~= "string" or raw_dbtype == "" then
        local final = release(db, response_error("dialect"))
        return nil, final
    end
    local result, err = fn(db, raw_dbtype)
    local final, release_failed = release(db, err)
    if not release_failed then return result, err end
    if err then return result, final end
    if final and mutating then return nil, committed_error.new(final) end
    return nil, final
end

local function opt_string(value: any): string?
    if type(value) == "string" then
        return value
    end
    return nil
end

local function opt_integer(value: any): integer?
    local n = tonumber(value)
    if not n then
        return nil
    end
    return math.floor(n) :: integer
end

-- Demand commits before the direct registered-pool message. If delivery fails,
-- return the failure so the caller can retry the idempotent enqueue.
local function nudge_after_enqueue(db: sql.DB, dbtype: string, parked: boolean): error?
    if parked then return nil end
    local _, nudge_err = wake.nudge_workers(db, dbtype)
    return nudge_err
end

local function nudge_after_transition(db: sql.DB, dbtype: string): error?
    local _, nudge_err = wake.nudge_workers(db, dbtype)
    return nudge_err
end

local function prepare_enqueue_params(params: table?): (lifecycle.EnqueueParams?, error?)
    if type(params) ~= "table" then
        return nil, (errors.new({ message = "jobs.enqueue params must be an object", kind = errors.INVALID }) :: error)
    end
    local p = params :: any
    if p.replace ~= nil and type(p.replace) ~= "boolean" then
        return nil, errors.new({message = "enqueue replace must be a boolean", kind = errors.INVALID, retryable = false})
    end
    if p.demand ~= nil and type(p.demand) ~= "boolean" then
        return nil, (errors.new({ message = "enqueue demand must be a boolean", kind = errors.INVALID }) :: error)
    end
    if p.demand == true and p.slot ~= true then
        return nil, (errors.new({ message = "enqueue demand requires a reusable slot", kind = errors.INVALID }) :: error)
    end
    local carried_err = lifecycle.carried_identity_error(p)
    if carried_err then return nil, carried_err end
    local owner_err = enqueue.owner_locator_error(p)
    if owner_err then return nil, owner_err end
    if type(p.namespace) ~= "string" or p.namespace == ""
        or type(p.scope) ~= "string" or p.scope == ""
        or type(p.key) ~= "string" or p.key == ""
        or type(p.job_type) ~= "string" or p.job_type == ""
        or type(p.immutable_payload) ~= "table" then
        return nil, (errors.new({ message = "enqueue requires namespace, scope, key, job_type and immutable_payload", kind = errors.INVALID }) :: error)
    end
    if p.worker_ref ~= nil or p.payload ~= nil or p.job_identity ~= nil or p.idempotency_key ~= nil
        or p.thread_event ~= nil then
        return nil, (errors.new({ message = "enqueue accepts only the canonical identity and immutable_payload", kind = errors.INVALID }) :: error)
    end
    local trace: table? = nil
    if type(p.trace_context) == "table" then
        trace = p.trace_context :: table
    end
    return {
        thread_id = opt_string(p.thread_id),
        owner_locator = p.owner_locator,
        job_type = p.job_type,
        worker_ref = p.job_type,
        concurrency_key = opt_string(p.concurrency_key),
        payload = p.immutable_payload,
        queue_tier = opt_string(p.queue_tier),
        priority = opt_integer(p.priority),
        max_attempts = opt_integer(p.max_attempts),
        progress_timeout_ms = p.progress_timeout_ms,
        idempotency_key = p.namespace == "thread" and p.key or nil,
        scheduled_at = opt_string(p.scheduled_at),
        trace_context = trace,
        job_identity = { namespace = p.namespace, scope = p.scope, key = p.key },
        slot = p.slot == true,
        wake_key = opt_string(p.wake_key),
        parked = p.parked == true,
        demand = p.demand == true,
        replace = p.replace == true,
    }, nil
end

local function enqueue_result(params: lifecycle.EnqueueParams, id: string, inserted: boolean?, replaced_job_id: string?): (table?, error?)
    local identity, identity_err = lifecycle.identity_parts(params, id)
    if identity_err then return nil, identity_err end
    return { id = id, job_identity = identity, existing = inserted == false, replaced_job_id = replaced_job_id }, nil
end

local function enqueue_tx(tx: sql.Transaction, dbtype: string, job_params: lifecycle.EnqueueParams): (table?, error?)
    local thread_id = job_params.thread_id
    local owner = job_params.owner_locator :: table
    if thread_id and (owner.kind ~= "thread" or owner.id ~= thread_id) then
        local link, link_err = thread_fence.admit_link(tx, dbtype, thread_id)
        if link_err then return nil, link_err end
        job_params.thread_id = link
    end
    local id, enqueue_err, inserted, replaced_job_id = lifecycle.enqueue_job(tx, dbtype, job_params)
    if enqueue_err or not id then return nil, enqueue_err end
    if job_params.demand then
        local _, demand_err = wake.wake_job(tx, id, { control = true }, dbtype)
        if demand_err then return nil, demand_err end
    end
    return enqueue_result(job_params, id, inserted, replaced_job_id)
end

function jobs.enqueue(params: table?): (table?, error?)
    local result, err = with_db(function(db: sql.DB, dbtype: string): (any?, error?)
        local job_params, params_err = prepare_enqueue_params(params)
        if params_err or not job_params then return nil, params_err end
        local tx, begin_err = sql_boundary.begin(db, "job enqueue transaction failed", "transaction", response_error)
        if begin_err then return nil, begin_err end
        if not tx then return nil, response_error("transaction") end
        local value, enqueue_err = enqueue_tx(tx, dbtype, job_params)
        if enqueue_err then return nil, sql_boundary.rollback(tx, enqueue_err, "job enqueue rollback failed") end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "job enqueue commit failed") end
        local notify_err: error? = nil
        if job_params.demand or value.existing ~= true then
            notify_err = nudge_after_enqueue(db, dbtype, job_params.parked == true and not job_params.demand)
        end
        if value.replaced_job_id then
            notify_err = error_envelope.cleanup(function(): (any, error?)
                return nil, lease_release.notify(value.replaced_job_id, nil, job_params.owner_locator)
            end, notify_err, "replacement notification failed")
        end
        if notify_err then return nil, notify_err end
        return value, nil
    end, true)
    return result :: table?, err
end

-- The caller commits enrollment and optional slot demand before notifying the pool.
function jobs.enqueue_tx(tx: sql.Transaction, dbtype: string, params: table): (table?, error?)
    local job_params, params_err = prepare_enqueue_params(params)
    if params_err or not job_params then return nil, params_err end
    return enqueue_tx(tx, dbtype, job_params)
end

-- Call only after the owning transaction commits; durable demand survives an absent pool.
function jobs.nudge_workers(): (integer, error?)
    return wake.notify_workers("kickside.core.jobs:nudge_workers")
end

-- The owner authorizes retirement before deleting its exact slot and settled history.
function jobs.purge_slot(params: table): (integer?, error?)
    return slot_purge.purge_slot(params)
end

function jobs.cancel(id: string, expected_lease_token: string?): (table?, error?)
    return with_db(function(db: sql.DB, dbtype: string): (any?, error?)
        if type(id) ~= "string" or id == "" or
            (expected_lease_token ~= nil and (type(expected_lease_token) ~= "string" or expected_lease_token == "")) then
            return nil, (errors.new({ message = "cancel requires a job id and an optional lease token", kind = errors.INVALID }) :: error)
        end
        local tx, begin_err = sql_boundary.begin(db, "cancel begin failed", "transaction", response_error)
        if begin_err then return nil, begin_err end
        if not tx then return nil, response_error("transaction") end
        local canceled, cancel_err, revoked, owner = lifecycle_cancel.cancel_job_tx(tx, dbtype, {
            id = id, expected_lease_token = expected_lease_token,
        })
        if cancel_err then return nil, sql_boundary.rollback(tx, cancel_err, "cancel rollback failed") end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "cancel commit failed") end
        if owner then
            local release_err = lease_release.notify(id, nil, owner)
            if release_err then return nil, release_err end
        end
        local notify_err = reclaim.notify_cancellations(db, dbtype, revoked or {})
        if notify_err then return nil, notify_err end
        return { canceled = canceled, job_id = id }, nil
    end, true)
end

-- lease_valid(id, lease) is the operation-boundary lease fence used by round
-- owners before an external effect. Cancellation itself is fenced by cancel().
function jobs.lease_valid(id: string, lease: table): (boolean?, error?)
    return with_db(function(db: sql.DB, dbtype: string): (boolean?, error?)
        if type(id) ~= "string" or id == "" or type(lease) ~= "table"
            or type(lease.token) ~= "string" or lease.token == ""
            or type(lease.execution_seq) ~= "number" then
            return nil, (errors.new({ message = "lease_valid requires a job id and lease fence", kind = errors.INVALID }) :: error)
        end
        local current, err = lease_status.job_still_running(db, {
            id = id, lease_token = lease.token, execution_seq = lease.execution_seq,
        }, dbtype)
        return current == true, err
    end)
end

-- heartbeat(id, lease) reports progress under the existing ownership fence.
-- Automatic renewals keep the lease alive; progress only moves the supervisor's
-- heartbeat deadline. False confirms lease loss; reporting errors propagate.
function jobs.heartbeat(id: string, lease: table): (boolean?, error?)
    if type(lease) == "table" and type(lease.execution_seq) == "number"
        and (lease.execution_seq < 1 or lease.execution_seq == math.huge
            or lease.execution_seq ~= math.floor(lease.execution_seq)) then
        return nil, (errors.new({message = "heartbeat requires an integer execution sequence", kind = errors.INVALID}) :: error)
    end
    local active, active_err = jobs.lease_valid(id, lease)
    if active_err then return nil, active_err end
    if not active then return false, nil end
    local sent, notify_err = proc_supervisor.notify(id, lease.token, lease.execution_seq,
        "heartbeat", nil)
    if notify_err then return nil, notify_err end
    if not sent then
        return nil, (errors.new({message = "job execution supervisor did not receive heartbeat",
            kind = errors.UNAVAILABLE, retryable = true}) :: error)
    end
    return true, nil
end

function jobs.wake_tx(tx: sql.Transaction, key: string, dbtype: string?): (table?, error?)
    return wake.wake_tx(tx, key, dbtype)
end

function jobs.wake_job(id: string, opts: table?): (table?, error?)
    local result, err = with_db(function(db: sql.DB, dbtype: string): (table?, error?)
        local woken, wake_err = wake.wake_job(db, id, opts, dbtype)
        if wake_err or not woken then return woken, wake_err end
        if woken.woken then
            local _, nudge_err = wake.nudge_workers(db, dbtype)
            if nudge_err then return nil, nudge_err end
        end
        return woken, nil
    end, true)
    return result :: table?, err
end

function jobs.complete_tx(tx: sql.Transaction, id: string, lease: table, options: table): (table?, error?)
    return completion.complete_tx(tx, id, lease, options)
end

function jobs.complete(id: string, lease: table, options: table): (table?, error?)
    return with_db(function(db: sql.DB, dbtype: string): (table?, error?)
        local tx, begin_err = sql_boundary.begin(db, "completion begin failed", "transaction", response_error)
        if begin_err then return nil, begin_err end
        if not tx then return nil, response_error("transaction") end
        local result, err = completion.complete_tx(tx, id, lease, options)
        if err then return nil, sql_boundary.rollback(tx, err, "completion rollback failed") end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "completion commit failed") end
        local release_err = lease_release.notify(id, lease.execution_seq, result.owner_locator)
        if release_err then return nil, release_err end
        if result.scheduled_at ~= nil then
            local nudge_err = nudge_after_transition(db, dbtype)
            if nudge_err then return nil, nudge_err end
        end
        return result, nil
    end, true)
end

-- Jobs-owned, bounded retention entry point consumed by the maintenance slot.
function jobs.retention_sweep(cursor: table?, completed_fence_cursor: table | boolean | nil, scan_wake: boolean?): (table?, error?)
    return with_db(function(db: sql.DB, dbtype: string): (table?, error?)
        return retention.sweep(db, dbtype, cursor, completed_fence_cursor, scan_wake)
    end, true)
end

-- Standalone cleanup commits one Jobs page and preserves its exact result for replay.
function jobs.cleanup_thread_page(thread_id: string, page_seq: integer): (table?, error?)
    return with_db(function(db: sql.DB, dbtype: string): (table?, error?)
        return thread_teardown.page(db, dbtype, thread_id, page_seq)
    end, true)
end

function jobs.ack_thread_cleanup_page(thread_id: string, page_seq: integer,
        thread_done: boolean): (boolean?, error?)
    return with_db(function(db: sql.DB, dbtype: string): (boolean?, error?)
        return thread_teardown.ack(db, dbtype, thread_id, page_seq, thread_done)
    end, true)
end

-- Exact reads use the id returned to the owning caller by enqueue.
function jobs.get_job(id: string): (table?, error?)
    return with_db(function(db: sql.DB, _dbtype: string): (table?, error?)
        return lifecycle.get_job(db, id)
    end)
end

function jobs.get_jobs(ids: string[]): (table?, error?)
    return with_db(function(db: sql.DB, _dbtype: string): (table?, error?)
        return lifecycle.get_jobs(db, ids)
    end)
end

function jobs.get_job_statuses(ids: string[]): (table?, error?)
    return with_db(function(db: sql.DB, _dbtype: string): (table?, error?)
        return lifecycle.get_job_statuses(db, ids)
    end)
end

-- Read uncommitted Jobs state when the caller owns a transaction on the
-- configured Jobs database. Transaction ownership and commit stay with it.
function jobs.get_job_statuses_tx(tx: sql.Transaction, ids: string[]): (table?, error?)
    return lifecycle.get_job_statuses(tx, ids)
end

local function list_history(collection: string, thread_ids: string[], filters: table?, limit: integer?,
        after: table?): (table[]?, error?, boolean?)
    local result, err = with_db(function(db: sql.DB, _dbtype: string): (table?, error?)
        local scope_ids, scope_err = api_scope.only_thread_ids(thread_ids)
        if scope_err then return nil, scope_err end
        local read = collection == "jobs" and lifecycle.list_jobs or lifecycle.list_job_runs
        local rows, read_err, more = read(db, scope_ids :: string[], filters, limit or 100, after)
        if read_err then return nil, read_err end
        return { rows = rows, has_more = more }, nil
    end)
    if err or not result then return nil, err end
    return result.rows, nil, result.has_more
end

function jobs.list_jobs(thread_ids: string[], filters: table?, limit: integer?, after: table?): (table[]?, error?, boolean?)
    return list_history("jobs", thread_ids, filters, limit, after)
end

-- Internal owner API: the caller authorizes its resource before enumerating its jobs.
function jobs.list_owner_jobs(owner: table, filters: table?, limit: integer?, after: table?): (table[]?, error?, boolean?)
    local owner_err = enqueue.owner_locator_error({owner_locator = owner})
    if owner_err then return nil, owner_err end
    local result, err = with_db(function(db: sql.DB, _dbtype: string): (table?, error?)
        local rows, read_err, more = lifecycle.list_owner_jobs(db, owner, filters, limit or 100, after)
        if read_err then return nil, read_err end
        return {rows = rows, has_more = more}, nil
    end)
    if err or not result then return nil, err end
    return result.rows :: table[], nil, result.has_more :: boolean
end

function jobs.list_job_runs(thread_ids: string[], filters: table?, limit: integer?, after: table?): (table[]?, error?, boolean?)
    return list_history("runs", thread_ids, filters, limit, after)
end

function jobs.health(): (table?, error?)
    local result, err = with_db(function(db: sql.DB, dbtype: string): (table?, error?)
        local policy, policy_err = runtime_policy.resolve()
        if policy_err then return nil, policy_err end
        if type(policy) ~= "table" then return nil, response_error("health.policy") end
        local fresh_seconds = cfg.worker_liveness(policy)
        local now = clock.now(dbtype)
        local fresh_predicate = dbtype == sql.type.POSTGRES
            and "p.last_seen_at > CAST($1 AS TIMESTAMPTZ) - ($2 * INTERVAL '1 second')"
            or "p.last_seen_at > datetime($1, '-' || $2 || ' seconds') || substr($1, 20)"
        local pulse_join = dbtype == sql.type.POSTGRES
            and " JOIN LATERAL (SELECT registry_version,last_seen_at FROM kickside_job_worker_pulse WHERE worker_id=w.id LIMIT 1) p ON TRUE"
            or " JOIN kickside_job_worker_pulse p ON p.worker_id=w.id"
        local workers, worker_err = db:query([[SELECT w.id,p.registry_version,w.current_job_id,p.last_seen_at,]]
            .. fresh_predicate .. [[ AS healthy
            FROM (SELECT id,current_job_id FROM kickside_job_worker ORDER BY id ASC LIMIT 256) w]]
            .. pulse_join .. " ORDER BY w.id ASC LIMIT 256", {now, fresh_seconds})
        workers, worker_err = sql_boundary.rows(workers, worker_err, "worker health query failed", "health.workers", response_error)
        if worker_err then return nil, worker_err end
        for _, row in ipairs(workers) do row.healthy = row.healthy == true or row.healthy == 1 end
        local fresh_sql = dbtype == sql.type.POSTGRES
            and "SELECT last_seen_at FROM kickside_job_worker_pulse WHERE last_seen_at > CAST($1 AS TIMESTAMPTZ) - ($2 * INTERVAL '1 second') ORDER BY last_seen_at DESC LIMIT 1001"
            or "SELECT last_seen_at FROM kickside_job_worker_pulse WHERE last_seen_at > (datetime($1, '-' || $2 || ' seconds') || substr($1, 20)) ORDER BY last_seen_at DESC LIMIT 1001"
        local fresh, fresh_err = db:query(fresh_sql, { now, fresh_seconds })
        fresh, fresh_err = sql_boundary.rows(fresh, fresh_err, "fresh worker query failed", "health.fresh", response_error)
        if fresh_err then return nil, fresh_err end
        local function count_matches(source: string, ordered: string, field: string, params: table?): (number?, boolean?, error?)
            local rows, read_err = db:query("SELECT COUNT(*) AS n FROM (SELECT 1 FROM " .. source
                .. " ORDER BY " .. ordered .. " LIMIT 1001) health_matches", params or {})
            local count, count_err = sql_boundary.query_count(rows, read_err,
                field .. " query failed", "health." .. field, response_error)
            if count_err then return nil, nil, count_err end
            return math.min(count :: number, 1000), count > 1000, nil
        end
        local pending_count, pending_capped, pending_err = count_matches(
            "kickside_job WHERE status='pending'", "priority DESC,scheduled_at", "pending")
        if pending_err then return nil, pending_err end
        local running_count, running_capped, running_err = count_matches(
            "kickside_job WHERE status='running'", "priority DESC,scheduled_at", "running")
        if running_err then return nil, running_err end
        local dead_count, dead_capped, dead_err = count_matches(
            "kickside_job WHERE status='dead'", "priority DESC,scheduled_at", "dead")
        if dead_err then return nil, dead_err end
        local lease_source = dbtype == sql.type.SQLITE
            and "kickside_job INDEXED BY idx_kickside_job_lease_reap"
            or "kickside_job"
        local expired_count, expired_capped, expired_err = count_matches(
            lease_source .. " WHERE status='running' AND lease_until IS NOT NULL AND lease_until < $1",
            "lease_until", "expired", {now})
        if expired_err then return nil, expired_err end
        local due_source = "kickside_job WHERE status='pending' AND scheduled_at IS NOT NULL AND scheduled_at <= "
        local due_count, due_capped, due_err = count_matches(due_source .. "$1", "scheduled_at", "due", {now})
        if due_err then return nil, due_err end
        local overdue_deadline = dbtype == sql.type.POSTGRES
            and "$1::timestamptz - ($2 * INTERVAL '1 second')"
            or "datetime($1, '-' || $2 || ' seconds') || substr($1, 20)"
        local overdue_count, overdue_capped, overdue_err = count_matches(due_source .. overdue_deadline,
            "scheduled_at", "overdue", {now, math.floor((policy :: any).health_overdue_grace_ms / 1000)})
        if overdue_err then return nil, overdue_err end
        local age_sql = dbtype == sql.type.POSTGRES
            and "SELECT EXTRACT(EPOCH FROM ($1::timestamptz - (SELECT scheduled_at FROM " .. due_source .. "$1 ORDER BY scheduled_at LIMIT 1))) * 1000 AS age_ms"
            or "SELECT (julianday($1) - julianday((SELECT scheduled_at FROM " .. due_source .. "$1 ORDER BY scheduled_at LIMIT 1))) * 86400000 AS age_ms"
        local age, age_err = db:query(age_sql, {now})
        age, age_err = sql_boundary.bounded_rows(age, age_err, "due age query failed", "health.age", 1, 1, response_error)
        if age_err then return nil, age_err end
        local due_age_ms, value_err = sql_boundary.number_value(age[1].age_ms,
            "health.age.age_ms", 0, false, true, response_error)
        if value_err then return nil, value_err end
        due_age_ms = math.max(0, math.floor(due_age_ms))
        -- Filter only the bounded status window; absence is not proof that no stranded job exists.
        local stranded, stranded_err = db:query([[SELECT id FROM (
            SELECT id,slot,last_error,scheduled_at FROM kickside_job WHERE status='pending'
            ORDER BY priority DESC,scheduled_at LIMIT 1001
        ) pending_sample WHERE slot=FALSE AND last_error IS NOT NULL AND scheduled_at IS NULL LIMIT 16]])
        stranded, stranded_err = sql_boundary.rows(stranded, stranded_err,
            "stranded job query failed", "health.stranded", response_error)
        if stranded_err then return nil, stranded_err end
        local stranded_ids: string[] = {}
        for _, row in ipairs(stranded) do stranded_ids[#stranded_ids+1] = tostring(row.id) end
        local issues: { table } = {}
        if #fresh == 0 then
            issues[#issues + 1] = { code = "no_live_workers", message = "no job worker has beaten within the lease window" }
        end
        if overdue_count > 0 then
            issues[#issues + 1] = { code = "due_work_unclaimed", count = overdue_count, capped = overdue_capped, oldest_age_ms = due_age_ms,
                message = "pending jobs are due past the overdue grace; concurrency or capacity may block claims" }
        end
        if #stranded_ids > 0 then
            issues[#issues + 1] = {code = "stranded_jobs", job_ids = stranded_ids,
                message = "sampled one-shot jobs have errors and no schedule for another execution"}
        end
        return {
            healthy = #issues == 0,
            issues = issues,
            workers = workers,
            healthy_worker_count = math.min(#fresh, 1000),
            healthy_worker_count_capped = #fresh > 1000,
            pending_jobs = pending_count,
            pending_jobs_capped = pending_capped,
            running_jobs = running_count,
            running_jobs_capped = running_capped,
            dead_jobs = dead_count,
            dead_jobs_capped = dead_capped,
            due_unclaimed_count = due_count,
            due_unclaimed_count_capped = due_capped,
            overdue_unclaimed_count = overdue_count,
            overdue_unclaimed_count_capped = overdue_capped,
            due_unclaimed_oldest_age_ms = due_age_ms,
            expired_leases = expired_count,
            expired_leases_capped = expired_capped,
        }, nil
    end)
    return result :: table?, err
end

return jobs
