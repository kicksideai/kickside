local test = require("test")
local registry = require("registry")

local function data(entry)
    return type(entry) == "table" and (entry.data or entry) or {}
end

local function define_tests()
    test.describe("core lifecycle dependency wiring", function()
        test.it("supplies Core's implementation through Component's owned seam", function()
            test.eq(data(registry.get("kickside.component:component_lifecycle")).imports.lifecycle_impl,
                "kickside.core.lifecycle:component_lifecycle_impl")
            test.eq(registry.get("kickside.core.lifecycle:component_lifecycle_impl_binding"), nil)
        end)

        test.it("declares the kind stored by plain threads", function()
            local entry, err = registry.get("kickside.core:thread")
            test.is_nil(err, tostring(err))
            test.not_nil(entry)
            test.eq(entry.kind, "contract.binding")
            test.eq(data(entry).contracts[1].contract, "kickside.contract:component")
            test.eq(data(entry).contracts[1].methods.get_status, "kickside.core.threads:thread_status")
            test.is_nil((entry.meta or {}).provision)
        end)

        test.it("keeps published group requirements and the slice bindings", function()
            for _, id in ipairs({ "kickside.contract.http:user_security_scope",
                "kickside.core.retention:user_security_scope", "kickside.core.threads:user_security_scope",
                "kickside.core.security:user_security_scope" }) do
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry)
            end
            local published = data(registry.get("kickside.core.security:user_security_scope"))
            local targets = {}
            for _, target in ipairs(published.targets) do targets[target.entry] = target.path end
            test.eq(targets["kickside.core.security:module_access"], ".groups +=")
            test.eq(targets["kickside.core.security:module_runtime"], ".groups +=")
            test.eq(registry.get("kickside.core.retention:security_scope"), nil)
            test.eq(registry.get("kickside.core.threads:security_scope"), nil)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
