local sql = require("sql")
local clock = require("clock")
local lifecycle = require("lifecycle")
local funcs = require("funcs")
local cfg = require("config")
local row_bytes = require("row_bytes")
local boundary = require("sql_boundary")

local wake = {}
type DialectTransaction = { db_type: (any) -> (string?, error?) }
type WakePlan = { key: string, generation: number, candidates: { table }, extras: { string },
    limit: integer, deferred: boolean?, continuation_id: string?, acknowledged: boolean? }

-- The published demand of one wake key (CONTRACTS jobs.wake_tx).
type WakeResult = { demand_generation: integer, touched_count: integer, continuation_id: string? }
local CONTINUATION_TYPE = "kickside.wake.continuation"
local POOL_NUDGE = "kickside.core.jobs.persist:pool_nudge"
wake.CONTINUATION_TYPE = CONTINUATION_TYPE

local function timestamp_param(dbtype)
    return dbtype == sql.type.POSTGRES and "CAST(? AS TIMESTAMPTZ)" or "?"
end

local function query_error(label: string, err: error): error
    return errors.wrap(err, label)
end

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "wake response is invalid",
        details = {code = "job_wake_response", field = field}})
end

local function read_policy()
    local policy, err = cfg.policy()
    if err then return nil, err end
    if type(policy) ~= "table" then return nil, response_error("policy") end
    return policy, nil
end

local function string_result(value: any, field: string, nullable: boolean): (string?, error?)
    if value == nil and nullable then return nil, nil end
    if type(value) ~= "string" or value == "" then return nil, response_error(field) end
    return value, nil
end

local function job_rows(value: any, err: error?, label: string, field: string, maximum: integer): (table[]?, error?)
    local rows, rows_err = boundary.bounded_rows(value, err, label, field, 0, maximum, response_error)
    if rows_err then return nil, rows_err end
    for _, row in ipairs(rows) do
        local _, id_err = string_result(row.id, field .. ".id", false)
        if id_err then return nil, id_err end
    end
    return rows, nil
end

local function fanout_row(tx, key, lock)
    local query = sql.builder.select("demand_generation", "ack_generation")
        :from("kickside_wake_fanout")
        :where(sql.builder.eq({ key = key }))
        :limit(1)
    if lock then query = query:suffix("FOR UPDATE") end
    local rows, err = query:run_with(tx):query()
    rows, err = boundary.bounded_rows(rows, err, "wake row lookup failed", "fanout", 0, 1, response_error)
    if err then return nil, err end
    return rows[1], nil
end

local function remaining_sql(exclusion: string, key: string, generation: string, limit: string): string
    return "SELECT id FROM kickside_job WHERE wake_key=" .. key .. [[ AND wake_enabled=TRUE
        AND status IN ('pending','running') AND wake_generation<]] .. generation .. exclusion
        .. " ORDER BY id ASC LIMIT " .. limit
end

local function remaining_ids(tx, key, generation, limit)
    local rows, err = tx:query(remaining_sql("", "$1", "$2", "$3"), { key, generation, limit + 1 })
    return job_rows(rows, err, "wake candidates failed", "candidates", limit + 1)
end

