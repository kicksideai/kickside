local sql = require("sql")

local cfg = require("config")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local enqueue = require("lifecycle_enqueue")
local wake = require("wake")
local slot_purge = require("slot_purge")
local clock = require("clock")
local completion = require("completion")
local lease_status = require("lease_status")
local retention = require("retention")
local thread_teardown = require("thread_teardown")
local api_scope = require("api_scope")
local lease_release = require("lease_release")
local claim = require("claim")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local sql_boundary = require("sql_boundary")

local runtime_policy = require("runtime_policy")
local pool_state = require("pool_state")
local jobs = {}

jobs.get_policy = runtime_policy.get
jobs.set_policy_overrides = runtime_policy.set
jobs.get_pool_state = pool_state.read


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
        idempotency_key = p.namespace == "thread" and p.key or nil,
        scheduled_at = opt_string(p.scheduled_at),
        trace_context = trace,
        job_identity = { namespace = p.namespace, scope = p.scope, key = p.key },
        slot = p.slot == true,
        wake_key = opt_string(p.wake_key),
        parked = p.parked == true,
        demand = p.demand == true,
    }, nil
end

local function enqueue_result(params: lifecycle.EnqueueParams, id: string, inserted: boolean?): (table?, error?)
    local identity, identity_err = lifecycle.identity_parts(params, id)
    if identity_err then return nil, identity_err end
    return { id = id, job_identity = identity, existing = inserted == false }, nil
end

local function enqueue_tx(tx: sql.Transaction, dbtype: string, job_params: lifecycle.EnqueueParams): (table?, error?)
    local id, enqueue_err, inserted = lifecycle.enqueue_job(tx, dbtype, job_params)
    if enqueue_err or not id then return nil, enqueue_err end
    if job_params.demand then
        local _, demand_err = wake.wake_job(tx, id, { control = true }, dbtype)
        if demand_err then return nil, demand_err end
    end
    return enqueue_result(job_params, id, inserted)
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
        if job_params.demand or value.existing ~= true then
            local nudge_err = nudge_after_enqueue(db, dbtype, job_params.parked == true and not job_params.demand)
            if nudge_err then return nil, nudge_err end
        end
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
        local canceled, cancel_err, revoked = lifecycle_cancel.cancel_job_tx(tx, dbtype, {
            id = id, expected_lease_token = expected_lease_token,
        })
        if cancel_err then return nil, sql_boundary.rollback(tx, cancel_err, "cancel rollback failed") end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "cancel commit failed") end
        local notify_err = lifecycle.notify_cancellations(db, dbtype, revoked or {})
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
function jobs.retention_sweep(): (table?, error?)
    return with_db(function(db: sql.DB, dbtype: string): (table?, error?)
        return retention.sweep(db, dbtype)
    end, true)
end

-- Thread teardown uses page ids persisted in the Core thread row. A Jobs page
-- commits independently and stores its exact result until Core acknowledges it.
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

function jobs.list_job_runs(thread_ids: string[], filters: table?, limit: integer?, after: table?): (table[]?, error?, boolean?)
    return list_history("runs", thread_ids, filters, limit, after)
end

