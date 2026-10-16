local test = require("test")
local declaration = require("declaration")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
return {run = test.run_cases(function()
    test.describe("native declaration serialization", function()
        for _, route in ipairs({"declaration", "creation"}) do
            local stages = route == "declaration" and {"receipt_encode", "receipt_decode"}
                or {"receipt_encode", "receipt_decode", "creation_encode", "creation_decode"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detail in ipairs({false, true}) do
                            test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detail), function()
                                local source = errors.new({kind = kind, retryable = options.retryable, message = "declaration codec refuses",
                                    details = detail and {code = "declaration_codec_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(stage, source)
                                local ok, result, err
                                if route == "declaration" then ok, result, err = pcall(declaration.prepare_declaration, fixture.input(), fixture.verify)
                                else ok, result, err = pcall(declaration.prepare_creation, fixture.input(), fixture.verify) end
                                test.is_true(ok); test.is_nil(result); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind())
                                test.eq(err:retryable(), source:retryable())
                                if detail then test.eq(err:details().code, "declaration_codec_dependency"); test.eq(err:details().nested.marker, "kept")
                                else test.is_nil(err:details()) end
                                local count = stage == "creation_encode" or stage == "creation_decode"
                                test.eq(fixture.encodes, count and 2 or 1)
                                test.eq(fixture.decodes, stage == "receipt_encode" and 0 or stage == "creation_decode" and 2 or 1)
                            end)
                        end
                    end
                end
            end
        end
        test.it("healthy declaration freezes the validated command", function()
            fixture.reset("", nil); local token, err = declaration.prepare_declaration(fixture.input(), fixture.verify)
            test.is_nil(err); test.eq(type(token), "table"); test.eq(fixture.encodes, 1); test.eq(fixture.decodes, 1)
        end)
        test.it("healthy creation retains input and one-use receipt", function()
            fixture.reset("", nil); local input = fixture.input(); local token, err = declaration.prepare_creation(input, fixture.verify)
            test.is_nil(err); test.eq(type(token), "table"); input.context.setting = false
            local created, take_err = declaration.take_creation(token); test.is_nil(take_err); test.is_true(created.input.context.setting)
            test.eq(created.input.meta.title, "kept"); test.is_true(created.input.rollback.step); test.eq(created.receipt.operator_id, "user-1")
            local absent, repeat_err = declaration.take_creation(token); test.is_nil(absent); test.is_true(errors.is(repeat_err, errors.PERMISSION_DENIED))
        end)
    end)
end)}
