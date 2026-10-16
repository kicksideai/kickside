-- Passive empty-round measurement and durable completion observations.
local sql = require("sql")
local time = require("time")
local support = require("driver_support")
local M = {}
type Map = { [string]: any }
local fail, open_db, exec, query, scalar = support.fail, support.open_db, support.exec, support.query, support.scalar
local state_get, state_set, metric = support.state_get, support.state_set, support.metric
local percentile, fmt, status_for = support.percentile, support.fmt, support.status_for
local dbtype, actor_and_threads, append_one, head = support.dbtype, support.actor_and_threads, support.append_one, support.head

local function completed_round_count(postgres: boolean): integer
    local observed = postgres and "NOW()::text"
        or "strftime('%Y-%m-%dT%H:%M:%fZ','now')"
    -- Save both facts in one post-quiet durable snapshot. Later recovery and
    -- outage phases may claim these same slots again, so their live job state
    -- cannot be used to reconstruct this cohort after run_worker returns.
    exec([[UPDATE kickside_lod_round_baseline SET observed_at=]] .. observed .. [[,
        completed=CASE WHEN EXISTS (SELECT 1 FROM kickside_automation_drive d
            WHERE d.automation_id=kickside_lod_round_baseline.automation_id
              AND d.drive_key=kickside_lod_round_baseline.drive_key
              AND d.round_seq>kickside_lod_round_baseline.round_seq
              AND d.last_round_at IS NOT NULL
              AND (kickside_lod_round_baseline.last_round_at IS NULL
                   OR d.last_round_at>kickside_lod_round_baseline.last_round_at))
            THEN 1 ELSE 0 END,
        job_completed=CASE WHEN EXISTS (SELECT 1 FROM kickside_automation_drive d
            JOIN kickside_job j ON j.id=d.job_id
            WHERE d.automation_id=kickside_lod_round_baseline.automation_id
              AND d.drive_key=kickside_lod_round_baseline.drive_key
              AND d.round_seq>kickside_lod_round_baseline.round_seq
              AND d.last_round_at IS NOT NULL
              AND (kickside_lod_round_baseline.last_round_at IS NULL
                   OR d.last_round_at>kickside_lod_round_baseline.last_round_at)
              AND j.status='pending' AND j.lease_token IS NULL
              AND j.execution_seq>kickside_lod_round_baseline.execution_seq)
            THEN 1 ELSE 0 END]])
    local rows = query("SELECT COALESCE(SUM(completed),0) AS n,MIN(observed_at) AS observed_at"
        .. " FROM kickside_lod_round_baseline")
    if rows[1] and rows[1].observed_at then state_set("empty_phase_end_at", rows[1].observed_at) end
    return math.floor(tonumber(rows[1] and rows[1].n) or 0)
end

