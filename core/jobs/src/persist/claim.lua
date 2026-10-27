-- Atomic job claiming. A claim selects the highest-priority due pending job and
-- flips it to running with a fresh lease in one transaction, so exactly one
-- claimant owns a job's live lease: postgres uses SELECT ... FOR UPDATE SKIP
-- LOCKED to skip rows another worker is already claiming; sqlite relies on its
-- serialized writer plus the status='pending' guard on the UPDATE, which makes a
-- losing racer's update affect zero rows. Lease and termination-fence recovery
-- lives in persist/reclaim.lua.

local sql = require("sql")
local uuid = require("uuid")

local job_types = require("job_types")
local cfg = require("config")
local lifecycle = require("lifecycle")
local thread_fence = require("thread_fence")
local lifecycle_cancel = require("lifecycle_cancel")
local row_bytes = require("row_bytes")
local boundary = require("sql_boundary")
local capacity = require("capacity")

local claim = {}

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "claim response is invalid",
        details = {code = "job_claim_response", field = field}})
end

local function read_policy()
    local policy, err = cfg.policy()
    if err then return nil, err end
    if type(policy) ~= "table" then return nil, response_error("policy") end
    return policy, nil
end

local function job_rows(result: any, err: error?, operation: string, field: string,
    maximum: integer?, tiers: boolean): (table[]?, error?)
    local rows, rows_err = boundary.bounded_rows(result, err, operation, field, 0, maximum, response_error)
    if rows_err then return nil, rows_err end
    local allowed: { [string]: boolean } = {}
    if tiers then for _, tier in ipairs(cfg.FAIRNESS_TIERS) do allowed[tier] = true end end
    for _, row in ipairs(rows) do
        if type(row.id) ~= "string" or row.id == "" then return nil, response_error(field .. ".id") end
        if tiers and (type(row.queue_tier) ~= "string" or not allowed[row.queue_tier]) then
            return nil, response_error(field .. ".queue_tier")
        end
    end
    return rows, nil
end

-- Tier allocation belongs to config.distribute_shares; a single-row claim
-- uses priority and due time without a second tier weighting algorithm.
local ORDER_SQL = "priority DESC, scheduled_at ASC"

local SELECT_COLS = {
    "id", "thread_id", "owner_kind", "owner_id", "queue_tier", "job_type", "worker_ref", "payload",
    "attempts", "max_attempts", "generation", "execution_seq", "slot", "idempotency_key", "concurrency_key",
    "capacity_group", "scheduled_at", "priority", "dispatch_requested_at",
}

