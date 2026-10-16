local test = require("test")
local registry = require("registry")

local function define_tests()
    test.describe("principal picker registry declaration", function()
        test.it("registers the users-owned canonical principal picker", function()
            local entry, err = registry.get("kickside.users:principal_picker_view")
            test.is_nil(err)
            test.not_nil(entry)
            local meta = entry.meta or {}
            test.eq(meta.type, "view.component")
            test.eq(meta.tag_name, "wc-principal-picker")
            test.eq(meta.entry_point, "principal_picker.js")
            test.eq(meta.auto_register, true)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
