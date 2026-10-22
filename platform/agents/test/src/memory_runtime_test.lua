local test = require("test")
local runtime = require("memory_runtime")

local function fake_prompt()
    return {
        new = function()
            local p = { messages = {} }
            function p:add_system(text)
                self.messages[#self.messages + 1] = { role = "system", text = text }
            end
            function p:add_user(text)
                self.messages[#self.messages + 1] = { role = "user", text = text }
            end
            return p
        end,
    }
end

local function fake_contract(prompt_text)
    return {
        get = function(contract_id)
            test.eq(contract_id, "wippy.agent:run_context")
            return {
                open = function(_, binding)
                    test.eq(binding, "run-context-binding")
                    return {
                        get_prompt = function(_, args)
                            return {
                                text = prompt_text,
                                range = {
                                    from_id = "m1",
                                    to_id = "m2",
                                    checkpoint_id = "c1",
                                },
                                args = args,
                            }, nil
                        end,
                    }, nil
                end,
            }, nil
        end,
    }
end

local function install_deps(ctx_values, captures, options)
    options = options or {}
    local prompt_text = options.prompt_text
    if prompt_text == nil then prompt_text = "User prefers concise future memory." end
    local llm_result = options.llm_result
    if llm_result == nil then llm_result = "Memory: user prefers concise future memory." end
    local memory_items = options.memory_items or {
        { id = "n1", content = "Prior memory: prefer concise answers." },
    }
    runtime._set_deps({
        ctx = {
            get = function(name)
                return ctx_values[name]
            end,
        },
        contract = fake_contract(prompt_text),
        prompt = fake_prompt(),
        llm = {
            generate = function(p, options)
                captures.llm = { prompt = p, options = options }
                return {
                    result = llm_result,
                    tokens = { total_tokens = 42 },
                }, nil
            end,
        },
        component = {
            ACCESS = { READ = 1, WRITE = 2 },
            open = function(component_id, access, contract_id)
                captures.opens[#captures.opens + 1] = {
                    component_id = component_id,
                    access = access,
                    contract_id = contract_id,
                }
                if contract_id == "kickside.contract:queryable" then
                    return {
                        query = function(_, args)
                            captures.query = args
                            local ranked = {}
                            local offset = args.offset or 0
                            local finish = math.min(offset + args.limit, #memory_items)
                            for index = offset + 1, finish do ranked[#ranked + 1] = memory_items[index] end
                            return { items = ranked, next_offset = finish < #memory_items and finish or nil }, nil
                        end,
                    }, nil
                end
                if contract_id == "kickside.contract:embeddable" then
                    return {
                        embed_content = function(_, args)
                            captures.embed = args
                            return { success = true, external_id = args.external_id }, nil
                        end,
                    }, nil
                end
                return nil, "unexpected contract " .. tostring(contract_id)
            end,
        },
    })
end

local function payload(phase)
    return {
        phase = phase,
        host = { kind = "session", session_id = "s1" },
        agent = { id = "agent:one", model = "class:fast" },
        reason = "test",
        run_context = {
            contract = "wippy.agent:run_context",
            binding = "run-context-binding",
        },
    }
end

local function define_tests()
    test.describe("knowledge base memory runtime", function()
        test.after_each(function()
            runtime._reset_deps()
        end)

        test.it("injects recalled memory on activation", function()
            local captures: any = { opens = {} }
            install_deps({
                kb_ids = { "kb:one" },
                read_enabled = true,
                recall_prompt = "Use retrieved memories as advisory context only.",
            }, captures)

            local result, err = runtime.apply(payload("activate"))
            test.is_nil(err)
            test.not_nil(result)
            local messages: any = (result :: any).messages or {}
            local first: any = messages[1] or {}
            test.eq(#messages, 1)
            test.is_true(string.find(tostring(first.content or ""), "Prior memory", 1, true) ~= nil)
            test.is_true(string.find(tostring(first.content or ""), "advisory context only", 1, true) ~= nil)
            test.eq(captures.opens[1].contract_id, "kickside.contract:queryable")
        end)

        test.it("writes checkpoint memory through the selected KB", function()
            local captures: any = { opens = {} }
            install_deps({
                kb_ids = { "kb:one" },
                write_enabled = true,
                checkpoint_model = "class:fast",
                checkpoint_prompt = "Store relevant details for future conversations.",
            }, captures)

            local result, err = runtime.create(payload("checkpoint"))
            test.is_nil(err)
            test.not_nil(result)
            test.is_true(result.metadata.committed)
            test.eq(captures.opens[1].contract_id, "kickside.contract:embeddable")
            test.eq(captures.embed.metadata.source, "kickside.memory")
            test.is_true(string.find(captures.embed.content, "## Memory Digest", 1, true) ~= nil)
            test.is_true(string.find(captures.embed.external_id, "agent-memory", 1, true) ~= nil)
        end)

        test.it("does not write a checkpoint when there is no durable conversation", function()
            local captures: any = { opens = {} }
            install_deps({
                kb_ids = { "kb:one" },
                write_enabled = true,
            }, captures, { prompt_text = "   " })

            local result, err = runtime.create(payload("checkpoint"))
            test.is_nil(err)
            test.not_nil(result)
            test.is_false(result.metadata.committed)
            test.is_true(result.metadata.skipped)
            test.eq(result.metadata.skip_reason, "no_durable_memory")
            test.eq(#captures.opens, 0)
        end)

        test.it("does not persist raw transcript when checkpoint model is disabled", function()
            local captures: any = { opens = {} }
            install_deps({
                kb_ids = { "kb:one" },
                write_enabled = true,
                checkpoint_model = "none",
            }, captures, { prompt_text = "User: remember that Curt uses R scripts.\nAssistant: Yes, I found a record." })

            local result, err = runtime.create(payload("checkpoint"))
            test.is_nil(err)
            test.not_nil(result)
            test.is_false(result.metadata.committed)
            test.is_true(result.metadata.skipped)
            test.eq(#captures.opens, 0)
        end)

        test.it("rejects assistant-answer-shaped checkpoint output", function()
            local captures: any = { opens = {} }
            install_deps({
                kb_ids = { "kb:one" },
                write_enabled = true,
                checkpoint_model = "class:fast",
            }, captures, {
                llm_result = "Yes, I found a record of a discussion involving Curt Stenger.\n\nWould you like me to look for more specific details?",
            })

            local result, err = runtime.create(payload("checkpoint"))
            test.is_nil(err)
            test.not_nil(result)
            test.is_false(result.metadata.committed)
            test.is_true(result.metadata.skipped)
            test.eq(result.metadata.skip_reason, "assistant_answer")
            test.eq(#captures.opens, 0)
        end)

        test.it("exposes explicit recall as a normal trait tool", function()
            local captures: any = { opens = {} }
            local memory_items = {}
            for index = 1, 5 do
                memory_items[index] = { id = "n" .. index, content = "Prior memory " .. index .. ": prefer concise answers." }
            end
            install_deps({}, captures, { memory_items = memory_items })

            local function page_ids(page)
                local ids = {}
                for _, item in ipairs(page.items) do ids[#ids + 1] = item.id end
                return table.concat(ids, ",")
            end
            local request = {
                kb_ids = { "kb:one" },
                query = "answer style",
                limit = 2,
            }

            local result, err = runtime.recall(request)
            test.is_nil(err)
            test.not_nil(result)
            test.is_true(result.success)
            test.eq(captures.query.query, "answer style")
            test.eq(result.count, 2)
            test.eq(page_ids(result), "n1,n2")
            test.eq(result.items[1].kb_id, "kb:one")
            test.not_nil(result.next_cursor)
            test.eq(captures.query.offset, 0)
            test.is_nil(result.message)
            test.is_nil(result.items[1].content)
            request.fields = { "content" }
            local detailed, detailed_err = runtime.recall(request)
            test.is_nil(detailed_err)
            test.eq(detailed.items[1].content, memory_items[1].content)
            test.eq(detailed.items[2].content, memory_items[2].content)
            test.is_true(string.find(result.note, "may be incomplete or inaccurate", 1, true) ~= nil)

            request.cursor = result.next_cursor
            local second = runtime.recall(request)
            test.eq(page_ids(second), "n3,n4")
            test.not_nil(second.next_cursor)
            test.eq(captures.query.offset, 2)

            request.cursor = second.next_cursor
            local last = runtime.recall(request)
            test.eq(page_ids(last), "n5")
            test.eq(captures.query.offset, 4)
            test.is_nil(last.next_cursor)
        end)

        test.it("does not query when recall is disabled", function()
            local captures: any = { opens = {} }
            install_deps({ read_enabled = false, kb_ids = { "kb:one" } }, captures)

            local result, err = runtime.recall({ query = "answer style" })
            test.is_nil(err)
            test.not_nil(result)
            test.is_false(result.success)
            test.eq(#captures.opens, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
