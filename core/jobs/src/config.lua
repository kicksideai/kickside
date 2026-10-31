-- The jobs runtime configuration (design §8): one registry entry,
-- kickside.core.jobs:policy, whose data carries defaults and whose meta
-- carries explicit host overrides. A host overrides any value through .wippy.yaml
-- "kickside.core.jobs:policy:meta.<path>". resolve validates the shape into the
-- runtime values; a malformed policy is a declaration fault and never falls
-- back to a code default.

local time = require("time")
local registry = require("registry")
local job_types = require("job_types")
local registry_version = require("registry_version")
local policy_fields = require("policy_fields")

local M = {}

M.DB_CONFIG = "kickside.core.jobs:db_config"
M.PROCESS_CONFIG = "kickside.core.jobs:process_config"

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "Jobs configuration response is invalid",
        details = {code = "job_config_response", field = field}})
end

local function configured_identity(id: string, field: string): string
    local entry, err = registry.get(id)
    if err then error(errors.wrap(err, "Jobs configuration lookup failed: " .. id)) end
    if type(entry) ~= "table" or type((entry :: any).meta) ~= "table" then error(response_error(id)) end
    local value = (entry :: any).meta[field]
    if type(value) ~= "string" then error(response_error(id .. "." .. field)) end
    return value
end

-- The target_db requirement rewrites db_config alongside the migration target,
-- so every runtime caller opens exactly the schema database selected by the host.
function M.db_id(): string
    return configured_identity(M.DB_CONFIG, "db_id")
end

function M.process_host(): string
    return configured_identity(M.PROCESS_CONFIG, "host_id")
end

local function invalid(message: string): error
    return (errors.new({ message = "kickside.core.jobs:policy " .. message, kind = errors.INVALID, retryable = false, details = {code = "jobs_policy_invalid"} }) :: error)
end

local function section(meta: any, name: string): (table?, error?)
    local value = type(meta) == "table" and (meta :: any)[name] or nil
    if type(value) ~= "table" then return nil, invalid(name .. " is required") end
    return value :: table, nil
end

local function count(value: any, path: string, min: integer, max: integer): (integer?, error?)
    if type(value) ~= "number" or value ~= math.floor(value) or value < min or value > max then
        return nil, invalid(path .. " must be an integer in [" .. tostring(min) .. ", " .. tostring(max) .. "]")
    end
    return math.floor(value) :: integer, nil
end

local function duration_ms(value: any, path: string): (integer?, error?)
    if type(value) ~= "string" or value == "" then return nil, invalid(path .. " must be a duration") end
    local days = value:match("^(%d+)d$")
    if days then
        local count = tonumber(days)
        if not count or count < 1 or count > 36500 then
            return nil, invalid(path .. " must be a positive finite duration")
        end
        return (count * 86400000) :: integer, nil
    end
    local parsed, err = time.parse_duration(value)
    if err or not parsed then return nil, invalid(path .. " must be a duration: " .. tostring(value)) end
    local ms = math.floor((parsed :: any):milliseconds())
    if ms < 1 then return nil, invalid(path .. " must be positive") end
    return ms :: integer, nil
end

local FAIRNESS_TIERS = { "live", "backfill", "maintenance" }
M.FAIRNESS_TIERS = FAIRNESS_TIERS

function M.validate_shares(value: any): (table?, error?)
    if type(value) ~= "table" then return nil, invalid("fairness.shares must be an object") end
    for key in pairs(value) do
        if key ~= "live" and key ~= "backfill" and key ~= "maintenance" then
            return nil, invalid("fairness.shares contains an unknown tier")
        end
    end
    local shares: table = {}
    local total = 0
    for _, tier in ipairs(FAIRNESS_TIERS) do
        local share, share_err = count(value[tier], "fairness.shares." .. tier, 0, 1000)
        if share_err then return nil, share_err end
        shares[tier] = share
        total = total + (share :: integer)
    end
    if total == 0 then return nil, invalid("fairness.shares must assign at least one slot") end
    return shares, nil
end

-- The validated runtime values of a policy meta.
type Resolved = {
    worker_count_sqlite: integer,
    worker_count_postgres: integer,
    worker_awaited_slots: integer,
    worker_claim_batch: integer,
    worker_policy_check_ms: integer?,
    lease_timeout_seconds: integer,
    lease_heartbeat_ms: integer,
    retry_max_attempts: integer,
    retry_after_ms: integer,
    retry_max_delay_ms: integer,
    slot_retry_after_ms: integer,
    slot_retry_max_delay_ms: integer,
    fairness_shares: table,
    wake_fanout_batch: integer,
    proc_max_execution_ms: integer,
    health_overdue_grace_ms: integer,
    max_row_bytes: integer,
    retention_jobs_ms: integer,
    retention_job_runs_ms: integer,
    retention_thread_cleanup_receipts_ms: integer,
    retention_interval_ms: integer,
    retention_batch: integer,
    thread_cleanup_batch: integer,
}