-- Serialize keyed claim transitions without blocking an unrelated claimant.
-- The running-row index remains the durable exclusion proof for keys listed in
-- running_keys. Its recheck uses a fresh statement snapshot after the
-- transaction acquires each advisory lock.
type KeyQuery = (string, table?) -> (table[]?, error?)
function claim.reserve_keys(query: KeyQuery, dbtype: string, keys: { string }, running_keys: { string }?): ({ [string]: boolean }?, error?)
    local ordered: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, key in ipairs(keys) do
        if not seen[key] then ordered[#ordered + 1] = key; seen[key] = true end
    end
    table.sort(ordered)
    local held: { [string]: boolean } = {}
    if dbtype ~= sql.type.POSTGRES then
        for _, key in ipairs(ordered) do held[key] = true end
        return held, nil
    end
    if #ordered == 0 then return held, nil end
    local values: { string } = {}
    for index in ipairs(ordered) do values[#values + 1] = "($" .. tostring(index) .. "::text)" end
    local rows, lock_err = query("WITH ordered AS MATERIALIZED (SELECT concurrency_key FROM (VALUES "
        .. table.concat(values, ",") .. ") AS keys(concurrency_key) ORDER BY concurrency_key)"
        .. " SELECT concurrency_key, pg_try_advisory_xact_lock(hashtextextended('kickside.core.jobs:concurrency:' || concurrency_key,0)) AS acquired FROM ordered", ordered)
    rows, lock_err = boundary.bounded_rows(rows, lock_err, "claim key reservation failed", "keys", #ordered, #ordered, response_error)
    if lock_err then return nil, lock_err end
    local acquired: { string } = {}
    local observed: { [string]: boolean } = {}
    for _, row in ipairs(rows) do
        local key = row.concurrency_key
        if type(key) ~= "string" or not seen[key] or observed[key] then return nil, response_error("keys.concurrency_key") end
        if row.acquired ~= true and row.acquired ~= false and row.acquired ~= 1 and row.acquired ~= 0 then
            return nil, response_error("keys.acquired")
        end
        observed[key] = true
        if row.acquired == true or row.acquired == 1 then held[key] = true; acquired[#acquired + 1] = key end
    end
    for _, key in ipairs(ordered) do
        if not observed[key] then return nil, response_error("keys.concurrency_key") end
    end
    local running_set: { [string]: boolean } = {}
    if running_keys == nil then
        for key in pairs(seen) do running_set[key] = true end
    else
        for _, key in ipairs(running_keys) do
            if not seen[key] then return nil, response_error("keys.running_key") end
            running_set[key] = true
        end
    end
    local checked: { string } = {}
    for _, key in ipairs(acquired) do
        if running_set[key] then checked[#checked + 1] = key end
    end
    if #checked == 0 then return held, nil end
    local marks: { string } = {}
    for index in ipairs(checked) do marks[#marks + 1] = "$" .. tostring(index) end
    local running, read_err = query("SELECT concurrency_key FROM kickside_job WHERE status='running' AND concurrency_key IN ("
        .. table.concat(marks, ",") .. ")", checked)
    running, read_err = boundary.bounded_rows(running, read_err, "claim reserved key recheck failed", "keys.running", 0, nil, response_error)
    if read_err then return nil, read_err end
    local acquired_set: { [string]: boolean } = {}
    for _, key in ipairs(checked) do acquired_set[key] = true end
    for _, row in ipairs(running) do
        if type(row.concurrency_key) ~= "string" or not acquired_set[row.concurrency_key] then
            return nil, response_error("keys.running.concurrency_key")
        end
        held[row.concurrency_key] = nil
    end
    return held, nil
end

local function available_concurrency_key(running_status: string): string
    return "(concurrency_key IS NULL OR (capacity_group IS NULL AND NOT EXISTS (SELECT 1 FROM kickside_job running"
        .. " WHERE running.status=" .. running_status .. " AND running.concurrency_key=kickside_job.concurrency_key))"
        .. " OR (capacity_group IS NOT NULL AND NOT EXISTS (SELECT 1 FROM kickside_job running"
        .. " WHERE running.status=" .. running_status .. " AND running.capacity_group IS NULL"
        .. " AND running.concurrency_key=kickside_job.concurrency_key)))"
end

-- Lease one pending row inside tx and return the counters the row now holds.
-- The new execution sequence follows both the row's own counter and every run
-- recorded for the job, so a claim can never reuse a recorded execution, and
-- the run history starts from the value this statement wrote. Returns nil when
-- the row is no longer pending.
function claim.lease_row(tx: sql.Transaction, dbtype: string, id: string, token: string,
        lease_until: string, now: string): (table?, error?)
    local greatest = dbtype == sql.type.POSTGRES and "GREATEST" or "MAX"
    local rows, err = tx:query("UPDATE kickside_job SET status=$1, attempts=attempts+1, execution_seq="
        .. greatest .. "(execution_seq, COALESCE((SELECT MAX(r.execution_seq) FROM kickside_job_run r"
        .. " WHERE r.job_id=kickside_job.id), 0)) + 1, lease_token=$2, lease_until=$3, heartbeat_at=$4,"
        .. " wake_demand_at=NULL WHERE id=$5 AND status=$6"
        .. " AND " .. available_concurrency_key("$1") .. " RETURNING attempts, execution_seq",
        { job_types.JOB_STATE.RUNNING, token, lease_until, now, id, job_types.JOB_STATE.PENDING })
    rows, err = boundary.bounded_rows(rows, err, "claim lease failed", "lease", 0, 1, response_error)
    if err then return nil, err end
    local row = rows[1]
    if not row then return nil, nil end
    local attempts, attempts_err = boundary.number_value(row.attempts, "lease.attempts", 1, true, false, response_error)
    if attempts_err then return nil, attempts_err end
    local sequence, sequence_err = boundary.number_value(row.execution_seq, "lease.execution_seq", 1, true, false, response_error)
    if sequence_err then return nil, sequence_err end
    return { attempts = attempts, execution_seq = sequence }, nil
end

local function select_next_pending(tx: sql.Transaction, dbtype: string, now: string, lock_suffix: string): (table?, error?)
    local query = sql.builder.select(table.unpack(SELECT_COLS))
        :from("kickside_job")
        :where(sql.builder.eq({ status = job_types.JOB_STATE.PENDING }))
        :where(sql.builder.lte({ scheduled_at = now }))
        :where(available_concurrency_key("'running'"))
        :order_by(ORDER_SQL)
        :limit(1)
    if lock_suffix ~= "" then query = query:suffix(lock_suffix) end
    local rows, err = query:run_with(tx):query()
    rows, err = job_rows(rows, err, "claim select failed", "selected", 1, false)
    if err then return nil, err end
    if #rows == 0 then return nil, nil end
    return rows[1] :: table, nil
end

-- Legacy single claims retain their existing one-row path. Capacity-declared
-- rows re-enter the shared batch path, which reserves their group resources.
function claim.claim_job(db: sql.DB, dbtype: string): (table?, error?)
    local policy, policy_err = read_policy()
    if policy_err then return nil, policy_err end
    local lease_seconds = (policy :: any).lease_timeout_seconds
    local now = lifecycle.now_string(dbtype)
    local lock_suffix = dbtype == sql.type.POSTGRES and "FOR UPDATE SKIP LOCKED" or ""
    local tx, tx_err = boundary.begin(db, "claim begin failed", "transaction", response_error)
    if tx_err then return nil, tx_err end
    local job, select_err = select_next_pending(tx, dbtype, now, lock_suffix)
    if select_err then return nil, boundary.rollback(tx, select_err, "claim rollback failed") end
    if not job then
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "claim commit failed") end
        return nil, nil
    end
    local descriptor, descriptor_err = capacity.group(job)
    if descriptor_err then return nil, boundary.rollback(tx, descriptor_err, "claim rollback failed") end
    if descriptor then
        local rollback_err = boundary.rollback(tx, nil, "claim rollback failed")
        if rollback_err then return nil, rollback_err end
        local claimed, batch_err = claim.claim_batch(db, dbtype, 1)
        if batch_err then return nil, batch_err end
        return claimed and claimed[1] or nil, nil
    end
    if type(job.concurrency_key) == "string" then
        local held, key_err = claim.reserve_keys(function(statement: string, params: table?): (table[]?, error?) return tx:query(statement, params) end, dbtype, { job.concurrency_key })
        if key_err then return nil, boundary.rollback(tx, key_err, "claim rollback failed") end
        if not held[job.concurrency_key] then return nil, boundary.rollback(tx, nil, "claim rollback failed") end
    end
    local lease_token = uuid.v7()
    local lease_until = lifecycle.future_string(dbtype, lease_seconds)
    local size_err = row_bytes.check_update(tx, "kickside_job", job.id, function(row)
        local attempts, sequence = tonumber(row.attempts), tonumber(row.execution_seq)
        if not attempts or not sequence then return nil, (errors.new({ message = "invalid claim counters", kind = errors.INTERNAL }) :: error) end
        return { status = job_types.JOB_STATE.RUNNING, attempts = attempts + 1, execution_seq = sequence + 1,
            lease_token = lease_token, lease_until = lease_until, heartbeat_at = now, wake_demand_at = row_bytes.NULL }
    end, (policy :: any).max_row_bytes, "claim_job")
    if size_err then return nil, boundary.rollback(tx, size_err, "claim rollback failed") end
    local leased, update_err = claim.lease_row(tx, dbtype, tostring(job.id), lease_token, lease_until, now)
    if update_err then return nil, boundary.rollback(tx, errors.wrap(update_err, "claim update failed"), "claim rollback failed") end
    if not leased then return nil, boundary.rollback(tx, nil, "claim rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "claim commit failed") end
    job.wake_demand_at = nil
    job.lease_token = lease_token
    job.lease_until = lease_until
    job.attempts = leased.attempts
    job.execution_seq = leased.execution_seq
    return job, nil
end

-- Due pending work a claim can take now: rows whose concurrency key a running
-- row holds wait by design and are excluded. Returns { count, oldest_age_ms,
-- overdue } where overdue counts rows due longer than grace_seconds.
-- at fixes the observation to a claim cutoff; absent at uses the database clock.
function claim.due_backlog(db: sql.DB, dbtype: string, grace_seconds: integer, at: string?): (table?, error?)
    local now = at and (dbtype == sql.type.POSTGRES and "CAST($1 AS TIMESTAMPTZ)" or "$1")
        or (dbtype == sql.type.POSTGRES and "NOW()" or "datetime('now')")
    local grace = at and "$2" or "$1"
    local sqlite_age = "(julianday(" .. (at and now or "'now'") .. ") - julianday(MIN(scheduled_at))) * 86400000"
    if at then sqlite_age = "ROUND(" .. sqlite_age .. ")" end
    local statement = dbtype == sql.type.POSTGRES
        and "SELECT COUNT(*) AS n, EXTRACT(EPOCH FROM (" .. now .. " - MIN(scheduled_at))) * 1000 AS age_ms,"
            .. " COALESCE(SUM(CASE WHEN scheduled_at <= " .. now .. " - (" .. grace .. " * INTERVAL '1 second') THEN 1 ELSE 0 END), 0) AS overdue"
        or "SELECT COUNT(*) AS n, " .. sqlite_age .. " AS age_ms,"
            .. " COALESCE(SUM(CASE WHEN scheduled_at <= datetime(" .. now .. ", '-' || " .. grace .. " || ' seconds') || substr(" .. now .. ", 20) THEN 1 ELSE 0 END), 0) AS overdue"
    local params: { any } = { grace_seconds }
    if at then params = { at, grace_seconds } end
    local rows, err = db:query(statement .. " FROM kickside_job WHERE status = 'pending' AND scheduled_at <= " .. now
        .. [[ AND (concurrency_key IS NULL OR NOT EXISTS
        (SELECT 1 FROM kickside_job running WHERE running.status = 'running'
            AND running.concurrency_key = kickside_job.concurrency_key))]], params)
    if err then return nil, errors.wrap(err, "due backlog query failed") end
    rows, err = boundary.bounded_rows(rows, nil, "due backlog query failed", "backlog", 1, 1, response_error)
    if err then return nil, err end
    local row = rows[1]
    local count, count_err = boundary.number_value(row.n, "backlog.n", 0, true, false, response_error)
    if count_err then return nil, count_err end
    local overdue, overdue_err = boundary.number_value(row.overdue, "backlog.overdue", 0, true, false, response_error)
    if overdue_err then return nil, overdue_err end
    local age, age_err = boundary.number_value(row.age_ms, "backlog.age_ms", nil, false, true, response_error)
    if age_err then return nil, age_err end
    return {count = count, overdue = overdue, oldest_age_ms = math.max(0, math.floor(age))}, nil
end

local TIER_ORDER = cfg.FAIRNESS_TIERS

type Reservation = { awaited_types: { string }, general_capacity: integer, tier_step: integer }

local function candidate_rows(db: sql.DB, now: string, n: integer,
        job_type_set: { string }?, reservation: Reservation?): (table[]?, error?)
    local limit = n * 4
    local params: { any } = {}
    local function bind(value: any): string
        params[#params + 1] = value
        return "$" .. tostring(#params)
    end
    local queries: { string } = {}
    local function scope(types: { string }?, exclude: boolean, label: string, requested: boolean?): ()
        for index, tier in ipairs(TIER_ORDER) do
            local where = "status='pending' AND queue_tier=" .. bind(tier)
                .. " AND scheduled_at IS NOT NULL AND scheduled_at <= " .. bind(now)
            if types and #types > 0 then
                local marks: { string } = {}
                for _, job_type in ipairs(types) do marks[#marks + 1] = bind(job_type) end
                where = where .. " AND job_type " .. (exclude and "NOT IN" or "IN")
                    .. " (" .. table.concat(marks, ",") .. ")"
            end
            if requested then where = where .. " AND dispatch_requested_at IS NOT NULL" end
            local order = requested and "dispatch_requested_at ASC, id ASC"
                or "scheduled_at ASC, priority DESC, concurrency_key ASC, id ASC"
            queries[#queries + 1] = "SELECT * FROM (SELECT " .. table.concat(SELECT_COLS, ",")
                .. " FROM kickside_job WHERE " .. where
                .. " AND " .. available_concurrency_key("'running'")
                .. " ORDER BY " .. order .. " LIMIT " .. bind(limit)
                .. ") AS " .. label .. tostring(index)
        end
    end
    local function read(): (table[]?, error?)
        if #queries == 0 then return {}, nil end
        local rows, err = db:query("SELECT * FROM (" .. table.concat(queries, " UNION ALL ")
            .. ") AS candidates ORDER BY queue_tier ASC, scheduled_at ASC, priority DESC, concurrency_key ASC, id ASC", params)
        return job_rows(rows, err, "claim batch candidates failed", "candidates", nil, true)
    end
    if not reservation then
        scope(job_type_set, false, "tier_")
        return read()
    end
    if #reservation.awaited_types > 0 then
        scope(reservation.awaited_types, false, "requested_", true)
        scope(reservation.awaited_types, false, "awaited_")
    end
    local awaited, awaited_err = read()
    if awaited_err then return nil, awaited_err end
    local unique: { [string]: boolean } = {}
    local capacity = 0
    for _, row in ipairs(awaited :: table[]) do
        local key = type(row.concurrency_key) == "string" and "key:" .. row.concurrency_key or "id:" .. tostring(row.id)
        if not unique[key] then unique[key] = true; capacity = capacity + 1 end
    end
    -- Avoid walking excluded types when awaited candidates fill the dispatch.
    if capacity >= n or reservation.general_capacity == 0 then return awaited, nil end
    queries, params = {}, {}
    scope(reservation.awaited_types, true, "general_")
    local general, general_err = read()
    if general_err then return nil, general_err end
    for _, row in ipairs(general :: table[]) do awaited[#awaited + 1] = row end
    return awaited :: table[], nil
end

function claim.lock_candidates(tx: sql.Transaction, dbtype: string, ids: { string }, now: string): (table[]?, error?)
    if #ids == 0 then return {}, nil end
    local marks: { string } = {}
    local params: { any } = { now }
    for _, id in ipairs(ids) do
        params[#params + 1] = id
        marks[#marks + 1] = "$" .. tostring(#params)
    end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE SKIP LOCKED" or ""
    local rows, err = tx:query([[SELECT * FROM kickside_job
        WHERE status='pending' AND scheduled_at IS NOT NULL AND scheduled_at <= $1
        AND ]] .. available_concurrency_key("'running'") .. [[
        AND id IN (]] .. table.concat(marks, ",") .. ") ORDER BY id ASC" .. suffix, params)
    return job_rows(rows, err, "claim job lock failed", "locked", #ids, false)
end

type CapacityState = { descriptor: table, global_limit: integer, concurrency_key_limit: integer,
    running: integer, running_keys: { [string]: integer } }

local function converge_capacity_group(tx: sql.Transaction, job: table, descriptor: table,
        max_row_bytes: integer): error?
    if job.capacity_group == descriptor.group then return nil end
    if job.capacity_group ~= nil then return response_error("capacity_group") end
    local size_err = row_bytes.check_update(tx, "kickside_job", job.id,
        { capacity_group = descriptor.group }, max_row_bytes, "claim_capacity")
    if size_err then return size_err end
    local updated, update_err = sql.builder.update("kickside_job"):set("capacity_group", descriptor.group)
        :where(sql.builder.eq({ id = job.id })):where("capacity_group IS NULL"):run_with(tx):exec()
    local count, count_err = boundary.single_row_count(updated, update_err,
        "claim capacity admission update failed", "capacity_group.rows_affected", response_error)
    if count_err then return count_err end
    if count ~= 1 then return response_error("capacity_group.rows_affected") end
    job.capacity_group = descriptor.group
    return nil
end

local function capacity_states(tx: sql.Transaction, rows: table[], max_row_bytes: integer): ({ [string]: CapacityState }?, error?)
    local states: { [string]: CapacityState } = {}
    for _, job in ipairs(rows) do
        local descriptor, descriptor_err = capacity.group(job)
        if descriptor_err then return nil, descriptor_err end
        if descriptor then
            local converge_err = converge_capacity_group(tx, job, descriptor, max_row_bytes)
            if converge_err then return nil, converge_err end
            local group = descriptor.group
            local state = states[group]
            if not state then
                local limits, limits_err = capacity.limits(descriptor)
                if limits_err or not limits then return nil, limits_err end
                state = { descriptor = descriptor, global_limit = limits.global_limit,
                    concurrency_key_limit = limits.concurrency_key_limit, running = 0, running_keys = {} }
                states[group] = state
            end
            (job :: any).capacity = state
        end
    end
    return states, nil
end

local function capacity_lock(group: string, key: string?): string
    local group_part = tostring(#group) .. ":" .. group
    if key == nil then return "\1capacity-group:" .. group_part end
    return "\1capacity-key:" .. group_part .. ":" .. tostring(#key) .. ":" .. key
end

local function running_capacity(tx: sql.Transaction, states: { [string]: CapacityState }): error?
    local groups: { string } = {}
    for group in pairs(states) do groups[#groups + 1] = group end
    if #groups == 0 then return nil end
    table.sort(groups)
    local marks: { string } = {}
    for index in ipairs(groups) do marks[#marks + 1] = "$" .. tostring(index) end
    local rows, query_err = tx:query("SELECT capacity_group,concurrency_key,COUNT(*) AS n FROM kickside_job"
        .. " WHERE status='running' AND capacity_group IN (" .. table.concat(marks, ",") .. ")"
        .. " GROUP BY capacity_group,concurrency_key", groups)
    rows, query_err = boundary.bounded_rows(rows, query_err, "claim capacity count failed", "capacity", 0, nil, response_error)
    if query_err then return query_err end
    for _, row in ipairs(rows or {}) do
        local group, key = row.capacity_group, row.concurrency_key
        local state = type(group) == "string" and states[group] or nil
        local count, count_err = boundary.number_value(row.n, "capacity.n", 1, true, false, response_error)
        if count_err then return count_err end
        if not state or type(key) ~= "string" then return response_error("capacity.group") end
        state.running = state.running + (count :: integer)
        state.running_keys[key] = (state.running_keys[key] or 0) + (count :: integer)
    end
    return nil
end

-- A row that cannot be leased is refused alone: the fourth result lists each
-- refused row as { id, execution_seq, error } while the rest of the batch
-- commits.
-- Candidate rows are selected by tier and FIFO age. Running-key entries are
-- reserved in global key order; PostgreSQL skips another claimant's keys before
-- updates, and SQLite keyed collisions roll back only their savepoint.
-- job_type_set, when given, restricts the claim to those job types (the pool's
-- awaited slots); an empty set claims nothing.
-- The fifth result is the timestamp bound in the candidate and lock queries.
function claim.claim_batch(db: sql.DB, dbtype: string, requested: integer?, preferred_tier: string?, requested_shares: table?,
        worker_id: any?, job_type_set: { string }?, reservation: Reservation?): (table[]?, error?, integer?, { table }?, string?)
    if job_type_set and #job_type_set == 0 then return {}, nil end
    if reservation and (job_type_set ~= nil or reservation.general_capacity < 0
        or reservation.general_capacity % 1 ~= 0 or reservation.tier_step < 0
        or reservation.tier_step % 1 ~= 0) then
        return nil, (errors.new({ message = "invalid claim capacity reservation", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = read_policy()
    if policy_err then return nil, policy_err end
    local lease_seconds = (policy :: any).lease_timeout_seconds
    local requested_n = tonumber(requested) or (policy :: any).worker_claim_batch
    if requested_n < 1 or requested_n > (policy :: any).worker_claim_batch
        or requested_n ~= math.floor(requested_n) then
        return nil, (errors.new({ message = "claim batch exceeds worker.claim_batch policy",
            kind = errors.INVALID }) :: error)
    end
    local n = requested_n :: integer
    local worker_ids: { string }? = nil
    if type(worker_id) == "table" then
        if #worker_id ~= n then
            return nil, (errors.new({ message = "worker batch requires one idle worker per claim", kind = errors.INVALID }) :: error)
        end
        worker_ids = worker_id :: { string }
        local seen: { [string]: boolean } = {}
        for i = 1, n do
            local id = worker_ids[i]
            if type(id) ~= "string" or id == "" or seen[id] then
                return nil, (errors.new({ message = "worker batch ids must be distinct nonempty strings", kind = errors.INVALID }) :: error)
            end
            seen[id] = true
        end
    elseif worker_id ~= nil and (type(worker_id) ~= "string" or worker_id == "" or n ~= 1) then
        return nil, (errors.new({ message = "worker claim requires one job and a worker id", kind = errors.INVALID }) :: error)
    end
    local now = lifecycle.now_string(dbtype)
    local rows, read_err = candidate_rows(db, now, n, job_type_set, reservation)
    if read_err then return nil, read_err end
    if #rows == 0 then return {}, nil, nil, nil, now end
    local tx, begin_err = boundary.begin(db, "claim batch begin failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    local candidates: { [string]: table[] } = {}
    for _, tier in ipairs(TIER_ORDER) do candidates[tier] = {} end
    for _, row in ipairs(rows :: table[]) do
        local tier = candidates[tostring(row.queue_tier)]
        tier[#tier + 1] = row
    end

    -- Serialize with thread teardown before taking job locks. A deleting
    -- thread owner cannot admit another run; its pending jobs take the
    -- canonical cancellation path and remain durable evidence for the
    -- Jobs-owned cleanup pages.
    local refused: { table } = {}
    local thread_owners: { [string]: boolean } = {}
    local thread_ids: { string } = {}
    local candidate_ids: { string } = {}
    local by_id: { [string]: table } = {}
    for _, tier in ipairs(TIER_ORDER) do
        for _, job in ipairs(candidates[tier] or {}) do
            local owner = { kind = job.owner_kind, id = job.owner_id }
            local id = tostring(job.id)
            if type(owner.kind) ~= "string" or owner.kind == ""
                or type(owner.id) ~= "string" or owner.id == "" then
                if not by_id[id] then
                    by_id[id] = job
                    refused[#refused + 1] = { id = id, execution_seq = tonumber(job.execution_seq),
                        error = (errors.new({ message = "claimed job has no durable owner locator",
                            kind = errors.INVALID, retryable = false }) :: error) }
                end
            else
                if owner.kind == "thread" and not thread_owners[owner.id] then
                    thread_owners[owner.id] = true
                    thread_ids[#thread_ids + 1] = owner.id
                end
                if not by_id[id] then by_id[id] = job; candidate_ids[#candidate_ids + 1] = id end
            end
        end
    end
    local deleting: { [string]: boolean } = {}
    local fences, fence_err = thread_fence.lock_many(tx, thread_ids)
    if fence_err then return nil, boundary.rollback(tx, fence_err, "claim rollback failed") end
    if type(fences) ~= "table" then return nil, boundary.rollback(tx, response_error("fences"), "claim rollback failed") end
    for thread_id, fence in pairs(fences :: { [string]: table }) do
        if type(fence) ~= "table" or type(fence.started) ~= "boolean" then
            return nil, boundary.rollback(tx, response_error("fences"), "claim rollback failed")
        end
        deleting[thread_id] = fence.started
    end
    table.sort(candidate_ids)
    local available: { [string]: boolean } = {}
    local retained: { [string]: table } = {}
    local locked, lock_err = claim.lock_candidates(tx, dbtype, candidate_ids, now)
    if lock_err then return nil, boundary.rollback(tx, lock_err, "claim rollback failed") end
    for _, job in ipairs(locked :: table[]) do
        local id = tostring(job.id)
        retained[id] = job
        by_id[id] = job
        if job.owner_kind == "thread" and deleting[job.owner_id] then
            local _, cancel_err = lifecycle_cancel.cancel_job_tx(tx, dbtype, { id = id })
            if cancel_err then return nil, boundary.rollback(tx, cancel_err, "claim rollback failed") end
        else
            available[id] = true
        end
    end
    for _, tier in ipairs(TIER_ORDER) do
        local runnable: table[] = {}
        for _, job in ipairs(candidates[tier] or {}) do
            if available[tostring(job.id)] then runnable[#runnable + 1] = by_id[tostring(job.id)] end
        end
        candidates[tier] = runnable
    end

    local capacity_candidates: table[] = {}
    for _, tier in ipairs(TIER_ORDER) do
        for _, job in ipairs(candidates[tier] or {}) do capacity_candidates[#capacity_candidates + 1] = job end
    end
    local capacities, capacities_err = capacity_states(tx, capacity_candidates, (policy :: any).max_row_bytes)
    if capacities_err or not capacities then
        return nil, boundary.rollback(tx, capacities_err, "claim rollback failed")
    end

    local selected: table[] = {}
    local selected_ids: { [string]: boolean } = {}
    local selected_keys: { [string]: boolean } = {}
    -- Every non-null concurrency key dedupes, including the empty string the
    -- running unique index also covers; keyless rows never collide.
    local function add(row: table): boolean
        local id = tostring(row.id)
        local key = row.concurrency_key
        local declared = (row :: any).capacity ~= nil
        if selected_ids[id] or (not declared and type(key) == "string" and selected_keys[key]) then return false end
        selected[#selected + 1] = row
        selected_ids[id] = true
        if not declared and type(key) == "string" then selected_keys[key] = true end
        return true
    end
    local function choose(matches: (table) -> boolean, capacity: integer, shares: table, order: ((table, table) -> boolean)?): ()
        local target = math.min(n, #selected + capacity)
        local eligible: { [string]: table[] } = {}
        for _, tier in ipairs(TIER_ORDER) do
            eligible[tier] = {}
            for _, row in ipairs(candidates[tier] or {}) do
                if matches(row) then eligible[tier][#eligible[tier] + 1] = row end
            end
            if order then table.sort(eligible[tier], order) end
        end
        for _, tier in ipairs(TIER_ORDER) do
            local taken = 0
            for _, row in ipairs(eligible[tier] or {}) do
                if #selected >= target or taken >= shares[tier] then break end
                if add(row) then taken = taken + 1 end
            end
        end
        if #selected < target then
            local spare: table[] = {}
            for _, tier in ipairs(TIER_ORDER) do
                for _, row in ipairs(eligible[tier] or {}) do spare[#spare + 1] = row end
            end
            table.sort(spare, order or function(a, b)
                local at, bt = tostring(a.scheduled_at or ""), tostring(b.scheduled_at or "")
                if at ~= bt then return at < bt end
                return tostring(a.id) < tostring(b.id)
            end)
            for _, row in ipairs(spare) do
                if #selected >= target then break end
                add(row)
            end
        end
    end
    local awaited_set: { [string]: boolean } = {}
    local general_limit = n
    if reservation then
        for _, job_type in ipairs(reservation.awaited_types) do awaited_set[job_type] = true end
        local shares, next_step = cfg.distribute_shares(n, (policy :: any).fairness_shares, reservation.tier_step)
        local requested_shares = cfg.distribute_shares(math.min(n, (policy :: any).worker_awaited_slots),
            (policy :: any).fairness_shares, reservation.tier_step)
        -- Addressed requests use reserved capacity; ordinary slots still advance.
        choose(function(row) return row.dispatch_requested_at ~= nil and awaited_set[tostring(row.job_type)] == true end,
            math.min(n, (policy :: any).worker_awaited_slots), requested_shares, function(a, b)
                local at, bt = tostring(a.dispatch_requested_at), tostring(b.dispatch_requested_at)
                if at ~= bt then return at < bt end
                return tostring(a.id) < tostring(b.id)
            end)
        choose(function(row) return awaited_set[tostring(row.job_type)] == true end, n, shares)
        general_limit = math.min(reservation.general_capacity, n - #selected) :: integer
        local general_shares = cfg.distribute_shares(general_limit, (policy :: any).fairness_shares,
            #selected > 0 and next_step or reservation.tier_step)
        choose(function(row) return awaited_set[tostring(row.job_type)] ~= true end, general_limit, general_shares)
    else
        local shares = requested_shares or cfg.distribute_shares(n, (policy :: any).fairness_shares, 0)
        if n == 1 and (preferred_tier == "live" or preferred_tier == "backfill" or preferred_tier == "maintenance") then
            shares = { live = 0, backfill = 0, maintenance = 0 }
            shares[preferred_tier] = 1
        end
        choose(function() return true end, n, shares)
    end
    table.sort(selected, function(a, b)
        local ak = type(a.concurrency_key) == "string" and a.concurrency_key or "\255"
        local bk = type(b.concurrency_key) == "string" and b.concurrency_key or "\255"
        if ak ~= bk then return ak < bk end
        return tostring(a.id) < tostring(b.id)
    end)

    local keys: { string } = {}
    local resource_keys: { [string]: { string } } = {}
    for _, job in ipairs(selected) do
        local state = (job :: any).capacity
        local job_keys: { string } = {}
        if state then
            local group = ((state :: CapacityState).descriptor :: any).group
            job_keys[#job_keys + 1] = capacity_lock(group, nil)
            job_keys[#job_keys + 1] = capacity_lock(group, tostring(job.concurrency_key))
            -- The ordinary key serializes mixed legacy and capacity claims.
            -- It is not a capacity running-row exclusion, so group members
            -- retain their declared per-key parallelism.
            job_keys[#job_keys + 1] = tostring(job.concurrency_key)
        elseif type(job.concurrency_key) == "string" then
            job_keys[#job_keys + 1] = job.concurrency_key
        end
        resource_keys[tostring(job.id)] = job_keys
        for _, key in ipairs(job_keys) do keys[#keys + 1] = key end
    end
    local legacy_keys: { string } = {}
    for _, job in ipairs(selected) do
        if (job :: any).capacity == nil and type(job.concurrency_key) == "string" then
            legacy_keys[#legacy_keys + 1] = job.concurrency_key
        end
    end
    local held, key_err = claim.reserve_keys(function(statement: string, params: table?): (table[]?, error?) return tx:query(statement, params) end,
        dbtype, keys, legacy_keys)
    if key_err then return nil, boundary.rollback(tx, key_err, "claim rollback failed") end
    local capacity_count_err = running_capacity(tx, capacities)
    if capacity_count_err then return nil, boundary.rollback(tx, capacity_count_err, "claim rollback failed") end
    local reserved: table[] = {}
    for _, job in ipairs(selected) do
        local all_held = true
        for _, key in ipairs(resource_keys[tostring(job.id)] or {}) do
            if not held[key] then all_held = false; break end
        end
        local state = (job :: any).capacity
        if all_held and state then
            local capacity_state = state :: CapacityState
            local key = tostring(job.concurrency_key)
            if capacity_state.running >= capacity_state.global_limit
                or (capacity_state.running_keys[key] or 0) >= capacity_state.concurrency_key_limit then
                all_held = false
            else
                capacity_state.running = capacity_state.running + 1
                capacity_state.running_keys[key] = (capacity_state.running_keys[key] or 0) + 1
            end
        end
        if all_held then reserved[#reserved + 1] = job end
    end
    local claimed: table[] = {}
    -- Each row leases under its own savepoint. A row-scoped refusal (a lost
    -- concurrency-key race, a row over the size limit, run history that cannot
    -- start) rolls back that row alone and is reported; database faults and a
    -- worker marker that contradicts its idle notice end the batch.
    local function savepoint(statement: string): error?
        local result, err = tx:execute(statement)
        if err then return errors.wrap(err, "claim savepoint failed") end
        if type(result) ~= "table" then return response_error("savepoint") end
        local _, count_err = boundary.number_value(result.rows_affected, "savepoint", 0, true, false, response_error)
        return count_err
    end
    for _, job in ipairs(reserved) do
        local save_err = savepoint("SAVEPOINT kickside_claim_row")
        if save_err then return nil, boundary.rollback(tx, save_err, "claim rollback failed") end
        local token = uuid.v7()
        local lease_until = lifecycle.future_string(dbtype, lease_seconds)
        local refusal: error? = row_bytes.check_update(tx, "kickside_job", job.id, function(row)
            local attempts, sequence = tonumber(row.attempts), tonumber(row.execution_seq)
            if not attempts or not sequence then return nil, (errors.new({
                message = "invalid claim counters", kind = errors.INTERNAL }) :: error) end
            return { status = job_types.JOB_STATE.RUNNING,
                attempts = attempts + 1, execution_seq = sequence + 1,
                lease_token = token, lease_until = lease_until, heartbeat_at = now, wake_demand_at = row_bytes.NULL }
        end, (policy :: any).max_row_bytes, "claim_job", retained[tostring(job.id)])
        local leased: table? = nil
        if not refusal then
            local update_err: error? = nil
            leased, update_err = claim.lease_row(tx, dbtype, tostring(job.id), token, lease_until, now)
            if update_err then
                return nil, boundary.rollback(tx, errors.wrap(update_err, "claim batch update failed"), "claim rollback failed")
            end
        end
        if leased then
            job.wake_demand_at = nil
            job.lease_token = token
            job.lease_until = lease_until
            job.attempts = leased.attempts
            job.execution_seq = leased.execution_seq
            local owner_id: string? = worker_ids and worker_ids[#claimed + 1] or worker_id
            if owner_id then
                local marked, mark_err = sql.builder.update("kickside_job_worker")
                    :set("current_job_id", job.id)
                    :where(sql.builder.eq({ id = owner_id }))
                    :where("current_job_id IS NULL")
                    :run_with(tx):exec()
                local marked_count, marked_err = boundary.single_row_count(marked, mark_err, "worker current job failed", "worker.rows_affected", response_error)
                if marked_err then return nil, boundary.rollback(tx, marked_err, "claim rollback failed") end
                if marked_count == 0 then
                    return nil, boundary.rollback(tx, errors.new({message = "worker is not available for another claim",
                        kind = errors.CONFLICT, details = {reason = job_types.CLAIM_REFUSAL.WORKER_MARKER_OCCUPIED}}), "claim rollback failed")
                end
                local started_run, run_err = lifecycle.start_job_run(tx, dbtype, job, owner_id, leased.attempts)
                if run_err then
                    if errors.is(run_err, errors.INTERNAL) then return nil, boundary.rollback(tx, run_err, "claim rollback failed") end
                    refusal = run_err
                else
                    if type(started_run) ~= "table" then return nil, boundary.rollback(tx, response_error("run"), "claim rollback failed") end
                    if type(started_run.id) ~= "string" or started_run.id == "" then
                        return nil, boundary.rollback(tx, response_error("run.id"), "claim rollback failed")
                    end
                    job.run_ctx = started_run
                    job.worker_id = owner_id
                end
            end
        end
        if refusal or not leased then
            local undo_err = savepoint("ROLLBACK TO SAVEPOINT kickside_claim_row")
                or savepoint("RELEASE SAVEPOINT kickside_claim_row")
            if undo_err then return nil, boundary.rollback(tx, undo_err, "claim rollback failed") end
            if refusal then
                refused[#refused + 1] = { id = tostring(job.id), execution_seq = tonumber(job.execution_seq), error = refusal }
            end
        else
            local release_err = savepoint("RELEASE SAVEPOINT kickside_claim_row")
            if release_err then return nil, boundary.rollback(tx, release_err, "claim rollback failed") end
            claimed[#claimed + 1] = job
        end
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "claim batch commit failed") end
    local next_step: integer? = nil
    if reservation then
        next_step = reservation.tier_step
        local awaited_claimed, general_claimed = false, false
        for _, job in ipairs(claimed) do
            if awaited_set[tostring(job.job_type)] then awaited_claimed = true else general_claimed = true end
        end
        if awaited_claimed then
            local _, advanced = cfg.distribute_shares(n, (policy :: any).fairness_shares, next_step)
            next_step = advanced
        end
        if general_claimed then
            local _, advanced = cfg.distribute_shares(general_limit, (policy :: any).fairness_shares, next_step)
            next_step = advanced
        end
    end
    return claimed, nil, next_step, refused, now
end

return claim
