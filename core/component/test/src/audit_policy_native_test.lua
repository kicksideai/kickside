local test = require("test")
local policy = require("policy")
local fixture = require("fixture")
local operations = {
    policy = function() local _, err = policy.policy(); return err end,
    row = function() return policy.check_row("component", "row", "write") end,
}
return {run = test.run_cases(function()
    test.describe("native component audit policy failures", function()
        for name, operation in pairs(operations) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(name .. "/registry/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "policy registry failure",
                            retryable = options.retryable, details = {code = "policy_dependency", nested = {marker = "kept"}}})
                        fixture.configure(source, nil)
                        local err = operation()
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, source:details().code)
                        test.eq(err:details().nested.marker, "kept")
                        test.eq(fixture.calls, 1)
                    end)
                end
            end
            for _, input in ipairs({{name = "absent entry", field = "entry"},
                {name = "scalar entry", entry = true, field = "entry"},
                {name = "absent meta", entry = {}, field = "meta.limits"},
                {name = "scalar meta", entry = {meta = false}, field = "meta.limits"},
                {name = "absent limits", entry = {meta = {}}, field = "meta.limits"},
                {name = "scalar limits", entry = {meta = {limits = true}}, field = "meta.limits"},
                {name = "absent retention", entry = {meta = {limits = {max_row_bytes = 3}}}, field = "meta.retention"},
                {name = "scalar retention", entry = {meta = {limits = {max_row_bytes = 3}, retention = true}}, field = "meta.retention"}}) do
                test.it(name .. "/" .. input.name, function()
                    fixture.configure(nil, input.entry)
                    local err = operation()
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "component_policy")
                    test.eq(err:details().field, "kickside.component:policy." .. input.field)
                    test.eq(fixture.calls, 1)
                end)
            end
        end
        test.it("retains the exact size limit and valid retention policy", function()
            fixture.configure(nil, {meta = {limits = {max_row_bytes = 3}, retention = {identity_audits = "365d"}}})
            local result, err = policy.policy()
            test.is_nil(err)
            test.eq(result.max_row_bytes, 3)
            test.eq(result.history_days, 365)
            test.is_nil(policy.check_row("component", "row", "write"))
            local denied = policy.check_row("component", "rows", "write")
            test.is_true(errors.is(denied, errors.INVALID))
            test.eq(denied:retryable(), false)
            test.eq(denied:details().reason, "row_too_large")
            test.eq(denied:details().operation, "write")
            test.eq(denied:details().scope, "component")
            test.eq(denied:details().used, 4)
            test.eq(denied:details().cap, 3)
        end)
    end)
end)}
