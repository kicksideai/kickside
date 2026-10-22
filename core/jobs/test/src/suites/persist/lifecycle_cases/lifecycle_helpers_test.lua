local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local job_types = require("job_types")
local config = require("config")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local claim = require("claim")
local jobs = require("jobs")
local wake = require("wake")
local process = require("process")
local channel = require("channel")
local proc_supervisor = require("proc_supervisor")
local job_fixture = require("job_fixture")

local function with_db(fn)
    local db, err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(err)) end
    if err or not db then
        error("jobs test: db connect failed: " .. tostring(err))
    end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then
        error(run_err)
    end
end

-- Insert a thread row so kickside_job FK is satisfied on both dialects.
local function make_thread(db): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({ id = id, thread_class = "test", component_id = id })
        :run_with(db)
        :exec()
    if err then
        error("make_thread failed: " .. tostring(err))
    end
    return id
end

-- Insert a job already in running state under a known lease token.
local function make_running_job(db, dbtype, thread_id, attempts, max_attempts): table
    local id = uuid.v7()
    local token = uuid.v7()
    local _, err = sql.builder.insert("kickside_job")
        :set_map({
            id = id,
            owner_kind = "test",
            owner_id = "lifecycle_test",
            job_identity = "7:oneshot" .. tostring(#id) .. ":" .. id .. tostring(#id) .. ":" .. id,
            thread_id = thread_id,
            job_type = "test.job",
            payload = "{}",
            status = job_types.JOB_STATE.RUNNING,
            attempts = attempts,
            max_attempts = max_attempts,
            queue_tier = job_types.QUEUE_TIER.LIVE,
            lease_token = token,
            execution_seq = 1,
            lease_until = lifecycle.future_string(dbtype, 60),
        })
        :run_with(db)
        :exec()
    if err then
        error("make_running_job failed: " .. tostring(err))
    end
    return { id = id, thread_id = thread_id, job_type = "test.job", attempts = attempts,
        max_attempts = max_attempts, lease_token = token, execution_seq = 1, payload = "{}",
        owner_kind = "test", owner_id = "lifecycle_test" }
end

local function job_status(db, id): string?
    local rows = sql.builder.select("status"):from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    if rows and rows[1] then
        return tostring(rows[1].status)
    end
    return nil
end

local function job_row(db, id): table?
    local rows = sql.builder.select("status", "lease_token", "last_error")
        :from("kickside_job")
        :where(sql.builder.eq({ id = id }))
        :limit(1)
        :run_with(db)
        :query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs.lifecycle helpers", function()
        test.it("looks up an exact job independently of its owner kind and surrounding jobs", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local thread_id = make_thread(db)
            for _, owner_kind in ipairs({ "user", "group", "thread" }) do
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local _, update_err = sql.builder.update("kickside_job")
                    :set_map({ owner_kind = owner_kind, owner_id = uuid.v7() })
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(update_err)
                local row, read_err = lifecycle.get_job(db, job.id)
                test.is_nil(read_err)
                test.eq(row.id, job.id)
                test.eq(row.thread_id, thread_id)
                test.eq(row.owner_kind, owner_kind)
                test.eq(row.status, job_types.JOB_STATE.RUNNING)
            end
            local missing, missing_err = lifecycle.get_job(db, uuid.v7())
            local malformed, malformed_err = lifecycle.get_job(db, "missing-job")
            db:release()
            test.is_nil(missing_err)
            test.is_nil(missing)
            test.is_nil(malformed_err)
            test.is_nil(malformed)
        end)
        test.it("reads statuses for exact job ids across owners and states", function()
            with_db(function(db)
                local ids, expected = {}, {}
                for _, state in ipairs({ "pending", "running", "done", "dead", "cancelled" }) do
                    local id = uuid.v7()
                    local _, err = db:execute([[INSERT INTO kickside_job
                        (id,job_type,payload,status,job_identity,owner_kind,owner_id)
                        VALUES ($1,'test.status','{}',$2,$3,'test',$4)]], { id, state, id, uuid.v7() })
                    test.is_nil(err, tostring(err))
                    ids[#ids + 1], expected[id] = id, state
                end
                local absent = uuid.v7()
                ids[#ids + 1], ids[#ids + 2], ids[#ids + 3] = absent, ids[1], "missing-job"
                local statuses, err = jobs.get_job_statuses(ids)
                test.is_nil(err, tostring(err))
                for id, status in pairs(expected) do test.eq(statuses[id], status) end
                test.is_nil(statuses[absent])
                test.is_nil(statuses["missing-job"])
                local empty, empty_err = jobs.get_job_statuses({})
                test.is_nil(empty_err, tostring(empty_err))
                test.is_nil(next(empty))
                for _, invalid in ipairs({ "id", { "" }, { false } }) do
                    local value, invalid_err = (jobs.get_job_statuses :: any)(invalid)
                    test.is_nil(value)
                    test.is_true(errors.is(invalid_err, errors.INVALID))
                end
            end)
        end)

        test.it("reads transactional statuses without committing the caller's work", function()
            with_db(function(db)
                local tx, begin_err = db:begin()
                test.is_nil(begin_err, tostring(begin_err))
                local id = uuid.v7()
                local _, insert_err = tx:execute([[INSERT INTO kickside_job
                    (id,job_type,payload,status,job_identity,owner_kind,owner_id)
                    VALUES ($1,'test.status','{}','pending',$2,'test',$3)]], {id,id,uuid.v7()})
                test.is_nil(insert_err, tostring(insert_err))
                local statuses, read_err = jobs.get_job_statuses_tx(tx, {id})
                test.is_nil(read_err, tostring(read_err))
                test.eq(statuses[id], "pending")
                local _, rollback_err = tx:rollback()
                test.is_nil(rollback_err, tostring(rollback_err))
                local committed, committed_err = jobs.get_job_statuses({id})
                test.is_nil(committed_err, tostring(committed_err))
                test.is_nil(committed[id])
            end)
        end)

        test.it("clamps rows_affected to a non-negative integer", function()
            test.eq(lifecycle.rows_affected({ rows_affected = 5 }), 5)
            test.eq(lifecycle.rows_affected({ rows_affected = -1 }), 0)
            test.eq(lifecycle.rows_affected(nil), 0)
            test.eq(lifecycle.rows_affected({}), 0)
        end)

        test.it("identifies lost leases by their native error code", function()
            local lost = errors.new({
                message = "lease ownership changed", kind = errors.CONFLICT,
                details = { code = job_types.ERROR_CODE.LEASE_LOST },
            })
            local phrase_only = errors.new({
                message = "Postgres says lease lost", kind = errors.CONFLICT,
            })
            test.is_true(job_types.is_lease_lost_error(lost))
            test.is_false(job_types.is_lease_lost_error(phrase_only))
            test.is_false(job_types.is_lease_lost_error("lease lost"))
            test.is_false(job_types.is_lease_lost_error(nil))
        end)

        test.it("decodes a payload column from string or table", function()
            test.eq(lifecycle.decode_payload('{"a":1}').a, 1)
            test.eq(lifecycle.decode_payload({ a = 2 }).a, 2)
            local empty, empty_err = lifecycle.decode_payload("")
            test.is_nil(empty)
            test.not_nil(empty_err)
            local corrupt, corrupt_err = lifecycle.decode_payload("not json")
            test.is_nil(corrupt)
            test.not_nil(corrupt_err)
            local missing, missing_err = lifecycle.decode_payload(nil)
            test.is_nil(missing)
            test.not_nil(missing_err)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
