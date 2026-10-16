-- Ask synthesis must produce its free-form answer through a plain generation,
-- not strict structured output: several OpenAI-compatible endpoints ignore
-- response_format json_schema and return empty content, which surfaced as blank
-- answers. These cases pin the generation path (and its guards) by injecting a
-- fake llm seam, so the regression cannot return.
local test = require("test")
local kb_answer = require("kb_answer")

local function with_llm(fake: any, fn: any)
    local prev = kb_answer._llm
    kb_answer._llm = fake
    local ok, err = pcall(fn)
    kb_answer._llm = prev
    if not ok then error(err) end
end

local function items(n: number): any
    local out = {}
    for i = 1, n do out[i] = { content = "passage " .. tostring(i) } end
    return out
end

local function define_tests()
    test.describe("kb_answer.synthesize", function()
        test.it("instructs synthesis to cite the numbered passages", function()
            with_llm({ generate = function(prompt)
                test.is_true(prompt:find("[1]", 1, true) ~= nil)
                test.is_true(prompt:find("Cite", 1, true) ~= nil)
                test.is_true(prompt:find("[1][2]", 1, true) ~= nil)
                test.is_true(prompt:find("never combine", 1, true) ~= nil)
                return { result = "The marker is NW-AI-731 [1]." }, nil
            end }, function()
                test.eq(kb_answer._synthesize("marker?", items(1), "model", nil), "The marker is NW-AI-731 [1].")
            end)
        end)
        test.it("returns the generated prose answer via llm.generate", function()
            local seen_prompt: any = nil
            with_llm({
                generate = function(prompt: any, opts: any): (any, any)
                    seen_prompt = prompt
                    test.eq(opts.model, "test-model")
                    test.eq(opts.max_tokens, 1024)
                    test.eq(opts.timeout, 30)
                    return { result = "The launch code is ZEPHYR-9." }, nil
                end,
            }, function()
                local answer = kb_answer._synthesize("launch code?", items(2), "test-model", nil)
                test.eq(answer, "The launch code is ZEPHYR-9.")
                test.is_true((seen_prompt :: string):find("passage 1", 1, true) ~= nil, "passages included in prompt")
            end)
        end)

        test.it("does not call strict structured output", function()
            with_llm({
                generate = function(): (any, any) return { result = "ok" }, nil end,
                structured_output = function(): (any, any)
                    error("synthesize must not use strict structured output")
                end,
            }, function()
                test.eq((kb_answer._synthesize("q", items(1), "m", nil)), "ok")
            end)
        end)

        test.it("unwraps a provider returning result as a content table", function()
            with_llm({
                generate = function(): (any, any) return { result = { content = "Answer text." } }, nil end,
            }, function()
                test.eq((kb_answer._synthesize("q", items(1), "m", nil)), "Answer text.")
            end)
        end)

        test.it("returns nil when the model produces empty content", function()
            with_llm({
                generate = function(): (any, any) return { result = "" }, nil end,
            }, function()
                local value, err = kb_answer._synthesize("q", items(1), "m", nil)
                test.is_nil(value)
                test.not_nil(err)
            end)
        end)

        test.it("returns nil on a generation error without dereferencing the response", function()
            with_llm({
                generate = function(): (any, any) return nil, "model overloaded" end,
            }, function()
                local value, err = kb_answer._synthesize("q", items(1), "m", nil)
                test.is_nil(value)
                test.not_nil(err)
            end)
        end)

        test.it("classifies a generation failure and keeps its cause", function()
            for _, row in ipairs({ { errors.NOT_FOUND, errors.UNAVAILABLE }, { errors.TIMEOUT, errors.TIMEOUT }, { errors.RATE_LIMITED, errors.RATE_LIMITED } }) do
                with_llm({
                    generate = function(): (any, any) return nil, errors.new({ kind = row[1], message = "provider refused" }) end,
                }, function()
                    local value, err = kb_answer._synthesize("q", items(1), "m", nil)
                    test.is_nil(value)
                    test.is_true(errors.is(err, row[2]), row[1] .. ": " .. tostring(err))
                    test.contains(tostring(err), "answer generation failed")
                    test.contains(tostring(err), "provider refused")
                end)
            end
        end)

        test.it("types an empty generation as an internal error", function()
            with_llm({
                generate = function(): (any, any) return { result = "" }, nil end,
            }, function()
                local _, err = kb_answer._synthesize("q", items(1), "m", nil)
                test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
            end)
        end)

        test.it("returns nil without a model or passages (passages-only mode)", function()
            with_llm({
                generate = function(): (any, any) error("must not call the model without a model/passages") end,
            }, function()
                test.is_nil((kb_answer._synthesize("q", items(1), "", nil)))
                test.is_nil((kb_answer._synthesize("q", {}, "m", nil)))
            end)
        end)

        test.it("appends extra instructions to the prompt", function()
            local seen: any = nil
            with_llm({
                generate = function(prompt: any): (any, any) seen = prompt; return { result = "ok" }, nil end,
            }, function()
                kb_answer._synthesize("q", items(1), "m", "Respond as the KB itself.")
                test.is_true((seen :: string):find("Respond as the KB itself.", 1, true) ~= nil, "extra prompt included")
            end)
        end)
    end)

    test.describe("kb_answer query mode", function()
        test.it("keeps summarization independent of the answer model", function()
            test.is_nil(kb_answer._resolve_answer_model({ summary_model = "class:fast" }))
        end)

        test.it("treats explicit false as passages-only despite a summary model", function()
            test.is_nil(kb_answer._resolve_answer_model({
                analysis_model = false,
                summary_model = "class:fast"
            }))
        end)

        test.it("propagates config failure before querying", function()
            local previous = kb_answer._kb_search
            kb_answer._kb_search = {
                config = function() return nil, nil, "config unavailable" end,
                query = function() error("must not query after config failure") end,
            }
            local ok, value, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
            kb_answer._kb_search = previous
            if not ok then error(value) end
            test.is_nil(value)
            test.eq(err, "config unavailable")
        end)

        test.it("propagates an agentic failure without invoking another driver", function()
            local previous_search = kb_answer._kb_search
            local previous_funcs = kb_answer._funcs
            local previous_llm = kb_answer._llm
            kb_answer._kb_search = {
                config = function() return { analysis_model = "model", query_driver = "agentic" }, {} end,
                query = function() return { items = items(1) }, nil end,
            }
            kb_answer._funcs = { call = function() return nil, errors.new({ kind = errors.NOT_FOUND, message = "agent model is not registered" }) end }
            kb_answer._llm = { generate = function() error("must not invoke another answer driver") end }
            local ok, value, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
            kb_answer._kb_search = previous_search
            kb_answer._funcs = previous_funcs
            kb_answer._llm = previous_llm
            if not ok then error(value) end
            test.is_nil(value)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.contains(tostring(err), "agentic answer failed")
            test.contains(tostring(err), "agent model is not registered")
        end)

        test.it("does not invoke agentic or synthesis generation in passages-only mode", function()
            local prev_search = kb_answer._kb_search
            local prev_funcs = kb_answer._funcs
            local prev_llm = kb_answer._llm
            kb_answer._kb_search = {
                config = function(): (any, any)
                    return {
                        analysis_model = false,
                        summary_model = "class:fast",
                        query_driver = "agentic"
                    }, { is_graph = true }
                end,
                query = function(): (any, any)
                    return { items = { { id = "one", content = "grounded passage" } } }, nil
                end,
            }
            kb_answer._funcs = {
                call = function(): (any, any) error("passages-only mode must not invoke the agentic driver") end,
            }
            kb_answer._llm = {
                generate = function(): (any, any) error("passages-only mode must not invoke synthesis") end,
            }

            local ok, result, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
            kb_answer._kb_search = prev_search
            kb_answer._funcs = prev_funcs
            kb_answer._llm = prev_llm
            if not ok then error(result) end

            test.is_nil(err)
            test.is_nil(result.answer)
            test.eq(result.count, 1)
            test.eq(result.results[1].content, "grounded passage")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
