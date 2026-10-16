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














        test.it("llm builds its prompt with documented defaults", function()
            local prompt_text, model = strategy_llm.build_prompt({}, { payload = {} })
            test.ok(#prompt_text > 0)
            test.eq(model, "class:fast")
            local custom, custom_model = strategy_llm.build_prompt(
                { prompt = "Be brief.", model = "class:smart" },
                { payload = {} }
            )
            test.eq(custom, "Be brief.")
            test.eq(custom_model, "class:smart")
        end)


        test.it("llm declares only its configured ACL resources; the model is a catalog choice", function()
            local refs, derr = strategy_llm.describe({ model = "class:smart" })
            test.is_nil(derr)
            test.eq(#refs, 0)
            refs, derr = strategy_llm.describe({ model = "class:smart", resources = { { resource_id = "res:kb", required_mask = 1 } } })
            test.is_nil(derr)
            test.eq(#refs, 1)
            test.eq(refs[1].resource_id, "res:kb")
        end)

        test.it("llm runs on its selected model without a model grant", function()
            local calls = 0
            local seen_model: any = nil
            local real_generate = llm_module.generate
            llm_module.generate = function(prompt_input: any, options: any)
                calls = calls + 1
                seen_model = (options or {}).model
                return { result = "mapped text" }, nil
            end
            local value, message = strategy_llm.apply({ model = "class:smart" }, apply.build_env(item({ title = "hello" })), {
                operator_grants = {}, principal_grants = {},
            })
            llm_module.generate = real_generate
            test.is_nil(message)
            test.eq(calls, 1)
            test.eq(seen_model, "class:smart")
            test.eq(value, "mapped text")
        end)

        test.it("llm preserves the direct runtime prompt override over policy defaults", function()
            local system, model, err = strategy_llm.build_prompt({prompt = "Explicit prompt.",
                generation_policy = {prompts = {runtime = "Policy prompt."}}}, {})
            test.is_nil(err)
            test.eq(system, "Explicit prompt.")
            test.eq(model, "class:fast")
        end)

        test.it("llm rejects malformed generation options before an effect", function()
            local original = llm_module.generate
            local calls = 0
            llm_module.generate = function()
                calls = calls + 1
                return {result = "unexpected"}, nil
            end
            local results = {}
            for _, config in ipairs({{temperature = "0.1"}, {temperature = 0/0}, {max_tokens = -1},
                {max_tokens = 1.5}, {generation_policy = false}, {generation_policy = {model = false}},
                {generation_policy = {version = 2}}}) do
                local value, message, code = strategy_llm.apply(config, {}, {operator_grants = {}, principal_grants = {}})
                results[#results + 1] = {value = value, message = message, code = code}
            end
            llm_module.generate = original
            test.eq(calls, 0)
            for _, result in ipairs(results) do
                test.is_nil(result.value)
                test.not_nil(result.message)
                test.eq(result.code, "invalid_configuration")
            end
        end)

        test.it("llm parks when the operator grant is missing", function()
            local calls = 0
            local real_generate = llm_module.generate
            llm_module.generate = function(prompt_input: any, options: any)
                calls = calls + 1
                return { result = "must not run" }, nil
            end
            local res, err = apply.apply({
                strategy = "llm",
                config = { model = "class:smart", resources = { { resource_id = "res:kb" } } },
                item = item({}),
                authorization = {
                    operator_grants = {},
                    principal_grants = { { resource_id = "res:kb", mask = 1 } },
                },
            })
            llm_module.generate = real_generate
            test.is_nil(err)
            test.eq(calls, 0)
            test.eq(res.present, false)
            test.eq(res.error.code, "forbidden_reference")
            test.eq(res.error.kind, "PERMISSION_DENIED")
            test.eq(res.error.retriable, false)
            test.ok(tostring(res.error.message):find("operator", 1, true) ~= nil)
        end)

        test.it("llm parks when the principal grant is missing", function()
            local calls = 0
            local real_generate = llm_module.generate
            llm_module.generate = function(prompt_input: any, options: any)
                calls = calls + 1
                return { result = "must not run" }, nil
            end
            local res, err = apply.apply({
                strategy = "llm",
                config = { model = "class:smart", resources = { { resource_id = "res:kb" } } },
                item = item({}),
                authorization = {
                    operator_grants = { { resource_id = "res:kb", mask = 1 } },
                    principal_grants = {},
                },
            })
            llm_module.generate = real_generate
            test.is_nil(err)
            test.eq(calls, 0)
            test.eq(res.present, false)
            test.eq(res.error.code, "forbidden_reference")
            test.eq(res.error.kind, "PERMISSION_DENIED")
            test.eq(res.error.retriable, false)
            test.ok(tostring(res.error.message):find("principal", 1, true) ~= nil)
        end)

        test.it("llm refuses a tool outside the declared resources", function()
            local calls = 0
            local real_generate = llm_module.generate
            llm_module.generate = function(prompt_input: any, options: any)
                calls = calls + 1
                return { result = "must not run" }, nil
            end
            local res, err = apply.apply({
                strategy = "llm",
                config = { model = "class:fast", tool_ids = { "tool:mystery" } },
                item = item({}),
                authorization = { operator_grants = {}, principal_grants = {} },
            })
            llm_module.generate = real_generate
            test.is_nil(err)
            test.eq(calls, 0)
            test.eq(res.present, false)
            test.eq(res.error.code, "forbidden_reference")
            test.eq(res.error.retriable, false)
        end)




















    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
