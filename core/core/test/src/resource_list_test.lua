local test = require("test")
local resource = require("resource")
local fixture = require("fixture")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "graph read guard requires JSON result"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("native Core resource list release", function()
        for _, route in ipairs({{name = "threads", call = resource.list}}) do
            for _, stage in ipairs({"open", "read", "release"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(route.name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                                details = {code = "graph_read_dependency", nested = {marker = "kept"}}})
                            fixture.reset(stage, source, nil); local result, err = route.call({thread_id = "thread", limit = 3})
                            test.is_nil(result); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "graph_read_dependency"); test.eq(err:details().nested.marker, "kept")
                            test.eq(fixture.opens, 1); test.eq(fixture.reads, stage == "open" and 0 or 1); test.eq(fixture.releases, stage == "open" and 0 or 1)
                        end)
                    end
                end
            end
            test.it(route.name .. "/complete read and release causes", function()
                local primary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "read refusal", details = {code = "read", nested = {marker = "primary"}}})
                local secondary = errors.new({kind = errors.CONFLICT, retryable = false, message = "release refusal", details = {code = "release", nested = {marker = "secondary"}}})
                fixture.reset("read", primary, secondary); local result, err = route.call({thread_id = "thread"})
                test.is_nil(result); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.eq(err:retryable(), secondary:retryable())
                test.eq(encoded(err:details().cause), encoded(error_envelope.encode(secondary)))
                test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                test.eq(fixture.reads, 1); test.eq(fixture.releases, 1)
            end)
            test.it(route.name .. "/absent result proof", function()
                fixture.reset("missing", nil, nil); local result, err = route.call({thread_id = "thread"})
                test.is_nil(result); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.not_nil(err:details().code); test.eq(fixture.reads, 1); test.eq(fixture.releases, 1)
            end)
            for _, stage in ipairs({"", "empty"}) do
                test.it(route.name .. "/healthy/" .. stage, function()
                    fixture.reset(stage, nil, nil); local result, err = route.call({thread_id = "thread", limit = 3})
                    test.is_nil(err); test.not_nil(result); test.eq(fixture.reads, 1); test.eq(fixture.releases, 1)
                    test.eq(#result[route.name], stage == "empty" and 0 or 1)
                    if stage == "" then
                        test.eq(result.threads[1].id, "thread")
                    end
                end)
            end
            do
                for _, args in ipairs({{thread_id = "thread", limit = 0}}) do
                    test.it(route.name .. "/validation/" .. tostring(args.limit), function()
                        fixture.reset("", nil, nil); local result, err = route.call(args)
                        test.is_nil(result); test.not_nil(err); test.eq(err:kind(), errors.INVALID); test.eq(fixture.opens, 0)
                    end)
                end
            end
        end
    end)
end)}
