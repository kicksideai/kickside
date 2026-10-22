local test = require("test")
local funcs = require("funcs")
local security = require("security")
local engines = require("engines")

-- The control plane opens an engine's store through the binding the engine
-- descriptor names, not through the contract's default binding.
local function define_tests()
    test.describe("engine store binding", function()
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
