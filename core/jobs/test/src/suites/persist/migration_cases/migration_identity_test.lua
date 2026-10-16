local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local claim = require("claim")

local function define_tests()
    test.describe("jobs P1 migration", function()
        test.it("rejects the old enqueue statement without job_identity", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = sql.builder.insert("kickside_thread")
                :set_map({ id = thread_id, thread_class = "test", component_id = thread_id })
                :run_with(db):exec()
            test.is_nil(thread_err)
            local _, legacy_err = db:execute([[INSERT INTO kickside_job
                (id, thread_id, job_type, payload, status, idempotency_key)
                VALUES (']] .. uuid.v7() .. [[', ']] .. thread_id .. [[', 'test.legacy.enqueue', '{}',
                    'pending', 'old-writer') ON CONFLICT DO NOTHING]])
            db:release()
            test.not_nil(legacy_err)
            test.is_true(string.find(string.lower(tostring(legacy_err)), "job_identity", 1, true) ~= nil)
        end)

        test.it("uses lifetime sequence rather than retry attempt as the run key", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            test.not_nil(db)

            local thread_id = uuid.v7()
            local job_id = uuid.v7()
            local _, thread_err = sql.builder.insert("kickside_thread")
                :set_map({ id = thread_id, thread_class = "test", component_id = thread_id })
                :run_with(db):exec()
            test.is_nil(thread_err)
            local _, job_err = sql.builder.insert("kickside_job")
                :set_map({ id = job_id, thread_id = thread_id, owner_kind = "thread", owner_id = thread_id,
                    job_type = "test.migration",
                    job_identity = "7:oneshot" .. #job_id .. ":" .. job_id .. #job_id .. ":" .. job_id })
                :run_with(db):exec()
            test.is_nil(job_err)

            local _, first_err = sql.builder.insert("kickside_job_run")
                :set_map({ id = uuid.v7(), job_id = job_id, thread_id = thread_id,
                    owner_kind = "thread", owner_id = thread_id,
                    job_type = "test.migration", attempt_no = 1, execution_seq = 1 })
                :run_with(db):exec()
            test.is_nil(first_err)

            local _, sequence_err = sql.builder.insert("kickside_job_run")
                :set_map({ id = uuid.v7(), job_id = job_id, thread_id = thread_id,
                    owner_kind = "thread", owner_id = thread_id,
                    job_type = "test.migration", attempt_no = 2, execution_seq = 1 })
                :run_with(db):exec()
            test.not_nil(sequence_err)
            test.is_true(string.find(string.lower(tostring(sequence_err)), "unique", 1, true) ~= nil)

            local _, attempt_err = sql.builder.insert("kickside_job_run")
                :set_map({ id = uuid.v7(), job_id = job_id, thread_id = thread_id,
                    owner_kind = "thread", owner_id = thread_id,
                    job_type = "test.migration", attempt_no = 1, execution_seq = 2 })
                :run_with(db):exec()
            test.is_nil(attempt_err)

            local _, missing_seq_err = sql.builder.insert("kickside_job_run")
                :set_map({ id = uuid.v7(), job_id = job_id, thread_id = thread_id,
                    owner_kind = "thread", owner_id = thread_id,
                    job_type = "test.migration", attempt_no = 3 })
                :run_with(db):exec()
            test.not_nil(missing_seq_err)

            db:release()
        end)

        test.it("keeps distinct run history when a slot retries attempt one", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "migration07_test" },
                job_identity = { namespace = "drive", scope = uuid.v7(), key = "main" },
                job_type = "test.slot_history", slot = true,
            })
            test.is_nil(enqueue_err)
            test.not_nil(job_id)
            local job = { id = job_id, job_type = "test.slot_history", slot = true,
                owner_kind = "test", owner_id = "migration07_test",
                execution_seq = 1, attempts = 1 }
            local first, first_err = lifecycle.start_job_run(db, dbtype, job, "pid-1", 1)
            test.is_nil(first_err)
            test.not_nil(first)
            job.execution_seq = 2
            local second, second_err = lifecycle.start_job_run(db, dbtype, job, "pid-2", 1)
            test.is_nil(second_err)
            test.not_nil(second)
            test.is_true(first.id ~= second.id)
            local rows = sql.builder.select("id", "execution_seq")
                :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
                :order_by("execution_seq ASC"):run_with(db):query()
            db:release()
            test.eq(#rows, 2)
            test.eq(tonumber(rows[1].execution_seq), 1)
            test.eq(tonumber(rows[2].execution_seq), 2)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
