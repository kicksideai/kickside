local test = require("test")
local dispatch = require("dispatch")
local types = require("job_types")
return {run = test.run_cases(function()
    test.describe("native process worker outcomes", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, shape in ipairs({"status", "exit", "value", "direct", "legacy"}) do
                    test.it(shape .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "worker outcome refusal", retryable = options.retryable,
                            details = {code = "worker_outcome", nested = {marker = "kept"}}})
                        local value: any
                        if shape == "status" then value = {ok = false, error_native = types.error_to_data(source)}
                        elseif shape == "exit" then value = {error = source}
                        elseif shape == "value" then value = {value = {ok = false, error_native = types.error_to_data(source)}}
                        elseif shape == "direct" then value = source
                        else value = {ok = false, error = source:message(), error_kind = kind, retryable = source:retryable(), details = source:details()} end
                        local output, actual = dispatch.interpret_proc_result(value)
                        test.is_nil(output)
                        if shape == "legacy" then
                            test.is_true(errors.is(actual, errors.INVALID))
                        else
                            if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker outcome guard requires native failure"})) end
                            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                            test.eq(actual:details().code, "worker_outcome"); test.eq(actual:details().nested.marker, "kept")
                        end
                    end)
                end
            end
        end
        test.it("healthy output remains", function()
            local output, err = dispatch.interpret_proc_result({value = {ok = true, output = {marker = "kept"}}})
            test.is_nil(err); test.eq(output.marker, "kept")
        end)
        test.it("non-envelope EXIT values are rejected", function()
            local output, err = dispatch.interpret_proc_result({value = 7})
            test.is_nil(output); test.is_true(errors.is(err, errors.INVALID))
        end)
    end)
end)}
