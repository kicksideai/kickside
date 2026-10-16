-- An ingress writer reaches the conversation session hub from a principal
-- without process messaging authority (a group principal holds no members-only
-- process grant); the hub receives the message stamped with its origin.

local test = require("test")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")
local channel = require("channel")
local time = require("time")
local consts = require("channel_consts")

local function define_tests()
    test.describe("conversation hub signal", function()
        test.it("delivers an ingress message to the hub without caller process messaging authority", function()
            local key = "hub-signal:" .. uuid.v4()
            local mailbox = process.listen(consts.HUB_TOPIC)
            local _, reg_err = process.registry.register(consts.HUB_NAME)
            test.is_nil(reg_err, tostring(reg_err))
            local policy = assert(security.policy("app:hub_signal_constrained"))
            local sent, send_err = funcs.new():with_actor(security.new_actor("principal:group:ingress", {}))
                :with_scope(security.new_scope({ policy })):call("app:hub_signal_probe", { key = key })
            local selected = channel.select({ mailbox:case_receive(), time.after("2s"):case_receive() })
            process.registry.unregister(consts.HUB_NAME)
            process.unlisten(mailbox)
            test.is_nil(send_err, tostring(send_err))
            test.is_true(sent)
            test.eq(selected.channel, mailbox, "the hub never received the ingress message")
            test.eq(selected.value.kind, "clear")
            test.eq(selected.value.key, key)
            test.is_true(type(selected.value.origin) == "string" and selected.value.origin ~= "",
                "the hub message carries no origin")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
