type Map = { [string]: any }

local sql = require("sql")
local time = require("time")
local prune_lib = require("prune_lib")
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

function M.monitor(): Map
    local db = open_db()
    while true do
        local stop_rows, stop_err = db:query("SELECT value FROM kickside_lod_state WHERE key='monitor_stop'")
        if stop_err then db:release(); fail("monitor stop check failed: " .. tostring(stop_err)) end
        if stop_rows[1] and tostring(stop_rows[1].value) == "1" then break end
        local statement = [[INSERT INTO kickside_lod_observation(observed_at,xact_age_ms,lock_waiters,lock_age_ms,deadlocks,hot_statement)
            SELECT clock_timestamp(),COALESCE(MAX(EXTRACT(EPOCH FROM (clock_timestamp()-xact_start))*1000),0),
              (SELECT COUNT(*) FROM pg_locks WHERE NOT granted),
              COALESCE(MAX(CASE WHEN wait_event_type='Lock'
                THEN EXTRACT(EPOCH FROM (clock_timestamp()-query_start))*1000 ELSE 0 END),0),
              (SELECT deadlocks FROM pg_stat_database WHERE datname=current_database()),
              COALESCE((SELECT LEFT(query,2000) FROM pg_stat_activity
                WHERE datname=current_database() AND pid<>pg_backend_pid() AND state='active'
                ORDER BY EXTRACT(EPOCH FROM (clock_timestamp()-query_start)) DESC LIMIT 1),'')
            FROM pg_stat_activity WHERE datname=current_database() AND pid<>pg_backend_pid()
              AND state='active' AND xact_start IS NOT NULL]]
        local _, sample_err = db:execute(statement)
        if sample_err then db:release(); fail("pg_stat_activity sample failed: " .. tostring(sample_err)) end
        local lock_statement = [[INSERT INTO kickside_lod_lock_observation
            (observed_at,pid,blocking_pids,locktype,relation_name,mode,wait_ms,query_text)
            SELECT clock_timestamp(),waiter.pid,ARRAY_TO_STRING(pg_blocking_pids(waiter.pid),','),
                lock.locktype,COALESCE(relation.relname,lock.relation::text),lock.mode,
                GREATEST(0,EXTRACT(EPOCH FROM (clock_timestamp()-COALESCE(waiter.query_start,waiter.xact_start)))*1000),
                LEFT(waiter.query,2000)
            FROM pg_stat_activity waiter JOIN pg_locks lock ON lock.pid=waiter.pid
            LEFT JOIN pg_class relation ON relation.oid=lock.relation
            WHERE waiter.datname=current_database() AND waiter.pid<>pg_backend_pid()
              AND waiter.wait_event_type='Lock' AND NOT lock.granted]]
        local _, lock_err = db:execute(lock_statement)
        if lock_err then db:release(); fail("pg_locks sample failed: " .. tostring(lock_err)) end
        time.sleep("50ms")
    end
    db:release()
    return { stopped = true }
end

function M.monitor_report(): Map
    if dbtype() ~= sql.type.POSTGRES then
        local waited = 0
        local max_wait: number? = nil
        for _, value in ipairs(db_acquire_waits) do
            if value >= 1 then waited = waited + 1 end
            if max_wait == nil or value > max_wait then max_wait = value end
        end
        local p99_wait = percentile(db_acquire_waits, 0.99)
        metric("deadlocks", "0", "0 deadlock events; SQLite worker completed without a phase timeout", "PASS",
            "SQLite has no pg_stat_database equivalent; successful fixture and worker phases are the observed evidence")
        metric("SQLite DB acquisition waits", "diagnostic", tostring(waited) .. " acquisitions ≥1 ms",
            "MEASURED", tostring(#db_acquire_waits) .. " timed sql.get calls in this harness process; p99="
                .. fmt(p99_wait) .. " ms, max=" .. fmt(max_wait) .. " ms")
        return { database = "sqlite", sampled = false, db_acquire_waits = waited,
            db_acquire_p99_ms = p99_wait, db_acquire_max_ms = max_wait }
    end
    local rows = query([[SELECT COUNT(*) AS n,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY xact_age_ms) AS p99_ms,
        MAX(xact_age_ms) AS max_ms,
        COALESCE(MAX(lock_waiters),0) AS max_lock_waiters,
        COALESCE(MAX(lock_age_ms),0) AS max_lock_age_ms,
        COALESCE(MAX(deadlocks)-MIN(deadlocks),0) AS deadlocks
        FROM kickside_lod_observation]])
    local r = rows[1] or {}
    local n = tonumber(r.n) or 0
    local p99 = tonumber(r.p99_ms)
    local max_ms = tonumber(r.max_ms)
    local lock_age = tonumber(r.max_lock_age_ms) or 0
    local deadlocks = tonumber(r.deadlocks) or 0
    metric("active transaction age p99 (sampled)", "diagnostic", fmt(p99), "MEASURED",
        tostring(n) .. " pg_stat_activity samples; sampled max=" .. fmt(max_ms)
            .. " ms; query at max age=" .. tostring(scalar([[SELECT hot_statement FROM kickside_lod_observation
                ORDER BY xact_age_ms DESC LIMIT 1]], nil, "hot_statement") or ""))
    metric("deadlocks", "0", tostring(deadlocks), deadlocks == 0 and "PASS" or "FAIL",
        "pg_stat_database deadlocks delta during measured worker phases")
    metric("lock wait max", "≤250 ms", fmt(lock_age), lock_age <= 250 and "PASS" or "FAIL",
        "pg_stat_activity wait_event_type=Lock sample; max concurrent waiters=" .. tostring(r.max_lock_waiters or 0))
    metric("nested waits", "N/A for PostgreSQL", "N/A", "N/A", "SQLite-only gate")
    return { samples = n, transaction_p99_sampled_ms = p99, transaction_max_sampled_ms = max_ms,
        deadlocks = deadlocks, max_lock_wait_ms = lock_age }
