local test = require("test")
local provision = require("provision")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("strict provisioning grant verdict", function()
        for _, value in ipairs({{}, {success = 1}, {success = "yes"}}) do
            test.it("refuses a malformed verdict/" .. type(value.success), function()
                fixture.reset("grant_proof", nil)
                fixture.grant_result = value
                local result, err = provision.ensure_user({}, fixture.scope, "user")
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "provision_response")
                test.eq(err:details().field, "grant")
                test.eq(fixture.grants, 1)
                test.eq(fixture.releases, 1)
            end)
        end
    end)
end)}
