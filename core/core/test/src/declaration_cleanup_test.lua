local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "declaration guard requires encoding proof"})) end
    return data
end
local function invoke(method: string): (any, error?)
    if method == "emit" then return api.emit({component_id = "thread", type = "event"}) end
    return api.converge_thread({component_id = "thread", impl_id = "impl"})
end
return {run = test.run_cases(function()
    test.describe("existing thread declaration cleanup preserves native causes", function()
        for _, method in ipairs({"converge_thread", "emit"}) do
            for _, stage in ipairs({"identity", "complete", "healthy"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(method .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque operation refusal", details = {code = "declaration_operation"}})
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque release refusal", details = {code = "declaration_release", nested = {marker = "kept"}}})
                            fixture.reset(method, stage, primary, nil); fixture.existing, fixture.release_source = true, source
                            local value, err = invoke(method)
                            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                            test.eq(err:details().code, "declaration_release"); test.eq(err:details().nested.marker, "kept")
                            if stage == "healthy" then
                                test.is_false(err:retryable()); test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                            else
                                test.eq(err:retryable(), source:retryable()); test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                            end
                            test.eq(fixture.opens, 2); test.eq(fixture.registers, 0); test.eq(fixture.removes, 0)
                            test.eq(fixture.completions, stage == "identity" and 0 or 1); test.eq(fixture.releases, 2); test.eq(fixture.appends, 0)
                        end)
                    end
                end
            end
            test.it("healthy/" .. method, function()
                local primary = errors.new({kind = errors.INTERNAL, retryable = false, message = "unused fixture failure"})
                fixture.reset(method, "healthy", primary, nil); fixture.existing = true
                local value, err = invoke(method); test.is_nil(err); test.eq(value.thread_id, "thread")
                if method == "converge_thread" then test.is_false(value.created); test.is_nil(value.rollback); test.eq(value.thread.marker, "kept")
                else test.eq(value.max_seq, 1) end
                test.eq(fixture.registers, 0); test.eq(fixture.removes, 0); test.eq(fixture.completions, 1)
                test.eq(fixture.releases, 2); test.eq(fixture.appends, method == "emit" and 1 or 0)
            end)
        end
    end)
end)}
