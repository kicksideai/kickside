local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "scope guard requires JSON proof"})) end
    return data
end
local function call(): (any, error?) return api.readable_threads({limit = 2, offset = 0}) end
return {run = test.run_cases(function()
    test.describe("native readable thread mapping boundaries", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"open", "read", "release"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "scope_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source, nil); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(encoded(err:details()), encoded(source:details())); test.eq(fixture.releases, stage == "open" and 0 or 1)
                    end)
                end
            end
        end
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("read and release/" .. kind .. "/" .. tostring(policy.retryable), function()
                    local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "read refuses", details = {code = "scope_read"}})
                    local secondary = errors.new({kind = kind, retryable = policy.retryable, message = "release refuses", details = {code = "scope_release", nested = {marker = "kept"}}})
                    fixture.reset("read", primary, secondary); local value, err = call()
                    test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.eq(err:retryable(), secondary:retryable())
                    test.eq(encoded(err:details().cause), encoded(error_envelope.encode(secondary)))
                    test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary))); test.eq(fixture.releases, 1)
                end)
            end
        end
        for _, stage in ipairs({"missing_open", "missing_rows", "invalid_rows", "sparse_rows", "invalid_row", "missing_id", "invalid_id", "empty_id", "missing_release", "false_release", "missing_page"}) do
            test.it(stage .. "/required proof", function()
                fixture.reset(stage, nil, nil); local value, err = call()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.eq(fixture.releases, (stage == "missing_open" or stage == "missing_page") and 0 or 1)
            end)
        end
        test.it("missing rows plus release failure preserves complete generated cause", function()
            local source = errors.new({kind = errors.TIMEOUT, retryable = true, message = "release refuses", details = {code = "scope_release"}})
            fixture.reset("missing_rows", nil, source); local value, err = call()
            test.is_nil(value); test.eq(err:kind(), errors.TIMEOUT); test.is_true(err:retryable()); test.eq(err:details().code, "scope_release")
            test.eq(err:details().operation_error.kind, errors.INTERNAL); test.is_false(err:details().operation_error.retryable); test.not_nil(err:details().operation_error.details.code)
        end)
        for _, stage in ipairs({"", "empty_components", "empty_mapping"}) do
            test.it(stage .. "/healthy mapped shape", function()
                fixture.reset(stage, nil, nil); local value, err = call()
                test.is_nil(err); test.eq(value.count, stage == "" and 2 or 0); test.is_false(value.has_more)
                test.eq(value.next_offset, stage == "empty_components" and 0 or 1)
                test.eq(fixture.releases, stage == "empty_components" and 0 or 1)
                if stage == "" then test.eq(encoded(value.thread_ids), '["a","b"]') end
            end)
        end
    end)
end)}
