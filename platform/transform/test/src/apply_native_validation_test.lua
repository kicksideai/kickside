local test = require("test")
local apply = require("apply")
local funcs = require("funcs")

local function define_tests()
    test.describe("native transform request validation", function()
        for _, case in ipairs({
            {request = false, field = "request"},
            {request = {}, field = "strategy"},
            {request = {strategy = 42}, field = "strategy"},
            {request = {strategy = ""}, field = "strategy"},
            {request = {strategy = "none", item = false}, field = "item"},
            {request = {strategy = "none", item = {}}, field = "item.item_key"},
            {request = {strategy = "none", item = {item_key = false}}, field = "item.item_key"},
            {request = {strategy = "none", item = {item_key = ""}}, field = "item.item_key"},
            {request = {strategy = "none", item = {item_key = "native-validation"}, config = false}, field = "config"},
        }) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("retains Invalid validation of " .. case.field .. " through " .. boundary, function()
                    local result, err
                    if boundary == "library" then
                        result, err = apply.apply(case.request)
                    else
                        result, err = funcs.call("app:native_apply_validation_probe", case.request)
                    end
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "transform_request_invalid")
                    test.eq(err:details().field, case.field)
                end)
            end
        end
        for _, boundary in ipairs({"library", "funcs"}) do
            test.it("retains optional config defaults and raw false input through " .. boundary, function()
                local request = {strategy = "none", item = {item_key = "native-validation", input = false}}
                local result, err
                if boundary == "library" then
                    result, err = apply.apply(request)
                else
                    result, err = funcs.call("app:native_apply_validation_probe", request)
                end
                test.is_nil(err)
                test.is_true(result.present)
                test.is_false(result.value)
                test.is_true(result.replay_safe)
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
