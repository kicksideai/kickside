local test = require("test")
local funcs = require("funcs")
local security = require("security")
local process = require("process")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")

local NAME = "kickside.core.retention.service:sweeper_process"
local TOPIC = "kickside.core.retention.changed"
local PROBE = "kickside.core.retention.pin_tests:notifier_probe"

local function define_tests()
    test.describe("Retention change notification authority", function()
        test.it("delivers a change from a producer without process messaging authority", function()
            local mailbox, listen_err = process.listen(TOPIC)
            test.is_nil(listen_err, tostring(listen_err))
            if not mailbox then error("retention mailbox is absent") end
            local _, register_err = process.registry.register(NAME, nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            local policy, policy_err = security.policy("app:test_constrained_writer_policy")
            if not policy then error("constrained policy missing: " .. tostring(policy_err)) end
            local producer = funcs.new():with_actor(security.new_actor("retention-producer-" .. uuid.v4(), {}))
                :with_scope(security.new_scope({ policy }))
            local delivered, notify_err = producer:call(PROBE, { kind = "notifier_authority_test" })
            local selected = channel.select({ mailbox:case_receive(), time.after("2s"):case_receive() })
            local _, unregister_err = process.registry.unregister(NAME, process.registry.CONSISTENT)
            process.unlisten(mailbox)
            test.is_nil(unregister_err, tostring(unregister_err))
            test.is_nil(notify_err, tostring(notify_err))
            test.is_true(delivered)
            test.eq(selected.channel, mailbox, "retention change from a constrained producer never reaches the sweeper")
            test.eq(selected.value.kind, "notifier_authority_test")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
