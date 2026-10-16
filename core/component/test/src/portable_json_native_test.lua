local test = require("test")
local binding = require("binding")
local fixture = require("fixture")
local json = require("json")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
return {run = test.run_cases(function()
    test.describe("native portable component export causes", function()
        for _, stage in ipairs({"read", "lookup", "encode"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "portable dependency refused",
                            details = {code = "portable_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local result = binding.handle({component_id = "component"})
                        test.is_false(result.success); test.eq(result.kind, source:kind()); test.eq(result.retryable, source:retryable())
                        test.eq(result.details.code, "portable_dependency"); test.eq(result.details.nested.marker, "kept")
                        test.eq(fixture.reads, 1); test.eq(fixture.lookups, stage == "read" and 0 or 1)
                        test.eq(fixture.encodes, stage == "encode" and 1 or 0)
                    end)
                end
            end
        end
        test.it("real native JSON encode failure retains its fields", function()
            local _, source = json.encode({[1] = true, marker = true})
            if type(source) ~= "userdata" then
                error(errors.new({kind = errors.INTERNAL, retryable = false, message = "JSON error probe requires a native error"}))
            end
            fixture.reset("encode", source); local result = binding.handle({component_id = "component"})
            test.is_false(result.success); test.eq(result.kind, source:kind()); test.eq(result.retryable, source:retryable())
            test.not_nil(result.details); test.eq(result.details.cause.kind, source:kind())
            test.eq(result.details.cause.retryable, source:retryable())
            local source_details = source:details()
            if source_details == nil then test.is_nil(result.details.cause.details)
            else
                local actual_json, actual_err = json.encode(result.details.cause.details)
                local expected_json, expected_err = json.encode(source_details)
                test.is_nil(actual_err); test.is_nil(expected_err); test.eq(actual_json, expected_json)
            end
        end)
        test.it("healthy export keeps its shell and portable slots", function()
            fixture.reset("", nil); local result = binding.handle({component_id = "component"})
            test.is_true(result.success); test.eq(result.component_id, "component"); test.eq(result.impl_id, "fixture:implementation")
            test.is_true(result.has_portable); test.eq(result.slots[1].name, "slot")
            local shell_json = result.shell
            if type(shell_json) ~= "string" then
                error(errors.new({kind = errors.INTERNAL, retryable = false, message = "export guard requires a JSON shell"}))
            end
            local shell, err = json.decode(shell_json); test.is_nil(err); test.eq(shell.private_context.marker, "kept")
            test.eq(fixture.user, "actor"); test.eq(fixture.mask, 16); test.eq(fixture.encodes, 1)
        end)
    end)
end)}
