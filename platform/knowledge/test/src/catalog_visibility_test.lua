-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")

return { run = test.run_cases(function()
    test.describe("Knowledge catalog visibility", function()
        test.it("lists a committed library immediately after creation without a projection worker", function()
            local result, err = funcs.new()
                :with_actor(security.new_actor("catalog-reader", {}))
                :with_scope(security.named_scope("wippy.security:process"))
                :call("app.catalog_visibility:probe")
            test.is_nil(err, tostring(err))
            test.eq(result.status, 200)
            test.is_true(result.body.success)
            local found = false
            for _, item in ipairs(result.body.items) do
                if item.id == result.id then
                    found = true
                    test.eq(item.name, "Catalog visibility fixture")
                    test.eq(item.kb_type, "bound")
                    test.eq(item.status, "ready")
                end
            end
            test.is_true(found, "committed library is absent from the list response")
        end)
    end)
end) }
