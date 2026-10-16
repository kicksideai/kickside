local test = require("test")
local lifecycle = require("component_lifecycle")
local dependency = require("lifecycle_stub")

local function invoke(method)
    if method == "publish_audit" then
        local result, err = lifecycle.publish_audit({component_id = "native-lifecycle"})
        test.is_nil(result)
        return err
    end
    return lifecycle[method]({component_id = "native-lifecycle"})
end

local function define_tests()
    test.describe("native Component lifecycle outcomes", function()
        for _, method in ipairs({"created", "updated", "deleted", "committed", "publish_audit"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, channel in ipairs({"return", "envelope"}) do
                        test.it(method .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. channel, function()
                            local source = errors.new({message = "lifecycle failure", kind = kind,
                                retryable = options.retryable,
                                details = {code = "lifecycle_dependency", nested = {method = method}}})
                            if channel == "return" then dependency.set_outcome(nil, source)
                            else dependency.set_outcome({success = false, error = source:message(), kind = source:kind(),
                                retryable = source:retryable(), details = source:details()}, nil) end
                            local err = invoke(method)
                            dependency.clear_outcome()
                            test.not_nil(err)
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "lifecycle_dependency")
                            test.eq(err:details().nested.method, method)
                        end)
                    end
                end
            end
            test.it(method .. " retains an unclassified failure as Internal", function()
                dependency.set_outcome({success = false, error = "legacy lifecycle refusal"}, nil)
                local err = invoke(method)
                dependency.clear_outcome()
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:message(), "component lifecycle " .. method .. " rejected: legacy lifecycle refusal")
            end)
        end
    end)
end

return {run = test.run_cases(define_tests)}
