-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local generator = require("generator")
local gen_flow = require("gen_flow")
local gen_nodes = require("gen_nodes")

local function define_tests()
    test.describe("Transform explicit generation", function()
        test.it("rejects missing real samples before starting a flow", function()
            local result, err = gen_flow.generate_transform({source_schema = {}, sink_schema = {}, input_shape = "record"})
            test.is_nil(result)
            test.not_nil(err)
            test.contains(tostring(err), "samples")
        end)
        test.it("defaults to expression and reserves analysis for explicit auto", function()
            test.eq(gen_flow.resolve_strategy(nil), "expression")
            test.eq(gen_flow.resolve_strategy("auto"), "auto")
            local calls = 0
            local prompt = {new = function() return {add_system = function() end, add_user = function() end} end}
            local nodes = gen_nodes.new({snippet = {}, prompt = prompt, llm = {generate = function() calls = calls + 1; error("unexpected model call") end}})
            local result = nodes.analyze({source_schema = {}, sink_schema = {}})
            test.eq(result.strategy, "expression")
            test.eq(calls, 0)
        end)
        test.it("does not reuse a snippet from a different explicit strategy", function()
            local nodes = gen_nodes.new({snippet = {search_snippet = function() return {id = "stored", strategy = "llm", artifact = {prompt = "semantic"}}, nil end}, prompt = {}, llm = {}})
            local result = nodes.snippet_search({strategy = "expression", source_schema = {}, sink_schema = {}, samples = {{payload = {title = "real"}}}, input_shape = "record"})
            test.is_false(result.done)
            test.is_nil(result.artifact)
        end)
        test.it("explicit auto preserves a failed strategy judgment", function()
            local prompt = {new = function() return {add_system = function() end, add_user = function() end} end}
            local nodes = gen_nodes.new({snippet = {}, prompt = prompt, llm = {generate = function() return nil, "judge unavailable" end}})
            local ok, err = pcall(nodes.analyze, {strategy = "auto", source_schema = {}, sink_schema = {}})
            test.is_false(ok)
            test.contains(tostring(err), "judge unavailable")
        end)
        test.it("does not fabricate a sample inside the generation node", function()
            local calls = 0
            local prompt = {new = function() return {add_system = function() end, add_user = function() end} end}
            local nodes = gen_nodes.new({snippet = {}, prompt = prompt, llm = {generate = function() calls = calls + 1; return {result = "{}"}, nil end}})
            local ok, err = pcall(nodes.iterate, {strategy = "expression", source_schema = {}, sink_schema = {}, input_shape = "record", max_attempts = 1})
            test.is_false(ok)
            test.contains(tostring(err), "sample")
            test.eq(calls, 0)
        end)
        for _, strategy in ipairs({"expression", "llm", "code"}) do
            test.it("preserves generation provider errors for " .. strategy, function()
                local prompt = {new = function() return {add_system = function() end, add_user = function() end} end}
                local nodes = gen_nodes.new({snippet = {}, prompt = prompt, llm = {generate = function() return nil, "generation provider unavailable" end}})
                local ok, err = pcall(nodes.iterate, {strategy = strategy, samples = {{payload = {title = "real"}}}, source_schema = {}, sink_schema = {}, input_shape = "record", max_attempts = 1})
                test.is_false(ok)
                test.contains(tostring(err), "generation provider unavailable")
            end)
        end
        test.it("expression exhaustion remains a failed expression with no LLM attempt", function()
            local calls = 0
            local result = generator.advance({strategy = "expression", attempt = 2, max_attempts = 3,
                allow_llm_fallback = true, samples = {{payload = {title = "real data"}}}, input_shape = "record",
                sink_schema = {type = "object"}, generate_fn = function() calls = calls + 1; return "bad" end,
                apply_fn = function() return nil, "expression fails" end})
            test.eq(calls, 1)
            test.eq(result.strategy, "expression")
            test.is_false(result.continue)
            test.is_false(result.validated)
            test.is_nil(result.artifact)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(o) return run_cases(o) end}
