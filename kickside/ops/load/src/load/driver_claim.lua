type Map = { [string]: any }

local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local process = require("process")
local channel = require("channel")
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

function M.claim_probe(): Map
    local engine_type = dbtype()
    local postgres = engine_type == sql.type.POSTGRES
    local uuid = require("uuid")
    local json = require("json")
    local time_mod = require("time")
    local db = open_db()
    local automation_id = state_get("automation_id")
    local job_id = uuid.v7()
    local drive_key = "claim-probe"
    local identity = tostring(#"probe") .. ":probe" .. tostring(#automation_id) .. ":" .. automation_id
        .. tostring(#drive_key) .. ":" .. drive_key
    local payload, json_err = json.encode({ automation_id = automation_id, drive_key = "main" })
    if json_err or not payload then db:release(); fail("probe payload encoding failed: " .. tostring(json_err)) end
    -- The fixture includes timer slots which may already be due. An older
    -- scheduled_at keeps this dedicated probe first in the production order.
    local now = postgres and "2000-01-01T00:00:00.000000+00:00" or "2000-01-01 00:00:00.000000"
    local _, ins_err = db:execute([[INSERT INTO kickside_job
        (id,job_type,payload,status,priority,attempts,max_attempts,queue_tier,generation,scheduled_at,
         job_identity,slot,wake_enabled,wake_generation,wake_control_pending,execution_seq,
         owner_kind,owner_id)
        VALUES($1,'kickside.automation:round',$2,'pending',100000,0,1,'live',1,$3,$4,TRUE,TRUE,0,FALSE,0,
            'automation',$5)]],
        { job_id, payload, now, identity, automation_id })
    if ins_err then db:release(); fail("probe job insert failed: " .. tostring(ins_err)) end
    local claim = require("claim")
    local samples: { number } = {}
    for _ = 1, 250 do
        local started = time_mod.now():unix_nano()
        local rows, claim_err = claim.claim_batch(db, engine_type, 1, "live", { live = 1, backfill = 0, maintenance = 0 })
        local elapsed = (time_mod.now():unix_nano() - started) / 1000000
        if claim_err or not rows or #(rows :: { any }) ~= 1 or tostring((rows :: { any })[1].id) ~= job_id then
            db:execute("DELETE FROM kickside_job WHERE id=$1", { job_id })
            db:release()
            fail("real claim path did not claim its probe row: " .. tostring(claim_err))
        end
        samples[#samples + 1] = elapsed
        local _, reset_err = db:execute([[UPDATE kickside_job SET status='pending',scheduled_at=$1,
            attempts=0,lease_token=NULL,lease_until=NULL,heartbeat_at=NULL,execution_seq=0 WHERE id=$2]], { now, job_id })
        if reset_err then db:release(); fail("probe job reset failed: " .. tostring(reset_err)) end
    end
    local _, del_err = db:execute("DELETE FROM kickside_job WHERE id=$1", { job_id })
    if del_err then db:release(); fail("probe cleanup failed: " .. tostring(del_err)) end
    local reclaim_samples: { number } = {}
    for _ = 1, 250 do
        local started = time_mod.now():unix_nano()
        local reclaimed, reclaim_err = claim.reclaim_expired(db, engine_type)
        if reclaim_err or reclaimed ~= 0 then
            db:release()
            fail("idle lease reclaim probe failed: " .. tostring(reclaim_err or reclaimed))
        end
        reclaim_samples[#reclaim_samples + 1] = (time_mod.now():unix_nano() - started) / 1000000
    end
    db:release()
    local p95, p99 = percentile(samples, 0.95), percentile(samples, 0.99)
    local maximum: number? = nil
    for _, sample in ipairs(samples) do if maximum == nil or sample > maximum then maximum = sample end end
    local reclaim_max: number? = nil
    for _, sample in ipairs(reclaim_samples) do
        if reclaim_max == nil or sample > reclaim_max then reclaim_max = sample end
    end
    if postgres then
        metric("claim p95", "≤10 ms", fmt(p95), status_for(p95, 10),
            "250 samples through core/jobs persist.claim_batch(limit=1), one transaction per sample, no worker service running")
        metric("claim p99", "≤50 ms", fmt(p99), status_for(p99, 50),
            "Same real claim path; probe row removed before worker startup")
    else
        metric("claim p95", "N/A for SQLite", fmt(p95), "N/A",
            "250 production claim_batch transaction samples; PostgreSQL-only §15.1 gate")
        metric("claim p99", "N/A for SQLite", fmt(p99), "N/A",
            "250 production claim_batch transaction samples; PostgreSQL-only §15.1 gate")
    end
    metric("idle reclaim p95", "diagnostic", fmt(percentile(reclaim_samples, 0.95)), "MEASURED",
        "250 production reclaim_expired transactions with no expired lease; worker previously ran one before every claim")
    metric("claim transaction wall p99", "diagnostic", fmt(p99), "MEASURED",
        tostring(#samples) .. " production claim_batch wall samples, including its transaction")
    if not postgres then
        local all: { number } = {}
        for _, value in ipairs(samples) do all[#all + 1] = value end
        for _, value in ipairs(reclaim_samples) do all[#all + 1] = value end
        local all_max = math.max(maximum or 0, reclaim_max or 0)
        state_set("sqlite_tx_p99_bound", fmt(percentile(all, 0.99)))
        state_set("sqlite_tx_max_bound", fmt(all_max))
        metric("transaction p99", "≤50 ms", fmt(percentile(all, 0.99)),
            status_for(percentile(all, 0.99), 50),
            "500 timed production claim_batch and reclaim_expired calls; each call encloses its SQLite transaction, so the wall time is a conservative duration upper bound")
        metric("transaction max", "≤250 ms", fmt(all_max), status_for(all_max, 250),
            "Maximum of the same 500 enclosing production-call wall times; other worker transaction classes are outside this SQLite boundary sample")
        M.sqlite_contention()
    end
    return { samples = #samples, p95_ms = p95, p99_ms = p99 }
end

function M.sqlite_contention_child(): Map
    local ready_db = open_db()
    local _, ready_err = ready_db:execute([[INSERT INTO kickside_lod_state(key,value)
        VALUES('sqlite_contention_ready','1') ON CONFLICT(key) DO UPDATE SET value='1']])
    ready_db:release()
    if ready_err then fail("contention child readiness failed: " .. tostring(ready_err)) end
    time.sleep("100ms")
    local started = time.now():unix_nano()
    local db = open_db()
    local got_ms = (time.now():unix_nano() - started) / 1000000
    local tx_started = time.now():unix_nano()
    local tx, begin_err = db:begin()
    local begin_ms = (time.now():unix_nano() - tx_started) / 1000000
    if begin_err or not tx then db:release(); fail("contention child begin failed: " .. tostring(begin_err)) end
    local rows, query_err = tx:query("SELECT 1 AS ok")
    if query_err or not rows[1] then tx:rollback(); db:release(); fail("contention child query failed") end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then fail("contention child commit failed: " .. tostring(commit_err)) end
    return { get_ms = got_ms, begin_ms = begin_ms,
        wait_ms = (time.now():unix_nano() - started) / 1000000 }
end

function M.sqlite_contention(): Map
    exec("DELETE FROM kickside_lod_state WHERE key='sqlite_contention_ready'")
    local events = process.events()
    local pid, spawn_err = process.spawn_monitored("kickside.load:sqlite_contention_child", "app:processes", {})
    if spawn_err or not pid then fail("contention child spawn failed: " .. tostring(spawn_err)) end
    local deadline = time.now():unix_nano() + 10000000000
    while state_get("sqlite_contention_ready") ~= "1" and time.now():unix_nano() < deadline do
        time.sleep("2ms")
    end
    if state_get("sqlite_contention_ready") ~= "1" then fail("contention child did not become ready") end
    local db = open_db()
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); fail("contention parent begin failed: " .. tostring(begin_err)) end
    local held_at = time.now():unix_nano()
    time.sleep("350ms")
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then fail("contention parent commit failed: " .. tostring(commit_err)) end
    local result = support.await_exit(events, tostring(pid), "10s", "contention child")
    local wait_ms = type(result) == "table" and tonumber(result.wait_ms) or 0
    local held_ms = (time.now():unix_nano() - held_at) / 1000000
    metric("nested waits", "single connection blocks then resumes",
        fmt(wait_ms) .. " ms child; " .. fmt(held_ms) .. " ms parent hold",
        wait_ms >= 200 and "PASS" or "FAIL",
        "Public sql.get/begin/commit contention probe on pool.max_open=1; child starts after readiness handshake and resumes only after parent commit. This proves pool contention behavior, not absence of nested calls in production")
    return { wait_ms = wait_ms, parent_held_ms = held_ms }
end


return M
