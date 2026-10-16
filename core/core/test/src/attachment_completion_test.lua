local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "attachment guard requires encoding proof"})) end
    return data
end
local function invoke(method: string): (any, error?)
    if method == "emit" then return api.emit({component_id = "thread", type = "event"}) end
    local target = api[method]
    if type(target) ~= "function" then
        error(errors.new({kind = errors.INTERNAL, retryable = false, message = "attachment guard requires a declared resource method"}))
    end
    return target({id = "thread", component_id = "thread"})
end
return {run = test.run_cases(function()
    test.describe("attached threads retain permanent marker and notification failures", function()
        for _, method in ipairs({"create", "ensure_thread", "emit"}) do
            local stages = method == "emit" and {"marker", "both", "notify"} or {"notify"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(method .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque refusal", details = {code = "attachment_dependency", nested = {marker = "kept"}}})
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque marker refusal", details = {code = "attachment_marker"}})
                            fixture.reset(method, stage == "both" and "marker" or stage, stage == "both" and primary or source, nil)
                            if stage == "both" then fixture.release_source = source end
                            local value, err = invoke(method)
                            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.is_false(err:retryable())
                            test.eq(err:details().code, "attachment_dependency"); test.eq(err:details().nested.marker, "kept")
                            if stage == "both" then
                                test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                                test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(source)))
                            else test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source))) end
                            test.eq(fixture.registers, 1); test.eq(fixture.removes, 0)
                            test.eq(fixture.releases, method == "create" and 1 or 2)
                            test.eq(fixture.stamps, method == "emit" and 1 or 0)
                            test.eq(fixture.emits, stage == "notify" and 1 or 0); test.eq(fixture.appends, 0)
                        end)
                    end
                end
            end
            test.it("healthy/" .. method, function()
                fixture.reset(method, "healthy", errors.new({kind = errors.INTERNAL, retryable = false, message = "unused"}), nil)
                local value, err = invoke(method); test.is_nil(err); test.eq(value.thread_id, "thread")
                if method == "emit" then test.eq(value.max_seq, 1) else test.eq(value.thread.id, "thread"); test.eq(value.rollback.method, "delete") end
                test.eq(fixture.registers, 1); test.eq(fixture.removes, 0); test.eq(fixture.emits, 1)
                test.eq(fixture.releases, method == "create" and 1 or 2); test.eq(fixture.stamps, method == "emit" and 1 or 0)
                test.eq(fixture.appends, method == "emit" and 1 or 0)
            end)
        end
    end)
end)}
