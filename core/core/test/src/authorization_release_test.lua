local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local sql = require("sql")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "authorization release guard requires JSON proof"})) end
    return result
end
local function call(): (any, error?)
    return api.authorize_primary_emit({component_id = fixture.ID, event = {type = "guard:event", body = {marker = "kept"}}})
end
return {run = test.run_cases(function()
    test.describe("native primary-event authorization read cleanup", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, stage in ipairs({"read", "release", "both"}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "authorization_dependency", nested = {marker = "kept"}}})
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "read refuses", details = {code = "authorization_read", nested = {marker = "primary"}}})
                        fixture.reset((stage == "read" or stage == "both") and "read" or "", stage == "both" and primary or stage == "read" and source or nil, stage ~= "read" and source or nil)
                        local value, err = call(); test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        if stage == "both" then
                            test.eq(err:details().code, source:details().code); test.eq(err:details().nested.marker, "kept")
                            test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                            test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else test.eq(encoded(err:details()), encoded(source:details())) end
                        test.eq(fixture.opens, 1); test.eq(fixture.reads, 1); test.eq(fixture.releases, 1)
                    end)
                end
            end
        end
        for _, stage in ipairs({"missing_rows", "scalar_rows", "scalar_row", "sparse_rows", "missing_release"}) do
            test.it(stage .. "/mandatory reply proof", function()
                fixture.reset(stage, nil, nil); local value, err = call()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.eq(fixture.releases, 1)
            end)
        end
        test.it("missing rows and cleanup failure keep both causes", function()
            local secondary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "release refuses", details = {code = "authorization_release"}})
            fixture.reset("missing_rows", nil, secondary); local value, err = call()
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.is_true(err:retryable())
            test.eq(err:details().code, "authorization_release"); test.eq(err:details().operation_error.kind, errors.INTERNAL)
            test.is_false(err:details().operation_error.retryable); test.not_nil(err:details().operation_error.details.code)
            test.eq(encoded(err:details().cause), encoded(error_envelope.encode(secondary)))
        end)
        for _, stage in ipairs({"", "empty_rows"}) do
            test.it("healthy authorized first-touch retains shape/" .. stage, function()
                fixture.reset(stage, nil, nil); local value, err = call(); test.is_nil(err)
                test.eq(encoded(value), encoded({output = true, impl_id = "guard:component", maintenance = false, component_id = fixture.ID}))
                test.eq(fixture.releases, 1)
            end)
        end
        test.it("real pooled release carries explicit success proof", function()
            local db, err = sql.get("app:db")
            if err then error(err) end
            if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "release probe requires a database"})) end
            local released, release_err = db:release()
            if release_err then error(release_err) end
            test.is_true(released)
        end)
    end)
end)}
