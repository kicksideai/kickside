-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local security = require("security")
local writer = require("scope_writer")
local source_scope = require("source_scope")
return {run = test.run_cases(function()
    test.describe("native scope compatibility", function()
        local projector
        test.before_all(function() projector = writer.start_projector() end)
        test.after_all(function() writer.stop_projector(projector) end)
        test.it("retains the native scope used by existing applications before any login", function()
            local native = assert(security.named_scope("app:declared_members"))
            local selected = assert(source_scope.resolve("app:declared_members"))
            local actor = assert(security.new_actor("existing-app"))
            for _, pair in ipairs({{"access", "app:module.endpoint"}, {"registry.get", "app:module_view"},
                    {"access", "unrelated:list.endpoint"}}) do
                test.eq(native:evaluate(actor, pair[1], pair[2]), selected:evaluate(actor, pair[1], pair[2]))
            end
            test.eq(native:evaluate(actor, "access", "app:module.endpoint"), "allow")
            test.neq(native:evaluate(actor, "access", "unrelated:list.endpoint"), "allow")
        end)
    end)
end)}
