-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local security = require("security")
return {run = test.run_cases(function()
    test.describe("Performance endpoint authorization", function()
        test.it("grants only the two exact endpoints to performance administrators", function()
            local declaration = assert(registry.get("kickside.jobs_admin.security:admin_access"))
            local policy = assert(security.policy(tostring(declaration.id)))
            local member = assert(security.policy("kickside.jobs_admin.security:module_runtime"))
            local actor = security.new_actor("performance-test", {})
            test.eq(#declaration.data.policy.resources, 2)
            for _, id in ipairs({"kickside.jobs_admin.api:get_policy.endpoint", "kickside.jobs_admin.api:put_policy.endpoint"}) do
                test.eq(policy:evaluate(actor, "access", id), "allow")
                test.neq(member:evaluate(actor, "access", id), "allow")
                local endpoint = assert(registry.get(id))
                test.not_nil(endpoint.meta.router)
            end
            test.neq(policy:evaluate(actor, "access", "kickside.jobs_admin.api:future_policy.endpoint"), "allow")
        end)
    end)
end)}
