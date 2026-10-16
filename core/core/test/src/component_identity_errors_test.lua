local test = require("test")
local fixture = require("fixture")
local identity = require("identity")
local common = require("common")
local canonical_json = require("canonical_json")
local execution = require("execution")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "identity guard requires JSON proof"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("native component execution identity failures", function()
        for _, route in ipairs({{name = "stored", call = identity.execution_identity_of}, {name = "declared", call = common.declared_identity}}) do
            for _, stage in ipairs({"read", "validate", "validate_success_error", "row"}) do
                if route.name == "declared" or stage ~= "row" then
                    for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                        errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            test.it(route.name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "identity_dependency", nested = {marker = "kept"}}})
                                fixture.reset(stage, source); local value, err = route.call("component")
                                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                                test.eq(encoded(err:details()), encoded(source:details()))
                                test.eq(fixture.validations, stage == "read" and 0 or 1); test.eq(fixture.rows, stage == "row" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            for _, stage in ipairs({"missing_context", "scalar_context", "missing_validation", "missing_row", "scalar_row"}) do
                if route.name == "declared" or (stage ~= "missing_row" and stage ~= "scalar_row") then
                    test.it(route.name .. "/" .. stage, function()
                        fixture.reset(stage, nil); local value, err = route.call("component")
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                    end)
                end
            end
            test.it(route.name .. "/healthy", function()
                fixture.reset("", nil); local value, err = route.call("component")
                test.is_nil(err); test.not_nil(value)
                test.eq(route.name == "stored" and value.marker or value.row.marker, "kept")
            end)
            test.it(route.name .. "/absent stored identity", function()
                fixture.reset("absent", nil); local value, err = route.call("component")
                test.is_nil(err); test.eq(fixture.validations, 0); test.eq(fixture.rows, 0)
                if route.name == "stored" then test.is_nil(value) else test.is_true(value.system) end
            end)
        end
        test.it("real identity validator returns native declaration errors", function()
            local ok, err = execution.validate({version = 1})
            test.is_false(ok); test.not_nil(err); test.is_true(errors.is(err, errors.INVALID)); test.is_false(err:retryable())
            test.eq(err:details().code, "declaration")
        end)
    end)
end)}
