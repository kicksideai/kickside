local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "purge guard requires encoding proof"})) end
    return data
end
local function invoke(): (any, error?) return api.purge({component_id = "thread"}) end
return {run = test.run_cases(function()
    test.describe("thread purge native cleanup and result proof", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, stage in ipairs({"operation", "release", "both"}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque refusal", details = {code = "purge_dependency", nested = {marker = "kept"}}})
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque purge refusal", details = {code = "purge_operation"}})
                        fixture.reset(stage == "both" and "operation" or stage, stage == "both" and primary or source, stage == "both" and source or nil, nil)
                        local value, err = invoke(); test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                        test.eq(err:details().code, "purge_dependency"); test.eq(err:details().nested.marker, "kept")
                        if stage == "release" then
                            test.is_false(err:retryable()); test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else
                            test.eq(err:retryable(), source:retryable())
                            if stage == "both" then test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary))) end
                        end
                        test.eq(fixture.opens, 1); test.eq(fixture.purges, 1); test.eq(fixture.releases, 1)
                    end)
                end
            end
        end
        for index, reply in ipairs({{}, {value = false}, {value = true}, {value = 1}, {value = "reply"}}) do
            test.it("mandatory result/" .. tostring(index), function()
                fixture.reset("reply", nil, nil, reply); local value, err = invoke()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.eq(err:details().code, "thread_purge_result_missing"); test.eq(fixture.releases, 1)
            end)
        end
        test.it("missing result and cleanup failure retain both causes", function()
            local source = errors.new({kind = errors.TIMEOUT, retryable = true, message = "opaque release refusal", details = {code = "purge_release"}})
            fixture.reset("reply", nil, source, {}); local value, err = invoke()
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.TIMEOUT); test.is_false(err:retryable())
            test.eq(err:details().code, "purge_release"); test.eq(err:details().operation_error.kind, errors.INTERNAL)
            test.is_false(err:details().operation_error.retryable); test.eq(err:details().operation_error.details.code, "thread_purge_result_missing")
            test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(source)))
            test.eq(fixture.releases, 1)
        end)
        for _, reply in ipairs({{purged = true, discarded = {events = 3}}, {purged = true}}) do
            test.it("healthy/" .. tostring(reply.discarded ~= nil), function()
                fixture.reset("reply", nil, nil, {value = reply}); local value, err = invoke()
                test.is_nil(err); test.eq(encoded(value), encoded({thread_id = "thread", purged = true, discarded = reply.discarded}))
                test.eq(fixture.opens, 1); test.eq(fixture.purges, 1); test.eq(fixture.releases, 1)
            end)
        end
    end)
end)}
