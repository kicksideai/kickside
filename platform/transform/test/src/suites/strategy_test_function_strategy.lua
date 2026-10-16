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





















        test.it("func rejects a non-single-bit required_mask", function()
            local refs, derr = strategy_func.describe({ resource_id = "res:owned", required_mask = 3 })
            test.is_nil(refs)
            test.ok(tostring(derr):find("required_mask", 1, true) ~= nil)
        end)


        test.it("func without target is a declaration error", function()
            local res, err = apply.apply({ strategy = "func", config = {}, item = item({}) })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "missing_function")
            test.eq(res.error.retriable, false)
        end)

        test.it("func returns the raw fixture value", function()
            local res, err = apply.apply({
                strategy = "func",
                config = { ["function"] = FUNC_FIXTURE, resource_id = "res:fixture", config = { content_type = "application/x-test" } },
                item = item({ title = "mapped" }),
                authorization = FIXTURE_GRANTS,
            })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value.content, "mapped")
            test.eq(res.replay_safe, false)
        end)

        test.it("func returns a raw scalar instead of failing", function()
            local res, err = apply.apply({
                strategy = "func",
                config = { ["function"] = FUNC_FIXTURE, resource_id = "res:fixture", config = { scalar = true } },
                item = item({}),
                authorization = FIXTURE_GRANTS,
            })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value, "scalar")
        end)

        test.it("func refuses an unenforceable configuration", function()
            local config = { ["function"] = FUNC_FIXTURE }
            local authorization = {
                operator_grants = grants_ok("res:other"),
                principal_grants = grants_ok("res:other"),
            }
            local res, err = apply.apply({
                strategy = "func",
                config = config,
                item = item({}),
                authorization = authorization,
            })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "forbidden_reference")
            test.eq(res.error.kind, "PERMISSION_DENIED")
            test.eq(res.error.retriable, false)
        end)

        test.it("func runs when both principals hold the resource", function()
            local res, err = apply.apply({
                strategy = "func",
                config = {
                    ["function"] = FUNC_FIXTURE,
                    resource_id = "res:owned",
                    required_mask = 1,
                    config = { content_type = "application/x-test" },
                },
                item = item({ title = "ok" }),
                authorization = {
                    operator_grants = { { resource_id = "res:owned", mask = 3 } },
                    principal_grants = { { resource_id = "res:owned", mask = 1 } },
                },
            })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value.content, "ok")
        end)

        test.it("func parks when the principal grant is missing", function()
            local res, err = apply.apply({
                strategy = "func",
                config = {
                    ["function"] = FUNC_FIXTURE,
                    resource_id = "res:owned",
                    required_mask = 1,
                },
                item = item({}),
                authorization = {
                    operator_grants = grants_ok("res:owned"),
                    principal_grants = {},
                },
            })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "forbidden_reference")
            test.eq(res.error.retriable, false)
            test.ok(tostring(res.error.message):find("principal", 1, true) ~= nil)
        end)












    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
