local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local security = require("security")
local funcs = require("funcs")
local jobs = require("jobs")
local job_fixture = require("job_fixture")

local function constrained(operation: string, params: table?): (integer?, error?)
    local policy = assert(security.policy("app:public_seams_scope"))
    local actor = security.new_actor("principal:group:jobs-owner", {})
    local scope = security.new_scope({ policy })
    test.eq(scope:evaluate(actor, "funcs.call", "kickside.core.jobs.persist:pool_nudge"), "undefined")
    test.eq(scope:evaluate(actor, "process.send", "*"), "undefined")
    return funcs.new():with_actor(actor):with_scope(scope):call("app:public_seams_probe",
        { operation = operation, params = params })
end

local function params(scope: string, key: string): table
    return { namespace = "public-seams", scope = scope, key = key,
        owner_locator = { kind = "test", id = scope },
        job_type = "app:generic_job_target", immutable_payload = {}, slot = true, parked = true }
end

local function define_tests()
    test.describe("Jobs public owner operations", function()
        test.it("nudges the pool after caller-owned enqueue commits without persistence grants", function()
            local db = assert(sql.get("app:db"))
            local tx = assert(db:begin())
            local mailbox = assert(process.listen("kickside.core.jobs:wake", { message = true }))
            assert(process.registry.register("kickside.core.jobs.worker_pool", nil, process.registry.CONSISTENT))
            local input = params(uuid.v7(), "transaction")
            input.parked = false
            local queued, enqueue_err = jobs.enqueue_tx(tx, tostring(db:type()), input)
            local before = channel.select({ mailbox:case_receive(), default = true })
            local _, commit_err = tx:commit()
            local sent, nudge_err = constrained("nudge")
            local after = channel.select({ mailbox:case_receive(), default = true })
            process.registry.unregister("kickside.core.jobs.worker_pool", process.registry.CONSISTENT)
            process.unlisten(mailbox)
            db:release()
            test.is_nil(enqueue_err)
            test.not_nil(queued)
            test.is_nil(commit_err)
            test.is_true(before.default, "enqueue_tx must leave notification to the transaction owner")
            test.is_nil(nudge_err, tostring(nudge_err))
            test.eq(sent, 1)
            test.eq(after.channel, mailbox)
            local row, read_err = jobs.get_job(queued.id)
            test.is_nil(read_err)
            test.eq(row.id, queued.id)
            test.eq(row.status, "pending")
        end)

        test.it("returns zero when no pool is registered", function()
            local sent, err = constrained("nudge")
            test.is_nil(err, tostring(err))
            test.eq(sent, 0)
        end)

        test.it("purges only the exact slot identity and is idempotent without persistence grants", function()
            local owner = uuid.v7()
            local target = params(owner, "target")
            local queued = assert(jobs.enqueue(target))
            local neighbors = { params(owner, "other"), params(uuid.v7(), "target"), params(owner, "target") }
            neighbors[3].namespace = "another-namespace"
            local ids = {}
            for _, neighbor in ipairs(neighbors) do ids[#ids + 1] = assert(jobs.enqueue(neighbor)).id end
            local removed, err = constrained("purge", target)
            test.is_nil(err, tostring(err))
            test.eq(removed, 1)
            local missing, read_err = jobs.get_job(queued.id)
            test.is_nil(read_err)
            test.is_nil(missing)
            for _, id in ipairs(ids) do
                local row, neighbor_err = jobs.get_job(id)
                test.is_nil(neighbor_err)
                test.not_nil(row)
            end
            local again, retry_err = constrained("purge", target)
            test.is_nil(retry_err)
            test.eq(again, 0)
        end)

        test.it("retains the running lease fence and removes settled history", function()
            local input = params(uuid.v7(), "lease")
            local queued = assert(jobs.enqueue(input))
            local db = assert(sql.get("app:db"))
            local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), queued.id)
            db:release()
            test.is_nil(lease_err)
            test.not_nil(leased)
            local removed, err = constrained("purge", input)
            test.is_nil(removed)
            test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
            test.is_true(err:retryable())
            test.is_true(err:details().cleanup_pending)
            test.eq(err:details().wait_for, "lease_release")
            local _, complete_err = jobs.complete(queued.id,
                { token = leased.lease_token, execution_seq = tonumber(leased.execution_seq) },
                { record = { status = "completed" } })
            test.is_nil(complete_err)
            local count, purge_err = constrained("purge", input)
            test.is_nil(purge_err)
            test.eq(count, 1)
            local verify = assert(sql.get("app:db"))
            local rows, read_err = verify:query("SELECT id FROM kickside_job_run WHERE job_id=$1", { queued.id })
            verify:release()
            test.is_nil(read_err)
            test.eq(#rows, 0)
        end)

        test.it("preserves purge input validation", function()
            for _, input in ipairs({ {}, { namespace = "test", scope = "owner" },
                { namespace = "test", scope = "owner", key = "" } }) do
                local value, err = constrained("purge", input)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.is_false(err:retryable())
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