-- ORDER BY is applied before PostgreSQL's LockRows node, so this single
-- transport statement acquires the same ascending row locks as the old loop.
local function prelock_sorted(tx, ids: { string }, dbtype: string): ({ [string]: table }?, error?)
    local retained: { [string]: table } = {}
    if #ids == 0 then return retained, nil end
    local placeholders: { string } = {}
    for i = 1, #ids do placeholders[i] = "$" .. tostring(i) end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, lock_err = tx:query("SELECT * FROM kickside_job WHERE id IN ("
        .. table.concat(placeholders, ",") .. ") ORDER BY id ASC" .. suffix, ids)
    rows, lock_err = job_rows(rows, lock_err, "wake job prelock failed", "prelock", #ids)
    if lock_err then return nil, lock_err end
    for _, row in ipairs(rows) do retained[row.id] = row end
    return retained, nil
end

local function sorted_unique(ids: { string }): { string }
    table.sort(ids)
    local out: { string } = {}
    local previous = ""
    for _, id in ipairs(ids) do
        if id ~= previous then out[#out + 1] = id; previous = id end
    end
    return out
end

-- Recheck eligibility under the row lock. Updates remain in ascending ID
-- order across keys; the prelock is the batched transport optimization.
local function apply_update(tx, id: string, key: string, generation: number, dbtype, now: string, ts: string, snapshot: table): (integer, error?)
    local policy, policy_err = read_policy()
    if policy_err then return 0, policy_err end
    local size_err = row_bytes.check_update(tx, "kickside_job", id, function(row)
        return { wake_generation = generation,
            scheduled_at = row.status == "pending" and row.scheduled_at == nil and now
                or (row.scheduled_at or row_bytes.NULL),
            wake_demand_at = (row.status == "running" or row.scheduled_at ~= nil)
                and now or (row.wake_demand_at or row_bytes.NULL) }
    end, (policy :: any).max_row_bytes, "wake_job", snapshot)
    if size_err then return 0, size_err end
    local result, err = sql.builder.update("kickside_job")
        :set("wake_generation", generation)
        :set("scheduled_at", sql.builder.expr("CASE WHEN status = 'pending' AND scheduled_at IS NULL THEN " .. ts .. " ELSE scheduled_at END", now))
        :set("wake_demand_at", sql.builder.expr("CASE WHEN status = 'running' OR scheduled_at IS NOT NULL THEN " .. ts .. " ELSE wake_demand_at END", now))
        :where(sql.builder.eq({ id = id, wake_key = key, wake_enabled = true }))
        :where("status IN ('pending','running') AND wake_generation < ?", generation)
        :run_with(tx):exec()
    local count, count_err = boundary.single_row_count(result, err, "wake job update failed", "update.rows_affected", response_error)
    if count_err then return 0, count_err end
    return count :: integer, nil
end

local function apply_batch(tx, key, generation, rows, dbtype, limit: integer, extra_ids: { string }?)
    local now = clock.now(dbtype)
    local ts = timestamp_param(dbtype)
    local count = 0
    local ids: { string } = {}
    for index = 1, math.min(#rows, limit) do ids[#ids + 1] = tostring(rows[index].id) end
    local lock_ids: { string } = {}
    for _, id in ipairs(ids) do lock_ids[#lock_ids + 1] = id end
    for _, id in ipairs(extra_ids or {}) do lock_ids[#lock_ids + 1] = tostring(id) end
    local retained, lock_err = prelock_sorted(tx, sorted_unique(lock_ids), dbtype)
    if lock_err then return 0, lock_err end
    for _, id in ipairs(ids) do
        local snapshot = retained[id]
        if snapshot then
            local updated, err = apply_update(tx, id, key, generation, dbtype, now, ts, snapshot)
            if err then return 0, err end
            count = count + updated
        end
    end
    return count, nil
end

local function discover_tx(tx, key: string, generation: number, limit: integer, dbtype: string): (table[]?, string?, boolean?, error?)
    local identity, identity_err = lifecycle.identity_parts({
        job_identity = { namespace = "wake", scope = key, key = "continuation" },
    }, "")
    if identity_err then return nil, nil, nil, identity_err end
    identity, identity_err = string_result(identity, "identity", false)
    if identity_err then return nil, nil, nil, identity_err end
    -- The demand upsert holds the wake-row lock. This later statement sees
    -- committed continuation state and acknowledges only an empty target set.
    local statement = [[WITH input AS (SELECT CAST($1 AS TEXT) AS wake_key,
        CAST($2 AS BIGINT) AS generation,CAST($3 AS INTEGER) AS page_limit,CAST($4 AS TEXT) AS identity),
        continuation AS (SELECT id FROM kickside_job WHERE job_identity=(SELECT identity FROM input) AND status IN ('pending','running') LIMIT 1),
        candidates AS (]] .. remaining_sql(" AND NOT EXISTS (SELECT 1 FROM continuation)", "(SELECT wake_key FROM input)",
            "(SELECT generation FROM input)", "(SELECT page_limit FROM input)") .. ")"
    local proof = "FALSE"
    if dbtype == sql.type.POSTGRES then
        statement = statement .. [[, acknowledged AS (UPDATE kickside_wake_fanout SET ack_generation=$2
            WHERE key=$1 AND demand_generation=$2 AND NOT EXISTS (SELECT 1 FROM continuation)
            AND NOT EXISTS (SELECT 1 FROM candidates) RETURNING key)]]
        proof = "EXISTS (SELECT 1 FROM acknowledged)"
    end
    local rows, read_err = tx:query(statement .. " SELECT candidates.id,continuation.id AS continuation_id,"
        .. proof .. " AS acknowledged FROM (SELECT 1) AS root LEFT JOIN continuation ON TRUE LEFT JOIN candidates ON TRUE",
        { key, generation, limit + 1, identity })
    rows, read_err = boundary.bounded_rows(rows, read_err, "wake fanout discovery failed", "discovery", 1, limit + 1, response_error)
    if read_err then return nil, nil, nil, read_err end
    local candidates: table[] = {}
    for _, row in ipairs(rows) do
        local id, id_err = string_result(row.id, "discovery.id", true)
        if id_err then return nil, nil, nil, id_err end
        local _, continuation_err = string_result(row.continuation_id, "discovery.continuation_id", true)
        if continuation_err then return nil, nil, nil, continuation_err end
        if row.acknowledged ~= true and row.acknowledged ~= false and row.acknowledged ~= 0 and row.acknowledged ~= 1 then
            return nil, nil, nil, response_error("discovery.acknowledged")
        end
        if id then candidates[#candidates + 1] = {id = id} end
    end
    return candidates, rows[1].continuation_id, rows[1].acknowledged == true or rows[1].acknowledged == 1, nil
end

local function acknowledge(tx, key, generation)
    local result, err = tx:execute("UPDATE kickside_wake_fanout SET ack_generation=$1 WHERE key=$2 AND demand_generation=$1", { generation, key })
    local _, count_err = boundary.single_row_count(result, err, "wake acknowledgment failed", "ack.rows_affected", response_error)
    return count_err
end

local function ensure_continuation(tx, key, dbtype)
    local id, err = lifecycle.enqueue_job(tx, dbtype, {
        job_identity = { namespace = "wake", scope = key, key = "continuation" },
        owner_locator = { kind = "installation", id = "kickside.core.jobs" },
        job_type = CONTINUATION_TYPE,
        queue_tier = "maintenance",
        payload = { wake_key = key },
    })
    if err then return nil, err end
    return string_result(id, "continuation.id", false)
end

-- Prepare one wake key: publish demand on its fanout row and collect the
-- woken job targets. The caller prepares keys in ascending key order so the
-- transaction acquires wake rows before any job row.
local function prepare_tx(tx, key: string, dbtype: string, completion_job_id: string?): (WakePlan?, error?)
    local policy, policy_err = read_policy()
    if policy_err or not policy then return nil, policy_err end
    local fanout_limit = policy.wake_fanout_batch
    -- The upsert both serializes this key and returns its durable generation.
    -- Separate insert, update and read statements held the append's thread
    -- lock across two avoidable client round trips on every event.
    local rows, demand_err = tx:query([[INSERT INTO kickside_wake_fanout
        (key,demand_generation,ack_generation) VALUES($1,1,0)
        ON CONFLICT(key) DO UPDATE
        SET demand_generation = kickside_wake_fanout.demand_generation + 1
        RETURNING demand_generation]], { key })
    rows, demand_err = boundary.bounded_rows(rows, demand_err, "wake demand publication failed", "demand", 1, 1, response_error)
    if demand_err then return nil, demand_err end
    local generation, generation_err = boundary.number_value(rows[1].demand_generation, "demand.demand_generation", 0, true, false, response_error)
    if generation_err then return nil, generation_err end
    -- A queued/running continuation already owns this key. The wake row lock
    -- serializes its final acknowledgment with this increment, so it must
    -- observe the new generation before it can finish.
    local candidates, continuation_id, acknowledged, discovery_err = discover_tx(tx, key, generation, fanout_limit, dbtype)
    if discovery_err then return nil, discovery_err end
    local extras: { string } = {}
    if completion_job_id then extras[#extras + 1] = tostring(completion_job_id) end
    if continuation_id then
        -- An existing continuation defers fan-out and is not updated here.
        -- The wake-row lock orders its acknowledgment with this generation;
        -- prelocking the unchanged job row only prolongs the append lock.
        return ({ key = key, generation = generation, candidates = {}, extras = extras,
            limit = fanout_limit, deferred = true, continuation_id = tostring(continuation_id) } :: WakePlan), nil
    end
    return ({ key = key, generation = generation, candidates = candidates, extras = extras,
        limit = fanout_limit, acknowledged = acknowledged } :: WakePlan), nil
end

-- Apply prepared wake plans: prelock every target job id once in ascending
-- id order across all keys, then update the woken rows in that same order
-- with eligibility rechecked per row, then acknowledge each key or queue its
-- continuation. Lock-only extras (a completing job, a continuation row) take
-- no update. Returns each key's published demand.
local function apply_plans(tx, plans: { WakePlan }, dbtype: string): ({ [string]: WakeResult }?, error?)
    local now = clock.now(dbtype)
    local ts = timestamp_param(dbtype)
    local all_ids: { string } = {}
    local owner: { [string]: WakePlan } = {}
    local results: { [string]: WakeResult } = {}
    for _, plan in ipairs(plans) do
        results[plan.key] = { demand_generation = math.floor(plan.generation) :: integer, touched_count = 0 }
        for index = 1, math.min(#plan.candidates, plan.limit) do
            local id = tostring(plan.candidates[index].id)
            all_ids[#all_ids + 1] = id
            if not owner[id] then owner[id] = plan end
        end
        for _, id in ipairs(plan.extras) do all_ids[#all_ids + 1] = tostring(id) end
    end
    local ordered = sorted_unique(all_ids)
    local retained, lock_err = prelock_sorted(tx, ordered, dbtype)
    if lock_err then return nil, lock_err end
    for _, id in ipairs(ordered) do
        local plan = owner[id]
        local snapshot = retained[id]
        if plan and snapshot then
            local updated, err = apply_update(tx, id, plan.key, plan.generation, dbtype, now, ts, snapshot)
            if err then return nil, err end
            local result = results[plan.key]
            if not result then return nil, response_error("result") end
            result.touched_count = result.touched_count + updated
        end
    end
    for _, plan in ipairs(plans) do
        if plan.deferred then
            results[plan.key].continuation_id = plan.continuation_id
        elseif #plan.candidates > plan.limit then
            local continuation_id, continuation_err = ensure_continuation(tx, plan.key, dbtype)
            if continuation_err then return nil, continuation_err end
            results[plan.key].continuation_id = tostring(continuation_id)
        elseif not plan.acknowledged then
            local ack_err = acknowledge(tx, plan.key, plan.generation)
            if ack_err then return nil, ack_err end
        end
    end
    return results, nil
end

local function resolve_dbtype(tx, dbtype)
    if dbtype ~= nil then return dbtype, nil end
    local executor = tx :: DialectTransaction
    local tx_type, type_err = executor.db_type(tx)
    if type_err then return nil, query_error("wake transaction dialect failed", type_err) end
    if tx_type ~= sql.type.SQLITE and tx_type ~= sql.type.POSTGRES then return nil, response_error("dialect") end
    return tx_type, nil
end

-- wake_tx publishes demand for one key inside the caller's transaction and
-- returns { demand_generation, touched_count, continuation_id? }.
function wake.wake_tx(tx, key, dbtype, completion_job_id)
    if type(key) ~= "string" or key == "" then
        return nil, (errors.new({ message = "wake key is required", kind = errors.INVALID }) :: error)
    end
    local dialect, dialect_err = resolve_dbtype(tx, dbtype)
    if dialect_err then return nil, dialect_err end
    if type(dialect) ~= "string" then return nil, response_error("dialect") end
    local plan, prepare_err = prepare_tx(tx, key, dialect, completion_job_id)
    if prepare_err then return nil, prepare_err end
    local results, apply_err = apply_plans(tx, { plan :: WakePlan }, dialect)
    if apply_err or not results then return nil, apply_err end
    return results[key], nil
end

-- Wake several keys in one transaction under the global lock order: wake
-- rows in ascending key order, then all target job rows in ascending id
-- order. Returns each key's published demand. Multi-thread append collects its keys here instead of waking each
-- thread inline, which would interleave wake and job locks per thread.
function wake.wake_multi(tx, keys: { string }, dbtype: string?): ({ [string]: WakeResult }?, error?)
    local dialect, dialect_err = resolve_dbtype(tx, dbtype)
    if dialect_err then return nil, dialect_err end
    if type(dialect) ~= "string" then return nil, response_error("dialect") end
    local ordered: { string } = {}
    for _, key in ipairs(keys) do
        if type(key) ~= "string" or key == "" then
            return nil, (errors.new({ message = "wake key is required", kind = errors.INVALID }) :: error)
        end
        ordered[#ordered + 1] = key :: string
    end
    table.sort(ordered)
    local plans: { WakePlan } = {}
    for _, key in ipairs(ordered) do
        local plan, prepare_err = prepare_tx(tx, key, dialect, nil)
        if prepare_err then return nil, prepare_err end
        plans[#plans + 1] = plan :: WakePlan
    end
    return apply_plans(tx, plans, dialect)
end

function wake.continue_job(db: sql.DB, dbtype: string, job: table)
    local payload, decode_err = lifecycle.decode_payload(job.payload)
    if decode_err then return nil, decode_err end
    if type(payload) ~= "table" then return nil, response_error("payload") end
    local key = payload.wake_key
    if type(key) ~= "string" or key == "" then
        return nil, (errors.new({ message = "wake continuation has no key", kind = errors.INVALID }) :: error)
    end
    local tx, begin_err = boundary.begin(db, "wake continuation begin failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    local row, row_err = fanout_row(tx, key, dbtype == sql.type.POSTGRES)
    if row_err or not row then
        return nil, boundary.rollback(tx, row_err or response_error("fanout"), "wake continuation rollback failed")
    end
    local generation, generation_err = boundary.number_value(row.demand_generation, "fanout.demand_generation", 0, true, false, response_error)
    if generation_err then return nil, boundary.rollback(tx, generation_err, "wake continuation rollback failed") end
    local policy, policy_err = read_policy()
    if policy_err or not policy then return nil, boundary.rollback(tx, policy_err, "wake continuation rollback failed") end
    local fanout_limit = policy.wake_fanout_batch
    local candidates, candidate_err = remaining_ids(tx, key, generation, fanout_limit)
    if candidate_err then return nil, boundary.rollback(tx, candidate_err, "wake continuation rollback failed") end
    local count, apply_err = apply_batch(tx, key, generation, candidates, dbtype, fanout_limit, { tostring(job.id) })
    if apply_err then return nil, boundary.rollback(tx, apply_err, "wake continuation rollback failed") end
    if #candidates <= fanout_limit then
        local ack_err = acknowledge(tx, key, generation)
        if ack_err then return nil, boundary.rollback(tx, ack_err, "wake continuation rollback failed") end
    end
    local opts = #candidates > fanout_limit and { next_run_at = clock.now(dbtype) } or { terminal = true }
    local complete_err = lifecycle.complete_tx(tx, job, dbtype, opts)
    if complete_err then return nil, boundary.rollback(tx, complete_err, "wake continuation rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return nil, query_error("wake continuation commit failed", commit_err) end
    return { self_completed = true, woken = count }, nil
end

-- wake_job wakes one job by id (CONTRACTS jobs.wake_job) and returns
-- { woken, scheduled_at? }; an inactive or missing job is not woken.
local function wake_job_tx(db, id, opts, dbtype)
    local now = clock.now(dbtype)
    local ts = timestamp_param(dbtype)
    local policy, policy_err = read_policy()
    if policy_err then return nil, policy_err end
    local control = type(opts) == "table" and opts.control == true
    local size_err = row_bytes.check_update(db, "kickside_job", id, function(row)
        if control then
            return { wake_control_pending = row.status == "running",
                wake_enabled = true, attempts = row.status == "pending" and 0 or row.attempts,
                scheduled_at = row.status == "pending" and now or (row.scheduled_at or row_bytes.NULL) }
        end
        return { wake_demand_at = now,
            scheduled_at = row.status == "pending" and row.scheduled_at == nil and now
                or (row.scheduled_at or row_bytes.NULL) }
    end, (policy :: any).max_row_bytes, "wake_job")
    if size_err then return nil, size_err end
    local update = sql.builder.update("kickside_job")
        :where(sql.builder.eq({ id = id }))
        :where("status IN ('pending','running')")
    if control then
        update = update
            :set("wake_control_pending", sql.builder.expr("CASE WHEN status = 'running' THEN TRUE ELSE FALSE END"))
            :set("wake_enabled", true)
            :set("attempts", sql.builder.expr("CASE WHEN status = 'pending' THEN 0 ELSE attempts END"))
            :set("scheduled_at", sql.builder.expr("CASE WHEN status = 'pending' THEN " .. ts .. " ELSE scheduled_at END", now))
    else
        -- A parked slot (pending with no schedule) becomes due on demand, the
        -- same rule wake_tx applies; a backoff schedule keeps its pacing.
        update = update:set("wake_demand_at", now)
            :set("scheduled_at", sql.builder.expr("CASE WHEN status = 'pending' AND scheduled_at IS NULL THEN " .. ts .. " ELSE scheduled_at END", now))
    end
    local result, err = update:run_with(db):exec()
    local count, count_err = boundary.single_row_count(result, err, "job wake failed", "update.rows_affected", response_error)
    if count_err then return nil, count_err end
    if count == 0 then return { woken = false }, nil end
    local rows, read_err = sql.builder.select("scheduled_at"):from("kickside_job")
        :where(sql.builder.eq({ id = id })):run_with(db):query()
    rows, read_err = boundary.bounded_rows(rows, read_err, "job wake read failed", "read", 1, 1, response_error)
    if read_err then return nil, read_err end
    return {woken = true, scheduled_at = rows[1].scheduled_at}, nil
end

-- An addressed waiter publishes dispatch demand without changing an already
-- due slot's schedule or retry state. The request lasts until the slot parks.
local function ensure_due_tx(db, id, opts, dbtype)
    local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, read_err = db:query("SELECT * FROM kickside_job WHERE id=$1" .. lock, { id })
    rows, read_err = boundary.bounded_rows(rows, read_err, "addressed wake read failed", "addressed", 0, 1, response_error)
    if read_err then return nil, read_err end
    local job = rows[1]
    local result
    if job and job.status == "running" then
        result = { woken = true, scheduled_at = job.scheduled_at, already_due = true }
    elseif job and job.status == "pending" and (job.wake_enabled == true or tonumber(job.wake_enabled) == 1)
        and job.scheduled_at ~= nil then
        local scheduled, scheduled_err = clock.parse(job.scheduled_at)
        if scheduled_err then return nil, scheduled_err end
        local now, now_err = clock.parse(clock.now(dbtype))
        if now_err then return nil, now_err end
        if not scheduled:after(now) then
            result = { woken = true, scheduled_at = job.scheduled_at, already_due = true }
        end
    end
    if not result then
        local wake_err
        result, wake_err = wake_job_tx(db, id, opts, dbtype)
        if wake_err then return nil, wake_err end
    end
    if result and result.woken then
        local now = clock.now(dbtype)
        local policy, policy_err = read_policy()
        if policy_err then return nil, policy_err end
        local size_err = row_bytes.check_update(db, "kickside_job", id, function(row)
            return { dispatch_requested_at = row.dispatch_requested_at or now }
        end, (policy :: any).max_row_bytes, "wake_job")
        if size_err then return nil, size_err end
        local requested, request_err = db:execute("UPDATE kickside_job SET dispatch_requested_at=COALESCE(dispatch_requested_at,$1)"
            .. " WHERE id=$2 AND status IN ('pending','running')", { now, id })
        local _, count_err = boundary.single_row_count(requested, request_err, "dispatch request failed", "dispatch.rows_affected", response_error)
        if count_err then return nil, count_err end
    end
    return result, nil
end

function wake.wake_job(db, id, opts, dbtype)
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ message = "job id is required", kind = errors.INVALID }) :: error)
    end
    local addressed = type(opts) == "table" and opts.ensure_due == true
    if addressed and opts.control ~= true then
        return nil, (errors.new({ message = "ensure_due requires a control wake", kind = errors.INVALID }) :: error)
    end
    local run = addressed and ensure_due_tx or wake_job_tx
    if type(db.db_type) == "function" then return run(db, id, opts, dbtype) end
    local tx, begin_err = boundary.begin(db :: sql.DB, "job wake begin failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    local result, err = run(tx, id, opts, dbtype)
    if err then return nil, boundary.rollback(tx, err, "job wake rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return nil, query_error("job wake commit failed", commit_err) end
    return result, nil
end

-- Notify the registered pool after the transaction-owning caller commits.
-- Durable demand is recoverable at boot; an unavailable recipient is returned
-- to the producer instead of being hidden behind pulse-row discovery. The
-- notification runs through the Jobs-owned pool_nudge function under its own
-- identity, independent of the producer's process authority.
function wake.nudge_workers(_db: sql.DB?, _dbtype: string?): (integer, error?)
    local sent, nudge_err = funcs.call(POOL_NUDGE)
    if nudge_err then return 0, nudge_err end
    local count, count_err = boundary.number_value(sent, "nudge", 0, true, false, response_error)
    if count_err then return 0, count_err end
    return count :: integer, nil
end

return wake
