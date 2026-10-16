local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cleanup guard requires JSON proof"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("native registered component cleanup failures", function()
        for _, method in ipairs({"create", "ensure_thread"}) do
            for _, stage in ipairs({"open", "identity", "attach"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(method .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local primary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "operation refuses", details = {code = "registration_operation", nested = {marker = "primary"}}})
                            local secondary = errors.new({kind = kind, retryable = policy.retryable, message = "cleanup refuses", details = {code = "registration_cleanup", nested = {marker = "secondary"}}})
                            fixture.reset(method, stage, primary, secondary)
                            local value, err = api[method]({id = "thread", component_id = "thread"})
                            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.is_false(err:retryable())
                            test.eq(err:details().code, "registration_cleanup"); test.eq(err:details().nested.marker, "secondary")
                            test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                            test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(secondary)))
                            test.eq(fixture.registers, 1); test.eq(fixture.removes, 1)
                        end)
                        test.it(method .. "/successful cleanup/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local primary = errors.new({kind = kind, retryable = policy.retryable, message = "operation refuses", details = {code = "registration_operation", nested = {marker = "primary"}}})
                            fixture.reset(method, stage, primary, nil)
                            local value, err = api[method]({id = "thread", component_id = "thread"})
                            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), primary:kind()); test.eq(err:retryable(), primary:retryable())
                            test.eq(encoded(err:details()), encoded(primary:details())); test.eq(fixture.registers, 1); test.eq(fixture.removes, 1)
                        end)
                    end
                end
            end
        end
        test.it("upsert retains cleanup Conflict before probing a concurrent winner", function()
            local primary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "operation refuses", details = {code = "operation"}})
            local secondary = errors.new({kind = errors.CONFLICT, retryable = true, message = "removal refuses", details = {code = "cleanup"}})
            fixture.reset("upsert", "open", primary, secondary)
            local value, err = api.upsert({thread_id = "thread"})
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.CONFLICT); test.is_false(err:retryable())
            test.eq(err:details().code, "cleanup"); test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
            test.eq(fixture.opens, 3); test.eq(fixture.reads, 2); test.eq(fixture.removes, 1)
        end)
    end)
end)}
