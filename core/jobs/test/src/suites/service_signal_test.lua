-- Jobs signals run under Jobs service identities: a principal without process
-- messaging authority (a group principal holds no members-only process grant)
-- still releases a lease to its cleanup consumer and revokes an execution owner.

local test = require("test")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local process = require("process")
local channel = require("channel")
local time = require("time")
local sql = require("sql")
local jobs = require("jobs")
local job_fixture = require("job_fixture")
local lifecycle = require("lifecycle")
local lease_manager = require("lease_manager")
local reclaim = require("reclaim")
local worker = require("worker")
local worker_fence = require("worker_fence")
local worker_child = require("worker_child")
local job_types = require("job_types")
local lease_release = require("lease_release")
local proc_supervisor = require("proc_supervisor")

local PROBE = "app:jobs_signal_probe"

local function constrained(args: table): (any?, error?)
    local policy, policy_err = security.policy("app:jobs_signal_constrained")
    if not policy then error("constrained policy missing: " .. tostring(policy_err)) end
    local actor = security.new_actor("principal:group:jobs-signal-" .. uuid.v4():sub(1, 8), {})
    return funcs.new():with_actor(actor):with_scope(security.new_scope({ policy })):call(PROBE, args)
end

local function receive(mailbox: any, job_id: string?): any?
    local timeout = time.after("2s")
    while true do
        local selected = channel.select({ mailbox:case_receive(), timeout:case_receive() })
        if selected.channel ~= mailbox then return nil end
        if job_id == nil or selected.value.job_id == job_id then return selected.value end
    end
end

local function start_run(db: sql.DB, job: table): table
    return assert(lifecycle.start_job_run(db, tostring(db:type()), job, tostring(process.pid()), 1))
end

local function lease(job_id: string): table
    local db = assert(sql.get("app:db"))
    local job, err = job_fixture.lease_own(db, tostring(db:type()), job_id)
    db:release()
    return assert(job, err)
end

local function status(job_id: string): string?
    return assert(jobs.get_job_statuses({ job_id }))[job_id]
end

local function history(job_id: string): table[]
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT status, error_text, CAST(result_json AS TEXT) AS result_json,"
        .. " CAST(actions_json AS TEXT) AS actions_json FROM kickside_job_run WHERE job_id=$1", { job_id })
    db:release()
    return assert(rows, err)
end

