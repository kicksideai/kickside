local test = require("test")
local login = require("login")
local registry = require("registry")
local templates = require("templates")
local function define_tests()
    test.describe("login theme configuration", function()
        test.it("rejects an empty declared cookie key without substituting a hardcoded key", function()
            local failure = registry.failure
            registry.failure = nil
            registry.values = {["wippy.facade:theme_persist"] = "cookie", ["wippy.facade:theme_storage_key"] = ""}
            templates.calls = 0
            local value, err = login.handler()
            registry.failure = failure
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(templates.calls, 0)
        end)
        test.it("preserves registry failure before reading the template", function()
            templates.calls = 0
            local value, err = login.handler()
            test.is_nil(value)
            test.eq(err, registry.failure)
            test.eq(templates.calls, 0)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
