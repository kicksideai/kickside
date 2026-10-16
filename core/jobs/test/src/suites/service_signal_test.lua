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
local lease_release = require("lease_release")
local proc_supervisor = require("proc_supervisor")

local PROBE = "app:jobs_signal_probe"

local function constrained(args: table): (any?, error?)
    local policy, policy_err = security.policy("app:jobs_signal_constrained")
    if not policy then error("constrained policy missing: " .. tostring(policy_err)) end
    local actor = security.new_actor("principal:group:jobs-signal-" .. uuid.v4():sub(1, 8), {})
    return funcs.new():with_actor(actor):with_scope(security.new_scope({ policy })):call(PROBE, args)
end

local function receive(mailbox: any): any?
    local selected = channel.select({ mailbox:case_receive(), time.after("2s"):case_receive() })
    if selected.channel ~= mailbox then return nil end
    return selected.value
end

local function define_tests()
    test.describe("Jobs service-identity signals", function()
        test.it("delivers a lease release from a principal without process messaging authority", function()
            local job_id = uuid.v7()
            local mailbox = process.listen(lease_release.TOPIC)
            local _, register_err = process.registry.register(lease_release.NAME, nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            local released, release_err = constrained({ kind = "release", job_id = job_id, execution_seq = 3 })
            local message = receive(mailbox)
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
            local message = receive(mailbox)
            process.registry.unregister(name, process.registry.CONSISTENT)
            process.unlisten(mailbox)

            test.is_nil(notify_err, tostring(notify_err))
            test.is_true(sent)
            test.not_nil(message, "the revocation never reached its execution owner")
            test.eq(message.kind, "revoked")
            test.eq(message.lease_token, token)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
