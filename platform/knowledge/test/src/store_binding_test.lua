local test = require("test")
local funcs = require("funcs")
local security = require("security")
local engines = require("engines")

-- The control plane opens an engine's store through the binding the engine
-- descriptor names, not through the contract's default binding.
local function define_tests()
    test.describe("engine store binding", function()
        for _, method in ipairs({"create_store", "update_config", "delete_store"}) do
            test.it("routes " .. method .. " to the named binding and preserves the legacy default", function()
                for _, binding in ipairs({"app.store_binding:bound_store", ""}) do
                    local result, err = funcs.new()
                        :with_actor(security.new_actor("store-binding-test", {}))
                        :with_scope(security.named_scope("wippy.security:process"))
                        :call("app.store_binding:exercise_probe", {binding = binding, method = method})
                    test.is_nil(err, tostring(err))
                    test.eq(result.served_by, binding == "" and "default" or "bound")
                end
            end)
        end

        test.it("rejects an unknown named binding instead of using the default", function()
            local result, err = funcs.new()
                :with_actor(security.new_actor("store-binding-test", {}))
                :with_scope(security.named_scope("wippy.security:process"))
                :call("app.store_binding:exercise_probe", {binding = "app.store_binding:missing", method = "create_store"})
            test.is_nil(result)
            test.not_nil(err)
        end)

        test.it("preserves a caller scope that denies contract calls", function()
            local scope = assert(security.new_scope({
                assert(security.policy("app.store_binding:allow_probe")),
                assert(security.policy("app.store_binding:deny_contract")),
            }))
            local result, err = funcs.new()
                :with_actor(security.new_actor("store-binding-denied", {}))
                :with_scope(scope)
                :call("app.store_binding:exercise_probe", {binding = "app.store_binding:bound_store", method = "create_store"})
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)

        test.it("carries the engine's store binding through discovery", function()
            local engine = engines.resolve("bound")
            test.not_nil(engine)
            test.eq(engine.store_binding, "app.store_binding:bound_store")
        end)

        test.it("resolves a knowledge base's store through the binding its engine names", function()
            local resolved, err = funcs.new()
                :with_actor(security.new_actor("store-binding-test", {}))
                :with_scope(security.named_scope("wippy.security:process"))
                :call("app.store_binding:resolve_probe", { component_id = "kb-store-binding" })
            test.is_nil(err, tostring(err))
            test.eq(resolved.kb_type, "bound")
            test.eq(resolved.served_by, "bound")
            test.eq(resolved.engine_kb_type, "bound")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
