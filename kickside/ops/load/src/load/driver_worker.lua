type Map = { [string]: any }

local sql = require("sql")
local time = require("time")
local process = require("process")
local channel = require("channel")
local wake = require("driver_wake")
local empty_round = require("empty_round")
local phases = require("phases")
local workflows = require("workflows")
local observer = require("driver_observe")
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

local function query_budget_snapshot(): Map
    return query([[SELECT
        COALESCE(SUM(CASE WHEN query ~* 'select' AND query ~* 'kickside_component_access' THEN calls ELSE 0 END),0) AS access_sql,
        COALESCE(SUM(CASE WHEN query ~* 'select' AND query ~* 'app_users|app_user_groups' THEN calls ELSE 0 END),0) AS identity_sql,
        COALESCE(SUM(CASE WHEN query ~* 'select' AND query ~* 'kickside_event' THEN calls ELSE 0 END),0) AS source_sql,
        COALESCE(SUM(CASE WHEN query ~* 'kickside_automation_receipt|kickside_lod_provider_receipt' THEN calls ELSE 0 END),0) AS receipt_sql,
        COALESCE(SUM(CASE WHEN query ~* 'kickside_retention_pin' THEN calls ELSE 0 END),0) AS pin_sql,
        COALESCE(SUM(CASE WHEN query ~* '^(update|insert)' AND query ~* 'kickside_automation_drive|kickside_job' THEN calls ELSE 0 END),0) AS drive_job_writes
        FROM pg_stat_statements
        WHERE dbid=(SELECT oid FROM pg_database WHERE datname=current_database())
          AND query !~* 'FROM pg_stat_statements'
        ]])[1] or {}
end

