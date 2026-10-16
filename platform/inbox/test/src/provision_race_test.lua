-- Concurrent first-touch provisioning must preserve the component/thread winner
-- for the Inbox declaration, which lives in this suite's registry.

local test = require("test")
local channel = require("channel")
local contract = require("contract")
local uuid = require("uuid")
local security = require("security")
local provision = require("provision")
local autoinit = require("autoinit")

local function test_scope(): any
    local policy, policy_err = security.policy("app:user")
    if policy_err or not policy then error("inbox provisioning test policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("inbox provisioning test scope: " .. tostring(scope_err)) end
    return scope
end

local function define_tests()
    test.describe("Inbox provisioning", function()
        test.it("concurrent first touch creates one inbox thread and both calls succeed", function()
            local owner_id = "inbox-prov-race-" .. uuid.v4():sub(1, 8)
            local inbox_id = autoinit.component_id(owner_id, "kickside.inbox")
            local scoped = test_scope()
            local actor = security.new_actor(owner_id, { security_groups = { "app:user" } })
            local ready = channel.new(2)
            local start = channel.new(2)
            local done = channel.new(2)

            for _ = 1, 2 do
                coroutine.spawn(function()
                    ready:send(true)
                    start:receive()
                    local ids, err = provision.ensure_user(actor, scoped, owner_id)
                    done:send({ ids = ids, err = err })
                end)
            end

            -- Release both first-touch provisioners from the same barrier.
            for _ = 1, 2 do ready:receive() end
            start:send(true)
            start:send(true)

            for _ = 1, 2 do
                local outcome = done:receive()
                test.is_nil(outcome.err)
                test.not_nil(outcome.ids)
                local saw_inbox = false
                for _, component_id in ipairs(outcome.ids) do
                    if component_id == inbox_id then saw_inbox = true end
                end
                test.is_true(saw_inbox, "ensure_user omitted the inbox declaration")
            end

            local threads_contract, contract_err = contract.get("kickside.core:threads")
            if contract_err or not threads_contract then
                error("threads contract unavailable: " .. tostring(contract_err))
            end
            local threads, open_err = (threads_contract :: any)
                :with_actor(actor):with_scope(scoped):open()
            if open_err or not threads then error("open threads contract: " .. tostring(open_err)) end
            local result, list_err = (threads :: any):list({ thread_class = "kickside.inbox" })
            if list_err or not result then error("list inbox threads: " .. tostring(list_err)) end
            local matches = 0
            for _, thread in ipairs((result.threads or {}) :: { any }) do
                if tostring(thread.id) == inbox_id then matches = matches + 1 end
            end
            test.eq(matches, 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
