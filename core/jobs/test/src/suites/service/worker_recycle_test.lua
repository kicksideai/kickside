-- Deterministic pool assignment and registry-version fences on a private queue.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local job_types = require("job_types")
local claim = require("claim")
local claim_execution = require("claim_execution")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")
local worker_pool = require("worker_pool")

local function job_row(db: sql.DB, id: string): table?
    local rows = sql.builder.select("status", "lease_token")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function latest_run(db: sql.DB, id: string): table?
    local rows = sql.builder.select("id"):from("kickside_job_run")
        :where(sql.builder.eq({ job_id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs worker recycled assignment", function()
        test.it("requeues an exited slot's unstarted assignment with its lease fence", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_worker_recycle_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local worker_ddl = dbtype == sql.type.POSTGRES
                and "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id UUID)"
                or "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id TEXT)"
            local _, drop_err = db:execute("DROP TABLE IF EXISTS kickside_job_worker")
            test.is_nil(drop_err)
            local _, table_err = db:execute(worker_ddl)
            test.is_nil(table_err)
            local worker_id = "exit-slot-" .. uuid.v7()
            local _, worker_err = db:execute("INSERT INTO kickside_job_worker(id) VALUES($1)", { worker_id })
            test.is_nil(worker_err)
            local thread_id = uuid.v7()
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_recycle_test" },
                parked = true, thread_id = thread_id, job_type = "test.exit.unstarted",
                priority = 10000,
            })
            test.is_nil(enqueue_err)
            if not id then error("unstarted job is absent") end
            local now = lifecycle.now_string(dbtype)
            local _, due_err = sql.builder.update("kickside_job")
                :set("scheduled_at", now):where(sql.builder.eq({ id = id }))
                :run_with(db):exec()
            test.is_nil(due_err)
            local claimed, claim_err = claim.claim_batch(db, dbtype, 1, "live", nil, { worker_id })
            test.is_nil(claim_err)
            test.eq(#claimed, 1)
            local job = claimed[1]
            test.eq(job.id, id)
            local released, release_err = claim_execution.release_unstarted(db, job, worker_id, job.run_ctx.id)
            test.is_nil(release_err)
            test.is_true(released)
            local row = job_row(db, id)
            test.eq(row.status, job_types.JOB_STATE.PENDING)
            test.is_nil(row.lease_token)
            test.is_nil(latest_run(db, id))
            local again, again_err = claim_execution.release_unstarted(db, job, worker_id, job.run_ctx.id)
            test.is_nil(again_err)
            test.is_false(again)
            local reclaimed, reclaim_err = claim.claim_batch(db, dbtype, 1, "live", nil, { worker_id })
            test.is_nil(reclaim_err)
            test.eq(#reclaimed, 1)
            local newer = reclaimed[1]
            test.eq(newer.id, id)
            local stale, stale_err = claim_execution.release_unstarted(db, job, worker_id, job.run_ctx.id)
            test.is_nil(stale_err)
            test.is_false(stale)
            local started, start_err = claim_execution.mark_started(db, newer, worker_id, newer.run_ctx.id, "child-" .. uuid.v7())
            test.is_nil(start_err)
            test.is_true(started)
            local after_start, after_start_err = claim_execution.release_unstarted(db, newer, worker_id, newer.run_ctx.id)
            test.is_nil(after_start_err)
            test.is_false(after_start)
            test.eq(job_row(db, id).status, job_types.JOB_STATE.RUNNING)
            db:release()
        end)

        test.it("releases an assignment when its slot exits before starting it", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_worker_recycle_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local worker_ddl = dbtype == sql.type.POSTGRES
                and "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id UUID)"
                or "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id TEXT)"
            test.is_nil(select(2, db:execute("DROP TABLE IF EXISTS kickside_job_worker")))
            test.is_nil(select(2, db:execute(worker_ddl)))
            local worker_id = "exiting-slot-" .. uuid.v7()
            test.is_nil(select(2, db:execute("INSERT INTO kickside_job_worker(id) VALUES($1)", { worker_id })))
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_recycle_test" },
                thread_id = uuid.v7(), job_type = "test.exit.dispatch", priority = 10000,
            })
            test.is_nil(enqueue_err)
            local event_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local idle_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local now_ns, selection, sends, stale_sends = 0, 0, 0, 0
            local fake_time = {
                now = function() return { unix_nano = function() return now_ns end } end,
                after = function() return timer_ch end,
            }
            local fake_channel = { select = function(cases: any)
                if cases.default == true then return { default = true } end
                selection = selection + 1
                if selection == 1 then
                    return { channel = idle_ch, value = { kind = "idle", worker_id = worker_id, version = "v0", epoch = 0 } }
                elseif selection == 2 then
                    return { channel = idle_ch, value = { kind = "nudge", worker_id = worker_id, version = "v0", epoch = 0 } }
                elseif selection == 3 then
                    now_ns = 2000000
                    return { channel = timer_ch }
                elseif selection == 4 then
                    stale_sends = sends
                    return { channel = idle_ch, value = { kind = "idle", worker_id = worker_id, version = "v1", epoch = 0 } }
                elseif selection == 5 then
                    now_ns = 4000000
                    return { channel = timer_ch }
                elseif selection == 6 then
                    test.eq(sends, 1)
                    return { channel = event_ch, value = { kind = process.event.EXIT, from = worker_id } }
                end
                return { channel = event_ch, value = { kind = process.event.CANCEL } }
            end }
            local fake_process = {
                registry = job_fixture.process_registry("pool-test"),
                    event = process.event, pid = function() return "pool-test" end,
                events = function() return event_ch end, set_options = function() end,
                listen = function() return idle_ch end, unlisten = function() end,
                spawn_linked_monitored = function() return worker_id end,
                send = function(_to, topic, value)
                    test.eq(topic, "kickside.core.jobs:worker_assign")
                    test.eq(value.job.id, id)
                    test.eq(value.epoch, 1)
                    sends = sends + 1
                    return true, nil
                end,
                cancel = function() end,
            }
            local pool_db = {
                type = function() return db:type() end,
                query = function(_, ...) return db:query(...) end,
                begin = function() return db:begin() end,
                release = function() end,
            }
            local root = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return pool_db, nil end,
                policy = function() return job_fixture.pool_policy({ worker_count_postgres = 1,
                    worker_count_sqlite = 1 }), nil end,
                process = fake_process, time = fake_time, channel = fake_channel,
                registry = { current_version = function() return { id = function() return "v1" end }, nil end },
                events = { subscribe = function() return {
                    channel = function() return registry_ch end, close = function() end,
                } end },
            })
            root.main()
            test.eq(sends, 1)
            test.eq(job_row(db, id).status, job_types.JOB_STATE.PENDING)
            test.is_nil(latest_run(db, id))
            test.eq(stale_sends, 0)
            db:release()
        end)
    end)
end

return { run = test.run_cases(define_tests) }
