local test = require("test")
local llm_module = require("llm")
local apply = require("apply")
local strategy_none = require("strategy_none")
local strategy_expr = require("strategy_expr")
local strategy_llm = require("strategy_llm")
local strategy_func = require("strategy_func")
local strategy_code = require("strategy_code")
local strategy_reference = require("strategy_reference")
local strategies = require("strategies")

local FUNC_FIXTURE = "kickside.transform:func_strategy_fixture"

local function item(input, key)
    return {
        item_key = key or "k1",
        envelope = { event_type = "test.event" },
        input = input,
    }
end

local function grants_ok(resource)
    return { { resource_id = resource, mask = 3 } }
end

-- An authorization whose operator and principal hold the fixture resource.
local FIXTURE_GRANTS = { operator_grants = grants_ok("res:fixture"), principal_grants = grants_ok("res:fixture") }

local function define_tests()
    test.describe("transform strategies", function()
        test.it("none passes the input record through unchanged", function()
            local input = { title = "hello", n = 3 }
            local res, err = apply.apply({ strategy = "none", config = {}, item = item(input) })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value.title, "hello")
            test.eq(res.value.n, 3)
            test.eq(res.replay_safe, true)
            test.is_nil(res.error)
        end)

        test.it("none preserves an explicit false value", function()
            local res, err = apply.apply({ strategy = "none", config = {}, item = item(false) })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value, false)
        end)

        test.it("none maps a nil input to absent", function()
            local res, err = apply.apply({ strategy = "none", config = {}, item = item(nil) })
            test.is_nil(err)
            test.eq(res.present, false)
            test.is_nil(res.value)
        end)

        test.it("expr returns scalars raw, including false", function()
            local res, err = apply.apply({
                strategy = "expr",
                config = { expr = "input.flag" },
                item = item({ flag = false }),
            })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value, false)
            test.eq(res.replay_safe, true)
        end)

        test.it("expr maps nil to absent", function()
            local res, err = apply.apply({
                strategy = "expr",
                config = { expr = "input.missing" },
                item = item({}),
            })
            test.is_nil(err)
            test.eq(res.present, false)
        end)

        test.it("expr sees the single frozen environment", function()
            local res, err = apply.apply({
                strategy = "expr",
                config = { expr = "input.trigger_id + ':' + input.dedup_key" },
                item = {
                    item_key = "k1",
                    envelope = { event_type = "test.event" },
                    input = { trigger_id = "src", dedup_key = "d1" },
                },
            })
            test.is_nil(err)
            test.eq(res.value, "src:d1")
        end)

        test.it("expr maps the declared input body through payload", function()
            local res, err = apply.apply({
                strategy = "expr",
                config = { expr = "payload.title" },
                item = item({ title = "hi" }),
            })
            test.is_nil(err)
            test.eq(res.value, "hi")
        end)

        test.it("expr evaluation failure is deterministic", function()
            local res, err = apply.apply({
                strategy = "expr",
                config = { expr = "1 + " },
                item = item({}),
            })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "invalid_expression")
            test.eq(res.error.kind, "INVALID")
            test.eq(res.error.retriable, false)
        end)

































    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
