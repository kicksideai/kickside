-- The MCP session scope denies control-plane and cross-tenant capabilities a
-- surfaced tool must never reach, including operator component adoption.
local test = require("test")
local security = require("security")
local registry = require("registry")

local function define_tests()
    test.describe("MCP session control-plane denies", function()
        test.it("keeps internal policies private and member access selectable", function()
            local entries, err = registry.find({ [".kind"] = "security.policy" })
            test.is_nil(err)
            local checked = 0
            for _, entry in ipairs(entries) do
                local id = tostring(entry.id)
                if id:sub(1, #"kickside.mcp.security:") == "kickside.mcp.security:" then
                    if id == "kickside.mcp.security:module_access" then
                        test.is_false(entry.meta.private == true)
                    else
                        test.is_true(entry.meta.private == true, id)
                        checked = checked + 1
                    end
                end
            end
            test.is_true(checked >= 10)
        end)
        test.it("denies operator component adoption and cross-tenant reads", function()
            local policy, err = security.policy("kickside.mcp.security:session_deny_control_plane")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("mcp-session-principal", {})
            for _, action in ipairs({ "component.adopt", "list_all", "view_all", "realtime.broadcast" }) do
                test.eq(policy:evaluate(actor, action, "kickside.component:components", nil), "deny", action)
            end
            test.eq(policy:evaluate(actor, "contract.call", "kickside.component:components", nil), "undefined")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
