local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "update guard requires JSON proof"})) end
    return data
end
local function call(): (any, error?) return api.update(fixture.database(), "thread", fixture.params(), nil) end
return {run = test.run_cases(function()
    test.describe("native thread update transaction outcomes", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"begin", "lock", "capture", "commit", "read"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "update_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source, nil); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                        local committed = stage == "commit" or stage == "read"
                        if committed then test.is_false(err:retryable()) else test.eq(err:retryable(), source:retryable()) end
                        test.eq(err:details().code, source:details().code); test.eq(err:details().nested.marker, "kept")
                        if committed then test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else test.eq(encoded(err:details()), encoded(source:details())) end
                        test.eq(fixture.writes, committed and 1 or 0); test.eq(fixture.commits, committed and 1 or 0)
                        test.eq(fixture.rollbacks, (stage == "lock" or stage == "capture") and 1 or 0)
                        test.eq(fixture.reads, stage == "read" and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"lock", "capture"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. " and rollback/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "capture refuses", details = {code = "update_capture"}})
                        local secondary = errors.new({kind = kind, retryable = policy.retryable, message = "rollback refuses", details = {code = "update_rollback"}})
                        fixture.reset(stage, primary, secondary); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.is_false(err:retryable())
                        test.eq(err:details().code, "update_rollback")
                        test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                        test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(secondary)))
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.writes, 0); test.eq(fixture.commits, 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"missing_begin", "invalid_begin", "missing_commit", "missing_rows", "invalid_rows", "invalid_row", "sparse_rows", "multiple_rows", "missing_rollback", "false_rollback"}) do
            test.it(stage .. "/mandatory proof", function()
                local primary = errors.new({kind = errors.INVALID, retryable = false, message = "capture refuses", details = {code = "update_capture"}})
                fixture.reset(stage, primary, nil); local value, err = call()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                if stage == "missing_rollback" or stage == "false_rollback" then test.eq(err:details().operation_error.details.code, "update_capture") end
            end)
        end
        test.it("healthy patched row remains unchanged", function()
            fixture.reset("", nil, nil); local value, err = call()
            test.is_nil(err); test.eq(value.id, "thread"); test.eq(value.marker, "kept"); test.eq(fixture.writes, 1); test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0)
        end)
        test.it("post-commit missing row stays permanent NotFound", function()
            fixture.reset("empty_rows", nil, nil); local value, err = call()
            test.is_nil(value); test.eq(err:kind(), errors.NOT_FOUND); test.is_false(err:retryable()); test.eq(fixture.writes, 1); test.eq(fixture.commits, 1)
        end)
    end)
end)}
