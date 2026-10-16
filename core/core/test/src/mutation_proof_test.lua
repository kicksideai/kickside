local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "mutation proof guard requires JSON proof"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("unproven mutations retain permanent replay policy", function()
        for _, method in ipairs({"update", "delete"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(method .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "release_dependency", nested = {marker = "kept"}}})
                        fixture.reset("unproven_effect", nil, source)
                        local result, err = api[method]({thread_id = "thread"})
                        test.is_nil(result); test.not_nil(err)
                        test.eq(err:kind(), source:kind()); test.is_false(err:retryable())
                        test.eq(err:details().code, "release_dependency")
                        test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(source)))
                        test.eq(err:details().operation_error.kind, errors.INTERNAL)
                        test.eq(err:details().operation_error.retryable, false)
                        test.eq(err:details().operation_error.details.code, "thread_" .. method .. "_result_missing")
                        test.eq(fixture.writes, 1); test.eq(fixture.releases, 1); test.eq(fixture.notifications, 0)
                    end)
                end
            end
        end
        test.it("shared mutation finalization capability", function()
            test.eq(type(api.finish_mutation), "function")
        end)
    end)
end)}
