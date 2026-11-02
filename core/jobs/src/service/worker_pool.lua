local proc_supervisor = require("proc_supervisor")
-- The supervised job worker service: a pool root claims into idle execution
-- slots, each with one child loop. A loop exits on OUTDATED once its in-flight
-- execution settles (its replacement loads the new code), when its heartbeat
-- dies, or when it cannot start (database, dialect, policy); the root respawns
-- every exited slot. On OUTDATED the root upgrades in place and hands its slots
-- and their assignments to the new code. Executions keep running while new
-- claims wait for this code's Jobs migrations; it drains on its own cancel.
-- A slot that exits sooner than
-- LOOP_RESPAWN_DELAY_MS after its spawn waits that long before its replacement
-- starts, so a loop that cannot start retries at a steady pace.

local sql = require("sql")
local logger = require("logger")
local time = require("time")
local channel = require("channel")
local process = require("process")
local events = require("events")
local registry = require("registry")
local registry_version = require("registry_version")

local job_types = require("job_types")
local cfg = require("config")
local claim = require("claim")
local reclaim = require("reclaim")
local claim_execution = require("claim_execution")
local jobs = require("jobs")
local retention_schedule = require("retention_schedule")
local claim_refusal = require("claim_refusal")
local job_class = require("job_class")
local clock = require("clock")
local migration_runner = require("migration_runner")

-- Registry publication can replace this pool before the install's migrations
-- run. The migration owner supplies readiness; Jobs never executes migrations.
local function schema_ready(): (boolean, error?)
    local rows, err = migration_runner.setup(cfg.db_id()):find_migrations()
    if err or not rows then
        return false, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "Jobs migration status unavailable: " .. tostring(err)})
    end
    local found = false
    local prefix = "kickside.core.jobs.migrations:"
    for _, row in ipairs(rows) do
        if string.sub(tostring(row.id), 1, #prefix) == prefix then
            found = true
            if row.applied ~= true then return false, nil end
        end
    end
    if not found then
        return false, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "Jobs migrations are absent from the configured database"})
    end
    return true, nil
end

local function construct(dependencies: any): any
local pool = {}

-- There is no idle re-scan. The only job timer is the earliest durable deadline
-- after the dispatch instant: the instant its reclaim and claim already judged.
-- A row that becomes due or expires after that instant arms the timer, so work
-- the claim could not yet see is never left without a dispatch.
local function next_deadline(db: sql.DB, dbtype: string, dispatch_at: string): (number?, string?, error?)
    local due_sql: string
    local lease_sql: string
    if dbtype == sql.type.POSTGRES then
        due_sql = [[SELECT EXTRACT(EPOCH FROM (MIN(scheduled_at) - NOW())) * 1000 AS ms
            FROM kickside_job WHERE status='pending' AND scheduled_at > CAST($1 AS TIMESTAMPTZ)]]
        lease_sql = [[SELECT EXTRACT(EPOCH FROM (MIN(lease_until) - NOW())) * 1000 AS ms
            FROM kickside_job WHERE status='running' AND lease_until IS NOT NULL
            AND lease_until > CAST($2 AS TIMESTAMPTZ)]]
    else
        due_sql = [[SELECT (julianday(MIN(scheduled_at)) - julianday('now')) * 86400000 AS ms
            FROM kickside_job WHERE status='pending' AND scheduled_at > $1]]
        lease_sql = [[SELECT (julianday(MIN(lease_until)) - julianday('now')) * 86400000 AS ms
            FROM kickside_job WHERE status='running' AND lease_until IS NOT NULL
            AND lease_until > $2]]
    end
    local rows, err = db:query("SELECT kind, ms FROM (SELECT 'due' AS kind, ms FROM ("
        .. due_sql .. ") AS due UNION ALL SELECT 'lease' AS kind, ms FROM ("
        .. lease_sql .. ") AS lease) AS deadlines WHERE ms IS NOT NULL ORDER BY ms ASC, kind DESC LIMIT 1",
        { dispatch_at, dispatch_at })
    if err then return nil, nil, errors.wrap(err, "worker deadline lookup failed") end
    local row = rows and rows[1]
    local ms = tonumber(row and row.ms)
    if ms == nil then return nil, nil, nil end
    return math.max(1, math.ceil(ms)), tostring(row.kind), nil
