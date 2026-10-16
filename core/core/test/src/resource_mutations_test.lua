local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "write guard requires JSON proof"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("native resource mutation failures", function()
        for _, route in ipairs({"update", "delete"}) do
            for _, stage in ipairs({"open", "write", "release", "notify"}) do
                do
                    for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                        errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "resource_dependency", nested = {marker = "kept"}}})
                                fixture.reset(stage, source, nil); local value, err = api[route]({thread_id = "thread", attrs = {marker = "kept"}})
                                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                                if stage == "release" or stage == "notify" then
                                    test.is_false(err:retryable()); test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                                else test.eq(err:retryable(), source:retryable()); test.eq(encoded(err:details()), encoded(source:details())) end
                                test.eq(err:details().code, "resource_dependency"); test.eq(err:details().nested.marker, "kept")
                                test.eq(fixture.opens, 1)
                                test.eq(fixture.writes, stage == "open" and 0 or 1)
                                test.eq(fixture.releases, stage == "open" and 0 or 1)
                                test.eq(fixture.notifications, stage == "notify" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            test.it(route .. "/combined write and cleanup causes", function()
                local primary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "write refuses", details = {code = "write", nested = {marker = "primary"}}})
                local secondary = errors.new({kind = errors.CONFLICT, retryable = false, message = "release refuses", details = {code = "release", nested = {marker = "secondary"}}})
                fixture.reset("write", primary, secondary); local value, err = api[route]({thread_id = "thread"})
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.eq(err:retryable(), secondary:retryable())
                test.eq(encoded(err:details().cause), encoded(error_envelope.encode(secondary)))
                test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                test.eq(fixture.notifications, 0); test.eq(fixture.releases, 1)
            end)
            test.it(route .. "/missing mandatory write proof", function()
                fixture.reset("missing_write", nil, nil); local value, err = api[route]({thread_id = "thread"})
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.eq(fixture.notifications, 0); test.eq(fixture.releases, 1)
            end)
            test.it(route .. "/healthy result", function()
                fixture.reset("", nil, nil); local value, err = api[route]({thread_id = "thread", attrs = {marker = "kept"}})
                test.is_nil(err); test.not_nil(value); test.eq(value.thread_id, "thread")
                if route == "update" then test.eq(value.thread.marker, "kept") else test.eq(value.marker, "kept") end
                test.eq(fixture.writes, 1); test.eq(fixture.releases, 1); test.eq(fixture.notifications, 1)
            end)
        end
    end)
end)}
