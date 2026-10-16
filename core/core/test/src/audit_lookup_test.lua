local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "audit guard requires JSON proof"})) end
    return data
end
return {run = test.run_cases(function()
    test.describe("native lifecycle audit lookup outcomes", function()
        for _, stage in ipairs({"read", "list", "binding"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "audit_lookup_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local value, err = api.append_events(fixture.args())
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(encoded(err:details()), encoded(source:details())); test.eq(fixture.releases, 1); test.eq(fixture.appends, 0); test.eq(fixture.emits, 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"missing_rows", "scalar_rows", "scalar_row", "sparse_rows", "keyed_rows", "extra_rows",
            "missing_components", "scalar_components", "scalar_component", "sparse_components", "keyed_components", "extra_components", "missing_bindings", "scalar_bindings", "scalar_binding", "sparse_bindings", "keyed_bindings", "extra_bindings"}) do
            test.it(stage .. "/mandatory proof", function()
                fixture.reset(stage, nil); local value, err = api.append_events(fixture.args())
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.eq(fixture.releases, 1); test.eq(fixture.appends, 0); test.eq(fixture.emits, 0)
            end)
        end
        for _, stage in ipairs({"empty_components", "impl_mismatch", "class_mismatch", "empty_bindings"}) do
            test.it(stage .. "/canonical authority", function()
                fixture.reset(stage, nil); local value, err = api.append_events(fixture.args())
                test.is_nil(value); test.eq(err:kind(), errors.PERMISSION_DENIED); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.eq(fixture.releases, 1); test.eq(fixture.appends, 0); test.eq(fixture.emits, 0)
            end)
        end
        test.it("existing canonical lifecycle thread remains writable", function()
            fixture.reset("", nil); local value, err = api.append_events(fixture.args())
            test.is_nil(err); test.eq(value.thread_id, "thread"); test.eq(value.inserted, 1); test.eq(fixture.reads, 1); test.eq(fixture.lists, 1)
            test.eq(fixture.releases, 1); test.eq(fixture.appends, 1); test.eq(fixture.emits, 1)
        end)
    end)
end)}