function M.wait_empty(): Map
    local total = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_automation_drive
        WHERE source_kind='event' AND automation_id IN (SELECT id FROM kickside_lod_automations)]], nil, "n")) or 0
    if total < 1 then fail("no seeded event drives") end
    local postgres = dbtype() == sql.type.POSTGRES
    local due_expr = postgres and "NOW()" or "CURRENT_TIMESTAMP"
    local worker_predicate = postgres
        and "last_seen_at > NOW() - INTERVAL '30 seconds'"
        or "last_seen_at > datetime('now','-30 seconds')"
    local workers = query("SELECT worker_id AS id FROM kickside_job_worker_pulse WHERE " .. worker_predicate)
    if #workers < (postgres and 4 or 1) then fail("worker pool is not ready for empty-round measurement") end
    -- Drain earlier fan-out work before taking a baseline. This preparation
    -- ends before the measured release; the quiet interval contains no
    -- harness query, write, or polling loop.
    exec([[UPDATE kickside_job SET wake_enabled=FALSE,scheduled_at=NULL,wake_demand_at=NULL
        WHERE id IN (SELECT job_id FROM kickside_automation_drive WHERE source_kind='event'
          AND automation_id IN (SELECT id FROM kickside_lod_automations))]])
    -- A nonmatching event makes every event drive acquire and commit a round
    -- with zero delivered items. Clear old matching backlog first so provider
    -- time cannot enter an "empty" sample.
    exec([[UPDATE kickside_automation_drive SET event_seq=(SELECT event_count
        FROM kickside_thread WHERE id=source_thread_id)
        WHERE source_kind='event' AND automation_id IN (SELECT id FROM kickside_lod_automations)]])
    local _actor, threads = actor_and_threads()
    local sources = query("SELECT thread_id FROM kickside_lod_source_threads ORDER BY ordinal")
    for _, source in ipairs(sources) do
        local _, append_err = threads:append_event({ thread_id = tostring(source.thread_id),
            event = { type = "kickside.load:empty_probe", role = "user", body = {} } })
        if append_err then fail("empty probe event append failed: " .. tostring(append_err)) end
    end
    local ready_deadline = time.now():unix_nano() + 60 * 1000000000
    local ready = false
    while time.now():unix_nano() < ready_deadline do
        local active = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_automation_drive d
            JOIN kickside_job j ON j.id=d.job_id WHERE d.source_kind='event'
              AND d.automation_id IN (SELECT id FROM kickside_lod_automations)
              AND (j.status<>'pending' OR d.round_token IS NOT NULL)]], nil, "n")) or 0
        if active == 0 then ready = true; break end
        time.sleep("25ms")
    end
    if not ready then fail("event drives did not quiesce before empty-round release") end
    -- An append-triggered claim can still commit between the first idle check
    -- and this reset. Drain it before snapshotting execution_seq; otherwise a
    -- pre-baseline claim could appear as a newly completed empty round.
    ready = false
    ready_deadline = time.now():unix_nano() + 60 * 1000000000
    while time.now():unix_nano() < ready_deadline do
        exec([[UPDATE kickside_job SET scheduled_at=NULL,wake_demand_at=NULL
            WHERE id IN (SELECT job_id FROM kickside_automation_drive WHERE source_kind='event'
              AND automation_id IN (SELECT id FROM kickside_lod_automations))]])
        local active = tonumber(scalar([[SELECT COUNT(*) AS n FROM kickside_automation_drive d
            JOIN kickside_job j ON j.id=d.job_id WHERE d.source_kind='event'
              AND d.automation_id IN (SELECT id FROM kickside_lod_automations)
              AND (j.status<>'pending' OR j.scheduled_at IS NOT NULL
                   OR d.round_token IS NOT NULL)]], nil, "n")) or 0
        if active == 0 then ready = true; break end
        time.sleep("25ms")
    end
    if not ready then fail("event drives did not settle before the empty-round baseline") end
    exec("DELETE FROM kickside_lod_round_baseline")
    exec([[INSERT INTO kickside_lod_round_baseline(automation_id,drive_key,job_id,round_seq,execution_seq,last_round_at)
        SELECT d.automation_id,d.drive_key,j.id,d.round_seq,j.execution_seq,d.last_round_at FROM kickside_automation_drive d
        JOIN kickside_job j ON j.id=d.job_id WHERE d.source_kind='event'
          AND d.automation_id IN (SELECT id FROM kickside_lod_automations)]])
    local provider_pages_before = tonumber(scalar(
        "SELECT COUNT(*) AS n FROM kickside_lod_page_observation", nil, "n")) or 0
    local quiet_seconds = state_get("smoke") == "1" and 20 or (postgres and 180 or 10)
    -- The phase is observed only after a fixed quiet period. PostgreSQL's
    -- statement log supplies claim-start and durable-completion boundaries;
    -- this process writes and polls nothing after release until the period ends.
    state_set("empty_phase_start_at", time.now():utc():format("2006-01-02T15:04:05.000000Z07:00"))
    exec("UPDATE kickside_job SET scheduled_at=" .. due_expr .. ",wake_enabled=TRUE"
        .. " WHERE id IN (SELECT job_id FROM kickside_automation_drive WHERE source_kind='event'"
        .. " AND automation_id IN (SELECT id FROM kickside_lod_automations))")
    local released = time.now():unix_nano()
    time.sleep(tostring(quiet_seconds) .. "s")
    local done = completed_round_count(postgres)
    local job_join = postgres and "r.job_id=b.job_id::uuid" or "r.job_id=b.job_id"
    local job_histories = tonumber(scalar([[SELECT COUNT(DISTINCT r.job_id) AS n
        FROM kickside_lod_round_baseline b
        JOIN kickside_job_run r ON ]] .. job_join .. [[ AND r.execution_seq>b.execution_seq
        WHERE r.status IN ('success','skipped') AND r.finished_at IS NOT NULL]], nil, "n")) or 0
    state_set("empty_job_histories", job_histories)
    local completed_filter = "b.job_completed=1"
    local completed_jobs = tonumber(scalar([[SELECT COALESCE(SUM(job_completed),0) AS n
        FROM kickside_lod_round_baseline]], nil, "n")) or 0
    local all_histories = tonumber(scalar("SELECT COUNT(*) AS n FROM kickside_job_run", nil, "n")) or 0
    metric("empty job completion observations", "all committed rounds have finalized jobs",
        tostring(completed_jobs) .. "/" .. tostring(done),
        state_get("smoke") == "1" and "SMOKE" or
            (completed_jobs == done and "PASS" or "FAIL"),
        "Post-quiet durable job status=pending, cleared lease, and execution_seq advance; "
            .. tostring(job_histories) .. " retained terminal run histories for baseline slots out of "
            .. tostring(all_histories) .. " total histories")
    local provider_pages_after = tonumber(scalar(
        "SELECT COUNT(*) AS n FROM kickside_lod_page_observation", nil, "n")) or 0
    if provider_pages_after ~= provider_pages_before then
        fail("empty-round phase delivered provider pages: " .. tostring(provider_pages_after - provider_pages_before))
    end
    local wall_ms = (time.now():unix_nano() - released) / 1000000
    local rate_window_ms = wall_ms
    local sqlite_overhead_p95: number? = nil
    local sqlite_hard_upper_ms: number? = nil
    if not postgres then
        local boundary = state_get("empty_phase_start_at")
        local samples = query([[SELECT b.job_id,
            (julianday(j.updated_at)-julianday($1))*86400000 AS elapsed_ms
            FROM kickside_lod_round_baseline b JOIN kickside_job j ON j.id=b.job_id
            WHERE ]] .. completed_filter, { boundary })
        local elapsed: { number } = {}
        local latest = 0
        for _, row in ipairs(samples) do
            local value = tonumber(row.elapsed_ms)
            if value then
                -- SQLite's production updated_at trigger rounds to seconds.
                -- Adding one second bounds the timestamp quantization, but
                -- cannot account for a commit delayed after that trigger.
                local upper = math.max(0, value) + 1000
                elapsed[#elapsed + 1] = upper
                latest = math.max(latest, upper)
            end
        end
        if #elapsed ~= completed_jobs then fail("SQLite durable completion timestamps are incomplete") end
        sqlite_overhead_p95 = percentile(elapsed, 0.95)
        rate_window_ms = latest > 0 and latest or wall_ms
        if rate_window_ms <= 0 then rate_window_ms = wall_ms end
        -- One post-quiet snapshot proves that every counted job had committed
        -- by this time. This is a strict, queue-inclusive upper bound on each
        -- claim-to-durable-completion interval without in-interval polling.
        sqlite_hard_upper_ms = tonumber(scalar([[SELECT
            (julianday(MAX(observed_at))-julianday($1))*86400000 AS ms
            FROM kickside_lod_round_baseline]], { boundary }, "ms")) or wall_ms
        rate_window_ms = math.max(rate_window_ms, sqlite_hard_upper_ms or 0)
    end
    local completed_count = postgres and done or completed_jobs
    local conservative_rate = completed_count / math.max(rate_window_ms / 1000, 0.001)
    local rate_target = postgres and 100 or 10
    if postgres then
        metric("empty-round overhead p95", "≤50 ms",
            "awaiting passive boundary reconstruction", "UNMEASURED",
            tostring(done) .. "/" .. tostring(total) .. " durable job-and-drive completions after one quiet observation")
    else
        metric("SQLite passive empty overhead upper bound", "diagnostic", fmt(sqlite_hard_upper_ms),
            "MEASURED", "Pre-release to single post-quiet durable observation; includes queue and idle quiet time. "
                .. "Completed-row timestamp p95 plus SQLite's one-second resolution allowance="
                .. fmt(sqlite_overhead_p95) .. " ms")
    end
    metric("empty rounds/s", "≥" .. tostring(rate_target), fmt(conservative_rate),
        postgres and "UNMEASURED" or (completed_jobs == total and conservative_rate >= rate_target and "PASS" or "FAIL"),
        tostring(completed_count) .. "/" .. tostring(total) .. " committed AND job-completed rounds; SQLite uses the "
            .. "pre-release wall boundary to the single durable snapshot "
            .. "(" .. fmt(rate_window_ms) .. " ms), including queue delay; "
            .. tostring(quiet_seconds) .. " s no-poll interval")
    state_set("empty_round_done", done)
    return { empty_rounds = done, total = total, wall_ms = wall_ms,
        completed_job_histories = job_histories, completed_jobs = completed_jobs,
        conservative_rounds_per_second = conservative_rate }
end

return M
