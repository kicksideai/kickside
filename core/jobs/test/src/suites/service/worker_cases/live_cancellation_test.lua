local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local time = require("time")
local channel = require("channel")
local lifecycle = require("lifecycle")
local jobs = require("jobs")
local job_fixture = require("job_fixture")
local worker_child = require("worker_child")
local worker = require("worker")
local proc_supervisor = require("proc_supervisor")

return { run = function(options)
    test.is_nil(job_fixture.supervise_as_loop())
    return test.run_cases(function()
        test.describe("live durable job cancellation", function()
            local job, completion, ready, completed
            test.after_each(function()
                if job then
                    local _, cancel_err = jobs.cancel(job.id)
                    test.is_nil(cancel_err)
                    if not completed then
                        local selected = channel.select({ completion:case_receive(), time.after("15s"):case_receive() })
                        test.eq(selected.channel, completion)
                    end
                end
                if ready then
                    local _, unlisten_err = process.unlisten(ready)
                    test.is_nil(unlisten_err)
                end
            end)
            test.it("retains the cancellation fence until a real blocked worker exits and then settles once", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local owner = uuid.v7()
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = owner }, parked = true,
                    job_identity = { namespace = "live-cancellation", scope = owner, key = "cancel" },
                    job_type = "test.live.cancel", worker_ref = "proc://app:job_sleep_proc",
                    payload = { block = true, ready_to = tostring(process.pid()), max_execution_ms = 5000 },
                })
                test.is_nil(enqueue_err)
                if type(id) ~= "string" then
                    error(errors.new({ kind = errors.INTERNAL, retryable = false, message = "cancellation fixture enqueue returns no job id" }))
                end
                local leased, lease_err = job_fixture.lease_own(db, dbtype, id)
                test.is_nil(lease_err)
                if type(leased) ~= "table" then
                    error(errors.new({ kind = errors.INTERNAL, retryable = false, message = "cancellation fixture lease returns no job" }))
                end
                job = leased
                local run, run_err = lifecycle.start_job_run(db, dbtype, job, tostring(process.pid()), 1)
                test.is_nil(run_err)
                db:release()
                ready = process.listen("job_worker_ready")
                completion = channel.new(1)
                coroutine.spawn(function()
                    local supervise_err, control = worker_child.supervise_job_child(job, run.id)
                    completion:send({ err = supervise_err, control = control })
                end)
                local selected = channel.select({ ready:case_receive(), completion:case_receive(), time.after("15s"):case_receive() })
                completed = selected.channel == completion
                test.eq(selected.channel, ready, "worker exits before it starts")
                test.eq(selected.value.job_id, id)
                local live, live_err = proc_supervisor.child_alive(id, job.lease_token)
                test.is_nil(live_err)
                test.is_true(live)
                local canceled, cancel_err = jobs.cancel(id, job.lease_token)
                test.is_nil(cancel_err)
                test.is_true(canceled.canceled)
                selected = channel.select({ completion:case_receive(), time.after("15s"):case_receive() })
                completed = selected.channel == completion
                test.eq(selected.channel, completion, "revoked worker does not exit")
                test.is_nil(selected.value.err)
                test.eq(selected.value.control, "revoked")
                local ended, end_err = proc_supervisor.child_alive(id, job.lease_token)
                test.is_nil(end_err)
                test.is_false(ended)
                db = assert(sql.get("app:db"))
                local fenced = assert(db:query("SELECT status,last_error FROM kickside_job WHERE id=$1", { id }))
                test.eq(fenced[1].status, "running")
                test.contains(fenced[1].last_error, job.lease_token)
                test.is_nil(worker.settle_child_exit(db, dbtype, job, run, nil, "revoked"))
                local rows = assert(db:query("SELECT status,lease_token,finished_at FROM kickside_job WHERE id=$1", { id }))
                local history = assert(db:query("SELECT status,finished_at FROM kickside_job_run WHERE job_id=$1", { id }))
                db:release()
                test.eq(rows[1].status, "cancelled")
                test.is_nil(rows[1].lease_token)
                test.not_nil(rows[1].finished_at)
                test.eq(#history, 1)
                test.eq(history[1].status, "failed")
                test.not_nil(history[1].finished_at)
                job = nil
                local repeated, repeat_err = jobs.cancel(id)
                test.is_nil(repeat_err)
                test.is_false(repeated.canceled)
            end)
        end)
    end)(options)
end }
