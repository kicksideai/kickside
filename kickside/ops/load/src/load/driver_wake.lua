type Map = { [string]: any }

local sql = require("sql")
local time = require("time")
local process = require("process")
local support = require("driver_support")
local db_acquire_waits = support.db_acquire_waits
local fail = support.fail
local open_db = support.open_db
local exec = support.exec
local query = support.query
local scalar = support.scalar
local state_get = support.state_get
local state_set = support.state_set
local metric = support.metric
local percentile = support.percentile
local fmt = support.fmt
local status_for = support.status_for
local dbtype = support.dbtype
local actor_and_threads = support.actor_and_threads
local append_one = support.append_one
local head = support.head
local DB = support.DB
local EVENT_TYPE = support.EVENT_TYPE
local EVENT_KIND = support.EVENT_KIND
local MANAGE_TOOL = support.MANAGE_TOOL
local PROC_SCOPE = support.PROC_SCOPE

local M = {}

function M.append_samples(): Map
    local _actor, threads = actor_and_threads()
    local source_thread = state_get("source_thread_id")
    local wake_key = "thread:" .. source_thread
    local automation_id = state_get("automation_id")
    local samples_each = state_get("smoke") == "1" and 5 or 100
    local initial: { number } = {}
    local coalesced: { number } = {}
    local function reset_fanout(): ()
        exec([[UPDATE kickside_job SET scheduled_at=NULL,wake_demand_at=NULL,
            wake_generation=COALESCE((SELECT demand_generation FROM kickside_wake_fanout WHERE key=$1),0)
            WHERE id IN (SELECT job_id FROM kickside_automation_drive
                WHERE source_thread_id=$2 AND source_kind='event'
                  AND automation_id IN (SELECT id FROM kickside_lod_automations))]],
            { wake_key, source_thread })
        exec("UPDATE kickside_wake_fanout SET ack_generation=demand_generation WHERE key=$1", { wake_key })
        exec("DELETE FROM kickside_job WHERE job_type='kickside.wake.continuation' AND status='pending'")
    end
    for i = 1, samples_each do
        reset_fanout()
        local started = time.now():unix_nano()
        append_one(threads, source_thread, "lod-initial-append-" .. tostring(i))
        initial[#initial + 1] = (time.now():unix_nano() - started) / 1000000
    end
    reset_fanout()
    append_one(threads, source_thread, "lod-coalesced-primer")
    local first_generation = tonumber(scalar("SELECT demand_generation FROM kickside_wake_fanout WHERE key=$1",
        { wake_key }, "demand_generation")) or 0
    local continuation_pending = (tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_job
        WHERE wake_key=$1 AND wake_generation<$2]], { wake_key, first_generation }, "n")) or 0) > 0
    if continuation_pending then
        for i = 1, samples_each do
            local started = time.now():unix_nano()
            append_one(threads, source_thread, "lod-coalesced-append-" .. tostring(i))
            coalesced[#coalesced + 1] = (time.now():unix_nano() - started) / 1000000
        end
        local rewritten = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_job
            WHERE wake_key=$1 AND wake_generation>$2]], { wake_key, first_generation }, "n")) or 0
        metric("coalesced watcher rewrites", "0", tostring(rewritten), rewritten == 0 and "PASS" or "FAIL",
            "Demand was advanced while a continuation remained queued")
    else
        metric("coalesced watcher rewrites", "N/A", "no continuation", "N/A",
            "Fixture fits in the synchronous fan-out batch")
    end
    local postgres = dbtype() == sql.type.POSTGRES
    local initial_p95, coalesced_p95 = percentile(initial, 0.95), percentile(coalesced, 0.95)
    metric("initial fan-out append p95", postgres and "≤15 ms" or "N/A for SQLite", fmt(initial_p95),
        postgres and status_for(initial_p95, 15) or "N/A",
        tostring(#initial) .. " independent initial bounded fan-outs; reset occurs between measured appends")
    metric("coalesced append p95", "diagnostic", fmt(coalesced_p95),
        #coalesced >= samples_each and "MEASURED" or "N/A",
        tostring(#coalesced) .. " continuation-backed appends; measured separately from initial fan-out")
    metric("append+wake p95", postgres and "≤15 ms" or "N/A for SQLite", fmt(initial_p95),
        postgres and status_for(initial_p95, 15) or "N/A",
        tostring(#initial) .. " initial fan-out appends through the thread contract")
    local event_seq = head(source_thread)
    exec([[UPDATE kickside_automation_drive SET event_seq=$1,round_token=NULL,round_until=NULL
        WHERE automation_id=$2]], { event_seq, automation_id })
    reset_fanout()
    return { initial_samples = #initial, coalesced_samples = #coalesced,
        initial_p95_ms = initial_p95, coalesced_p95_ms = coalesced_p95, event_seq = event_seq }
end

-- A wake with one eligible parked slot measures notification-to-claim while
-- workers are idle. The burst below measures fanout and backlog separately:
-- its last watcher cannot be claimed until earlier rounds release capacity.
function M.steady_wake(): Map
    local automation_id = state_get("automation_id")
    local source_thread = state_get("source_thread_id")
    local postgres = dbtype() == sql.type.POSTGRES
    local slot = query([[SELECT j.id AS job_id,j.execution_seq FROM kickside_automation_drive d
        JOIN kickside_job j ON j.id=d.job_id WHERE d.automation_id=$1 AND d.drive_key='main']],
        { automation_id })[1]
    if not slot then fail("steady wake slot is missing") end
    exec([[UPDATE kickside_job SET wake_enabled=FALSE WHERE id IN
        (SELECT job_id FROM kickside_automation_drive
         WHERE automation_id IN (SELECT id FROM kickside_lod_automations)
           AND source_kind='event'
           AND NOT (automation_id=$1 AND drive_key='main'))]], { automation_id })
    local _, threads = actor_and_threads()
    local samples: { number } = {}
    local count = state_get("smoke") == "1" and 3 or 100
    for index = 1, count do
        local baseline = tonumber(slot.execution_seq) or 0
        append_one(threads, source_thread, "lod-steady-wake-" .. tostring(index))
        local published_ns = time.now():unix_nano()
        local target_seq = head(source_thread)
        local deadline = published_ns + 10000000000
        local claimed = false
        while time.now():unix_nano() < deadline do
            local current = query([[SELECT j.execution_seq,j.status,j.scheduled_at,d.event_seq
                FROM kickside_automation_drive d JOIN kickside_job j ON j.id=d.job_id
                WHERE d.automation_id=$1 AND d.drive_key='main']], { automation_id })[1]
            if current and (tonumber(current.execution_seq) or 0) > baseline and not claimed then
                samples[#samples + 1] = (time.now():unix_nano() - published_ns) / 1000000
                claimed = true
            end
            if claimed and current and (tonumber(current.event_seq) or 0) >= target_seq
                and tostring(current.status) == "pending" and current.scheduled_at == nil then
                slot.execution_seq = current.execution_seq
                break
            end
            time.sleep("2ms")
        end
        if not claimed or (tonumber(slot.execution_seq) or 0) <= baseline then
            local current = query([[SELECT j.status,j.scheduled_at,j.execution_seq,j.attempts,
                d.event_seq,d.round_seq,d.phase,d.last_error_json
                FROM kickside_automation_drive d JOIN kickside_job j ON j.id=d.job_id
                WHERE d.automation_id=$1 AND d.drive_key='main']], { automation_id })[1] or {}
            fail("steady wake did not claim and complete sample " .. tostring(index)
                .. "; baseline=" .. tostring(baseline) .. " claimed=" .. tostring(claimed)
                .. " status=" .. tostring(current.status) .. " scheduled=" .. tostring(current.scheduled_at)
                .. " execution=" .. tostring(current.execution_seq) .. " attempts=" .. tostring(current.attempts)
                .. " event_seq=" .. tostring(current.event_seq) .. " round_seq=" .. tostring(current.round_seq)
                .. " phase=" .. tostring(current.phase) .. " error=" .. tostring(current.last_error_json))
        end
    end
    local event_seq = head(source_thread)
    exec("UPDATE kickside_automation_drive SET event_seq=$1 WHERE automation_id=$2", { event_seq, automation_id })
    exec([[UPDATE kickside_job SET wake_enabled=TRUE,scheduled_at=NULL,wake_demand_at=NULL,
        wake_generation=COALESCE((SELECT demand_generation FROM kickside_wake_fanout
            WHERE key=kickside_job.wake_key),0)
        WHERE id IN (SELECT job_id FROM kickside_automation_drive
            WHERE source_kind='event'
              AND automation_id IN (SELECT id FROM kickside_lod_automations))]])
    local p99 = percentile(samples, 0.99)
    metric("wake-to-claim p99", postgres and "≤2,000 ms" or "N/A for SQLite", fmt(p99),
        postgres and status_for(p99, 2000) or "N/A",
        tostring(#samples) .. "/" .. tostring(count) .. " isolated append notifications with one parked slot; commit return to execution_seq advance, 2 ms observation poll")
    return { samples = #samples, p99_ms = p99 }
end

local function watch_filter(postgres: boolean): string
    if postgres then return "drive_key LIKE 'watch-%'" end
    return "(drive_key='main' OR drive_key LIKE 'base-%')"
end

function M.propagate(): Map
    local automation_id = state_get("automation_id")
    local source_thread = state_get("source_thread_id")
    local postgres = dbtype() == sql.type.POSTGRES
    local filter = watch_filter(postgres)
    exec("DELETE FROM kickside_lod_watch_baseline")
    local owner_filter = postgres and "d.automation_id=$1" or
        "d.automation_id IN (SELECT id FROM kickside_lod_automations)"
    local baseline_sql = "INSERT INTO kickside_lod_watch_baseline(automation_id,drive_key,job_id,execution_seq) "
        .. "SELECT d.automation_id,d.drive_key,d.job_id,j.execution_seq FROM kickside_automation_drive d "
        .. "JOIN kickside_job j ON j.id=d.job_id WHERE " .. owner_filter .. " AND " .. filter
    if postgres then
        exec(baseline_sql, { automation_id })
    else
        exec(baseline_sql)
    end
    local watchers = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_lod_watch_baseline", nil, "n")) or 0
    if watchers < 1 then fail("watcher fixture is empty") end
    if postgres then
        exec([[UPDATE kickside_job SET wake_enabled=FALSE,scheduled_at=NULL WHERE id IN
            (SELECT job_id FROM kickside_automation_drive WHERE automation_id=$1
             AND (drive_key='main' OR drive_key LIKE 'base-%'))]], { automation_id })
    end
    local _actor, threads = actor_and_threads()
    local start_ns = time.now():unix_nano()
    append_one(threads, source_thread, "lod-watch-propagation-burst")
    local event_seq = head(source_thread)
    local key = "thread:" .. source_thread
    local ack_ms: number? = nil
    local drain_ms: number? = nil
    local claimed: { [string]: boolean } = {}
    local claim_samples: { number } = {}
    local function collect_claims(): ()
        local job_join = postgres and "j.id::text=b.job_id" or "j.id=b.job_id"
        local observations = query([[SELECT b.automation_id,b.drive_key FROM kickside_lod_watch_baseline b
            JOIN kickside_job j ON ]] .. job_join .. [[
            WHERE j.execution_seq>b.execution_seq]], nil)
        local observed_ns = time.now():unix_nano()
        for _, row in ipairs(observations) do
            local key = tostring(row.automation_id) .. "/" .. tostring(row.drive_key)
            if not claimed[key] then
                claimed[key] = true
                claim_samples[#claim_samples + 1] = (observed_ns - start_ns) / 1000000
            end
        end
    end
    local deadline = start_ns + 600 * 1000000000
    while time.now():unix_nano() < deadline do
        collect_claims()
        local elapsed = (time.now():unix_nano() - start_ns) / 1000000
        if ack_ms == nil then
            local ack = query("SELECT ack_generation,demand_generation FROM kickside_wake_fanout WHERE key=$1", { key })
            if ack[1] and tonumber(ack[1].ack_generation) >= tonumber(ack[1].demand_generation) then ack_ms = elapsed end
        end
        if drain_ms == nil then
            local event_parameter = postgres and "$2" or "$1"
            local waiting = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_automation_drive d "
                .. "WHERE " .. owner_filter .. " AND " .. filter .. " AND d.event_seq<" .. event_parameter,
                postgres and { automation_id, event_seq } or { event_seq }, "n")) or 0
            if waiting == 0 then drain_ms = elapsed end
        end
        if ack_ms ~= nil and drain_ms ~= nil and #claim_samples >= watchers then break end
        time.sleep("5ms")
    end
    collect_claims()
    if ack_ms == nil then ack_ms = (time.now():unix_nano() - start_ns) / 1000000 end
    if drain_ms == nil then drain_ms = (time.now():unix_nano() - start_ns) / 1000000 end
    local wake_claim_p99 = percentile(claim_samples, 0.99)
    local claim_coverage = #claim_samples .. "/" .. tostring(watchers)
    if postgres then
        local propagation_status = watchers >= 10000 and ack_ms <= 5000 and "PASS"
            or (watchers >= 10000 and "FAIL" or "PARTIAL")
        metric("10,000-watcher propagation", "≤5,000 ms for 10,000 watchers", fmt(ack_ms), propagation_status,
            tostring(watchers) .. " watchers exercised; measured fanout acknowledgment for this configured scale")
        metric("burst watcher claim p99", "diagnostic", fmt(wake_claim_p99),
            #claim_samples < watchers and "PARTIAL" or "MEASURED",
            claim_coverage .. " jobs observed with execution_seq advanced; append start to first 5 ms-poll observation, including round backlog")
    else
        metric("10,000-watcher propagation", "N/A for SQLite", fmt(ack_ms), "N/A",
            tostring(watchers) .. " SQLite drive slots exercised; 10,000-watcher gate is PostgreSQL-only")
        metric("burst watcher claim p99", "N/A for SQLite", fmt(wake_claim_p99), "N/A",
            claim_coverage .. " SQLite slots; driver poll upper bound for comparison, no §15.1 SQLite target")
    end
    local drain_target = postgres and 120000 or 30000
    metric("backlog drain", "≤" .. tostring(drain_target) .. " ms", fmt(drain_ms),
        drain_ms <= drain_target and "PASS" or "FAIL", tostring(watchers) .. " real round slots advanced through event_seq")
    if postgres then
        exec([[UPDATE kickside_job SET wake_enabled=TRUE,scheduled_at=NULL WHERE id IN
            (SELECT job_id FROM kickside_automation_drive WHERE automation_id=$1
             AND (drive_key='main' OR drive_key LIKE 'base-%'))]], { automation_id })
        exec([[UPDATE kickside_automation_drive SET event_seq=$1 WHERE automation_id=$2
            AND (drive_key='main' OR drive_key LIKE 'base-%')]], { event_seq, automation_id })
    end
    state_set("propagation_event_seq", event_seq)
    return { watchers = watchers, propagation_ms = ack_ms, backlog_ms = drain_ms, event_seq = event_seq }
end

-- Keep the installed interval slots and event consumer active for a full
-- provider-outage soak. Smoke runs two seconds and never supplies a verdict.
function M.soak(): Map
    local postgres = dbtype() == sql.type.POSTGRES
    local smoke = state_get("smoke") == "1"
    local duration_s = smoke and 2 or 1800
    local interval_s = smoke and 1 or 10
    local due_expr = postgres and "NOW()" or "CURRENT_TIMESTAMP"
    if postgres then
        exec("UPDATE kickside_job SET scheduled_at=" .. due_expr
            .. " WHERE id IN (SELECT job_id FROM kickside_automation_drive WHERE source_kind='timer'"
            .. " AND automation_id IN (SELECT id FROM kickside_lod_timer_automations))")
    end
    local source = query([[SELECT thread_id FROM kickside_lod_automations
        ORDER BY ordinal DESC LIMIT 1]])[1]
    if not source then fail("soak source automation is missing") end
    local source_thread = tostring(source.thread_id)
    local protected_owner = state_get("automation_id")
    local protected_key = "lod-protected:" .. protected_owner
    local old = "2000-01-01T00:00:00Z"
    exec([[INSERT INTO kickside_automation_prepared
        (automation_id,idempotency_key,payload_hash,prepared_json,created_at,settled_at)
        VALUES($1,$2,'lod-protected-hash','{"retry":"original payload"}',$3,NULL)]],
        { protected_owner, protected_key, old })
    exec([[INSERT INTO kickside_automation_receipt
        (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
        VALUES($1,'kickside.load:events',$2,'protected',$2,'{}',$3)]],
        { protected_owner, protected_key, old })
    exec([[INSERT INTO kickside_trigger_item_ledger
        (owner_id,source_port,item_key,identity_key,state,first_failed_at,last_failed_at,
         created_at,updated_at,envelope_json,error_code,terminal)
        VALUES($1,'kickside.load:events',$2,$2,'uncertain',$3,$3,$3,$3,
        '','provider_uncertain',FALSE)]],
        { protected_owner, protected_key, old })
    local initial_unresolved = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger
        WHERE owner_id IN (SELECT id FROM kickside_lod_automations) AND state<>'resolved']], nil, "n")) or 0
    local initial_receipts = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_lod_provider_receipt", nil, "n")) or 0
    local _actor, threads = actor_and_threads()
    state_set("provider_outage", "1")
    local started = time.now():unix_nano()
    local deadline = started + duration_s * 1000000000
    local next_tick = started
    local appends = 0
    local pulse_gaps = 0
    while time.now():unix_nano() < deadline do
        local now = time.now():unix_nano()
        if now >= next_tick then
            appends = appends + 1
            append_one(threads, source_thread, "lod-outage-" .. tostring(appends))
            next_tick = now + interval_s * 1000000000
            local pulse_predicate = postgres
                and "last_seen_at > NOW() - INTERVAL '30 seconds'"
                or "last_seen_at > datetime('now','-30 seconds')"
            local pulses = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_job_worker_pulse WHERE "
                .. pulse_predicate, nil, "n")) or 0
            if pulses < (postgres and 4 or 1) then pulse_gaps = pulse_gaps + 1 end
            local unresolved_now = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger
                WHERE owner_id IN (SELECT id FROM kickside_lod_automations) AND state<>'resolved']], nil, "n")) or 0
            local bytes_now = tonumber(scalar([[SELECT COALESCE(SUM(LENGTH(envelope_json)),0) AS n
                FROM kickside_trigger_item_ledger WHERE owner_id IN
                (SELECT id FROM kickside_lod_automations) AND state<>'resolved']], nil, "n")) or 0
            local pending_wakes = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_automation_drive
                WHERE automation_id IN (SELECT id FROM kickside_lod_automations)
                  AND wake_generation>wake_applied_generation]], nil, "n")) or 0
            exec([[INSERT INTO kickside_lod_outage_observation
                (tick,unresolved,unresolved_bytes,pending_wakes,observed_at) VALUES($1,$2,$3,$4,$5)]],
                { appends, unresolved_now, bytes_now, pending_wakes, time.now():utc():format(time.RFC3339) })
        end
        time.sleep("100ms")
    end
    local elapsed_s = (time.now():unix_nano() - started) / 1000000000
    local unresolved = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger
        WHERE owner_id IN (SELECT id FROM kickside_lod_automations) AND state<>'resolved']], nil, "n")) or 0
    local receipts = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_lod_provider_receipt", nil, "n")) or 0
    local protected = tonumber(scalar([[SELECT
        (SELECT COUNT(*) FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2 AND settled_at IS NULL)
        +(SELECT COUNT(*) FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key=$2)
        +(SELECT COUNT(*) FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key=$2 AND state='uncertain') AS n]],
        { protected_owner, protected_key }, "n")) or 0
    local growth = query([[SELECT MIN(unresolved) AS min_rows,MAX(unresolved) AS max_rows,
        MIN(unresolved_bytes) AS min_bytes,MAX(unresolved_bytes) AS max_bytes,
        MAX(pending_wakes) AS max_pending_wakes,
        COUNT(*) AS samples FROM kickside_lod_outage_observation]])[1] or {}
    state_set("provider_outage", "0")
    append_one(threads, source_thread, "lod-outage-recovery")
    metric("30-minute soak", "≥1800 s; healthy workers", fmt(elapsed_s),
        smoke and "SMOKE" or (elapsed_s >= 1800 and pulse_gaps == 0 and appends >= 100 and "PASS" or "FAIL"),
        tostring(appends) .. " appends; " .. tostring(pulse_gaps) .. " missing worker-pulse samples")
    metric("30-minute provider outage", "30 min; retry evidence retained",
        tostring(unresolved - initial_unresolved) .. " additional unresolved",
        smoke and "SMOKE" or (elapsed_s >= 1800 and unresolved > initial_unresolved
            and receipts == initial_receipts and "PASS" or "FAIL"),
        "Fixture consumer returned retriable unavailable outcomes; "
            .. tostring(receipts - initial_receipts) .. " provider receipts written during outage; "
            .. "provider fixture receipt writes exercise durable local settlement cost")
    metric("protected prepared/uncertain evidence", "3 aged rows survive outage",
        tostring(protected) .. "/3", smoke and "SMOKE" or (protected == 3 and "PASS" or "FAIL"),
        "Unsettled prepared row is the sole original retry payload; source receipt and uncertain ledger marker were aged to 2000 before outage and remain afterward")
    metric("unresolved outage growth", "sample every 10 s", tostring(growth.min_rows or 0)
        .. "→" .. tostring(growth.max_rows or 0) .. " rows; " .. tostring(growth.min_bytes or 0)
        .. "→" .. tostring(growth.max_bytes or 0) .. " bytes", smoke and "SMOKE" or
        (tonumber(growth.samples) or 0) >= 180 and "MEASURED" or "FAIL",
        tostring(growth.samples or 0) .. " durable samples; original envelopes are counted, not pruned")
    metric("outage control wake observations", "durable sampled demand",
        tostring(growth.max_pending_wakes or 0) .. " maximum pending wakes",
        smoke and "SMOKE" or "MEASURED",
        tostring(growth.samples or 0) .. " samples of wake_generation>wake_applied_generation during outage")
    return { elapsed_s = elapsed_s, appends = appends, unresolved_growth = unresolved - initial_unresolved,
        pulse_gaps = pulse_gaps }
end

return M