end
pool.next_deadline = next_deadline

local sql_get = dependencies.sql_get
local policy_read = dependencies.policy
local pool_process = dependencies.process or process
local pool_time = dependencies.time or time
local pool_channel = dependencies.channel or channel
local pool_events = dependencies.events or events
local pool_registry = dependencies.registry or registry
local pool_claim = dependencies.claim or claim
local pool_reclaim = dependencies.reclaim or reclaim
local pool_claim_execution = dependencies.claim_execution or claim_execution
local pool_jobs = dependencies.jobs or jobs
local pool_retention_schedule = dependencies.retention_schedule or retention_schedule
local pool_job_class = dependencies.job_class or job_class
local pool_schema_ready = dependencies.schema_ready or schema_ready
local pool_names = pool_process.registry

local function unavailable(message: string, cause: error?): error
    if cause then return errors.wrap(cause, message) end
    return errors.new({message = message, kind = errors.UNAVAILABLE, retryable = true})
end

-- A failed policy or database read is retried as that failed operation. Return
-- the validated policy with the size so dispatch uses the same snapshot.
local function detect_size_policy(): (integer?, table?, error?)
    local db, err = sql_get()
    if err or not db then return nil, nil, unavailable("job worker pool database unavailable", err) end
    local dbtype, type_err = db:type()
    db:release()
    if type_err or not dbtype then return nil, nil, unavailable("job worker pool dialect unavailable", type_err) end
    local policy, policy_err = policy_read()
    if policy_err or not policy then
        return nil, nil, policy_err or unavailable("job worker pool policy unavailable", nil)
    end
    local general = pool.general_slots(policy :: table, tostring(dbtype))
    if not general then return nil, nil, unavailable("job worker pool dialect unsupported: " .. tostring(dbtype), nil) end
    return (general :: integer) + (policy :: any).worker_awaited_slots, policy :: table, nil
end

function pool.detect_size(): (integer?, error?)
    local desired, _, err = detect_size_policy()
    return desired, err
end

-- general_slots(policy, dbtype) -> the slots any job may claim; the pool adds
-- worker_awaited_slots more that only awaited job types may claim.
function pool.general_slots(policy: table, dbtype: string): integer?
    if dbtype == sql.type.SQLITE then return (policy :: any).worker_count_sqlite end
    if dbtype == sql.type.POSTGRES then return (policy :: any).worker_count_postgres end
    return nil
end

