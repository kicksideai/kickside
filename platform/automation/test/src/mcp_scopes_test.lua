local test = require("test")
local registry = require("registry")

local function define_tests()
    test.describe("Automation MCP capability scopes", function()
        test.it("offers a reader preset with one bounded active capability", function()
            local entry, err = registry.get("kickside.automation.mcp:reader")
            test.is_nil(err)
            test.not_nil(entry)
            test.eq(entry.meta.type, "mcp.preset")
            test.eq(entry.data.access_mode, "traits")
            test.eq(#entry.data.scopes, 1)
            test.eq(entry.data.scopes[1], "state.read")
            test.eq(#entry.data.trait_filter.include_ids, 1)
            test.eq(entry.data.trait_filter.include_ids[1], "kickside.automation.traits:reader")
            test.eq(#entry.data.default_active, 1)
            test.eq(entry.data.default_active[1], "kickside.automation.traits:reader")
        end)
        test.it("separates read access from mutations across the tool surface", function()
            for _, name in ipairs({ "automations_read", "automations_manage", "recurring_tasks" }) do
                local entry, err = registry.get("kickside.automation.agent:" .. name)
                test.is_nil(err)
                test.not_nil(entry)
                test.not_nil(entry.meta.mcp, name .. " has no MCP scope declaration")
                local scopes = entry.meta.mcp.required_scopes
                test.eq(#scopes, 1)
                test.eq(scopes[1], name == "automations_manage" and "state.write" or "state.read")
                if name == "recurring_tasks" then
                    local actions = entry.meta.mcp.action_scopes
                    test.not_nil(actions)
                    for _, action in ipairs({ "create", "pause", "resume", "update", "delete", "run_now" }) do
                        test.eq(actions[action], "state.write", action)
                    end
                    test.is_nil(actions.list)
                    test.is_nil(actions.get)
                end
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
