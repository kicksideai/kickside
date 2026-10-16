local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "ingest guard requires JSON proof"})) end
    return data
end
local function call(): (any, error?)
    return api.ingest_multi(fixture.database(), {{thread_id = "thread", events = {{type = "guard"}}}}, nil, true)
end
return {run = test.run_cases(function()
    test.describe("native event ingest transaction outcomes", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"begin", "lock", "append", "wake", "commit", "notify", "nudge"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                            details = {code = "ingest_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source, nil); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                        local committed = stage == "commit" or stage == "notify" or stage == "nudge"
                        if committed then test.is_false(err:retryable()) else test.eq(err:retryable(), source:retryable()) end
                        test.eq(err:details().code, source:details().code); test.eq(err:details().nested.marker, "kept")
                        if committed then test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else test.eq(encoded(err:details()), encoded(source:details())) end
                        test.eq(fixture.commits, committed and 1 or 0)
                        test.eq(fixture.rollbacks, (stage == "lock" or stage == "append" or stage == "wake") and 1 or 0)
                        test.eq(fixture.notifies, (stage == "notify" or stage == "nudge") and 1 or 0)
                        test.eq(fixture.nudges, stage == "nudge" and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"lock", "append", "wake"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. " and rollback/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "operation refuses", details = {code = "ingest_primary"}})
                        local secondary = errors.new({kind = kind, retryable = policy.retryable, message = "rollback refuses", details = {code = "ingest_rollback", nested = {marker = "kept"}}})
                        fixture.reset(stage, primary, secondary); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.is_false(err:retryable())
                        test.eq(err:details().code, "ingest_rollback")
                        test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                        test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(secondary)))
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0); test.eq(fixture.notifies, 0); test.eq(fixture.nudges, 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"missing_begin", "invalid_begin", "missing_commit", "invalid_commit", "missing_append", "invalid_append", "missing_wake", "invalid_wake", "missing_notify", "invalid_notify", "missing_nudge", "invalid_nudge"}) do
            test.it(stage .. "/mandatory proof", function()
                fixture.reset(stage, nil, nil); local value, err = call()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
            end)
        end
        for _, stage in ipairs({"missing_rollback", "false_rollback"}) do
            test.it(stage .. "/retains operation cause", function()
                local primary = errors.new({kind = errors.INVALID, retryable = false, message = "operation refuses", details = {code = "ingest_primary"}})
                fixture.reset(stage, primary, nil); local value, err = call()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.eq(err:details().operation_error.kind, primary:kind()); test.eq(err:details().operation_error.details.code, "ingest_primary")
                test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
            end)
        end
        for _, stage in ipairs({"", "idle", "absent_sweeper"}) do
            test.it(stage .. "/healthy shape", function()
                fixture.reset(stage, nil, nil); local value, err = call()
                test.is_nil(err); test.eq(value[1].marker, "kept"); test.eq(value[1].inserted, 1)
                test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0); test.eq(fixture.notifies, 1); test.eq(fixture.nudges, stage == "idle" and 0 or 1)
            end)
        end
    end)
end)}