-- Slots added or retired to move from one known capacity to another.
function pool.resize_slots(current: integer, desired: integer): { integer }
    local slots: { integer } = {}
    if desired > current then
        for slot = current + 1, desired do slots[#slots + 1] = slot end
    else
        for slot = current, desired + 1, -1 do slots[#slots + 1] = slot end
    end
    return slots
end

-- respawn_after_ns(lived_ns, delay_ns) -> how long an exited slot waits before
-- its replacement: none after a full run, the rest of the delay after an
-- early exit.
function pool.respawn_after_ns(lived_ns: number, delay_ns: number): number
    if lived_ns >= delay_ns then return 0 end
    return delay_ns - lived_ns
end

-- main(handover) starts the root; handover is the slot state an outdated root
-- passes to its upgraded code.
function pool.main(handover: any?): (any?, error?)
    local size = 0
    local pid = tostring(pool_process.pid())
    local events_ch = pool_process.events()
    pool_process.set_options({ trap_links = true, upgradable = true })
    local subscription, subscription_err = pool_events.subscribe("registry", "registry.commit")
    if subscription_err or not subscription then
        return nil, unavailable("job worker pool registry subscription unavailable", subscription_err)
    end
    local registry_ch = subscription:channel()
    local idle_ch = pool_process.listen(cfg.IDLE_TOPIC)
    local wake_ch = pool_process.listen(cfg.WAKE_TOPIC)
    local registered, standby_stopped, register_err, stop_kind = proc_supervisor.claim_singleton(cfg.POOL_NAME, events_ch, { process = pool_process, registry = pool_names, channel = pool_channel })
    if standby_stopped or register_err or not registered then
        subscription:close()
        pool_process.unlisten(idle_ch)
        pool_process.unlisten(wake_ch)
        if stop_kind == pool_process.event.OUTDATED then return pool_process.upgrade() end
        if standby_stopped then return nil, nil end
        return nil, unavailable("job worker pool process registration failed", register_err)
    end
    -- Subscribe first, then take the initial version snapshot. Registry commits
    -- refresh this cached value and resize the pool.
    local version, version_err = registry_version.id(pool_registry)
    if version_err or not version then
        pool_names.unregister(cfg.POOL_NAME, process.registry.CONSISTENT)
        subscription:close()
        pool_process.unlisten(idle_ch)
        pool_process.unlisten(wake_ch)
        return nil, unavailable("job worker pool registry version unavailable", version_err)
    end
    local current_version = version
    local delay_ns = (job_types.LOOP_RESPAWN_DELAY_MS :: number) * 1e6
    logger:info("job_worker pool root pid=" .. pid .. " detecting configured loops")

    local slot_of: { [string]: integer } = {}
    local live: { [integer]: string } = {}
    -- Retired slots remain children until their monitored EXIT arrives.
    local children: { [string]: boolean } = {}
    local draining = false
    local admitted = false
    local waiting_for_schema = false
    local started_ns: { [integer]: number } = {}
    local due_ns: { [integer]: number } = {}
    local idle: { [string]: string } = {}
    local assigned: { [string]: table } = {}
    local assignment_epoch: { [string]: integer } = {}
    local deadline_ns: number? = nil
    local deadline_kind: string? = nil
    local tier_step = 0
    local dispatch_retry_ns: number? = nil
    local dispatch_retry_reclaim = false
    local size_retry_ns: number? = nil
    local active_policy: any = nil
    local dispatch_retry_count = 0
    local dispatch_retry_delay_ms = job_types.LOOP_RESPAWN_DELAY_MS :: number
    local retention_driver = pool_retention_schedule.new({
        policy = policy_read,
        now = pool_time.now,
        sweep = function() return pool_jobs.retention_sweep() end,
        logger = logger,
        fallback_retry_ms = function() return dispatch_retry_delay_ms end,
    })

    -- The awaited job types of the current registry version.
    local awaited_cache: { string }? = nil
    local awaited_cache_version: string? = nil
    local function awaited_types(): ({ string }?, error?)
        if awaited_cache and awaited_cache_version == current_version then return awaited_cache, nil end
        local types, types_err = pool_job_class.awaited_types()
        if types_err or not types then return nil, types_err end
        awaited_cache, awaited_cache_version = types, current_version
        return types, nil
    end

    local function retry_dispatch(reclaim_due: boolean): ()
        if active_policy then
            local exponent = math.min(dispatch_retry_count, 20)
            dispatch_retry_delay_ms = math.min(active_policy.slot_retry_after_ms * (2 ^ exponent),
                active_policy.slot_retry_max_delay_ms)
        end
        dispatch_retry_count = dispatch_retry_count + 1
        dispatch_retry_ns = pool_time.now():unix_nano() + dispatch_retry_delay_ms * 1000000
        dispatch_retry_reclaim = reclaim_due
    end

    local function accept_idle(value: any): boolean
        if type(value) ~= "table" then return false end
        local worker_id = tostring(value.worker_id or "")
        local epoch = value.epoch
        if not slot_of[worker_id] or live[slot_of[worker_id]] ~= worker_id
            or type(epoch) ~= "number" or epoch % 1 ~= 0
            or epoch ~= assignment_epoch[worker_id] then return false end
        if value.kind == "idle" then
            assigned[worker_id] = nil
            if type(value.version) == "string" and value.version ~= "" then
                idle[worker_id] = value.version
            end
        end
        return idle[worker_id] ~= nil
    end

    -- due_evidence is a due backlog read before this dispatch's claim: every row
    -- it counts was committed before the claim read its candidates.
    local function dispatch_idle(reclaim_due: boolean, due_evidence: table?): ()
        if draining or not admitted then return end
        local policy = active_policy
        if not policy then return end
        -- Apply queued capacity reports before the authoritative scan, under
        -- the same assignment fence as the selected report. The bounded drain
        -- also coalesces committed wake demand without delaying new notices.
        for _ = 1, policy.worker_claim_batch do
            local queued = pool_channel.select({ idle_ch:case_receive(), wake_ch:case_receive(), default = true })
            if queued.default or queued.ok == false then break end
            if queued.channel == idle_ch then accept_idle(queued.value) end
        end
        local worker_ids: { string } = {}
        for worker_id, idle_version in pairs(idle) do
            if idle_version == current_version then
                worker_ids[#worker_ids + 1] = worker_id
            end
        end
        table.sort(worker_ids)
        local db, db_err = sql_get()
        if db_err or not db then
            logger:error("job_worker dispatcher db unavailable: " .. tostring(db_err))
            retry_dispatch(reclaim_due)
            return
        end
        local raw_type, type_err = db:type()
        if type_err then
            db:release()
            logger:error("job_worker dispatcher db type failed: " .. tostring(type_err))
            retry_dispatch(reclaim_due)
            return
        end
        local dbtype = tostring(raw_type)
        local dispatch_at = clock.now(dbtype)
        while #worker_ids > (policy :: any).worker_claim_batch do table.remove(worker_ids) end
        local reclaim_err: error? = nil
        if reclaim_due then
            local reclaim_limit = (policy :: any).worker_claim_batch
            repeat
                local count, pass_err = pool_reclaim.reclaim_expired(db, dbtype, reclaim_limit)
                if pass_err then reclaim_err = pass_err; break end
            until (count or 0) < reclaim_limit
            if not reclaim_err then
                repeat
                    local count, pass_err = pool_reclaim.reclaim_terminated(db, dbtype, reclaim_limit)
                    if pass_err then reclaim_err = pass_err; break end
                until (count or 0) < reclaim_limit
            end
            if not reclaim_err then
                repeat
                    local count, pass_err = pool_reclaim.close_lost_runs(db, dbtype, reclaim_limit)
                    if pass_err then reclaim_err = pass_err; break end
                until (count or 0) < reclaim_limit
            end
            if reclaim_err then logger:warn("job_worker reclaim failed: " .. tostring(reclaim_err)) end
        end
        local claimed: table[] = {}
        local general_capacity = 0
        local claim_err: error? = nil
        local claim_at: string? = nil
        local refused_ids: { string } = {}
        local function assign(batch: table[]): ()
            for _, job in ipairs(batch) do
                local worker_id = tostring(job.worker_id)
                idle[worker_id] = nil
                local run_ctx = job.run_ctx
                job.run_ctx = nil
                local epoch = (assignment_epoch[worker_id] or 0) + 1
                assignment_epoch[worker_id] = epoch
                assigned[worker_id] = { job = job, run_id = run_ctx.id, epoch = epoch }
                local _, send_err = pool_process.send(worker_id, cfg.ASSIGN_TOPIC,
                    { job = job, run_ctx = run_ctx, epoch = epoch })
                if send_err and errors.is(send_err, errors.NOT_FOUND) then
                    -- A slot recycles itself on a new registry version; one that
                    -- exited after its idle report is settled by its monitored
                    -- EXIT, which releases this unstarted assignment.
                    logger:info("job_worker slot exited before its assignment worker=" .. worker_id)
                elseif send_err then
                    logger:error("job_worker assignment send failed worker=" .. worker_id .. ": " .. tostring(send_err))
                    pool_process.cancel(worker_id, job_types.LOOP_CANCEL_GRACE)
                end
            end
        end
        if #worker_ids > 0 then
            local awaited, awaited_err = awaited_types()
            if awaited_err or not awaited then
                claim_err = awaited_err
            else
                local awaited_set: { [string]: boolean } = {}
                for _, job_type in ipairs(awaited) do awaited_set[job_type] = true end
                local busy = 0
                for _, assignment in pairs(assigned) do
                    if not awaited_set[tostring(assignment.job and assignment.job.job_type)] then busy = busy + 1 end
                end
                local capacity = math.max(0, (pool.general_slots(policy :: table, dbtype) or 0) - busy)
                general_capacity = capacity
                local batch, batch_err, next_step, refused, cutoff = pool_claim.claim_batch(db, dbtype, #worker_ids, nil, nil,
                    worker_ids, nil, { awaited_types = awaited, general_capacity = capacity, tier_step = tier_step })
                claim_at = cutoff
                for _, refusal in ipairs(refused or {}) do
                    logger:error("job_worker claim refused job=" .. tostring(refusal.id) .. " execution_seq="
                        .. tostring(refusal.execution_seq) .. ": " .. tostring(refusal.error))
                end
                if batch_err then
                    claim_err = batch_err
                    refused_ids = worker_ids
                elseif batch and #batch > 0 then
                    claimed = batch
                    if next_step ~= nil then tier_step = next_step end
                    assign(batch)
                end
            end
        end
        -- An idle general slot claims any claimable due row, so a dispatch that
        -- leaves such work unclaimed is a fault to surface at once. A backlog
        -- read after the claim may count rows committed after the claim read its
        -- candidates; those rows are claimed by a dispatch that follows the
        -- read, and only a claim that runs after the evidence judges it. The
        -- backlog uses the claim cutoff so a later database clock cannot
        -- count work that neither claim considers due yet.
        local recheck: table? = nil
        if #worker_ids > 0 and general_capacity > 0 and not claim_err and #claimed == 0 then
            if due_evidence then
                logger:error("job_worker dispatch claimed nothing while claimable work is due: idle="
                    .. tostring(#worker_ids) .. " due=" .. tostring(due_evidence.count)
                    .. " oldest_due_ms=" .. tostring(due_evidence.oldest_age_ms))
            else
                local backlog, backlog_err = pool_claim.due_backlog(db, dbtype, 0, claim_at)
                if backlog_err then
                    logger:error("job_worker due backlog read failed: " .. tostring(backlog_err))
                elseif backlog and backlog.count > 0 then
                    recheck = backlog
                end
            end
        end
        local delay_ms, kind, deadline_err = next_deadline(db, dbtype, dispatch_at)
        db:release()
        if claim_err then
            logger:error("job_worker batch claim failed: " .. tostring(claim_err))
            if claim_refusal.is_marker_occupied(claim_err) then
                -- An occupied marker contradicts an idle notice. Retire these
                -- slots; retrying the identical batch would starve healthy work.
                for _, worker_id in ipairs(refused_ids) do
                    idle[worker_id] = nil
                    pool_process.cancel(worker_id, job_types.LOOP_CANCEL_GRACE)
                end
            else
                retry_dispatch(reclaim_due)
            end
        end
        if deadline_err then logger:warn("job_worker deadline failed: " .. tostring(deadline_err)) end
        if reclaim_err then retry_dispatch(true) end
        if deadline_err then
            retry_dispatch(reclaim_due)
            deadline_ns = nil
            deadline_kind = nil
        elseif delay_ms then
            deadline_ns = pool_time.now():unix_nano() + delay_ms * 1000000
            deadline_kind = kind
        else
            deadline_ns = nil
            deadline_kind = nil
        end
        if not reclaim_err and not deadline_err and not (claim_err and not claim_refusal.is_marker_occupied(claim_err)) then
            dispatch_retry_ns = nil
            dispatch_retry_count = 0
        end
        if recheck then
            dispatch_idle(false, recheck)
        elseif #claimed > 0 then
            for _ in pairs(idle) do
                dispatch_idle(false)
                break
            end
        end
    end

    local function release_exited_assignment(worker_id: string): error?
        local assignment = assigned[worker_id]
        if not assignment then return end
        assigned[worker_id] = nil
        local db, db_err = sql_get()
        if db_err or not db then
            logger:error("job_worker exited assignment db unavailable: " .. tostring(db_err))
            return unavailable("job worker exited assignment database unavailable", db_err)
        end
        local released, release_err = pool_claim_execution.release_unstarted(db, assignment.job, worker_id, assignment.run_id)
        db:release()
        if release_err then
            logger:error("job_worker exited assignment release failed: " .. tostring(release_err))
            return release_err
        elseif released then
            dispatch_idle(false)
        end
    end

    local function drain(): error?
        draining = true
        local deadline = pool_time.after(job_types.LOOP_CANCEL_GRACE)
        for _, child_pid in pairs(live) do
            local _, cancel_err = pool_process.cancel(child_pid, "job worker pool draining")
            -- A child can exit before its queued EXIT is consumed. Its monitor
            -- still confirms the exit; every other cancellation error fails drain.
            if cancel_err and not errors.is(cancel_err, errors.NOT_FOUND) then
                return unavailable("job worker pool drain cancellation failed", cancel_err)
            end
        end
        while next(children) ~= nil do
            local selected = pool_channel.select({ events_ch:case_receive(), idle_ch:case_receive(), deadline:case_receive() })
            if selected.channel == deadline then
                return unavailable("job worker pool drain timed out", nil)
            elseif selected.channel == events_ch then
                local event = selected.value
                if type(event) == "table" and event.kind == pool_process.event.EXIT then
                    local child_pid = tostring(event.from)
                    if children[child_pid] then
                        children[child_pid] = nil
                        local release_err = release_exited_assignment(child_pid)
                        if release_err then return release_err end
                    end
                end
            end
        end
        subscription:close()
        pool_process.unlisten(idle_ch)
        pool_process.unlisten(wake_ch)
        pool_names.unregister(cfg.POOL_NAME, process.registry.CONSISTENT)
        return nil
    end

    local function spawn(slot: integer): ()
        local now = pool_time.now():unix_nano()
        local child_pid, err = pool_process.spawn_linked_monitored(job_types.LOOP_PROCESS_ID, cfg.process_host(),
            { dispatcher_pid = pid })
        if err or not child_pid then
            logger:error("job_worker pool: spawn slot " .. tostring(slot) .. " failed: " .. tostring(err))
            due_ns[slot] = now + delay_ns
            return
        end
        slot_of[tostring(child_pid)] = slot
        live[slot] = tostring(child_pid)
        children[tostring(child_pid)] = true
        assignment_epoch[tostring(child_pid)] = 0
        started_ns[slot] = now
        due_ns[slot] = nil
    end

    local function refresh_size(now: number): ()
        if not admitted then
            if size_retry_ns ~= nil and now < size_retry_ns then return end
            local ready, schema_err = pool_schema_ready()
            if ready ~= true or schema_err then
                if schema_err then
                    logger:error("job_worker pool: schema readiness failed: " .. tostring(schema_err))
                elseif not waiting_for_schema then
                    logger:info("job_worker pool waiting for Jobs migrations")
                end
                waiting_for_schema = true
                size_retry_ns = now + delay_ns
                return
            end
            admitted = true
        end
        local desired, policy, detect_err = detect_size_policy()
        if detect_err or not desired or not policy then
            logger:error("job_worker pool: size detection failed: " .. tostring(detect_err))
            size_retry_ns = now + delay_ns
            return
        end
        active_policy = policy
        dispatch_retry_delay_ms = (policy :: any).slot_retry_after_ms
        size_retry_ns = nil
        for _, slot in ipairs(pool.resize_slots(size, desired)) do
            if desired > size then
                spawn(slot)
            else
                local child_pid = live[slot]
                if child_pid then
                    slot_of[child_pid] = nil
                    live[slot] = nil
                    idle[child_pid] = nil
                    assignment_epoch[child_pid] = nil
                    pool_process.cancel(child_pid, job_types.LOOP_CANCEL_GRACE)
                end
                due_ns[slot] = nil
                started_ns[slot] = nil
            end
        end
        if size ~= desired then logger:info("job_worker pool: configured loops " .. tostring(desired)) end
        size = desired
    end
    -- An upgraded root adopts the live slots, their assignments and the
    -- retired slots still exiting; their EXIT events reach this same PID.
    local function adopt(state: table): ()
        size = math.floor(tonumber(state.size) or 0) :: integer
        tier_step = math.floor(tonumber(state.tier_step) or 0) :: integer
        for _, record in ipairs(state.slots or {}) do
            local slot = math.floor(tonumber(record.slot) or 0) :: integer
            local child_pid = tostring(record.pid)
            slot_of[child_pid] = slot
            live[slot] = child_pid
            children[child_pid] = true
            started_ns[slot] = tonumber(record.started_ns) or 0
            assignment_epoch[child_pid] = math.floor(tonumber(record.epoch) or 0) :: integer
            if type(record.assignment) == "table" then assigned[child_pid] = record.assignment end
            if type(record.idle_version) == "string" then idle[child_pid] = record.idle_version end
        end
        for _, child_pid in ipairs(state.retired or {}) do children[tostring(child_pid)] = true end
        for _, record in ipairs(state.due or {}) do
            due_ns[math.floor(tonumber(record.slot) or 0) :: integer] = tonumber(record.at) or 0
        end
    end

    local function handover_state(): table
        local slots: { table } = {}
        for slot, child_pid in pairs(live) do
            slots[#slots + 1] = { slot = slot, pid = child_pid, started_ns = started_ns[slot],
                epoch = assignment_epoch[child_pid] or 0, assignment = assigned[child_pid],
                idle_version = idle[child_pid] }
        end
        table.sort(slots, function(a: table, b: table): boolean return a.slot < b.slot end)
        local retired: { string } = {}
        for child_pid in pairs(children) do
            if not slot_of[child_pid] then retired[#retired + 1] = child_pid end
        end
        table.sort(retired)
        local due: { table } = {}
        for slot, at in pairs(due_ns) do due[#due + 1] = { slot = slot, at = at } end
        return { size = size, tier_step = tier_step, slots = slots, retired = retired, due = due }
    end

    if type(handover) == "table" then adopt(handover :: table) end
    refresh_size(pool_time.now():unix_nano())
    -- Recover due work and leases before processing messages. There is no idle
    -- rescan timer; only durable deadlines discovered here can arm one.
    dispatch_idle(true)
    if admitted then retention_driver.run(pool_time.now():unix_nano()) end

    while true do
        local now = pool_time.now():unix_nano()
        local wait_ns: number? = nil
        local function consider_retry(at: number?): ()
            if at ~= nil then
                local left = math.max(0, (at :: number) - now)
                if wait_ns == nil or left < (wait_ns :: number) then wait_ns = left end
            end
        end
        consider_retry(dispatch_retry_ns)
        consider_retry(size_retry_ns)
        if admitted then
            for _, at in pairs(due_ns) do
                local left = math.max(0, at - now)
                if wait_ns == nil or left < (wait_ns :: number) then wait_ns = left end
            end
        end
        local function consider(at: number?): ()
            if at ~= nil then
                local left = math.max(0, at - now)
                if wait_ns == nil or left < (wait_ns :: number) then wait_ns = left end
            end
        end
        consider(deadline_ns)
        if admitted then consider(retention_driver.deadline()) end
        local cases = { events_ch:case_receive(), registry_ch:case_receive(), idle_ch:case_receive(), wake_ch:case_receive() }
        if wait_ns ~= nil then
            cases[#cases + 1] = pool_time.after(tostring(math.max(1, math.ceil((wait_ns :: number) / 1e6))) .. "ms"):case_receive()
        end
        local selected = pool_channel.select(cases)
        if selected.channel == registry_ch then
            if selected.ok == false then
                local drain_err = drain()
                return nil, drain_err or unavailable("job worker pool registry subscription closed", nil)
            end
            local fresh, fresh_err = registry_version.id(pool_registry)
            if fresh_err or not fresh then
                logger:error("job_worker pool registry version refresh failed: " .. tostring(fresh_err))
                size_retry_ns = pool_time.now():unix_nano() + delay_ns
            else
                local previous_version = current_version
                current_version = fresh
                refresh_size(pool_time.now():unix_nano())
                if current_version ~= previous_version then
                    dispatch_idle(false)
                end
            end
        end
        local event = selected.channel == events_ch and selected.value or nil
        if selected.channel == idle_ch then
            if accept_idle(selected.value) then dispatch_idle(false) end
        elseif selected.channel == wake_ch then
            dispatch_idle(false)
        end
        if type(event) == "table" then
            if event.kind == pool_process.event.CANCEL then
                logger:info("job_worker pool root cancelled, draining loops")
                local drain_err = drain()
                return nil, drain_err
            elseif event.kind == pool_process.event.OUTDATED then
                logger:info("job_worker pool root is outdated, upgrading in place with its slots")
                subscription:close()
                pool_process.unlisten(idle_ch)
                pool_process.unlisten(wake_ch)
                return pool_process.upgrade(nil, handover_state())
            elseif event.kind == pool_process.event.EXIT then
                local from = tostring(event.from)
                children[from] = nil
                release_exited_assignment(from)
                local slot = slot_of[from]
                if slot then
                    slot_of[from] = nil
                    live[slot] = nil
                    idle[from] = nil
                    assignment_epoch[from] = nil
                    local lived = pool_time.now():unix_nano() - (started_ns[slot] or 0)
                    due_ns[slot] = pool_time.now():unix_nano() + pool.respawn_after_ns(lived, delay_ns)
                    -- A loop also exits after observing a new registry version.
                    -- Re-read capacity here so a lost registry.commit hint cannot
                    -- leave the pool at its previous size.
                    refresh_size(pool_time.now():unix_nano())
                end
            end
        end
        now = pool_time.now():unix_nano()
        if dispatch_retry_ns ~= nil and now >= dispatch_retry_ns then
            local reclaim_retry = dispatch_retry_reclaim
            dispatch_retry_ns = nil
            dispatch_idle(reclaim_retry)
        end
        if size_retry_ns ~= nil and now >= size_retry_ns then
            local was_admitted = admitted
            refresh_size(now)
            if admitted and not was_admitted then
                dispatch_idle(true)
                retention_driver.run(now)
            end
        end
        if admitted then
            for slot, at in pairs(due_ns) do
                if at <= now then spawn(slot) end
            end
        end
        if deadline_ns ~= nil and deadline_ns <= now then
            local reclaim_due = deadline_kind == "lease"
            deadline_ns = nil
            deadline_kind = nil
            dispatch_idle(reclaim_due)
        end
        local retention_deadline = retention_driver.deadline()
        if admitted and retention_deadline ~= nil and retention_deadline <= now then
            retention_driver.run(now)
        end
    end
end

pool.new = construct
return pool
end

return construct({ sql_get = function() return sql.get(cfg.db_id()) end, policy = cfg.policy })