local function define_tests()
    test.describe("Jobs service-identity signals", function()
        test.it("delivers a lease release from a principal without process messaging authority", function()
            local job_id = uuid.v7()
            local mailbox = process.listen(lease_release.TOPIC)
            local _, register_err = process.registry.register(lease_release.NAME, nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            local released, release_err = constrained({ kind = "release", job_id = job_id, execution_seq = 3 })
            local message = receive(mailbox, job_id)
            process.registry.unregister(lease_release.NAME, process.registry.CONSISTENT)
            process.unlisten(mailbox)

            test.is_nil(release_err, tostring(release_err))
            test.is_true(released)
            test.not_nil(message, "the lease release never reached its consumer")
            test.eq(message.job_id, job_id)
            test.eq(message.execution_seq, 3)
        end)

        test.it("delivers an execution revocation from a principal without process messaging authority", function()
            local job_id, token = uuid.v7(), uuid.v7()
            local name = proc_supervisor.execution_name(job_id, token)
            local mailbox = process.listen(proc_supervisor.CONTROL_TOPIC)
            local _, register_err = process.registry.register(name, nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            local sent, notify_err = constrained({ kind = "control", job_id = job_id, lease_token = token, execution_seq = 2 })
            local message = receive(mailbox, job_id)
            process.registry.unregister(name, process.registry.CONSISTENT)
            process.unlisten(mailbox)

            test.is_nil(notify_err, tostring(notify_err))
            test.is_true(sent)
            test.not_nil(message, "the revocation never reached its execution owner")
            test.eq(message.kind, "revoked")
            test.eq(message.lease_token, token)
        end)
    end)

    test.describe("Jobs owner settlement", function()
        local mailbox, owner, identity
        test.before_each(function()
            identity = uuid.v7()
            owner = { kind = "test", id = identity }
            mailbox = process.listen(lease_release.TOPIC)
            assert(process.registry.register(lease_release.NAME, nil, process.registry.CONSISTENT))
        end)
        test.after_each(function()
            process.registry.unregister(lease_release.NAME, process.registry.CONSISTENT)
            process.unlisten(mailbox)
        end)

        local function enqueue(slot: boolean?, payload: table?): string
            return assert(jobs.enqueue({ namespace = "owner-settlement", scope = identity, key = "job",
                owner_locator = owner, job_type = "proc://app:job_sleep_proc", immutable_payload = payload or {},
                max_attempts = 1, parked = true, slot = slot })).id
        end

        local function assert_release(job_id: string, seq: number?, state: string, run_status: string?): table?
            local message = receive(mailbox, job_id)
            test.not_nil(message, "the owner did not receive the release hint")
            test.eq(message.kind, "lease_released")
            test.eq(message.job_id, job_id)
            test.eq(message.execution_seq, seq)
            test.eq(message.owner_locator.kind, owner.kind)
            test.eq(message.owner_locator.id, owner.id)
            test.eq(status(job_id), state)
            local runs = history(job_id)
            test.eq(#runs, run_status and 1 or 0)
            if run_status then test.eq(runs[1].status, run_status) end
            return runs[1]
        end

        for _, route in ipairs({
            { title = "worker success", state = "done", run = "completed" },
            { title = "last returned failure", payload = { fail = true }, state = "dead", run = "failed" },
            { title = "execution ceiling on the only attempt", payload = { block = true, max_execution_ms = 250 },
                state = "dead", run = "failed", error_text = worker_child.PROC_TIMEOUT_MARKER },
            { title = "invalid worker output", payload = { output = { next_run_at = "invalid" } },
                state = "dead", run = "failed", error_text = "uses rearm", rejected_output = true },
            { title = "oversized invalid worker output",
                payload = { output = { next_run_at = "invalid", extra = string.rep("x", 2200000) } },
                state = "dead", run = "failed", error_text = "uses rearm", rejected_output = true },
            { title = "slot park", slot = true, payload = { output = { park = true, record = { status = "parked" } } },
                state = "pending", run = "parked" },
        }) do
            test.it("delivers committed status and history after " .. route.title, function()
                local job = lease(enqueue(route.slot, route.payload))
                local events = process.events()
                local pid = assert(process.spawn_monitored("kickside.core.jobs.service:job_child",
                    "app:processes", { job = job }))
                local deadline = time.after("15s")
                repeat
                    local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                    test.eq(selected.channel, events, "the execution child did not exit")
                    local event = selected.value
                until event.kind == process.event.EXIT and tostring(event.from) == tostring(pid)
                test.eq(status(job.id), route.state)
                local run = assert_release(job.id, job.execution_seq, route.state, route.run)
                if route.error_text then
                    test.is_true(tostring(run.error_text):find(route.error_text, 1, true) ~= nil, tostring(run.error_text))
                end
                if route.rejected_output then
                    test.eq(run.result_json, "{}")
                    test.eq(run.actions_json, "{}")
                end
            end)
        end

        test.it("delivers committed cancellation of a running job without a registered supervisor", function()
            local job = lease(enqueue())
            local db = assert(sql.get("app:db"))
            start_run(db, job)
            db:release()
            test.is_true(assert(jobs.cancel(job.id, job.lease_token)).canceled)
            test.eq(status(job.id), "cancelled")
            assert_release(job.id, job.execution_seq, "cancelled", "failed")
        end)

        test.it("delivers committed failure when the execution heartbeat cannot start", function()
            local job = lease(enqueue())
            local db = assert(sql.get("app:db"))
            local start = lease_manager.start
            lease_manager.start = function()
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "heartbeat unavailable" })
            end
            local ok, _, err = pcall(worker.process_job, db, tostring(db:type()), tostring(process.pid()), job)
            lease_manager.start = start
            db:release()
            test.is_true(ok)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(status(job.id), "dead")
            local run = assert_release(job.id, job.execution_seq, "dead", "failed")
            test.is_true(tostring(run.error_text):find("heartbeat unavailable", 1, true) ~= nil)
        end)

        test.it("delivers committed cancellation of a pending job", function()
            local id = enqueue()
            test.is_true(assert(jobs.cancel(id)).canceled)
            test.eq(status(id), "cancelled")
            assert_release(id, nil, "cancelled")
        end)

        test.it("delivers committed cancellation of the job replaced by enqueue", function()
            local old_id = enqueue()
            local replacement = assert(jobs.enqueue({ namespace = "owner-settlement", scope = identity, key = "job",
                owner_locator = owner, job_type = "proc://app:job_sleep_proc", immutable_payload = { value = "new" },
                parked = true, replace = true }))
            test.eq(replacement.replaced_job_id, old_id)
            test.eq(status(replacement.id), "pending")
            test.eq(status(old_id), "cancelled")
            assert_release(old_id, nil, "cancelled")
        end)

        test.it("observes a purged slot as missing after the prior lease release", function()
            local job = lease(enqueue(true))
            assert(jobs.complete(job.id, { token = job.lease_token, execution_seq = job.execution_seq }, { park = true,
                record = { status = "parked" } }))
            assert_release(job.id, job.execution_seq, "pending", "parked")
            test.eq(assert(jobs.purge_slot({ namespace = "owner-settlement", scope = identity, key = "job",
                owner_locator = owner })), 1)
            test.is_nil(status(job.id))
            test.eq(#history(job.id), 0)
            test.is_true(channel.select({ mailbox:case_receive(), default = true }).default)
        end)

        test.it("delivers committed expiry reclaim after the old execution has ended", function()
            local job = lease(enqueue())
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            start_run(db, job)
            local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
            assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", { past, job.id }))
            local _, err = reclaim.reclaim_expired(db, dbtype, job_types.MAX_WORKERS)
            db:release()
            test.is_nil(err, tostring(err))
            assert_release(job.id, job.execution_seq, "pending", "lease_lost")
        end)

        test.it("delivers committed failure after confirmed termination on the final attempt", function()
            local job = lease(enqueue())
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            start_run(db, job)
            test.is_nil(worker_fence.prepare_termination(db, job))
            local changed, err = reclaim.settle_confirmed(db, dbtype, {
                id = job.id, token = job.lease_token, execution_seq = job.execution_seq,
                failure = { error_text = "terminated", failure_class = "infrastructure" },
            })
            db:release()
            test.is_nil(err, tostring(err))
            test.is_true(changed)
            assert_release(job.id, job.execution_seq, "dead", "failed")
        end)

        test.it("delivers committed status and history after a wake continuation", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            assert(db:execute("INSERT INTO kickside_wake_fanout (key, demand_generation) VALUES ($1, 1)", { identity }))
            local id = assert(lifecycle.enqueue_job(db, dbtype, {
                job_identity = { namespace = "wake", scope = identity, key = "continuation" },
                owner_locator = owner, job_type = job_types.WAKE_CONTINUATION_TYPE,
                payload = { wake_key = identity }, parked = true,
            }))
            local job = assert(job_fixture.lease_own(db, dbtype, id))
            local _, err = worker.process_job(db, dbtype, tostring(process.pid()), job)
            db:release()
            test.is_nil(err, tostring(err))
            test.eq(status(job.id), "done")
            assert_release(job.id, job.execution_seq, "done", "success")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