-- resolve(meta) -> (Resolved?, err?). SQLite serializes database writes; two
-- execution slots allow another owner to run while a provider call waits.
-- worker.awaited_slots adds slots only awaited jobs may claim, so work other
-- jobs wait on always has a worker. The lease heartbeat must fire inside the
-- lease timeout.
function M.resolve(meta: any): (Resolved?, error?)
    local worker, worker_err = section(meta, "worker")
    if worker_err then return nil, worker_err end
    local lease, lease_err = section(meta, "lease")
    if lease_err then return nil, lease_err end
    local retry, retry_err = section(meta, "retry")
    if retry_err then return nil, retry_err end
    local slot_retry, slot_retry_err = section(meta, "slot_retry")
    if slot_retry_err then return nil, slot_retry_err end
    local fairness, fairness_err = section(meta, "fairness")
    if fairness_err then return nil, fairness_err end
    local wake, wake_err = section(meta, "wake")
    if wake_err then return nil, wake_err end
    local proc, proc_err = section(meta, "proc")
    if proc_err then return nil, proc_err end
    local health, health_err = section(meta, "health")
    if health_err then return nil, health_err end
    local limits, limits_err = section(meta, "limits")
    if limits_err then return nil, limits_err end
    local retention, retention_err = section(meta, "retention")
    if retention_err then return nil, retention_err end
    local w, l, r, p = worker :: table, lease :: table, retry :: table, proc :: table

    local count_sqlite, e1 = count(w.count_sqlite, "worker.count_sqlite", 1, 2)
    if e1 then return nil, e1 end
    local count_postgres, e2 = count(w.count_postgres, "worker.count_postgres",
        job_types.MIN_WORKERS :: integer, job_types.MAX_WORKERS :: integer)
    if e2 then return nil, e2 end
    local awaited_slots, e_awaited = count(w.awaited_slots, "worker.awaited_slots", 1, job_types.MAX_WORKERS :: integer)
    if e_awaited then return nil, e_awaited end
    local claim_batch, e_batch = count(w.claim_batch, "worker.claim_batch", 1, job_types.MAX_WORKERS :: integer)
    if e_batch then return nil, e_batch end
    local policy_check_ms: integer? = nil
    if w.policy_check_interval ~= nil then
        local interval, interval_err = duration_ms(w.policy_check_interval, "worker.policy_check_interval")
        if interval_err then return nil, interval_err end
        if (interval :: integer) < 1000 or (interval :: integer) > 3600000 then
            return nil, invalid("worker.policy_check_interval must be between 1s and 1h")
        end
        policy_check_ms = interval
    end
    local timeout_ms, e3 = duration_ms(l.timeout, "lease.timeout")
    if e3 then return nil, e3 end
    local heartbeat_ms, e4 = duration_ms(l.heartbeat, "lease.heartbeat")
    if e4 then return nil, e4 end
    if (timeout_ms :: integer) < 1000 or (timeout_ms :: integer) % 1000 ~= 0 then
        return nil, invalid("lease.timeout must be a whole number of seconds, at least 1s")
    end
    if (heartbeat_ms :: integer) >= (timeout_ms :: integer) then
        return nil, invalid("lease.heartbeat must be shorter than lease.timeout")
    end
    local max_attempts, e5 = count(r.max_attempts, "retry.max_attempts", 1, 1000000)
    if e5 then return nil, e5 end
    local retry_after_ms, e_retry_after = count(r.retry_after_ms, "retry.retry_after_ms", 1, 86400000)
    if e_retry_after then return nil, e_retry_after end
    local max_delay_ms, e6 = count(r.max_delay_ms, "retry.max_delay_ms", 1000, 86400000)
    if e6 then return nil, e6 end
    local slot_retry_ms, e_slot = count((slot_retry :: table).retry_after_ms,
        "slot_retry.retry_after_ms", 1, 60000)
    if e_slot then return nil, e_slot end
    local slot_retry_max_ms, e_slot_max = count((slot_retry :: table).max_delay_ms,
        "slot_retry.max_delay_ms", 1000, 86400000)
    if e_slot_max then return nil, e_slot_max end
    local share_config, share_config_err = section(fairness, "shares")
    if share_config_err then return nil, share_config_err end
    local fairness_shares, shares_err = M.validate_shares(share_config)
    if shares_err or not fairness_shares then return nil, shares_err end
    local fanout_batch, e_fanout = count((wake :: table).fanout_batch, "wake.fanout_batch", 1, 200)
    if e_fanout then return nil, e_fanout end
    local max_execution_ms, e7 = duration_ms(p.max_execution, "proc.max_execution")
    if e7 then return nil, e7 end
    local overdue_grace_ms, e8 = duration_ms((health :: table).overdue_grace, "health.overdue_grace")
    if e8 then return nil, e8 end
    local max_row_bytes, e11 = count((limits :: table).max_row_bytes, "limits.max_row_bytes", 1, 2147483647)
    if e11 then return nil, e11 end
    local retention_jobs_ms, e_jobs = duration_ms((retention :: table).jobs, "retention.jobs")
    if e_jobs then return nil, e_jobs end
    local retention_job_runs_ms, e_runs = duration_ms((retention :: table).job_runs, "retention.job_runs")
    if e_runs then return nil, e_runs end
    local retention_thread_cleanup_receipts_ms, e_cleanup_receipts = duration_ms(
        (retention :: table).thread_cleanup_receipts, "retention.thread_cleanup_receipts")
    if e_cleanup_receipts then return nil, e_cleanup_receipts end
    local retention_interval_ms, e_interval = duration_ms((retention :: table).sweep_interval,
        "retention.sweep_interval")
    if e_interval then return nil, e_interval end
    local retention_batch, e_retention_batch = count((retention :: table).batch, "retention.batch", 1, 500)
    if e_retention_batch then return nil, e_retention_batch end
    local thread_cleanup_batch, e_cleanup_batch = count((retention :: table).thread_cleanup_batch,
        "retention.thread_cleanup_batch", 1, 500)
    if e_cleanup_batch then return nil, e_cleanup_batch end

    return {
        worker_count_sqlite = count_sqlite :: integer,
        worker_count_postgres = count_postgres :: integer,
        worker_awaited_slots = awaited_slots :: integer,
        worker_claim_batch = claim_batch :: integer,
        worker_policy_check_ms = policy_check_ms,
        lease_timeout_seconds = math.floor((timeout_ms :: integer) / 1000) :: integer,
        lease_heartbeat_ms = heartbeat_ms :: integer,
        retry_max_attempts = max_attempts :: integer,
        retry_after_ms = retry_after_ms :: integer,
        retry_max_delay_ms = max_delay_ms :: integer,
        slot_retry_after_ms = slot_retry_ms :: integer,
        slot_retry_max_delay_ms = slot_retry_max_ms :: integer,
        fairness_shares = fairness_shares :: table,
        wake_fanout_batch = fanout_batch :: integer,
        proc_max_execution_ms = max_execution_ms :: integer,
        health_overdue_grace_ms = overdue_grace_ms :: integer,
        max_row_bytes = max_row_bytes :: integer,
        retention_jobs_ms = retention_jobs_ms :: integer,
        retention_job_runs_ms = retention_job_runs_ms :: integer,
        retention_thread_cleanup_receipts_ms = retention_thread_cleanup_receipts_ms :: integer,
        retention_interval_ms = retention_interval_ms :: integer,
        retention_batch = retention_batch :: integer,
        thread_cleanup_batch = thread_cleanup_batch :: integer,
    }, nil
