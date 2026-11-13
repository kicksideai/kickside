-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local security = require("security")
local funcs = require("funcs")
local registry = require("registry")
local function call(id: string, path: string, empty: boolean, inject: boolean?): any
    local policies = {assert(security.policy("app:hub_signal_constrained"))}
    if inject then policies[#policies + 1] = assert(security.policy("app:maintenance_ingress_capability")) end
    local result, err = funcs.new():with_actor(assert(security.new_actor(id,
        {system = true, security_groups = {"app:admin"}, principal = {kind = "user", id = "victim"}})))
        :with_scope(assert(security.new_scope(policies)))
        :call("app:maintenance_ingress_probe", {path = path, empty = empty})
    test.is_nil(err, tostring(err))
    return result
end
return {run = test.run_cases(function()
    test.describe("framework ingress actor membership", function()
        for _, id in ipairs({"system:knowledge.injection", "system:unlisted"}) do
            for _, path in ipairs({"channel", "dm"}) do
                test.it("refuses " .. path .. " ingress from " .. id, function()
                    local result = call(id, path, false)
                    test.is_false(result.accepted); test.eq(result.status, "error")
                    test.eq(result.error, path == "dm" and "trusted DM ingress is required" or "trusted channel ingress is required")
                end)
            end
        end
        for _, declaration in ipairs(assert(registry.find({[".kind"] = "registry.entry",
            ["meta.type"] = "kickside.execution.maintenance_actor"}))) do
            local id = declaration.meta.actor_id
            test.it("admits the declared framework ingress actor " .. id, function()
                -- Missing transport data is checked only after trusted ingress admission.
                test.eq(call(id, "channel", true).error, "provider is required")
                test.eq(call(id, "dm", true).error, "provider is required")
            end)
        end
        test.it("retains the separate ingress capability for an ordinary caller", function()
            test.eq(call("system:unlisted", "channel", true, true).error, "provider is required")
            test.eq(call("system:unlisted", "dm", true, true).error, "provider is required")
        end)
    end)
end)}
