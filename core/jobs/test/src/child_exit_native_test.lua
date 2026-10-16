local test = require("test")
local child = require("child")
local fixture = require("fixture")
local types = require("job_types")
return {run = test.run_cases(function()
    test.describe("native child exit causes", function()
        for _, shape in ipairs({"status", "exit", "direct", "legacy"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(shape .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "child exit refusal", retryable = options.retryable,
                            details = {code = "child_exit_cause", nested = {marker = "kept"}}})
                        fixture.reset("exit", nil)
                        if shape == "status" then fixture.exit_value = {ok = false, error_native = types.error_to_data(source)}
                        elseif shape == "exit" then fixture.exit_value = {error = source}
                        elseif shape == "direct" then fixture.exit_value = source
                        else fixture.exit_value = {ok = false, error = source:message(), error_kind = kind} end
                        local actual, control = child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1})
                        test.is_nil(control)
                        if shape == "legacy" then test.is_true(errors.is(actual, errors.INVALID))
                        else
                            if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "child exit guard requires failure"})) end
                            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                            test.eq(actual:details().code, "child_exit_cause"); test.eq(actual:details().nested.marker, "kept")
                        end
                        test.eq(fixture.spawns, 1)
                    end)
                end
            end
        end
        test.it("successful child value remains", function()
            fixture.reset("exit", nil); fixture.exit_value = {value = {ok = true, control = nil}}
            local actual, control = child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1})
            test.is_nil(actual); test.is_nil(control); test.eq(fixture.spawns, 1)
        end)
        test.it("an EXIT table without a status envelope is invalid", function()
            fixture.reset("exit", nil); fixture.exit_value = {control = nil}
            local actual = select(1, child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1}))
            test.is_true(errors.is(actual, errors.INVALID))
        end)
    end)
end)}
