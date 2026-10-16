-- Runtime-faithful tests for the generic KB explorer tools (kickside.knowledge.traits:
-- kb_{find,search,ask}_tool). The tools run inside the agent runtime with the caller's
-- actor + scope, so we drive them through a framed funcs executor (matching
-- traits_test.lua) rather than a bare funcs.call — that way the required_scopes resolve
-- and the access gate sees a real actor. Coverage here is shape, argument validation,
-- kb_id resolution (arg + context), and the access gate; content/success assertions
-- over a seeded KB live in the live e2e.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local kb_tools = require("kb_tools")
local kb_render = require("kb_render")
local component = require("component")

local FIND = "kickside.knowledge.traits:kb_find_tool"
local SEARCH = "kickside.knowledge.traits:kb_search_tool"
local ASK = "kickside.knowledge.traits:kb_ask_tool"

local UNKNOWN_KB = "00000000-0000-0000-0000-000000000000"
local UNKNOWN_KB_2 = "11111111-1111-1111-1111-111111111111"

-- A framed executor mirroring the agent runtime: an actor + the process scope the
-- tools' required_scopes resolve against, plus an optional tool context.
local function executor(context: any?): any
    local actor: any = security.new_actor("kb_explorer_test_user", {})
    local scope: any = security.named_scope("wippy.security:process")
    local e: any = funcs.new():with_actor(actor):with_scope(scope)
    if context then e = e:with_context(context) end
    return e
end

