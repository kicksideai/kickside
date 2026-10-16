-- Proves the SubmitToInbox agent trait: a valid call enqueues an item onto the
-- actor's inbox thread (readable back by id), and a missing title is rejected
-- before any write.

local test = require("test")
local funcs = require("funcs")
local inbox_submit = require("inbox_submit")
local security = require("security")
local test_identity = require("test_identity")

local TOOL_ID = "kickside.inbox.traits:inbox_submit_tool"
local READ_PROBE_ID = "app:inbox_read_probe"
local CATCHUP_PROBE_ID = "app:inbox_catchup_probe"
local TEST_ACTOR_ID = "inbox-traits-user"

local function test_scope(): any
    local policy, policy_err = security.policy("app:user")
    if policy_err or not policy then error("inbox trait test policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("inbox trait test scope: " .. tostring(scope_err)) end
    return scope
end

local function executor(actor_id: string): any
    test_identity.ensure_user(actor_id)
    return funcs.new()
        :with_actor(security.new_actor(actor_id, { security_groups = { "app:user" } }))
        :with_scope(test_scope())
end

local function wait_item(actor_id: string, item_id: string): any
    local framed = executor(actor_id)
    local _, catchup_err = framed:call(CATCHUP_PROBE_ID, {})
    test.is_nil(catchup_err)
    local item, err = framed:call(READ_PROBE_ID, { id = item_id })
    test.is_nil(err)
    test.not_nil(item)
    return item
end

local function run()
    test.describe("kickside.inbox SubmitToInbox trait", function()
        test.it("rejects a missing title", function()
            local res, err = inbox_submit.handle({})
            test.is_nil(res)
            test.is_true(errors.is(err, errors.INVALID))
        end)

        test.it("rejects an item without a resolvable owner", function()
            local res, err = executor(""):call("kickside.inbox.traits:inbox_submit_tool", { title = "Review needed" })
            test.is_nil(res)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)

        test.it("ignores mutable context identity when no security actor is present", function()
            local res, err = executor(""):call("kickside.inbox.traits:inbox_submit_tool",
                { title = "Spoofed review", content = "ctx" },
                { actor_id = "agent:spoofed", agent_id = "agent:fallback" }
            )
            test.is_nil(res)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)

        test.it("enqueues an item under the security actor", function()
            local res, err = executor(TEST_ACTOR_ID):call(TOOL_ID,
                { title = "Review needed", content = "ctx", priority = "high" })
            test.is_nil(err)
            test.is_true(res.success, "submit failed: " .. tostring(res.error))
            test.not_nil(res.id, "no id returned")

            local item_id = tostring(res.id)
            local item = wait_item(TEST_ACTOR_ID, item_id)
            test.not_nil(item, "item not found in inbox")
            test.eq((item :: { title: any }).title, "Review needed", "title not persisted")
            test.eq((item :: { priority: any }).priority, "high", "priority not persisted")
            test.eq((item :: { actor_id: any }).actor_id, TEST_ACTOR_ID, "actor_id not persisted")
        end)
    end)
end

return { run = test.run_cases(run) }
