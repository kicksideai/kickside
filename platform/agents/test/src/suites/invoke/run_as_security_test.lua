local test = require("test")
local funcs = require("funcs")
local security = require("security")

local function scope(): any
    local policy, policy_err = security.policy("app:user")
    test.is_nil(policy_err)
    local result, scope_err = security.new_scope({ policy })
    test.is_nil(scope_err)
    return result
end

local function define_tests()
    test.describe("agent invoke admitted identity", function()
        test.it("keeps the admitted actor and its carrier while invoking the selected agent", function()
            local admitted = {
                version = 2,
                principal = { kind = "user", id = "agent-bot" },
                authorized_by = { kind = "user", id = "agent-admin" },
                component_id = "agent-root",
                credential_id = "agent-credential",
                link_id = "agent-link",
                captured_at = "2026-10-07T00:00:00Z",
            }
            local actor, actor_err = security.new_actor("agent-bot", {
                principal = admitted.principal,
                execution_identity = admitted,
            })
            test.is_nil(actor_err)
            local result, invoke_err = funcs.new():with_actor(actor):with_scope(scope())
                :call("app.agents_suites:kickside_agents_invoke__run_as_probe", {})
            test.is_nil(invoke_err)
            test.eq(result.success, true, tostring(result.error))
            test.eq(result.actor_id, "agent-bot")
            test.eq(result.identity.principal.id, "agent-bot")
            test.eq(result.identity.authorized_by.id, "agent-admin")
            test.eq(result.identity.component_id, "agent-root")
            test.eq(result.identity.credential_id, "agent-credential")
            test.eq(result.identity.link_id, "agent-link")
        end)
    end)
end

local cases = test.run_cases(define_tests)

local function run(options: any): any
    local actor, actor_err = security.new_actor("run-as-agent-suite", {})
    if actor_err or not actor then error(tostring(actor_err)) end
    local result, run_err = funcs.new():with_actor(actor):with_scope(scope())
        :call("app.agents_suites:kickside_agents_invoke__run_as_security_actor_run", options or {})
    if run_err then error(tostring(run_err)) end
    return result
end

return { run = run, actor_run = function(options: any): any return cases(options) end }
