local test = require("test")
local implementation = require("implementation")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native implementation visibility query failures", function()
        for _, method in ipairs({"narrow", "check"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(method .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({message = "visibility query failure", kind = kind,
                            retryable = options.retryable, details = {code = "visibility_dependency", nested = {method = method}}})
                        fixture.configure(source)
                        local value, err
                        if method == "narrow" then value, err = implementation.narrow({}, fixture.filter())
                        else value, err = implementation.check({}, "component") end
                        if method == "narrow" then test.is_nil(value) else test.is_false(value) end
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, source:details().code)
                        test.eq(err:details().nested.method, method)
                        test.eq(fixture.queries, 1)
                        test.eq(fixture.security_calls, 0)
                        test.eq(fixture.filters, 0)
                    end)
                end
            end
            test.it(method .. "/success", function()
                fixture.configure(nil)
                local filter = fixture.filter()
                local value, err
                if method == "narrow" then value, err = implementation.narrow({}, filter)
                else value, err = implementation.check({}, "component") end
                test.is_nil(err)
                if method == "narrow" then test.is_true(value == filter) else test.is_true(value) end
                test.eq(fixture.queries, 1)
                test.eq(fixture.security_calls, 1)
                test.eq(fixture.filters, method == "narrow" and 1 or 0)
            end)
        end
    end)
    test.describe("native implementation candidate narrowing", function()
        test.it("checks only implementations that survive the component query", function()
            fixture.configure(nil,
                {{impl_id = "outside-a"}, {impl_id = "outside-b"}, {impl_id = "inside"}},
                {{impl_id = "inside"}})
            local narrowed, err = implementation.narrow({}, fixture.filter(), fixture.candidates())
            test.is_nil(err)
            test.not_nil(narrowed)
            test.eq(fixture.queries, 1)
            test.eq(fixture.security_calls, 1)
            test.eq(fixture.filters, 1)
        end)
    end)
end)}