local function sqlite_correctness(empty: Map, recovery: Map, propagation: Map, pages: Map): ()
    local expected = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_lod_automations", nil, "n")) or 0
    local settled = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_automation_drive d
        JOIN kickside_job j ON j.id=d.job_id WHERE d.automation_id IN
        (SELECT id FROM kickside_lod_automations) AND d.round_seq>0
        AND d.round_token IS NULL AND j.status='pending']], nil, "n")) or 0
    local succeeded = tonumber(empty.completed_jobs) or 0
    local history_states = query([[SELECT r.status,COUNT(*) AS n FROM kickside_job_run r
        JOIN kickside_automation_drive d ON d.job_id=r.job_id
        WHERE d.automation_id IN (SELECT id FROM kickside_lod_automations)
        GROUP BY r.status ORDER BY r.status]])
    local history_text: { string } = {}
    for _, row in ipairs(history_states) do
        history_text[#history_text + 1] = tostring(row.status) .. "=" .. tostring(row.n)
    end
    local smoke = state_get("smoke") == "1"
    local correct = (smoke and expected >= 2 and expected <= 200 or expected == 200)
        and succeeded == expected and tonumber(empty.empty_rounds) == expected
        and tonumber(recovery.recovered) == expected
        and tonumber(recovery.replacements) >= 1
        and (smoke and expected < 200 or tonumber(recovery.elapsed_ms) <= 60000)
        and tonumber(propagation.watchers) == expected
        and (smoke and expected < 200 or tonumber(propagation.backlog_ms) <= 30000)
        and tonumber(pages.one_item_pages) > 0 and tonumber(pages.hundred_item_pages) > 0
    metric("SQLite 200-drive correctness", "200 committed and job-completed; three restart/race repetitions",
        tostring(settled) .. "/" .. tostring(expected) .. " settled; " .. tostring(succeeded)
            .. " durable job completions", not correct and "FAIL" or (smoke and "SMOKE" or "PASS"),
        "All event drives have a committed empty round and finalized job with cleared lease "
            .. "and advanced execution sequence; post-outage settled slots are diagnostic because retriable "
            .. "provider failures may remain due; "
            .. "and the 200-drive propagation and command recovery completed after injected worker termination; "
            .. "full-gate.sh requires three independent runs")
    if not correct then
        metric("SQLite drive correctness failure detail", "diagnostic", "FAILED", "FAIL",
            tostring(settled) .. "/" .. tostring(expected) .. " settled, " .. tostring(succeeded)
                .. " durable empty-phase job completions; retained histories="
                .. tostring(empty.completed_job_histories) .. "; page observations="
                .. tostring(pages.one_item_pages) .. "/" .. tostring(pages.hundred_item_pages)
                .. "; backlog_ms=" .. tostring(propagation.backlog_ms)
                .. "; current states=" .. table.concat(history_text, ","))
    end
end

local function wait_workers(expected: integer): Map
    local postgres = dbtype() == sql.type.POSTGRES
    local predicate = postgres
        and "last_seen_at > NOW() - INTERVAL '30 seconds'"
        or "last_seen_at > datetime('now','-30 seconds')"
    local deadline = time.now():unix_nano() + 90 * 1000000000
    local count = 0
    while time.now():unix_nano() < deadline do
        count = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_job_worker_pulse WHERE " .. predicate, nil, "n")) or 0
        if count >= expected then return { workers = count } end
        time.sleep("100ms")
    end
    return fail("worker pool did not become ready: " .. tostring(count) .. "/" .. tostring(expected))
end

local function await_process(pid: string, timeout: string, events: any): any
    return support.await_exit(events, pid, timeout, "child process")
end

function M.run_worker(): Map
    local postgres = dbtype() == sql.type.POSTGRES
    local expected_workers = postgres and 4 or 1
    local _ready = wait_workers(expected_workers)
    -- The empty phase must be observed passively. Start the active PG sampler
    -- only after its fixed quiet interval and completion snapshot are over.
    local empty = empty_round.wait_empty()
    if not postgres then
        local events = process.events()
        local pid, err = process.spawn_monitored("kickside.load:sqlite_round_probe", "app:processes", {})
        if err or not pid then fail("SQLite round probe start failed: " .. tostring(err)) end
        await_process(tostring(pid), "5400s", events)
    end
    local process = require("process")
    local monitor_pid: string? = nil
    local monitor_events: any = nil
    if postgres then
        monitor_events = process.events()
        local pid, err = process.spawn_monitored("kickside.load:monitor", "app:processes", {})
        if err or not pid then fail("monitor process start failed: " .. tostring(err)) end
        monitor_pid = tostring(pid)
        time.sleep("100ms")
    end
    local terminal = workflows.terminal_checks()
    local steady = wake.steady_wake()
    local propagation = wake.propagate()
    local recovery = phases.command_recovery()
    local budget_before = postgres and query_budget_snapshot() or {}
    local pages = phases.page_sizes()
    if postgres then
        local budget_after = query_budget_snapshot()
        local round_pages = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_lod_page_observation", nil, "n")) or 0
        local function delta(field: string): integer
            return math.floor(tonumber(budget_after[field]) or 0) - math.floor(tonumber(budget_before[field]) or 0)
        end
        local auth_delta = delta("access_sql")
        metric("authorization SQL calls per round", "count actual SQL", tostring(auth_delta)
            .. "/" .. tostring(round_pages), round_pages > 0 and "MEASURED" or "FAIL",
            "pg_stat_statements SELECT calls on the component access table during the 1/100-page cohort; "
                .. "one page is delivered per committed round; ratio=" .. fmt(auth_delta / math.max(1, round_pages)))
        metric("round query budget", "count access, identity, source, receipt, pin and write SQL",
            "access=" .. tostring(auth_delta) .. ", identity=" .. tostring(delta("identity_sql"))
                .. ", source=" .. tostring(delta("source_sql")) .. ", receipt="
                .. tostring(delta("receipt_sql")) .. ", pin=" .. tostring(delta("pin_sql"))
                .. ", drive/job writes=" .. tostring(delta("drive_job_writes")),
            round_pages > 0 and "MEASURED" or "FAIL",
            tostring(round_pages) .. " observed production pages/rounds; pg_stat_statements call deltas over the page cohort; "
                .. "fixture runs real component.open reference checks and durable provider receipts")
    else
        local round_pages = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_lod_page_observation", nil, "n")) or 0
        metric("reference access calls per round", "one per delivered page", tostring(round_pages),
            round_pages > 0 and "MEASURED" or "FAIL",
            "Each fixture page invokes production component.open(READ) before its durable page observation; SQLite lacks a statement counter, so this is API-call count rather than SQL-statement count")
    end

    -- Run the actual retention library in a sibling process while appends race it.
    local append: any = { samples = 0, p99_ms = nil }
    if postgres then
        local prune_events = process.events()
        local prune_pid, spawn_err = process.spawn_monitored("kickside.load:prune_only", "app:processes", {})
        if spawn_err or not prune_pid then fail("prune process start failed: " .. tostring(spawn_err)) end
        append = observer.append_prune_thread()
        await_process(tostring(prune_pid), "300s", prune_events)
    else
        metric("prune events", "N/A for SQLite", "N/A", "N/A", "v4 prune/vacuum performance gate is PostgreSQL-only")
        metric("append p99 during prune", "N/A for SQLite", "N/A", "N/A", "No append/prune phase on SQLite")
    end
    local soak = wake.soak()
    local evidence = workflows.evidence_after_outage()
    if not postgres then sqlite_correctness(empty, recovery, propagation, pages) end

    if postgres then
        state_set("monitor_stop", "1")
        if monitor_pid and monitor_events then await_process(monitor_pid, "10s", monitor_events) end
        observer.monitor_report()
    else
        observer.monitor_report()
    end
    M.check_plans()
    return { empty = empty, steady = steady, propagation = propagation,
        append_during_prune = append, command_recovery = recovery, pages = pages,
        terminal_checks = terminal, soak = soak, evidence = evidence }
end

function M.check_plans(): Map
    local postgres = dbtype() == sql.type.POSTGRES
    local source_thread = state_get("source_thread_id")
    local automation_id = state_get("automation_id")
    local statements: { string }
    if postgres then
        statements = {
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM kickside_job WHERE status='pending' AND scheduled_at IS NOT NULL
              AND scheduled_at <= NOW() AND queue_tier='live' ORDER BY scheduled_at,priority DESC,concurrency_key,id LIMIT 16]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=']] .. automation_id
                .. [[' AND source_port='kickside.load:events' AND state IN ('retrying','waiting')
                    AND next_attempt_at <= to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"+00:00"')
                    ORDER BY next_attempt_at LIMIT 100]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT id,seq FROM kickside_event WHERE thread_id=']] .. source_thread
                .. [['::uuid AND seq > 0 ORDER BY seq LIMIT 100]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT id,component_id FROM kickside_thread WHERE id=']]
                .. source_thread .. [['::uuid LIMIT 1]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM kickside_thread_edge WHERE from_thread_id=']]
                .. source_thread .. [['::uuid AND active=TRUE ORDER BY updated_at DESC LIMIT 200]],
            -- Source inventory: automation drive.wake_due/missing_slots,
            -- core observer.prune_tx, jobs wake.nudge_workers, round.reconcile.stale.
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT automation_id,drive_key,job_id FROM kickside_automation_drive
                WHERE wake_generation>wake_applied_generation ORDER BY automation_id,drive_key LIMIT 200]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT automation_id,drive_key FROM kickside_automation_drive
                WHERE automation_id=']] .. automation_id .. [[' AND drive_key='main' LIMIT 1]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT automation_id,drive_key FROM kickside_automation_drive
                WHERE job_id IS NULL AND pending_command_id IS NULL AND source_kind<>'none'
                ORDER BY automation_id,drive_key LIMIT 200]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT MIN(cursor_seq) FROM kickside_retention_pin
                WHERE thread_id=']] .. source_thread .. [['::uuid]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT MIN(last_seq) FROM kickside_projection_cursor
                WHERE thread_id=']] .. source_thread .. [['::uuid AND status<>'invalid']],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT seq FROM kickside_event WHERE thread_id=']]
                .. source_thread .. [['::uuid AND seq>0 ORDER BY seq LIMIT 100]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT demand_generation,ack_generation
                FROM kickside_wake_fanout WHERE key='thread:]] .. source_thread .. [[' LIMIT 1]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM kickside_job
                WHERE wake_key='thread:]] .. source_thread .. [[' AND wake_enabled=TRUE
                  AND status IN ('pending','running') AND wake_generation<999999
                ORDER BY id LIMIT 201]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT p.worker_id FROM kickside_job_worker_pulse p
                JOIN kickside_job_worker w ON w.id=p.worker_id
                WHERE p.last_seen_at>NOW()-INTERVAL '30 seconds']],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT DISTINCT r.item_key FROM kickside_automation_receipt r
                WHERE r.owner_id=']] .. automation_id .. [[' AND r.source_port='kickside.load:events'
                  AND r.pass_id IS NULL AND NOT EXISTS (SELECT 1 FROM kickside_trigger_item_ledger l
                    WHERE l.owner_id=r.owner_id AND l.source_port=r.source_port
                      AND l.item_key=r.item_key AND l.state<>'resolved')
                ORDER BY r.item_key LIMIT 100]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT automation_id FROM kickside_automation_command
                WHERE pending_request_id IS NOT NULL AND next_attempt_at <= NOW()::text
                ORDER BY pending_step,next_attempt_at,automation_id LIMIT 200]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT run_id FROM workflow_runs
                WHERE status IN ('pending','running') AND execution_identity_json IS NOT NULL
                  AND execution_identity_json<>'' AND completion_check_at IS NOT NULL
                  AND completion_check_at <= NOW()::text
                ORDER BY completion_check_at,run_id LIMIT 50]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT run_id FROM workflow_runs
                WHERE terminal_event_pending AND terminal_event_check_at IS NOT NULL
                  AND terminal_event_check_at <= NOW()::text
                ORDER BY terminal_event_check_at,run_id LIMIT 50]],
            [[EXPLAIN (ANALYZE, BUFFERS) SELECT run_id FROM workflow_runs
                WHERE status IN ('pending','running') AND (execution_identity_json IS NULL OR execution_identity_json='')
                ORDER BY started_at,run_id LIMIT 50]],
        }
    else
        statements = {
            [[EXPLAIN QUERY PLAN SELECT id FROM kickside_job WHERE status='pending' AND scheduled_at IS NOT NULL
              AND scheduled_at <= CURRENT_TIMESTAMP AND queue_tier='live' ORDER BY scheduled_at,priority DESC,concurrency_key,id LIMIT 16]],
            [[EXPLAIN QUERY PLAN SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=']] .. automation_id
                .. [[' AND source_port='kickside.load:events' AND state IN ('retrying','waiting') AND next_attempt_at <= CURRENT_TIMESTAMP
                    ORDER BY next_attempt_at LIMIT 100]],
            [[EXPLAIN QUERY PLAN SELECT id,seq FROM kickside_event WHERE thread_id=']] .. source_thread
                .. [[' AND seq > 0 ORDER BY seq LIMIT 100]],
            [[EXPLAIN QUERY PLAN SELECT id,component_id FROM kickside_thread WHERE id=']]
                .. source_thread .. [[' LIMIT 1]],
            [[EXPLAIN QUERY PLAN SELECT id FROM kickside_thread_edge WHERE from_thread_id=']]
                .. source_thread .. [[' AND active=1 ORDER BY updated_at DESC LIMIT 200]],
            [[EXPLAIN QUERY PLAN SELECT automation_id,drive_key,job_id FROM kickside_automation_drive
                WHERE wake_generation>wake_applied_generation ORDER BY automation_id,drive_key LIMIT 200]],
            [[EXPLAIN QUERY PLAN SELECT automation_id,drive_key FROM kickside_automation_drive
                WHERE automation_id=']] .. automation_id .. [[' AND drive_key='main' LIMIT 1]],
            [[EXPLAIN QUERY PLAN SELECT automation_id,drive_key FROM kickside_automation_drive
                WHERE job_id IS NULL AND pending_command_id IS NULL AND source_kind<>'none'
                ORDER BY automation_id,drive_key LIMIT 200]],
            [[EXPLAIN QUERY PLAN SELECT MIN(cursor_seq) FROM kickside_retention_pin
                WHERE thread_id=']] .. source_thread .. [[']],
            [[EXPLAIN QUERY PLAN SELECT MIN(last_seq) FROM kickside_projection_cursor
                WHERE thread_id=']] .. source_thread .. [[' AND status<>'invalid']],
            [[EXPLAIN QUERY PLAN SELECT seq FROM kickside_event WHERE thread_id=']]
                .. source_thread .. [[' AND seq>0 ORDER BY seq LIMIT 100]],
            [[EXPLAIN QUERY PLAN SELECT demand_generation,ack_generation
                FROM kickside_wake_fanout WHERE key='thread:]] .. source_thread .. [[' LIMIT 1]],
            [[EXPLAIN QUERY PLAN SELECT id FROM kickside_job
                WHERE wake_key='thread:]] .. source_thread .. [[' AND wake_enabled=1
                  AND status IN ('pending','running') AND wake_generation<999999
                ORDER BY id LIMIT 201]],
            [[EXPLAIN QUERY PLAN SELECT p.worker_id FROM kickside_job_worker_pulse p
                JOIN kickside_job_worker w ON w.id=p.worker_id
                WHERE p.last_seen_at>datetime('now','-30 seconds')]],
            [[EXPLAIN QUERY PLAN SELECT DISTINCT r.item_key FROM kickside_automation_receipt r
                WHERE r.owner_id=']] .. automation_id .. [[' AND r.source_port='kickside.load:events'
                  AND r.pass_id IS NULL AND NOT EXISTS (SELECT 1 FROM kickside_trigger_item_ledger l
                    WHERE l.owner_id=r.owner_id AND l.source_port=r.source_port
                      AND l.item_key=r.item_key AND l.state<>'resolved')
                ORDER BY r.item_key LIMIT 100]],
            [[EXPLAIN QUERY PLAN SELECT automation_id FROM kickside_automation_command
                WHERE pending_request_id IS NOT NULL AND next_attempt_at <= CURRENT_TIMESTAMP
                ORDER BY pending_step,next_attempt_at,automation_id LIMIT 200]],
            [[EXPLAIN QUERY PLAN SELECT run_id FROM workflow_runs
                WHERE status IN ('pending','running') AND execution_identity_json IS NOT NULL
                  AND execution_identity_json<>'' AND completion_check_at IS NOT NULL
                  AND completion_check_at <= CURRENT_TIMESTAMP
                ORDER BY completion_check_at,run_id LIMIT 50]],
            [[EXPLAIN QUERY PLAN SELECT run_id FROM workflow_runs
                WHERE terminal_event_pending=1 AND terminal_event_check_at IS NOT NULL
                  AND terminal_event_check_at <= CURRENT_TIMESTAMP
                ORDER BY terminal_event_check_at,run_id LIMIT 50]],
            [[EXPLAIN QUERY PLAN SELECT run_id FROM workflow_runs
                WHERE status IN ('pending','running') AND (execution_identity_json IS NULL OR execution_identity_json='')
                ORDER BY started_at,run_id LIMIT 50]],
        }
    end
    local db = open_db()
    local scans = 0
    local plans: { string } = {}
    for _, statement in ipairs(statements) do
        local rows, err = db:query(statement)
        if err then db:release(); metric("indexed hot queries", "0 sequential scans", "query error", "FAIL", tostring(err)); return { error = tostring(err) } end
        for _, row in ipairs(rows or {}) do
            local line = tostring(row["QUERY PLAN"] or row.detail or "")
            plans[#plans + 1] = line
            local upper = string.upper(line)
            if string.find(line, "Seq Scan", 1, true)
                or ((string.find(upper, "SCAN KICKSIDE_", 1, true)
                    or string.find(upper, "SCAN WORKFLOW_RUNS", 1, true))
                    and not string.find(upper, "USING INDEX", 1, true)) then scans = scans + 1 end
        end
    end
    db:release()
    metric("indexed hot queries", "0 sequential scans", tostring(scans), scans == 0 and "PASS" or "FAIL",
        table.concat(plans, " | "))
    return { sequential_scans = scans }
end


return M
