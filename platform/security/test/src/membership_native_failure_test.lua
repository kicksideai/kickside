local test = require("test")
local funcs = require("funcs")

local function define_tests()
    test.describe("membership dependency failure compatibility", function()
        for _, case in ipairs({
            {args = false, field = "change"},
            {args = {before_groups = false, after_groups = {}}, field = "before_groups"},
            {args = {before_groups = {""}, after_groups = {}}, field = "before_groups"},
            {args = {before_groups = {42}, after_groups = {}}, field = "before_groups"},
            {args = {before_groups = {}, after_groups = false}, field = "after_groups"},
            {args = {before_groups = {}, after_groups = {""}}, field = "after_groups"},
            {args = {before_groups = {}, after_groups = {42}}, field = "after_groups"},
        }) do
            test.it("retains native nonretryable membership validation for " .. case.field, function()
                local result, err = funcs.call("kickside.security.binding:classify_membership_effect", case.args)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "membership_change_invalid")
                test.eq(err:details().field, case.field)
            end)
        end
        test.it("retains the Unavailable facade and the complete native dependency cause", function()
            local result, err = funcs.call("app:membership_native_failure_binding", {
                before_groups = {"security_test"}, after_groups = {"security_test"},
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:retryable(), false)
            local cause = err:details().cause
            test.eq(cause.kind, errors.RATE_LIMITED)
            test.eq(cause.retryable, false)
            test.eq(cause.details.code, "fingerprint_dependency")
            test.eq(cause.details.nested.marker, "kept")
        end)
    end)
end
return {run = test.run_cases(define_tests)}
