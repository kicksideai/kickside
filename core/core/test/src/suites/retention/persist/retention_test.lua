local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local repo = require("repo")
local sweeper = require("sweeper")
local consts = require("ret_consts")
local function with_db(fn: (sql.DB) -> ())
    local db, err = sql.get("app:db")
    if err or not db then
        error("retention test: db connect failed: " .. tostring(err))
    end
    fn(db)
    db:release()
end
local function dbtype_of(db: sql.DB): string
    return tostring(db:type())
end
local function ts(db: sql.DB, offset_days: number): string
    local at = time.now():add(offset_days * 24 * time.HOUR)
    if dbtype_of(db) == sql.type.SQLITE then
        return at:utc():format(time.DATE_TIME)
    end
    return at:utc():format(time.RFC3339)
end
local function make_thread(db: sql.DB): string
    local thread_id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({ id = thread_id, thread_class = "test", component_id = thread_id, event_count = 0, last_event_ts = ts(db, 0) })
        :run_with(db):exec()
    if err then error("make_thread failed: " .. tostring(err)) end
    return thread_id
end
local function insert_event(db: sql.DB, thread_id: string, seq: integer, created_at: string): ()
    local _, err = sql.builder.insert("kickside_event")
        :set_map({ id = uuid.v7(), thread_id = thread_id, type = "kickside.threads:message.created", role = "user", body = "{}", seq = seq, created_at = created_at })
        :run_with(db):exec()
    if err then error("insert_event failed: " .. tostring(err)) end
