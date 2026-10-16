local test = require("test")
local contract = require("contract")
local security = require("security")
local uuid = require("uuid")
local channel = require("channel")
local time = require("time")

local function scope(policy_id: string): any
    local policy, perr = security.policy(policy_id)
    if not policy then error("policy " .. policy_id .. ": " .. tostring(perr)) end
    return security.new_scope({ policy })
end

local function open_realtime(user_id: string?, policy_id: string?, contract_id: string?): any
    local def, derr = contract.get(contract_id or "kickside.contract:realtime")
    if derr or not def then error("realtime contract: " .. tostring(derr)) end
    local actor = security.new_actor(user_id or "u1", {})
    local inst, oerr = def:with_actor(actor):with_scope(scope(policy_id or "app:self_notify")):open()
    if oerr or not inst then error("realtime open: " .. tostring(oerr)) end
    return inst
end

local function define_tests()
    test.describe("KickSide Realtime", function()
        test.it("broadcast requires a topic", function()
            test.eq(open_realtime():broadcast({}).success, false)
        end)

        test.it("notify requires a user_id", function()
            test.eq(open_realtime():notify({ topic = "x" }).success, false)
        end)

        test.it("notify requires a topic", function()
            test.eq(open_realtime():notify({ user_id = "u1" }).success, false)
        end)

        -- With no central hub live in the harness, broadcast is a no-op that still
        -- reports success (UIs reconcile on next load); the contract path works.
        test.it("broadcast requires broadcast authority", function()
            test.eq(open_realtime():broadcast({ topic = "nav.changed" }).success, false)
            test.eq(open_realtime("admin", "app:broadcast_realtime"):broadcast({ topic = "nav.changed" }).success, true)
        end)

        test.it("notify allows the current actor's own hub only by default", function()
            test.eq(open_realtime("u1"):notify({ user_id = "u1", topic = "x" }).success, true)
            test.eq(open_realtime("u1"):notify({ user_id = "u2", topic = "x" }).success, false)
            test.eq(open_realtime("admin", "app:notify_any_realtime"):notify({ user_id = "u2", topic = "x" }).success, true)
        end)

        -- None of the harness scopes carries process messaging authority, as a
        -- group principal holds none: delivery runs under the realtime policy.
        test.it("delivers a notify to the user's hub without caller process messaging authority", function()
            local user_id = "rt-" .. uuid.v4():sub(1, 8)
            local topic = "realtime.delivery:" .. uuid.v4()
            local mailbox = process.listen(topic)
            local _, reg_err = process.registry.register("user." .. user_id)
            test.is_nil(reg_err, tostring(reg_err))
            local result, notify_err = open_realtime(user_id):notify({ user_id = user_id, topic = topic, data = { n = 1 } })
            local selected = channel.select({ mailbox:case_receive(), time.after("2s"):case_receive() })
            process.registry.unregister("user." .. user_id)
            process.unlisten(mailbox)
            test.is_nil(notify_err, tostring(notify_err))
            test.eq(result.success, true)
            test.eq(selected.channel, mailbox, "the notify never reached the user's hub")
            test.eq(selected.value.n, 1)
        end)

        test.it("delivers a bounded audience once and authorizes the entire batch before sending", function()
            local user_id = "batch-" .. uuid.v4()
            local topic = "batch.delivery:" .. uuid.v4()
            local mailbox = process.listen(topic)
            process.registry.register("user." .. user_id)
            local denied, deny_err = open_realtime(user_id, nil, "kickside.contract:realtime_batch"):notify({ user_ids = { user_id, "other" }, topic = topic })
            local withheld = channel.select({ mailbox:case_receive(), time.after("20ms"):case_receive() })
            test.is_nil(denied)
            test.is_true(errors.is(deny_err, errors.PERMISSION_DENIED))
            test.eq(deny_err:details().code, "realtime_batch_denied")
            test.is_true(withheld.channel ~= mailbox)
            local accepted, accepted_err = open_realtime("admin", "app:notify_any_realtime", "kickside.contract:realtime_batch"):notify({
                user_ids = { user_id, user_id }, topic = topic, data = { batch = true } })
            local selected = channel.select({ mailbox:case_receive(), time.after("2s"):case_receive() })
            local duplicate = channel.select({ mailbox:case_receive(), time.after("20ms"):case_receive() })
            process.registry.unregister("user." .. user_id)
            process.unlisten(mailbox)
            test.is_true(duplicate.channel ~= mailbox)
            test.is_nil(accepted_err)
            test.eq(accepted.success, true)
            test.eq(selected.channel, mailbox)
            test.eq(selected.value.batch, true)
        end)

        test.it("hands a broadcast to the live central hub without caller process messaging authority", function()
            test.not_nil((process.registry.lookup("wippy.central")), "the harness runs the relay central hub")
            local result, broadcast_err = open_realtime("admin", "app:broadcast_realtime"):broadcast({
                topic = "realtime.broadcast:" .. uuid.v4(), data = { n = 2 } })
            test.is_nil(broadcast_err, tostring(broadcast_err))
            test.eq(result.success, true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
