local test = require("test")
local api_errors = require("api_errors")

local function define_tests()
    test.describe("native Security HTTP output failures", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, stage in ipairs({"status", "json"}) do
                    test.it("retains " .. kind .. " HTTP " .. stage .. " failure with retryability " .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, message = "output dependency",
                            retryable = policy.retryable, details = {code = "output_dependency", nested = {marker = "retained"}}})
                        local writes = 0
                        local output = {
                            set_status = function(_, status)
                                test.eq(status, 400)
                                if stage == "status" then return source end
                            end,
                            write_json = function(_, payload)
                                writes = writes + 1
                                test.is_false(payload.success)
                                test.eq(payload.kind, errors.INVALID)
                                test.eq(payload.retryable, false)
                                test.eq(payload.details.field, "field")
                                return source
                            end,
                        }
                        local result, err = api_errors.write(output, 400, api_errors.invalid("invalid input", "field"))
                        test.is_nil(result)
                        test.is_true(errors.is(err, kind))
                        test.eq(err:retryable(), policy.retryable)
                        test.eq(err:details().code, "output_dependency")
                        test.eq(err:details().nested.marker, "retained")
                        test.eq(writes, stage == "json" and 1 or 0)
                    end)
                end
            end
        end
    end)
end
return {run = test.run_cases(define_tests)}
