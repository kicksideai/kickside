local test = require("test")
local envelope = require("envelope")
return {run = test.run_cases(function()
    test.describe("native method binding response proof", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "binding refused",
                        details = {code = "binding_dependency", nested = {marker = "kept"}}})
                    local result, err = envelope.binding({}, source, "open", "open boundary", "invalid_binding")
                    test.is_nil(result); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "binding_dependency"); test.eq(err:details().nested.marker, "kept")
                end)
            end
        end
        for index, item in ipairs({{}, {value = false}, {value = 1}, {value = "invalid"}, {value = function() end},
            {value = {}}, {value = {open = false}}, {value = {open = "invalid"}}}) do
            test.it("invalid response/" .. tostring(index), function()
                local result, err = envelope.binding(item.value, nil, "open", "open boundary", "invalid_binding")
                test.is_nil(result); test.is_true(errors.is(err, errors.INTERNAL)); test.is_false(err:retryable())
                test.eq(err:details().code, "invalid_binding")
            end)
        end
        test.it("an instance without a selected method remains valid", function()
            local source = {marker = "instance"}; local result, err = envelope.binding(source, nil, nil, "open boundary", "invalid_binding")
            test.eq(result, source); test.is_nil(err)
        end)
        test.it("absent instance without a selected method fails", function()
            local result, err = envelope.binding(nil, nil, nil, "open boundary", "invalid_binding")
            test.is_nil(result); test.is_true(errors.is(err, errors.INTERNAL)); test.is_false(err:retryable())
            test.eq(err:details().code, "invalid_binding")
        end)
        test.it("valid method binding remains the returned value", function()
            local source = {open = function() end}; local result, err = envelope.binding(source, nil, "open", "open boundary", "invalid_binding")
            test.eq(result, source); test.is_nil(err)
        end)
    end)
end)}
