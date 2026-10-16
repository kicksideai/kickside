-- Shared DB and enqueue helpers for the worker suites. Each suite builds one
-- instance; the held connection stays per-suite.
local sql = require("sql")
local uuid = require("uuid")
local job_fixture = require("job_fixture")

local function new(): table
    local active_db
    local function release_db() if active_db then active_db:release(); active_db = nil end end
    local function get_db() local db, err = sql.get("app:db"); active_db = db; return db, err end
    local function with_db(fn)
        local db, err = get_db()
        if err or not db then error("jobs test: db connect failed: " .. tostring(err)) end
        fn(db)
    end

    local function make_thread(db: sql.DB): string
        local id = uuid.v7()
        sql.builder.insert("kickside_thread"):set_map({ id = id, thread_class = "test", component_id = id }):run_with(db):exec()
        return id
    end

    -- Enqueue a job parked and lease exactly that row. Claim selection has its own
    -- suite on a private queue; these cases never claim from the shared queue.
    local function enqueue_and_claim(db: sql.DB, dbtype: string, thread_id: string, job_type: string, opts: table?): table
        local params = { thread_id = thread_id, job_type = job_type }
        for key, value in pairs(opts or {}) do params[key] = value end
        local job, lease_err = job_fixture.enqueue_leased(db, dbtype, params)
        if lease_err or not job then error("own job lease failed: " .. tostring(lease_err)) end
        return job
    end

    local function job_row(db: sql.DB, id): table?
        local rows = sql.builder.select("status", "lease_token", "attempts", "scheduled_at", "wake_enabled")
            :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
        return rows and rows[1] or nil
    end

    local function latest_run(db: sql.DB, job_id): table?
        local rows = sql.builder.select("status", "attempt_no", "error_text", "result_json")
            :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
            :order_by("attempt_no DESC"):limit(1):run_with(db):query()
        return rows and rows[1] or nil
    end

    local SLEEP_PROC = "proc://app:job_sleep_proc"

    local function enqueue_proc_and_claim(db: sql.DB, dbtype: string, thread_id: string, payload: any): table
        return enqueue_and_claim(db, dbtype, thread_id, "upload.process.test", {
            worker_ref = SLEEP_PROC,
            priority = 10000,
            max_attempts = 3,
            payload = payload,
        })
    end

    local function thread_events_for(db: sql.DB, thread_id: string, event_type: string): { table }
        return sql.builder.select("type", "body", "trace_id", "run_id", "correlation_key")
            :from("kickside_event")
            :where(sql.builder.eq({ thread_id = thread_id, type = event_type }))
            :run_with(db):query() or {}
    end

    return {
        release_db = release_db,
        get_db = get_db,
        with_db = with_db,
        make_thread = make_thread,
        enqueue_and_claim = enqueue_and_claim,
        job_row = job_row,
        latest_run = latest_run,
        enqueue_proc_and_claim = enqueue_proc_and_claim,
        thread_events_for = thread_events_for,
    }
end

return { new = new }
