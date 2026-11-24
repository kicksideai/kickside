-- Ask synthesis must produce its free-form answer through a plain generation,
-- not strict structured output: several OpenAI-compatible endpoints ignore
-- response_format json_schema and return empty content, which surfaced as blank
-- answers. These cases pin the generation path (and its guards) by injecting a
-- fake llm seam, so the regression cannot return.
local test = require("test")
local kb_answer = require("kb_answer")
local analysis_model = require("analysis_model")
local funcs = require("funcs")
local security = require("security")

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

local function with_default_model(fn: any)
    local models = require("models_repo")
    local name = "ask-answer-model"
    local _, create_err = models.upsert_card({ name = name, class = { "fast" },
        capabilities = { "generate" }, max_tokens = 4096, output_tokens = 1024 })
    test.is_nil(create_err, tostring(create_err))
    local ok, err = pcall(fn)
    local _, delete_err = models.delete_card(name)
    test.is_nil(delete_err, tostring(delete_err))
    if not ok then error(err) end
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

        test.it("types empty or whitespace-only generation as an internal error", function()
            for _, output in ipairs({ "", " \n\t " }) do
                with_llm({
                    generate = function(): (any, any) return { result = output }, nil end,
                }, function()
                    local value, err = kb_answer._synthesize("q", items(1), "m", nil)
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                    test.contains(tostring(err), "answer generation returned empty content")
                end)
            end
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

        test.it("leads each passage with its file and page from the chunk metadata", function()
            local seen: any = nil
            with_llm({
                generate = function(prompt: any): (any, any) seen = prompt; return { result = "ok" }, nil end,
            }, function()
                kb_answer._synthesize("q", {
                    { content = "Wampanoag homesites", meta = { metadata = { filename = "Guide.pdf", page_start = 47, page_end = 47 } } },
                    { content = "plain passage" },
                }, "m", nil)
                local prompt = seen :: string
                test.is_true(prompt:find("[1] (Guide.pdf, p. 47) Wampanoag homesites", 1, true) ~= nil, prompt)
                test.is_true(prompt:find("[2] plain passage", 1, true) ~= nil, prompt)
                test.is_true(prompt:find("p. 47) [1]", 1, true) ~= nil, "prompt asks for the page with the citation")
            end)
        end)
    end)

    test.describe("kb_answer.source_label", function()
        test.it("names the file and the page or slide range a chunk covers", function()
            test.eq(kb_answer.source_label({ metadata = { filename = "a.pdf", page_start = 3, page_end = 3 } }), "a.pdf, p. 3")
            test.eq(kb_answer.source_label({ metadata = { filename = "a.pdf", page_start = 3, page_end = 4 } }), "a.pdf, pp. 3-4")
            test.eq(kb_answer.source_label({ meta = { metadata = { original_filename = "Deck.pptx", filename = "x", slide_start = 2, slide_end = 5 } } }), "Deck.pptx, slides 2-5")
            test.eq(kb_answer.source_label({ metadata = { page_start = 9 } }), "p. 9")
            test.eq(kb_answer.source_label({ metadata = { title = "Notes" } }), "Notes")
            test.is_nil(kb_answer.source_label({ content = "no metadata" }))
            test.is_nil(kb_answer.source_label({ metadata = { filename = " " } }))
        end)
    end)

    test.describe("kb_answer query mode", function()
        test.it("reports no answer for an empty search without calling single-shot synthesis", function()
            for _, case in ipairs({
                { model = "configured-model" },
                { model = false, reason = "Answers are disabled." },
                { model = "class:fast", reason = "No answer model is available." },
            }) do
                local previous = kb_answer._kb_search
                kb_answer._kb_search = {
                    config = function() return { analysis_model = case.model }, {} end,
                    query = function() return { items = {}, retrieval = { analysis = {
                        status = "unavailable", reason = "no_models_for_class", model = "class:fast",
                    } } }, nil end,
                }
                with_llm({ generate = function() error("must not invoke synthesis without sources") end }, function()
                    local ok, result, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
                    kb_answer._kb_search = previous
                    if not ok then error(result) end
                    test.is_nil(err)
                    test.eq(result.count, 0)
                    test.eq(#result.results, 0)
                    local notice = "No answer found. No source passages matched the question."
                    test.eq(result.mode, case.reason and "query" or nil)
                    test.eq(result.answer, case.reason and case.reason .. " " .. notice or notice)
                end)
            end
        end)

        test.it("resolves the default model in a member scope without catalog permissions", function()
            local scope = assert(security.new_scope({
                assert(security.policy("kickside.knowledge.retrieval:member_ask_call")),
                assert(security.policy("kickside.knowledge.retrieval:member_model_binding")),
                assert(security.policy("kickside.models.security:model_resolution")),
                assert(security.policy("kickside.models.security:model_resolution_call")),
            }))
            local actor = security.new_actor("ask-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.models.catalog:model_catalog"), "undefined")
            test.eq(scope:evaluate(actor, "store.get", "kickside.models:cache"), "undefined")
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.models.persist:reload_profiles"), "undefined")
            test.eq(scope:evaluate(actor, "funcs.security", "kickside.models.persist:reload_profiles"), "undefined")
            with_default_model(function()
                local result, err = funcs.new():with_actor(actor):with_scope(scope)
                    :call("kickside.knowledge.retrieval:member_ask_probe", {})
                test.is_nil(err, tostring(err))
                test.eq(result.answer, "cited answer [1]")
                test.is_nil(result.mode)
                test.eq(result.results[1].content, "passage 1")
            end)
        end)

        test.it("reports an unavailable analysis class even without passages for either answer driver", function()
            for _, driver in ipairs({ "single", "agentic" }) do
                for _, passages in ipairs({ {}, items(1) }) do
                    local previous = kb_answer._kb_search
                    kb_answer._kb_search = {
                        config = function() return { analysis_model = "class:unassigned", query_driver = driver }, {} end,
                        query = function() return { items = passages, retrieval = { strategy = "plain", analysis = {
                            status = "unavailable", reason = "no_models_for_class", model = "class:unassigned",
                        } } }, nil end,
                    }
                    local ok, value, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
                    kb_answer._kb_search = previous
                    if not ok then error(value) end
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
                    test.contains(tostring(err), "No models found for class: unassigned")
                    local retrieval = err:details().retrieval
                    test.eq(retrieval.strategy, "plain")
                    test.eq(retrieval.analysis.status, "unavailable")
                    test.eq(retrieval.analysis.reason, "no_models_for_class")
                    test.eq(retrieval.analysis.model, "class:unassigned")
                end
            end
        end)

        test.it("answers with the selected model or Fast unless answers are off", function()
            with_default_model(function()
                for _, case in ipairs({
                    { expected = "class:fast" },
                    { setting = "", expected = "class:fast" },
                    { setting = false, notice = "Answers are disabled. Returning query results." },
                    { setting = true, notice = "No answer model is available. Returning query results." },
                    { setting = "configured-model", expected = "configured-model" },
                }) do
                    local config = { analysis_model = case.setting, summary_model = "summary-only" }
                    for _, driver in ipairs({ "single", "agentic" }) do
                        config.query_driver = driver
                        local previous_search = kb_answer._kb_search
                        local previous_funcs = kb_answer._funcs
                        local previous_llm = kb_answer._llm
                        kb_answer._kb_search = {
                            config = function() return config, {} end,
                            query = function() return { items = items(1) }, nil end,
                        }
                        kb_answer._funcs = { call = function(_, args)
                            test.eq(args.config.analysis_model, case.expected)
                            return { answer = "cited answer [1]" }, nil
                        end }
                        kb_answer._llm = { generate = function(_, opts)
                            test.eq(opts.model, case.expected)
                            return { result = "cited answer [1]" }, nil
                        end }

                        local configured = config.analysis_model
                        local ok, result, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
                        kb_answer._kb_search = previous_search
                        kb_answer._funcs = previous_funcs
                        kb_answer._llm = previous_llm
                        if not ok then error(result) end
                        test.is_nil(err)
                        if case.notice then
                            test.eq(result.mode, "query")
                            test.eq(result.answer, case.notice)
                        else
                            test.is_nil(result.mode)
                            test.eq(result.answer, "cited answer [1]")
                        end
                        test.eq(result.results[1].content, "passage 1")
                        test.eq(config.analysis_model, configured)
                    end
                end
            end)
        end)

        test.it("keeps search analysis off without a named model", function()
            for _, config in ipairs({
                { summary_model = "class:fast" },
                { analysis_model = "", summary_model = "class:fast" },
                { analysis_model = false, summary_model = "class:fast" },
            }) do
                test.is_nil(analysis_model.configured(config))
            end
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

        test.it("rejects whitespace-only agent output even when there are sources", function()
            local previous_search, previous_funcs = kb_answer._kb_search, kb_answer._funcs
            kb_answer._kb_search = {
                config = function() return { analysis_model = "model", query_driver = "agentic" }, {} end,
                query = function() return { items = items(2) }, nil end,
            }
            kb_answer._funcs = { call = function() return { answer = " \t\n " }, nil end }
            local ok, value, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
            kb_answer._kb_search, kb_answer._funcs = previous_search, previous_funcs
            if not ok then error(value) end
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
            test.contains(tostring(err), "agentic answer returned empty content")
        end)

        test.it("does not invoke generation when Search analysis is off and Fast is unassigned", function()
            local models = require("models_repo")
            local fixture_model = "app.models:gpt-4.1-mini"
            local disabled, disable_err = models.upsert_card({ name = fixture_model, enabled = false })
            test.is_nil(disable_err, tostring(disable_err))
            test.eq(disabled.enabled, false)
            local resolver = assert(assert(require("contract").get("wippy.llm:model_resolver")):open())
            local card, resolve_err = resolver:resolve({ model = "class:fast" })
            test.is_nil(card, card and card.name)
            test.is_true(errors.is(resolve_err, errors.NOT_FOUND), tostring(resolve_err))
            local prev_search = kb_answer._kb_search
            local prev_funcs = kb_answer._funcs
            local prev_llm = kb_answer._llm
            kb_answer._kb_search = {
                config = function(): (any, any)
                    return {
                        analysis_model = "",
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
            local _, cleanup_err = models.delete_card(fixture_model)
            test.is_nil(cleanup_err, tostring(cleanup_err))
            if not ok then error(result) end

            test.is_nil(err)
            test.eq(result.mode, "query")
            test.eq(result.answer, "No answer model is available. Returning query results.")
            test.eq(result.count, 1)
            test.eq(result.results[1].content, "grounded passage")
        end)

        test.it("returns query results when the default answer class has no models", function()
            local previous = kb_answer._kb_search
            kb_answer._kb_search = {
                config = function() return { analysis_model = "class:fast" }, {} end,
                query = function() return { items = items(1), retrieval = { strategy = "plain", analysis = {
                    status = "unavailable", reason = "no_models_for_class", model = "class:fast",
                } } }, nil end,
            }
            local ok, result, err = pcall(kb_answer.ask, "kb-id", { query = "question" })
            kb_answer._kb_search = previous
            if not ok then error(result) end
            test.is_nil(err)
            test.eq(result.mode, "query")
            test.eq(result.answer, "No answer model is available. Returning query results.")
            test.eq(result.results[1].content, "passage 1")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return {
    run = function(options) return run_cases(options) end,
    member_ask = function()
        kb_answer._kb_search = {
            config = function() return { analysis_model = "" }, {} end,
            query = function() return { items = items(1) }, nil end,
        }
        kb_answer._llm = { generate = function(_, opts)
            test.eq(opts.model, "class:fast")
            return { result = "cited answer [1]" }, nil
        end }
        return kb_answer.ask("kb-id", { query = "question" })
    end,
}
