local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "resource guard requires encoding proof"})) end
    return data
end
return {run = test.run_cases(function()
    test.describe("thread creation database cleanup preserves native causes", function()
        for _, method in ipairs({"create", "ensure_thread"}) do
            for _, stage in ipairs({"identity", "attach", "healthy"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(method .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque operation refusal", details = {code = "resource_operation"}})
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque release refusal", details = {code = "resource_release", nested = {marker = "kept"}}})
                            fixture.reset(method, stage, primary, nil); fixture.release_source = source
                            local value, err = api[method]({id = "thread", component_id = "thread"})
                            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                            test.eq(err:details().code, "resource_release"); test.eq(err:details().nested.marker, "kept")
                            if stage == "healthy" then
                                test.is_false(err:retryable()); test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                                test.eq(fixture.removes, 0)
                            else
                                test.eq(err:retryable(), source:retryable()); test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                                test.eq(fixture.removes, 1)
                            end
                            test.eq(fixture.registers, 1); test.eq(fixture.releases, method == "create" and 1 or 2); test.eq(fixture.emits, 0)
                        end)
                    end
                end
            end
            test.it("healthy/" .. method, function()
                local primary = errors.new({kind = errors.INTERNAL, retryable = false, message = "unused fixture failure"})
                fixture.reset(method, "healthy", primary, nil)
                local value, err = api[method]({id = "thread", component_id = "thread"})
                test.is_nil(err); test.eq(value.thread_id, "thread"); test.eq(value.thread.id, "thread")
                test.eq(value.rollback.method, "delete"); test.eq(fixture.registers, 1); test.eq(fixture.removes, 0)
                test.eq(fixture.releases, method == "create" and 1 or 2); test.eq(fixture.emits, 1)
            end)
        end
    end)
end)}
