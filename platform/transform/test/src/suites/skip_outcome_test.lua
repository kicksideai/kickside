-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local apply = require("apply")
local sink_input = require("sink_input")
local generator = require("generator")

local function evaluate(output, absent)
    return apply.apply({ strategy = "func",
        config = { ["function"] = "kickside.transform:func_strategy_fixture", resource_id = "res:fixture",
            config = { output = output, absent = absent } },
        item = { item_key = "item", input = {} },
        authorization = {
            operator_grants = { { resource_id = "res:fixture", mask = 1 } },
            principal_grants = { { resource_id = "res:fixture", mask = 1 } },
        } })
end

local function define_tests()
    test.describe("explicit transform skip", function()
        test.it("validates explicit skips without requiring a sink record and preserves the preview reason", function()
            local ok, failures, outputs = generator.validate_transform(
                { kind = "expr", expr = '{"present": false, "skip": "no matching record"}' },
                { type = "object", required = { "title" } },
                { { item_key = "item", payload = {} } }, { input_shape = "record" })
            test.is_true(ok)
            test.eq(#failures, 0)
            test.eq(#outputs, 1)
            test.eq(outputs[1].present, false)
            test.eq(outputs[1].skip, "no matching record")
        end)

        test.it("accepts the skip contract from an independently bound strategy", function()
            local result, err = apply.apply({ strategy = "test_upper",
                config = { outcome = { present = false, skip = "strategy reason" } },
                item = { item_key = "item", input = {} } })
            test.is_nil(err)
            test.eq(result.present, false)
            test.eq(result.skip, "strategy reason")
            test.eq(result.replay_safe, true)
            test.is_nil(result.error)
            result = apply.apply({ strategy = "test_upper",
                config = { outcome = { present = true, value = {}, skip = "ambiguous" } },
                item = { item_key = "item", input = {} } })
            test.eq(result.error.kind, "INVALID")
            test.eq(result.error.retriable, false)
        end)

        test.it("returns an absent outcome with the function's skip reason", function()
            local result, err = evaluate({ present = false, skip = "no matching record" })
            test.is_nil(err)
            test.is_nil(result.error)
            test.eq(result.present, false)
            test.eq(result.skip, "no matching record")
            test.is_nil(result.value)
            test.eq(result.replay_safe, false)
        end)

        test.it("keeps nil without a skip as an absent value rejected by the sink", function()
            local result, err = evaluate(nil, true)
            test.is_nil(err)
            test.eq(result.present, false)
            test.is_nil(result.skip)
            local value, shape_err = sink_input.normalize(result.value, "record")
            test.is_nil(value)
            test.is_true(errors.is(shape_err, errors.INVALID))
            test.contains(tostring(shape_err), "produced no value")
        end)

        test.it("preserves raw records with skip fields and false scalar values", function()
            local result = evaluate({ skip = "record field", title = "record" })
            test.eq(result.present, true)
            test.eq(result.value.skip, "record field")
            test.eq(result.value.title, "record")
            test.is_nil(result.skip)
            result = evaluate(false)
            test.eq(result.present, true)
            test.eq(result.value, false)
        end)

        test.it("refuses empty or non-string reasons and skip outcomes carrying values", function()
            for _, output in ipairs({ { present = false, skip = "" }, { present = false, skip = "  " },
                { present = false, skip = true }, { present = false, skip = "reason", value = {} } }) do
                local result, err = evaluate(output)
                test.is_nil(err)
                test.eq(result.present, false)
                test.not_nil(result.error)
                test.eq(result.error.kind, "INVALID")
                test.eq(result.error.retriable, false)
                test.is_nil(result.skip)
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
