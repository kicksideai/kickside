-- A thread-backed component and its thread row become visible together: at the
-- moment a creation step has committed the component, its creator already reads
-- the thread through the threads contract. Covers the plain create, the
-- external-ref upsert used by the channel/DM bridges, and ensure_thread on a
-- fresh id for a kind that declares its primary thread and projections.
local test = require("test")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")

local PROCESS_SCOPE = "wippy.security:process"

local function run_as(owner: string, method: string, args: table): (any?, error?)
    local scope, scope_err = security.named_scope(PROCESS_SCOPE)
    if not scope then error("test scope missing: " .. tostring(scope_err)) end
    local actor = security.new_actor(owner, { security_groups = {} })
    return funcs.new():with_actor(actor):with_scope(scope):call("app:thread_visibility_probe",
        { method = method, args = args })
end

local function assert_visible_together(result: any, err: any)
    test.is_nil(err)
    test.not_nil(result)
    test.is_true(#result.observations >= 1)
    for _, observation in ipairs(result.observations) do
        test.eq(observation.component_id, result.thread_id)
        test.is_true(observation.component_visible)
        test.is_nil(observation.find_error)
        test.eq(observation.step .. ":" .. tostring(observation.thread_found), observation.step .. ":true")
    end
end

return { run = test.run_cases(function()
    test.describe("thread component visibility", function()
        local owner = "thread-visibility-" .. uuid.v4():sub(1, 8)

        test.it("create commits the component and its thread together", function()
            assert_visible_together(run_as(owner, "create", { thread_class = "visibility.create" }))
        end)

        test.it("external-ref upsert commits the component and its thread together", function()
            assert_visible_together(run_as(owner, "upsert", {
                thread_class = "visibility.channel",
                external_ref = "dm:" .. uuid.v4(),
                title = "Channel: visibility",
                attrs = { user_ids = { owner } },
            }))
        end)

        test.it("ensure_thread on a fresh id commits a declared kind with its thread", function()
            assert_visible_together(run_as(owner, "ensure_thread", {
                component_id = uuid.v4(),
                impl_id = "app:converge_test_decl",
            }))
        end)
    end)
end) }
