local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native Jobs registry versions", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(opts.retryable), function()
                    local source = errors.new({kind = kind, message = "registry version refusal", retryable = opts.retryable,
                        details = {code = "registry_dependency", nested = {marker = "kept"}}})
                    fixture.reset("dependency", source)
                    local value, actual = worker.registry_version_id(); test.is_nil(value)
                    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "version guard requires failure"})) end
                    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                    test.eq(actual:details().code, "registry_dependency"); test.eq(actual:details().nested.marker, "kept")
                end)
            end
        end
        for _, stage in ipairs({"missing", "method", "boolean", "empty"}) do
            test.it("rejects successful response/" .. stage, function()
                fixture.reset(stage, nil)
                local value, actual = worker.registry_version_id(); test.is_nil(value)
                test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                test.eq(actual:details().code, "job_registry_response")
            end)
        end
        test.it("native numeric version identity renders unchanged", function()
            fixture.reset("numeric", nil); local value, err = worker.registry_version_id()
            test.eq(value, "17"); test.is_nil(err)
        end)
        test.it("healthy version identity remains", function()
            fixture.reset("", nil); local value, err = worker.registry_version_id()
            test.eq(value, "fixture-version"); test.is_nil(err)
        end)
    end)
end)}
