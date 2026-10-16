local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "append guard requires JSON proof"})) end
    return data
end
return {run = test.run_cases(function()
    test.describe("native append contract finalization", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"validate", "append", "release", "emit"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "append_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source, nil); local value, err = api.append_events(fixture.args())
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                        local committed = stage == "release" or stage == "emit"
                        if committed then test.is_false(err:retryable()); test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else test.eq(err:retryable(), source:retryable()); test.eq(encoded(err:details()), encoded(source:details())) end
                        test.eq(err:details().code, "append_dependency"); test.eq(err:details().nested.marker, "kept")
                        test.eq(fixture.appends, stage == "validate" and 0 or 1); test.eq(fixture.releases, 1); test.eq(fixture.emits, stage == "emit" and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"validate", "append"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. " and release/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "operation refuses", details = {code = "append_operation"}})
                        local secondary = errors.new({kind = kind, retryable = policy.retryable, message = "release refuses", details = {code = "append_release"}})
                        fixture.reset(stage, primary, secondary); local value, err = api.append_events(fixture.args())
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.is_false(err:retryable())
                        test.eq(err:details().code, "append_release"); test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                        test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(secondary)))
                        test.eq(fixture.releases, 1); test.eq(fixture.emits, 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"missing_release", "false_release"}) do
            test.it(stage, function()
                fixture.reset(stage, nil, nil); local value, err = api.append_events(fixture.args())
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.eq(fixture.releases, 1); test.eq(fixture.emits, 0)
            end)
        end
        for _, multi in ipairs({false, true}) do
            test.it("healthy/" .. tostring(multi), function()
                fixture.reset("", nil, nil); local args = fixture.args()
                local result, err = api.append_events(multi and {writes = {args}} or args)
                test.is_nil(err); local value = multi and result.writes[1] or result
                test.eq(value.thread_id, "thread"); test.eq(value.inserted, 1); test.eq(value.duplicates, 0); test.eq(value.max_seq, 1)
                test.eq(fixture.releases, 1); test.eq(fixture.emits, 1)
            end)
        end
    end)
end)}
