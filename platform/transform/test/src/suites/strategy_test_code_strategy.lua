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





























        test.it("sends configured code the canonical nested input and event envelope", function()
            local res, err = apply.apply({
                strategy = "code",
                config = { code = "return { value = __cx_args.input.value, event = __cx_args.envelope.event_type }" },
                item = item({ value = 42 }, "source-42"),
                authorization = FIXTURE_GRANTS,
            })
            test.is_nil(err)
            test.is_true(res.present)
            test.eq(res.value.value, 42)
            test.eq(res.value.event, "test.event")
        end)

        test.it("code returns the sandbox mapped table raw", function()
            local res, err = apply.apply({
                strategy = "code",
                config = { code = "return { content = __cx_args.input.title }" },
                item = item({ title = "Q3" }),
                authorization = FIXTURE_GRANTS,
            })
            test.is_nil(err)
            test.eq(res.present, true)
            test.eq(res.value.content, "Q3")
            test.eq(res.replay_safe, false)
        end)

        test.it("code maps nil to absent and surfaces executor failure retriable", function()
            local res, err = apply.apply({
                strategy = "code",
                config = { code = "return nil" },
                item = item({}),
                authorization = FIXTURE_GRANTS,
            })
            test.is_nil(err)
            test.eq(res.present, false)
            test.is_nil(res.error)

            res, err = apply.apply({
                strategy = "code",
                config = { code = "error('boom in sandbox')" },
                item = item({}),
                authorization = FIXTURE_GRANTS,
            })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "strategy_failed")
            test.eq(res.error.retriable, true)
        end)

        test.it("code refuses a tool outside the declared resources", function()
            local res, err = apply.apply({
                strategy = "code",
                config = { code = "return 1", tool_ids = { "tool:mystery" } },
                item = item({}),
                authorization = {
                    operator_grants = {},
                    principal_grants = {},
                },
            })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "forbidden_reference")
        end)

        test.it("code without code is a declaration error", function()
            local res, err = apply.apply({ strategy = "code", config = {}, item = item({}) })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "missing_code")
            test.eq(res.error.kind, "INVALID")
            test.eq(res.error.retriable, false)

            res, err = apply.apply({ strategy = "code", config = { code = "   " }, item = item({}) })
            test.is_nil(err)
            test.eq(res.present, false)
            test.eq(res.error.code, "missing_code")
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
