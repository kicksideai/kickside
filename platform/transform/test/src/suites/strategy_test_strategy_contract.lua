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








        test.it("resolves each strategy through its kickside.transform:strategy binding and declared replay safety", function()
            local expr, expr_err = strategies.resolve("expr")
            test.is_nil(expr_err)
            test.eq(expr.id, "kickside.transform:strategy_expr_binding")
            test.eq(expr.replay_safe, true)
            test.eq((strategies.resolve("llm")).replay_safe, false)
            test.eq((strategies.resolve("func")).replay_safe, false)
            local missing, missing_err = strategies.resolve("nope")
            test.is_nil(missing)
            test.not_nil(missing_err)
        end)

        test.it("applies a strategy declared only as a registry binding", function()
            local res, err = apply.apply({ strategy = "test_upper", config = {}, item = item({ text = "abc" }) })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value, "ABC")
            test.eq(res.replay_safe, true)
        end)

        test.it("each binding describes its own references and refuses an unenforceable configuration", function()
            local expr_refs, expr_err = strategies.describe("expr", { expr = "1" })
            test.is_nil(expr_err)
            test.eq(#expr_refs, 0)
            local llm_refs = strategies.describe("llm", { model = "class:smart", resources = { { resource_id = "res:kb" } } })
            test.eq(#llm_refs, 1)
            test.eq(llm_refs[1].resource_id, "res:kb")
            local func_refs = strategies.describe("func", { ["function"] = "x:y", resource_id = "res:1", required_mask = 2 })
            test.eq(func_refs[1].resource_id, "res:1")
            test.eq(func_refs[1].required_mask, 2)
            local _, func_err = strategies.describe("func", { ["function"] = "x:y" })
            test.not_nil(func_err)
            local _, tool_err = strategies.describe("code", { code = "return 1", tool_ids = { "tool:x" } })
            test.not_nil(tool_err)
        end)

        test.it("unknown strategy is a declaration error", function()
            local res, err = apply.apply({ strategy = "nope", config = {}, item = item({}) })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "unknown_strategy")
            test.eq(res.error.kind, "INVALID")
            test.eq(res.error.retriable, false)
        end)

        test.it("contract open failures are retryable infrastructure errors", function()
            local res, err = apply.apply({ strategy = "open_failure", config = {}, item = item({}) })
            test.is_nil(err)
            test.eq(res.error.code, "strategy_unavailable")
            test.eq(res.error.kind, "UNAVAILABLE")
            test.eq(res.error.retriable, true)
            test.eq(res.error.scope, "infrastructure")
        end)

        test.it("malformed apply request is a contract error", function()
            local res, err = apply.apply({ strategy = "none" })
            test.is_nil(res)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "transform_request_invalid")
            test.eq(err:details().field, "item")
        end)

        test.it("effectful strategies declare replay_safe false on their bindings", function()
            test.eq((strategies.resolve("none")).replay_safe, true)
            test.eq((strategies.resolve("expr")).replay_safe, true)
            test.eq((strategies.resolve("llm")).replay_safe, false)
            test.eq((strategies.resolve("func")).replay_safe, false)
            test.eq((strategies.resolve("code")).replay_safe, false)
        end)


        test.it("pure strategies describe no resource reference", function()
            local refs = strategy_none.describe({})
            test.eq(#refs, 0)
            refs = strategy_expr.describe({ expr = "input.x" })
            test.eq(#refs, 0)
        end)







        test.it("refuses an effectful strategy called without authorization, and runs a pure one without", function()
            for _, strategy in ipairs({ "func", "code", "llm" }) do
                local config = strategy == "func" and { ["function"] = FUNC_FIXTURE, resource_id = "res:fixture" }
                    or (strategy == "code" and { code = "return 1" } or { model = "class:fast" })
                local res, err = apply.apply({ strategy = strategy, config = config, item = item({ title = "x" }) })
                test.is_nil(err)
                test.eq(res.present, false, strategy)
                test.eq(res.error.code, "missing_authorization", strategy)
                test.eq(res.error.kind, "PERMISSION_DENIED", strategy)
                test.eq(res.error.retriable, false, strategy)
            end
            local pure = apply.apply({ strategy = "expr", config = { expr = "input.n" }, item = item({ n = 2 }) })
            test.eq(pure.value, 2)
        end)


















    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