end

-- Weighted round-robin quotas shared by the pool and durable claim path. `step`
-- carries rotation across small worker batches so configured minority tiers
-- receive slots even when each notification only frees one worker.
function M.distribute_shares(count_slots: integer, shares: table, step: integer?): (table, integer)
    local cycle: { string } = {}
    for _, tier in ipairs(FAIRNESS_TIERS) do
        for _ = 1, tonumber(shares[tier]) or 0 do cycle[#cycle + 1] = tier end
    end
    local counts: { [string]: integer } = { live = 0, backfill = 0, maintenance = 0 }
    if #cycle == 0 then return counts, 0 end
    local cursor = math.floor(tonumber(step) or 0)
    for _ = 1, math.max(0, count_slots) do
        cursor = (cursor % #cycle) + 1
        local tier = cycle[cursor]
        counts[tier] = (counts[tier] or 0) + 1
    end
    return counts, cursor
end

M.POLICY = "kickside.core.jobs:policy"

-- Copies isolate both callers and the registry's declaration tables.
function M.copy(value: any): any
    if type(value) ~= "table" then return value end
    local result = {}
    for key, item in pairs(value) do result[key] = M.copy(item) end
    return result
end

local function at(meta: any, key: string): any
    local group, field = key:match("^([^.]+)%.(.+)$")
    return type(meta) == "table" and type(meta[group]) == "table" and meta[group][field] or nil
end
local function merge(defaults: any, host: any): table
    local out = type(defaults) == "table" and M.copy(defaults) or {}
    for key, value in pairs(host or {}) do
        if type(value) == "table" and type(out[key]) == "table" then
            out[key] = merge(out[key], value)
        else
            out[key] = M.copy(value)
        end
    end
    return out
end

function M.editable(key: any): boolean
    for _, field in ipairs(policy_fields) do if field.key == key then return true end end
    return false
end

-- Registry meta contains only explicit host values. Presence determines
-- provenance even when a host selects the shipped default.
local function layers(host: any, defaults: any, overrides: table): (any?, error?)
    if type(host) ~= "table" then return nil, invalid("meta must be an object") end
    local fallback = merge(defaults, host)
    local meta = M.copy(fallback)
    for key, value in pairs(overrides) do
        if not M.editable(key) then return nil, invalid("key is not live-editable: " .. tostring(key)) end
        local group, field = key:match("^([^.]+)%.(.+)$")
        if type(meta[group]) ~= "table" then return nil, invalid(group .. " is required") end
        meta[group][field] = M.copy(value)
    end
    local resolved, err = M.resolve(meta)
    if err then return nil, err end
    return {policy = resolved, meta = meta, fallback = fallback}, nil
end

function M.effective(host: any, defaults: any, overrides: table): (table?, error?)
    local result, err = layers(host, defaults, overrides)
    if err then return nil, err end
    local meta, fallback, resolved = result.meta, result.fallback, result.policy
    local fields = {}
    for _, definition in ipairs(policy_fields) do
        local key = definition.key
        local source = at(host, key) ~= nil and "host" or "default"
        if overrides[key] ~= nil then source = "admin" end
        fields[key] = { value = M.copy(at(meta, key)), source = source,
            default = M.copy(at(defaults, key)), fallback = M.copy(at(fallback, key)),
            min = definition.min, max = definition.max, unit = definition.unit }
    end
    return { policy = resolved, fields = fields }, nil
end

function M.declaration(): (any?, error?)
    local entry, err = registry.get(M.POLICY)
    if err then return nil, errors.wrap(err, "Jobs policy lookup failed") end
    if not entry then return nil, invalid("is not registered") end
    return entry, nil
end

-- The owner resolves committed editable values once per revision. Runtime
-- snapshots contain no settings metadata and are never mutated after capture.
function M.runtime(overrides: table): (Resolved?, error?)
    local entry, err = M.declaration()
    if err then return nil, err end
    local result, resolve_err = layers(entry.meta, entry.data and entry.data.defaults, overrides)
    return result and result.policy, resolve_err
end

-- An execution carries only the editable values it consumes. Fixed limits
-- retain their registry-version-cached semantics in each engine primitive.
function M.capture(policy: any): table
    return {lease_timeout_seconds = policy.lease_timeout_seconds, lease_heartbeat_ms = policy.lease_heartbeat_ms,
        proc_max_execution_ms = policy.proc_max_execution_ms, retry_after_ms = policy.retry_after_ms,
        retry_max_delay_ms = policy.retry_max_delay_ms}
end

local cached_version: string? = nil
local cached_policy: Resolved? = nil

local function policy_copy(value: Resolved): Resolved
    local out: table = {}
    for key, item in pairs(value) do out[key] = item end
    local shares: table = {}
    for key, item in pairs(value.fairness_shares) do shares[key] = item end
    out.fairness_shares = shares
    return out :: Resolved
end

-- Fixed policy reads retain the registry-version cache, with no SQL, stores,
-- override decoding or editor metadata on the runtime path.
function M.policy(): (Resolved?, error?)
    local version, version_err = registry_version.id(registry)
    if version_err then return nil, errors.wrap(version_err, "Jobs policy registry version unavailable") end
    if version == cached_version and cached_policy then return policy_copy(cached_policy), nil end
    local resolved, err = M.runtime({})
    if err or not resolved then return nil, err or response_error("policy") end
    cached_version, cached_policy = version, resolved
    return policy_copy(resolved), nil
end

-- Direct demand notices are delivered to the registered pool process.
M.WAKE_TOPIC = "kickside.core.jobs:wake"
M.POOL_NAME = "kickside.core.jobs.worker_pool"
M.IDLE_TOPIC = "kickside.core.jobs:worker_idle"
M.ASSIGN_TOPIC = "kickside.core.jobs:worker_assign"

return M
