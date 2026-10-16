local test = require("test")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local uuid = require("uuid")

return { run = test.run_cases(function()
    test.describe("Inbox runtime metadata", function()
        local owner
        local targets = {}
        test.after_each(function()
            for _, id in ipairs(targets) do
                local deleted, delete_err = owner:delete({ component_id = id })
                test.is_nil(delete_err)
                test.is_true(deleted.success)
            end
            targets = {}
        end)
        test.it("publishes committed summaries under a runtime actor without an Inbox grant", function()
            local owner_policy, policy_err = security.policy("app:user")
            test.is_nil(policy_err)
            local definition, definition_err = contract.get("kickside.component:component_service")
            test.is_nil(definition_err)
            local open_err
            owner, open_err = definition:with_actor(security.new_actor("inbox-summary-owner-" .. uuid.v4(), {}))
                :with_scope(security.new_scope({ owner_policy })):open()
            test.is_nil(open_err)
            local runtime_policy, runtime_policy_err = security.policy("app:inbox_runtime_base")
            test.is_nil(runtime_policy_err)
            local runtime = funcs.new():with_actor(security.new_actor("system:inbox-summary-test", {}))
                :with_scope(security.new_scope({ runtime_policy }))
            for _, kind in ipairs({ "kickside.inbox:inbox_binding", "kickside.core:thread" }) do
                local target, register_err = owner:register({ impl_id = kind, meta = { impl_id = "kickside.inbox:inbox_binding" } })
                test.is_nil(register_err)
                test.is_true(target.success)
                targets[#targets + 1] = target.component_id
                local result, err = runtime:call("kickside.inbox.persist:projection_committed", {
                    thread_id = target.component_id, range = { to_seq = 13 },
                    projection = { body = { counts = { item_count = 2, pending_count = 1, resolved_count = 1 } } },
                })
                if kind == "kickside.inbox:inbox_binding" then
                    test.is_nil(err)
                    test.not_nil(result)
                    local current, read_err = owner:get({ component_id = target.component_id })
                    test.is_nil(read_err)
                    test.eq(current.meta.last_event_seq, "13")
                    test.eq(current.meta.item_count, "2")
                else
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                end
            end
        end)
    end)
end) }
