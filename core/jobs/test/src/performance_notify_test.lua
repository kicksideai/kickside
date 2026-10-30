-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
return {run = test.run_cases(function()
    test.describe("Jobs performance realtime", function()
        test.it("does not require realtime when the host leaves status publishing unbound", function()
            local original = assert(registry.current_version())
            local wiring = assert(registry.get("kickside.core.jobs.performance:config"))
            local changes = assert(registry.snapshot()):changes()
            local meta = {}
            for key, value in pairs(wiring.meta or {}) do meta[key] = value end
            meta.binding_id = ""
            changes:update({id = tostring(wiring.id), kind = wiring.kind, meta = meta, data = wiring.data})
            local binding = assert(registry.get("kickside.core.jobs.performance:binding"))
            local data = {}
            for key, value in pairs(binding.data) do data[key] = value end
            local policy = {}
            for key, value in pairs(data.policy) do policy[key] = value end
            policy.resources = {}
            data.policy = policy
            changes:update({id = tostring(binding.id), kind = binding.kind, meta = binding.meta, data = data})
            assert(changes:apply())
            local ok, failure = pcall(function()
                local actor = security.new_actor("unbound-notifier-caller", {})
                local unbound = assert(security.policy("kickside.core.jobs.performance:binding"))
                test.neq(unbound:evaluate(actor, "contract.open", "kickside.realtime:realtime_binding"), "allow")
                test.neq(unbound:evaluate(actor, "contract.open", "app:another_binding"), "allow")
                local scope = security.new_scope({assert(security.policy("app:performance_notify_caller"))})
                local result, err = funcs.new():with_actor(actor):with_scope(scope)
                    :with_context({performance_refused = true}):call("kickside.core.jobs.performance:notify")
                test.is_nil(err)
                test.is_true(result.success)
            end)
            local _, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            if not ok then error(failure) end
        end)
        test.it("publishes through the contract with only the notifier call grant on its caller", function()
            local binding = assert(security.policy("kickside.core.jobs.performance:binding"))
            local reader = security.new_actor("binding-reader", {})
            test.eq(binding:evaluate(reader, "contract.open", "kickside.realtime:realtime_binding"), "allow")
            test.neq(binding:evaluate(reader, "contract.open", "app:another_binding"), "allow")
            local policy = assert(security.policy("app:performance_notify_caller"))
            local scope = security.new_scope({policy})
            local actor = security.new_actor("notifier-caller", {})
            test.neq(scope:evaluate(actor, "realtime.broadcast", "kickside.realtime:kickside.jobs.performance.changed"), "allow")
            local result, err = funcs.new():with_actor(actor):with_scope(scope):call("kickside.core.jobs.performance:notify",
                {state = {revision = 0, total = 0, busy = 0, idle = 0, awaited = 0, retiring = 0}})
            test.is_nil(err)
            test.is_true(result.success)
            local refused, refusal = funcs.new():with_actor(actor):with_scope(scope):with_context({performance_refused = true})
                :call("kickside.core.jobs.performance:notify", {state = {revision = 1, total = 0, busy = 0, idle = 0, awaited = 0, retiring = 0}})
            test.is_nil(refused)
            test.is_true(errors.is(refusal, errors.UNAVAILABLE))
            test.eq(refusal:details().code, "fixture_delivery_refused")
            test.eq(refusal:details().reason, "test")
            local recovered = assert(funcs.new():with_actor(actor):with_scope(scope):call("kickside.core.jobs.performance:notify"))
            test.is_true(recovered.success)
        end)
    end)
end)}
