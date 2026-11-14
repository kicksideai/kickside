local test = require("test")
local security = require("security")
local funcs = require("funcs")

local PROBE = "app:jobs_health_probe"

local function scope(policy_ids: { string }): any
    local policies = {}
    for _, id in ipairs(policy_ids) do
        local policy, err = security.policy(id)
        if not policy then error("policy " .. id .. ": " .. tostring(err)) end
        policies[#policies + 1] = policy
    end
    return security.new_scope(policies)
end

local function call(actor_id: string, policy_ids: { string }): any
    local result, err = funcs.new()
        :with_actor(security.new_actor(actor_id, {}))
        :with_scope(scope(policy_ids))
        :call(PROBE)
    if err then error("health probe: " .. tostring(err)) end
    return result
end

return { run = test.run_cases(function()
    test.describe("GET jobs health", function()
        test.it("returns the jobs health report to an administrator", function()
            local result = call("app:jobs_health_admin",
                { "app:jobs_health_base", "kickside.core.threads.api:health_access" })
            test.is_nil(result.kind)
            local health = result.health
            test.eq(type(health.healthy), "boolean")
            test.eq(type(health.workers), "table")
            test.eq(type(health.issues), "table")
            test.eq(type(health.due_unclaimed_count), "number")
            test.eq(type(health.overdue_unclaimed_count), "number")
            test.eq(type(health.healthy_worker_count), "number")
            test.eq(type(health.expired_leases), "number")
        end)

        test.it("refuses an actor without the administrator grant", function()
            local result = call("app:jobs_health_member", { "app:jobs_health_base" })
            test.eq(result.kind, errors.PERMISSION_DENIED)
            test.is_nil(result.health)
        end)
    end)
end) }