end
local function insert_done_job(db: sql.DB, thread_id: string, finished_at: string): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_job")
        :set_map({ id = id, job_identity = "7:oneshot" .. tostring(#id) .. ":" .. id .. tostring(#id) .. ":" .. id,
            owner_kind = "thread", owner_id = thread_id,
            thread_id = thread_id, job_type = "test", status = "done", finished_at = finished_at, scheduled_at = finished_at, created_at = finished_at })
        :run_with(db):exec()
    if err then error("insert_done_job failed: " .. tostring(err)) end
    return id
end
local function insert_cursor(db: sql.DB, thread_id: string, last_seq: integer, status: string): ()
    local projection_id = uuid.v7()
    local _, perr = sql.builder.insert("kickside_projection")
        :set_map({ id = projection_id, thread_id = thread_id, kind = "test", projection_key = uuid.v7(), last_event_seq = last_seq })
        :run_with(db):exec()
    if perr then error("insert projection failed: " .. tostring(perr)) end
    local _, cerr = sql.builder.insert("kickside_projection_cursor")
        :set_map({ id = uuid.v7(), projection_id = projection_id, thread_id = thread_id, last_seq = last_seq, status = status })
        :run_with(db):exec()
    if cerr then error("insert cursor failed: " .. tostring(cerr)) end
end
local function event_exists(db: sql.DB, thread_id: string, seq: integer): boolean
    local rows = sql.builder.select("seq")
        :from("kickside_event")
        :where(sql.builder.eq({ thread_id = thread_id, seq = seq }))
        :run_with(db):query()
    return rows ~= nil and #(rows :: table[]) > 0
end

local function count_events(db: sql.DB, thread_id: string): integer
    local rows = sql.builder.select("COUNT(*) AS count")
        :from("kickside_event")
        :where(sql.builder.eq({ thread_id = thread_id }))
        :run_with(db):query()
    return math.floor(tonumber((rows :: table[])[1].count) or 0)
end

local function count_jobs(db: sql.DB, thread_id: string): integer
    local rows = sql.builder.select("COUNT(*) AS count")
        :from("kickside_job")
        :where(sql.builder.eq({ thread_id = thread_id }))
        :run_with(db):query()
    return math.floor(tonumber((rows :: table[])[1].count) or 0)
end

local function define_tests()
    test.describe("Retention", function()
        test.it("upsert round-trips the Core event policy and reads it back", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                local policy, err = repo.upsert(db, thread_id, {
                    event_hot_retention_days = 60,
                    archive_mode = "hard_delete",
                    enabled = true,
                })
                test.is_nil(err)
                test.eq((policy :: table).event_hot_retention_days, 60)
                test.eq((policy :: table).archive_mode, "hard_delete")

                local read = repo.find_by_thread(db, thread_id) :: table
                test.eq(read.event_hot_retention_days, 60)
                test.is_nil(read.job_retention_days)
                test.is_nil(read.job_run_retention_days)
                test.is_nil(read.effect_retention_days)
                test.is_true(read.enabled)
            end)
        end)

        test.it("upsert applies enforced defaults for omitted fields", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                local policy, err = repo.upsert(db, thread_id, {})
                test.is_nil(err)
                local p = policy :: table
                test.eq(p.event_hot_retention_days, consts.DEFAULTS.event_hot_retention_days)
                test.eq(p.archive_mode, consts.DEFAULTS.archive_mode)
                test.is_true(p.enabled)
            end)
        end)


        test.it("does not keep Jobs retention columns in Core policy storage", function()
            with_db(function(db)
                local dbtype = tostring(db:type())
                local columns, column_err
                if dbtype == sql.type.SQLITE then
                    columns, column_err = db:query("PRAGMA table_info(kickside_retention_policy)")
                else
                    columns, column_err = db:query([[SELECT column_name AS name FROM information_schema.columns
                        WHERE table_name='kickside_retention_policy']])
                end
                test.is_nil(column_err)
                local names: { [string]: boolean } = {}
                for _, column in ipairs(columns or {}) do names[tostring(column.name)] = true end
                for _, foreign in ipairs({ "job_retention_days", "job_run_retention_days", "effect_retention_days" }) do
                    test.is_nil(names[foreign], foreign .. " must be owned by Jobs")
                end
            end)
        end)

        test.it("upsert rejects a below-floor retention window", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                local policy, err = repo.upsert(db, thread_id, { event_hot_retention_days = 0 })
                test.is_nil(policy)
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.INVALID)
            end)
        end)

        test.it("upsert rejects an unknown archive_mode", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                local policy, err = repo.upsert(db, thread_id, { archive_mode = "shred" })
                test.is_nil(policy)
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.INVALID)
            end)
        end)

        test.it("upsert updates an existing policy in place", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30 })
                local policy, err = repo.upsert(db, thread_id, { event_hot_retention_days = 45, enabled = false })
                test.is_nil(err)
                test.eq((policy :: table).event_hot_retention_days, 45)
                test.is_false((policy :: table).enabled)

                local read = repo.find_by_thread(db, thread_id) :: table
                test.eq(read.event_hot_retention_days, 45)
                test.is_false(read.enabled)
            end)
        end)

        test.it("find_by_thread returns nil when no policy is set", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                local policy, err = repo.find_by_thread(db, thread_id)
                test.is_nil(err)
                test.is_nil(policy)
            end)
        end)

        test.it("sweeper prunes rows past the window and keeps fresh rows", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30 })

                -- One stale + one fresh event.
                insert_event(db, thread_id, 1, ts(db, -60))
                insert_event(db, thread_id, 2, ts(db, -1))

                local stats, err = sweeper.run_for_thread(db, thread_id)
                test.is_nil(err)
                test.eq((stats :: table).events, 1)

                test.eq(count_events(db, thread_id), 1)
            end)
        end)

        test.it("sweeper holds events past a lagging live projection cursor", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30 })
                for seq = 1, 5 do
                    insert_event(db, thread_id, seq, ts(db, -60))
                end
                insert_cursor(db, thread_id, 2, "active")

                local stats, err = sweeper.run_for_thread(db, thread_id)
                test.is_nil(err)
                test.eq((stats :: table).events, 2)
                test.eq(count_events(db, thread_id), 3)
                test.is_false(event_exists(db, thread_id, 1))
                test.is_false(event_exists(db, thread_id, 2))
                test.is_true(event_exists(db, thread_id, 3))
                test.is_true(event_exists(db, thread_id, 5))
            end)
        end)

        test.it("sweeper ignores an invalid projection cursor", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30 })
                for seq = 1, 3 do
                    insert_event(db, thread_id, seq, ts(db, -60))
                end
                insert_cursor(db, thread_id, 1, "invalid")

                local stats, err = sweeper.run_for_thread(db, thread_id)
                test.is_nil(err)
                test.eq((stats :: table).events, 3)
                test.eq(count_events(db, thread_id), 0)
            end)
        end)

        test.it("sweeper prunes by age alone when no cursor exists", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30 })
                for seq = 1, 3 do
                    insert_event(db, thread_id, seq, ts(db, -60))
                end

                local stats, err = sweeper.run_for_thread(db, thread_id)
                test.is_nil(err)
                test.eq((stats :: table).events, 3)
                test.eq(count_events(db, thread_id), 0)
            end)
        end)

        test.it("sweeper floors at the lowest of multiple live cursors", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30 })
                for seq = 1, 5 do
                    insert_event(db, thread_id, seq, ts(db, -60))
                end
                insert_cursor(db, thread_id, 2, "active")
                insert_cursor(db, thread_id, 4, "active")

                local stats, err = sweeper.run_for_thread(db, thread_id)
                test.is_nil(err)
                test.eq((stats :: table).events, 2)
                test.eq(count_events(db, thread_id), 3)
                test.is_false(event_exists(db, thread_id, 2))
                test.is_true(event_exists(db, thread_id, 3))
            end)
        end)

        test.it("sweeper never deletes events inside the age window", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30 })
                for seq = 1, 3 do
                    insert_event(db, thread_id, seq, ts(db, -1))
                end
                insert_cursor(db, thread_id, 5, "active")

                local stats, err = sweeper.run_for_thread(db, thread_id)
                test.is_nil(err)
                test.eq((stats :: table).events, 0)
                test.eq(count_events(db, thread_id), 3)
            end)
        end)

        test.it("sweeper skips a disabled policy", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                repo.upsert(db, thread_id, { event_hot_retention_days = 30, enabled = false })
                insert_event(db, thread_id, 1, ts(db, -60))

                -- An explicit disabled row opts this thread out of Core event pruning.
                local stats, err = sweeper.run(db)
                test.is_nil(err)
                test.not_nil(stats)
                test.eq(count_events(db, thread_id), 1)
            end)
        end)

        test.it("leaves Jobs-owned rows and quotas to the Jobs retention operation", function()
            with_db(function(db)
                local thread_id = make_thread(db)
                local finished = ts(db, -60)
                local job_id = insert_done_job(db, thread_id, finished)
                local run_id = uuid.v7()
                local _, run_err = db:execute([[INSERT INTO kickside_job_run
                    (id,job_id,thread_id,job_type,attempt_no,execution_seq,status,started_at,finished_at,owner_kind,owner_id)
                    VALUES ($1,$2,$3,'test',1,1,'completed',$4,$4,'thread',$5)]],
                    { run_id, job_id, thread_id, finished, thread_id })
                test.is_nil(run_err, tostring(run_err))

                local worker_id = "retention-worker-stale:" .. uuid.v7()
                local _, worker_err = db:execute([[INSERT INTO kickside_job_worker
                    (id,registry_version,started_at,last_seen_at) VALUES ($1,'test',$2,$2)]],
                    { worker_id, finished })
                test.is_nil(worker_err, tostring(worker_err))
                local wake_key = "retention-orphan:" .. uuid.v7()
                local _, wake_err = db:execute([[INSERT INTO kickside_wake_fanout
                    (key,demand_generation,ack_generation) VALUES ($1,1,1)]], { wake_key })
                test.is_nil(wake_err, tostring(wake_err))

                local stats, sweep_err = sweeper.run(db)
                test.is_nil(sweep_err, tostring(sweep_err))
                test.is_nil((stats :: table).jobs)
                test.is_nil((stats :: table).job_runs)
                test.is_nil((stats :: table).workers)
                test.is_nil((stats :: table).wake_rows)
                test.eq(count_jobs(db, thread_id), 1)
                local runs, runs_err = db:query("SELECT id FROM kickside_job_run WHERE id=$1", { run_id })
                test.is_nil(runs_err, tostring(runs_err))
                test.eq(#runs, 1)
                local workers, workers_err = db:query("SELECT id FROM kickside_job_worker WHERE id=$1", { worker_id })
                test.is_nil(workers_err, tostring(workers_err))
                test.eq(#workers, 1)
                local wakes, wakes_err = db:query("SELECT key FROM kickside_wake_fanout WHERE key=$1", { wake_key })
                test.is_nil(wakes_err, tostring(wakes_err))
                test.eq(#wakes, 1)
            end)
        end)

        test.it("prunes committed write receipts in the existing retention pass", function()
            with_db(function(db)
                local sink = "retention-receipts:" .. uuid.v7()
                for _, spec in ipairs({
                    { "old", "committed", "2000-01-01T00:00:00Z", "2000-01-01T00:00:00Z" },
                    { "fresh", "committed", "2999-01-01T00:00:00Z", "2999-01-01T00:00:00Z" },
                    { "pending", "pending", "2000-01-01T00:00:00Z", nil },
                }) do
                    local statement = spec[4]
                        and [[INSERT INTO kickside_write_receipt
                            (sink_id,idempotency_key,identity_key,payload_hash,status,created_at,completed_at)
                            VALUES ($1,$2,'identity','hash',$3,$4,$5)]]
                        or [[INSERT INTO kickside_write_receipt
                            (sink_id,idempotency_key,identity_key,payload_hash,status,created_at)
                            VALUES ($1,$2,'identity','hash',$3,$4)]]
                    local args = { sink, spec[1], spec[2], spec[3] }
                    if spec[4] then args[5] = spec[4] end
                    local _, insert_err = db:execute(statement, args)
                    test.is_nil(insert_err, tostring(insert_err))
                end
                local stats, sweep_err = sweeper.run(db)
                test.is_nil(sweep_err, tostring(sweep_err))
                test.is_true((stats :: table).write_receipts >= 1)
                local rows, read_err = db:query("SELECT idempotency_key FROM kickside_write_receipt WHERE sink_id=$1", { sink })
                test.is_nil(read_err, tostring(read_err))
                test.eq(#rows, 2)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
local function run(options)
    return run_cases(options)
end

return { run = run }