function jobs.health(): (table?, error?)
    local result, err = with_db(function(db: sql.DB, dbtype: string): (table?, error?)
        local policy, policy_err = runtime_policy.resolve_from(db)
        if policy_err then return nil, policy_err end
        if type(policy) ~= "table" then return nil, response_error("health.policy") end
        local fresh_seconds = (policy :: any).lease_timeout_seconds
        local now = clock.now(dbtype)
        local workers, worker_err = db:query([[SELECT w.id,p.registry_version,w.current_job_id,p.last_seen_at
            FROM kickside_job_worker w JOIN kickside_job_worker_pulse p ON p.worker_id=w.id
            ORDER BY w.id ASC LIMIT 256]])
        workers, worker_err = sql_boundary.rows(workers, worker_err, "worker health query failed", "health.workers", response_error)
        if worker_err then return nil, worker_err end
        local fresh_sql = dbtype == sql.type.POSTGRES
            and "SELECT worker_id FROM kickside_job_worker_pulse WHERE last_seen_at > NOW() - ($1 * INTERVAL '1 second')"
            or "SELECT worker_id FROM kickside_job_worker_pulse WHERE last_seen_at > datetime('now', '-' || ? || ' seconds')"
        local fresh, fresh_err = db:query(fresh_sql, { fresh_seconds })
        fresh, fresh_err = sql_boundary.rows(fresh, fresh_err, "fresh worker query failed", "health.fresh", response_error)
        if fresh_err then return nil, fresh_err end
        local fresh_ids = {}
        for _, row in ipairs(fresh) do fresh_ids[tostring(row.worker_id)] = true end
        for _, row in ipairs(workers) do row.healthy = fresh_ids[tostring(row.id)] == true end

        local expired, expired_err = sql.builder.select("COUNT(*) AS n")
            :from("kickside_job")
            :where(sql.builder.eq({ status = "running" }))
            :where("lease_until IS NOT NULL AND lease_until < ?", now)
            :run_with(db):query()
        local expired_count, expired_count_err = sql_boundary.query_count(expired, expired_err,
            "expired lease query failed", "health.expired", response_error)
        if expired_count_err then return nil, expired_count_err end
        local wake_rows, wake_err = sql.builder.select("COUNT(*) AS n")
            :from("kickside_wake_fanout")
            :where("demand_generation > ack_generation")
            :run_with(db):query()
        local wake_count, wake_count_err = sql_boundary.query_count(wake_rows, wake_err,
            "wake health query failed", "health.wake", response_error)
        if wake_count_err then return nil, wake_count_err end
        local backlog, backlog_err = claim.due_backlog(db, dbtype,
            math.floor((policy :: any).health_overdue_grace_ms / 1000))
        if backlog_err then return nil, backlog_err end
        if type(backlog) ~= "table" then return nil, response_error("health.backlog") end
        local due_count, count_err = sql_boundary.number_value(backlog.count, "health.backlog.count", 0, true, false, response_error)
        if count_err then return nil, count_err end
        local overdue_count, overdue_err = sql_boundary.number_value(backlog.overdue, "health.backlog.overdue", 0, true, false, response_error)
        if overdue_err then return nil, overdue_err end
        local due_age_ms, age_err = sql_boundary.number_value(backlog.oldest_age_ms, "health.backlog.oldest_age_ms", 0, false, false, response_error)
        if age_err then return nil, age_err end
        -- A slot whose latest execution failed and that no schedule will run
        -- again waits on its owner: a parked deterministic failure.
        local failed_slots, failed_err = db:query([[SELECT COUNT(*) AS n FROM kickside_job j
            JOIN kickside_job_run r ON r.job_id=j.id AND r.execution_seq=j.execution_seq
            WHERE j.status='pending' AND j.slot AND j.scheduled_at IS NULL AND r.status='failed']])
        local failed_slot_count, failed_slot_count_err = sql_boundary.query_count(failed_slots, failed_err,
            "failed slot query failed", "health.failed", response_error)
        if failed_slot_count_err then return nil, failed_slot_count_err end
        local degraded, degraded_err = sql.builder.select("COUNT(*) AS n")
            :from("kickside_job")
            :where("status = 'pending' AND last_error IS NOT NULL")
            :run_with(db):query()
        local degraded_count, degraded_count_err = sql_boundary.query_count(degraded, degraded_err,
            "degraded job query failed", "health.degraded", response_error)
        if degraded_count_err then return nil, degraded_count_err end
        local control_age_sql = dbtype == sql.type.POSTGRES
            and "SELECT EXTRACT(EPOCH FROM (NOW() - MIN(updated_at))) * 1000 AS age_ms FROM kickside_job WHERE wake_control_pending = TRUE"
            or "SELECT (julianday('now') - julianday(MIN(updated_at))) * 86400000 AS age_ms FROM kickside_job WHERE wake_control_pending = 1"
        local control_age, control_err = db:query(control_age_sql)
        control_age, control_err = sql_boundary.rows(control_age, control_err,
            "control wake age query failed", "health.control", response_error)
        if control_err then return nil, control_err end
        if not control_age or #control_age ~= 1 or type(control_age[1]) ~= "table" then return nil, response_error("health.control.age_ms") end
        local control_ms, control_ms_err = sql_boundary.number_value(control_age[1].age_ms,
            "health.control.age_ms", nil, false, true, response_error)
        if control_ms_err then return nil, control_ms_err end
        local issues: { table } = {}
        if #fresh == 0 then
            issues[#issues + 1] = { code = "no_live_workers", message = "no job worker has beaten within the lease window" }
        end
        if overdue_count > 0 then
            issues[#issues + 1] = { code = "due_work_unclaimed", count = overdue_count, oldest_age_ms = due_age_ms,
                message = "claimable jobs are due past the overdue grace and no worker has claimed them" }
        end
        if failed_slot_count > 0 then
            issues[#issues + 1] = { code = "slots_failed", count = failed_slot_count,
                message = "slots are parked after a failed execution and wait on their owner" }
        end
        return {
            healthy = #issues == 0,
            failed_slots = failed_slot_count,
            issues = issues,
            workers = workers,
            healthy_worker_count = #fresh,
            due_unclaimed_count = due_count,
            overdue_unclaimed_count = overdue_count,
            due_unclaimed_oldest_age_ms = due_age_ms,
            expired_leases = expired_count,
            undelivered_wake_keys = wake_count,
            degraded_jobs = degraded_count,
            oldest_undelivered_control_wake_age_ms = math.max(0, control_ms),
        }, nil
    end)
    return result :: table?, err
end

return jobs