end

function M.prune(): Map
    local prune_thread = state_get("prune_thread_id")
    local expected = math.floor(tonumber(state_get("prune_events")) or 0)
    local started = time.now():unix_nano()
    local db = open_db()
    local cutoff = time.now():utc():format(time.RFC3339)
    if tostring(db:type()) == sql.type.POSTGRES then
        local plan_rows, plan_err = db:query([[EXPLAIN (ANALYZE, BUFFERS)
            SELECT MIN(seq) FROM kickside_event
            WHERE thread_id=$1::uuid AND seq>0 AND created_at>=$2]], { prune_thread, cutoff })
        if plan_err then db:release(); fail("retention cutoff EXPLAIN ANALYZE failed: " .. tostring(plan_err)) end
        local plan_lines: { string } = {}
        local indexed = false
        for _, row in ipairs(plan_rows or {}) do
            local line = tostring(row["QUERY PLAN"] or "")
            plan_lines[#plan_lines + 1] = line
            if string.find(line, "idx_kickside_event_retention_fresh", 1, true) then indexed = true end
        end
        metric("retention cutoff indexed", "fresh-event index", indexed and "index scan" or "index absent",
            indexed and "PASS" or "FAIL", table.concat(plan_lines, " | "))
    end
    local result, err = prune_lib.prune_thread(db, prune_thread, { cutoff = cutoff, batch_size = 5000 })
    db:release()
    local elapsed_ms = (time.now():unix_nano() - started) / 1000000
    if err or not result then fail("core retention prune failed: " .. tostring(err)) end
    local target_ms = expected * 60000 / 1000000
    local target_text = "≤60,000 ms / 1,000,000 events; scaled ≤" .. fmt(target_ms) .. " ms / " .. tostring(expected)
    local status = (result :: Map).deleted == expected and elapsed_ms <= target_ms and "PASS" or "FAIL"
    metric("prune events", target_text, tostring((result :: Map).deleted) .. " rows in " .. fmt(elapsed_ms) .. " ms",
        status, "core retention prune_thread requested 5,000 rows with per-transaction cap "
            .. tostring(prune_lib.MAX_LOCK_BATCH) .. "; no retention pin on prune fixture")
    state_set("prune_ms", elapsed_ms)
    state_set("prune_deleted", (result :: Map).deleted)
    return { deleted = (result :: Map).deleted, elapsed_ms = elapsed_ms,
        max_pruned_seq = (result :: Map).max_pruned_seq }
end

function M.prune_only(): Map
    return M.prune()
end

function M.append_prune_thread(): Map
    local _actor, threads = actor_and_threads()
    local prune_thread = state_get("prune_thread_id")
    local expected = math.floor(tonumber(state_get("prune_events")) or 0)
    local count_sql = "SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1 AND type='kickside.load:seed'"
    local remaining = expected
    local deadline = time.now():unix_nano() + 30000000000
    while time.now():unix_nano() < deadline do
        remaining = tonumber(scalar(count_sql, { prune_thread }, "n")) or 0
        if remaining < expected then break end
        time.sleep("2ms")
    end
    if remaining >= expected then fail("prune did not delete its first batch before append overlap") end
    local samples: { number } = {}
    local overlap = 0
    for i = 1, 100 do
        local before = tonumber(scalar(count_sql, { prune_thread }, "n")) or 0
        local started = time.now():unix_nano()
        append_one(threads, prune_thread, "lod-prune-append-" .. tostring(i))
        samples[#samples + 1] = (time.now():unix_nano() - started) / 1000000
        if before > 0 and before < expected then overlap = overlap + 1 end
    end
    local p99 = percentile(samples, 0.99)
    if dbtype() == sql.type.POSTGRES then
        metric("append p99 during prune", "≤30 ms", fmt(p99),
            overlap >= 100 and p99 ~= nil and p99 <= 30 and "PASS" or "FAIL",
            tostring(overlap) .. "/100 appends started after the first prune deletion and before prune completed")
    else
        metric("append p99 during prune", "N/A for SQLite", fmt(p99), "N/A",
            "100 appends measured; v4 prune/append gate is PostgreSQL-only")
    end
    return { samples = #samples, overlap_samples = overlap, p99_ms = p99 }
end

return M