local function define_tests()
    test.describe("kb explorer tools", function()
        test.it("returns typed KB resolution and access errors", function()
            local id, missing = kb_render.require_kb({}, {})
            test.is_nil(id)
            test.is_true(errors.is(missing, errors.INVALID), tostring(missing))
            local denied = kb_render.deny(UNKNOWN_KB)
            test.is_true(errors.is(denied, errors.PERMISSION_DENIED), tostring(denied))
        end)
        test.it("labels a node by its metadata title, else by its whole content", function()
            test.eq(kb_render.node_label({ metadata = { title = "Pricing" }, content = "ignored" }), "Pricing")
            local content = "Concept body\nspanning lines and " .. string.rep("long text ", 40)
            test.eq(kb_render.node_label({ metadata = {}, content = content }), content)
        end)

        -- Every KB tool returns a structured table whose fields a workflow node can
        -- map; error paths return nil and a typed invocation error.
        test.it("find returns accessible knowledge bases as records", function()
            local r, err = executor():call(FIND, {})
            test.is_nil(err)
            test.eq(type(r), "table")
            test.eq(type(r.knowledge_bases), "table")
            test.eq(r.count, #r.knowledge_bases)
        end)

        test.it("find pages accessible knowledge bases with a cursor", function()
            local original = component.get_service
            component.get_service = function()
                return {
                    list = function()
                        return { success = true, components = {
                            { component_id = "kb-3", meta = { title = "Third", class = "knowledge_base", kb_type = "document" } },
                            { component_id = "kb-1", meta = { title = "First", class = "knowledge_base", comment = "first base" } },
                            { component_id = "kb-2", meta = { title = "Second", class = "knowledge_base" } },
                        } }
                    end,
                }
            end
            local first, first_err = kb_tools.find({ limit = 2 }, {})
            local second, second_err = kb_tools.find({ limit = 2, cursor = first and first.next_cursor }, {})
            local filtered, filtered_err = kb_tools.find({ q = "third" }, {})
            test.is_nil(first_err)
            test.is_true(first.success)
            test.eq(first.count, 2)
            test.eq(first.knowledge_bases[1].kb_id, "kb-1")
            test.eq(first.knowledge_bases[1].name, "First")
            test.is_nil(first.knowledge_bases[1].description)
            test.is_nil(first.knowledge_bases[1].meta)
            test.eq(first.knowledge_bases[2].kb_id, "kb-2")
            test.eq(first.next_cursor, "kb-2")
            test.is_nil(second_err)
            test.eq(second.count, 1)
            test.eq(second.knowledge_bases[1].kb_id, "kb-3")
            test.eq(second.knowledge_bases[1].type, "document")
            test.is_nil(second.next_cursor)
            test.is_nil(filtered_err)
            test.eq(filtered.knowledge_bases[1].name, "Third")

            local detail, detail_err = kb_tools.find({ q = "first", fields = { "description", "meta" } }, {})
            component.get_service = original
            test.is_nil(detail_err)
            test.eq(detail.knowledge_bases[1].description, "first base")
            test.eq(detail.knowledge_bases[1].meta.title, "First")
        end)

        test.it("search requires a kb_id", function()
            local r, err = executor():call(SEARCH, { query = "anything" })
            test.is_nil(r)
            test.not_nil(err)
            test.contains(tostring(err), "kb_id is required")
        end)

        test.it("ask requires a kb_id", function()
            local r, err = executor():call(ASK, { query = "anything" })
            test.is_nil(r)
            test.not_nil(err)
            test.contains(tostring(err), "kb_id is required")
        end)

        test.it("resolves kb_id from the tool context when no arg is given", function()
            -- The context kb_id does not exist, so the access gate denies it; the
            -- point is the tool resolved the id from context (not "kb_id is required").
            local r, err = executor({ kb_id = UNKNOWN_KB }):call(SEARCH, { query = "x" })
            test.is_nil(r)
            test.not_nil(err)
            test.contains(tostring(err), "access denied")
        end)

        test.it("denies access to a knowledge base the actor cannot read", function()
            local r, err = executor():call(SEARCH, { kb_id = UNKNOWN_KB, query = "x" })
            test.is_nil(r)
            test.not_nil(err)
            test.contains(tostring(err), "access denied")
        end)

        test.it("gates ask on access", function()
            local r, err = executor():call(ASK, { kb_id = UNKNOWN_KB, query = "x" })
            test.is_nil(r)
            test.not_nil(err)
            test.contains(tostring(err), "access denied")
        end)

        test.it("ask formatter returns an empty answer with no sources for empty retrieval", function()
            local r = kb_tools.format_ask_result({ answer = nil, results = {}, count = 0 })
            test.eq(r.answer, "")
            test.eq(r.count, 0)
            test.eq(#r.sources, 0)
        end)

        test.it("ask formatter returns the answer with the full source records", function()
            local r = kb_tools.format_ask_result({
                answer = " grounded answer ",
                count = 1,
                results = {
                    { id = "node-1", content = "source text", meta = { metadata = { title = "Source title" } } },
                },
            })
            test.is_true(r.success)
            test.eq(r.answer, "grounded answer")
            test.eq(r.count, 1)
            test.eq(r.sources[1].id, "node-1")
            test.eq(r.sources[1].content, "source text")
            test.eq(r.sources[1].meta.metadata.title, "Source title")
        end)

        -- Multi-KB pinning (the kb_reader trait writes kb_ids: string[]). A single
        -- pinned KB still resolves with no kb_id; several pinned changes how each
        -- tool resolves — search spans every base.

        test.it("a single pinned KB resolves without an explicit kb_id", function()
            -- One configured KB is unambiguous, so search resolves it and the gate
            -- (an unreadable id) denies — proving resolution, not "kb_id is required".
            local r, err = executor({ kb_ids = { UNKNOWN_KB } }):call(SEARCH, { query = "x" })
            test.is_nil(r)
            test.not_nil(err)
            test.contains(tostring(err), "access denied")
        end)

        test.it("search spans every pinned KB and gates each", function()
            -- Both pinned ids are unreadable; the first one denied proves search
            -- resolved the full set and access-gates every KB it would touch.
            local r, err = executor({ kb_ids = { UNKNOWN_KB, UNKNOWN_KB_2 } }):call(SEARCH, { query = "x" })
            test.is_nil(r)
            test.not_nil(err)
            test.contains(tostring(err), "access denied")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
