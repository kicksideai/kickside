local test = require("test")
local update_policy = require("update_policy")

local function define_tests()
    test.describe("connection update policy", function()
        test.it("builds public metadata title from name and title", function()
            local fields, err = update_policy.fields({ name = "Primary", title = "Primary Connection" })
            test.is_nil(err)
            test.not_nil(fields)
            test.eq(fields.title, "Primary Connection")
        end)

        test.it("allows an empty update body as a no-op", function()
            local fields, err = update_policy.fields({})
            test.is_nil(err)
            test.not_nil(fields)
            test.is_nil(next(fields))
        end)

        test.it("rejects non-string metadata values", function()
            local fields, err = update_policy.fields({ name = { "bad" } })
            test.is_nil(fields)
            test.eq(err, "title must be a non-empty string")
        end)

        test.it("rejects generic credential/private_context patching", function()
            local fields, err = update_policy.fields({ private_context_patch = { token = "x" } })
            test.is_nil(fields)
            test.eq(err, update_policy.CREDENTIAL_PATCH_ERROR)

            fields, err = update_policy.fields({ auth = { token = "x" } })
            test.is_nil(fields)
            test.eq(err, update_policy.CREDENTIAL_PATCH_ERROR)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
