local test = require("test")
local list_user_agents = require("list_user_agents")

local function define_tests()
    test.describe("list_user_agents payload", function()
        test.it("surfaces flat public meta status and delegate count", function()
            local agent = list_user_agents.agent_payload({
                component_id = "agent-1",
                meta = {
                    title = "Research Agent",
                    comment = "Does research",
                    icon = "tabler:robot",
                    status = "paused",
                    model = "class:fast",
                    delegate_count = "2",
                },
                created_at = "2026-01-01T00:00:00Z",
                updated_at = "2026-01-01T00:00:00Z",
                access_level = 3,
            }, false)

            test.eq(agent.status, "paused")
            test.eq(agent.delegate_count, "2")
            test.is_false(agent.public)
        end)

        test.it("surfaces exact public metadata to the authorized management UI", function()
            local public = list_user_agents.agent_payload({ component_id = "agent-public", meta = { public = true } }, false)
            local persisted = list_user_agents.agent_payload({ component_id = "agent-persisted", meta = { public = "true" } }, false)
            local malformed = list_user_agents.agent_payload({ component_id = "agent-malformed", meta = { public = 1 } }, false)
            test.is_true(public.public)
            test.is_true(persisted.public)
            test.is_false(malformed.public)
        end)

        test.it("defaults status without calling get_status", function()
            local agent = list_user_agents.agent_payload({
                component_id = "agent-1",
                meta = {},
            }, false)

            test.eq(agent.status, "active")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
