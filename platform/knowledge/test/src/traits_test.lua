-- Runtime-faithful tests for the KB trait tools kickside.knowledge.traits:
-- {kb_query_tool, kb_embed_tool}. The agent runtime delivers a trait's
-- configured kb_ids through the tool ctx (the compiler binds trait_contexts onto
-- the executor context), never as a positional argument. So we drive both tools
-- exactly as the runtime does: through a framed funcs executor whose context
-- carries kb_ids, and assert the tools read it back via ctx.get. This locks the
-- regression where the tools read a positional context and reported "no
-- knowledge bases configured" in chat.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")

local QUERY_TOOL = "kickside.knowledge.traits:kb_query_tool"
local EMBED_TOOL = "kickside.knowledge.traits:kb_embed_tool"

-- A framed executor mirroring the agent runtime: an actor + the process scope the
-- tool's required_scopes resolve against, plus the trait context when supplied.
local function executor(context: any?): any
    local actor: any = security.new_actor("kb_traits_test_user", {})
    local scope: any = security.named_scope("wippy.security:process")
    local e: any = funcs.new():with_actor(actor):with_scope(scope)
    if context then e = e:with_context(context) end
    return e
end

local PRESENTATION_TOOL = "test.kb:query_presentation"

local function define_tests()
    test.describe("Knowledge capability discovery", function()
        test.it("directs reader configuration to the declared discovery capability", function()
            local reader, reader_err = registry.get("kickside.knowledge.traits:kb_reader")
            local explorer, explorer_err = registry.get("kickside.knowledge.traits:kb_explorer")
            test.is_nil(reader_err)
            test.is_nil(explorer_err)
            test.not_nil(reader)
            test.not_nil(explorer)
            test.contains(reader.meta.comment, explorer.meta.title)
            test.contains(reader.data.prompt, explorer.meta.title)
            test.contains(reader.data.prompt, "fields: [content, meta]")
        end)
    end)

    -- QueryKB returns token-lean markdown (a string) so the agent runtime passes it
    -- straight to the model; failures use the typed invocation error return.
    -- QueryKB returns { query, count, results }: every ranked result is the
    -- engine's full item with its kb_id; failures use the typed error return.
    test.describe("kickside.knowledge.traits:kb_query_tool (via runtime ctx)", function()
        test.it("preserves optional retrieval status for each queried base", function()
            local status = { strategy = "plain", analysis = { status = "unavailable",
                reason = "no_models_for_class", model = "class:unassigned" } }
            local out, err = executor({ kb_ids = { "kb-1", "kb-2" }, passages = {}, retrieval = status })
                :call(PRESENTATION_TOOL, { query = "question" })
            test.is_nil(err)
            test.eq(out.retrieval["kb-1"].analysis.reason, "no_models_for_class")
            test.eq(out.retrieval["kb-2"].analysis.model, "class:unassigned")
            local plain, plain_err = executor({ kb_ids = { "kb-1" }, passages = {} })
                :call(PRESENTATION_TOOL, { query = "question" })
            test.is_nil(plain_err)
            test.is_nil(plain.retrieval)
        end)

        test.it("SearchKB preserves each base's status including empty retrieval and continuations", function()
            local status = { strategy = "plain", analysis = { status = "unavailable",
                reason = "no_models_for_class", model = "class:unassigned" } }
            for _, passages in ipairs({ {}, { { id = "passage", content = "match" } } }) do
                local out, err = executor({ kb_ids = { "kb-1", "kb-2" }, passages = passages, retrieval = status })
                    :call("test.kb:search_presentation", { query = "question" })
                test.is_nil(err)
                test.is_true(out.success)
                test.eq(out.count, #passages * 2)
                test.eq(out.retrieval["kb-1"].analysis.reason, "no_models_for_class")
                test.eq(out.retrieval["kb-2"].analysis.model, "class:unassigned")
            end
            local page, page_err = executor({ kb_ids = { "kb-1", "kb-2" }, passages = {}, retrieval = status, next_offset = 1 })
                :call("test.kb:search_presentation", { query = "question", limit = 1 })
            test.is_nil(page_err)
            test.eq(page.next_cursor, "1:1")
            test.not_nil(page.retrieval["kb-1"])
            test.is_nil(page.retrieval["kb-2"])
            local plain, plain_err = executor({ kb_ids = { "kb-1" }, passages = {} })
                :call("test.kb:search_presentation", { query = "question" })
            test.is_nil(plain_err)
            test.is_nil(plain.retrieval)
        end)

        test.it("RetrieveKB preserves optional retrieval status with empty and populated results", function()
            local status = { strategy = "plain", analysis = { status = "unavailable",
                reason = "no_models_for_class", model = "class:unassigned" } }
            for _, passages in ipairs({ {}, { { id = "passage", content = "match" } } }) do
                local out, err = executor({ kb_id = "kb-1", passages = passages, retrieval = status, next_offset = 1 })
                    :call("test.kb:retrieve_presentation", { query = "question" })
                test.is_nil(err)
                test.is_true(out.success)
                test.eq(out.count, #passages)
                test.eq(out.next_cursor, "1")
                test.eq(out.retrieval.analysis.reason, "no_models_for_class")
                test.eq(out.retrieval.analysis.model, "class:unassigned")
            end
            local plain, plain_err = executor({ kb_id = "kb-1", passages = {} })
                :call("test.kb:retrieve_presentation", { query = "question" })
            test.is_nil(plain_err)
            test.is_nil(plain.retrieval)
        end)

        test.it("returns compact retrieved rows by default", function()
            local content = "PART_NUMBER: 1096657\n" .. string.rep("Catalog description. ", 20)
                .. "\nFinish: Plain\nMaterial: Steel\nDimensions: 3-1/4 in L x 7/8 in H"
            local out, err = executor({ kb_ids = { "kb-1" }, passages = {
                { id = "passage-1096657", content = content, meta = { similarity = 0.95, metadata = { title = "Shackle" } } },
            } }):call(PRESENTATION_TOOL, { query = "Finish for 1096657" })
            test.is_nil(err)
            test.is_true(out.success)
            test.eq(out.query, "Finish for 1096657")
            test.eq(out.count, 1)
            test.eq(out.results[1].id, "passage-1096657")
            test.eq(out.results[1].kb_id, "kb-1")
            test.eq(out.results[1].score, 0.95)
            test.eq(out.results[1].title, "Shackle")
            test.is_nil(out.results[1].meta)
            test.is_nil(out.results[1].content)
        end)

        test.it("returns requested content and metadata", function()
            local content = "## Crosby®\n\n| Attribute | Value |\n| --- | --- |\n| Finish | Plain |\n| Name | "
                .. string.rep("é", 90) .. "® |"
            local out, err = executor({ kb_ids = { "kb-1" }, passages = {
                { id = "table-passage", content = content },
            } }):call(PRESENTATION_TOOL, { query = "Finish", fields = { "content" } })
            test.is_nil(err)
            test.eq(out.results[1].content, content)
        end)

        test.it("keeps passage ids and base ids across configured KBs", function()
            local content = string.rep("Source details. ", 15) .. "\nWorking Load Limit: 192000"
            local out, err = executor({ kb_ids = { "kb-1", "kb-2" }, passages = {
                { id = "full-passage-id", content = content },
            } }):call(PRESENTATION_TOOL, { query = "Working Load Limit" })
            test.is_nil(err)
            test.eq(out.count, 2)
            test.eq(out.results[1].id, "full-passage-id")
            test.eq(out.results[1].kb_id, "kb-1")
            test.eq(out.results[2].kb_id, "kb-2")
            test.is_nil(out.results[2].content)
        end)

        test.it("queries an explicit KB without trait context", function()
            local out, err = executor({ passages = { { id = "passage", content = "permitted content" } } })
                :call(PRESENTATION_TOOL, { query = "stock", kb_id = "kb-1" })
            test.is_nil(err)
            test.is_nil(out.results[1].content)
        end)

        test.it("targets one configured KB and rejects an unconfigured KB", function()
            local exec = executor({ kb_ids = { "kb-1", "kb-2" }, passages = { { id = "passage", content = "stock" } } })
            local out, err = exec:call(PRESENTATION_TOOL, { query = "stock", kb_id = "kb-2" })
            test.is_nil(err)
            test.eq(out.count, 1)
            test.eq(out.results[1].kb_id, "kb-2")
            local denied, deny_err = exec:call(PRESENTATION_TOOL, { query = "stock", kb_id = "outside" })
            test.is_nil(denied)
            test.not_nil(deny_err)
            test.contains(tostring(deny_err), "kb_id not in configured knowledge bases")
        end)

        test.it("RetrieveKB returns compact rows and requested fields", function()
            local out, err = executor({ kb_id = "kb-1", passages = {
                { id = "retrieved", content = "full retrieved text", meta = { similarity = 0.5, metadata = { title = "Doc" } } },
            } }):call("test.kb:retrieve_presentation", { query = "text", fields = { "content", "meta" } })
            test.is_nil(err)
            test.is_true(out.success)
            test.eq(out.query, "text")
            test.eq(out.count, 1)
            test.eq(out.results[1].content, "full retrieved text")
            test.eq(out.results[1].meta.metadata.title, "Doc")
        end)

        test.it("SearchKB returns compact items with their kb_id", function()
            local out, err = executor({ kb_ids = { "kb-1" }, passages = {
                { id = "searched", content = "full searched text", meta = { similarity = 0.7, metadata = { title = "Found" } } },
            } }):call("test.kb:search_presentation", { query = "text" })
            test.is_nil(err)
            test.eq(out.count, 1)
            test.is_true(out.success)
            test.eq(out.results[1].kb_id, "kb-1")
            test.eq(out.results[1].title, "Found")
            test.eq(out.results[1].score, 0.7)
            test.is_nil(out.results[1].content)
            test.is_nil(out.results[1].meta)
        end)

        test.it("QueryKB and RetrieveKB expose provider continuations", function()
            local query, query_err = executor({ kb_ids = { "kb-1" }, next_offset = 1, passages = {
                { id = "query-page" },
            } }):call(PRESENTATION_TOOL, { query = "text", limit = 1 })
            test.is_nil(query_err)
            test.eq(query.next_cursor, "1:1")

            local retrieve, retrieve_err = executor({ kb_id = "kb-1", next_offset = 1, passages = {
                { id = "retrieve-page" },
            } }):call("test.kb:retrieve_presentation", { query = "text", limit = 1 })
            test.is_nil(retrieve_err)
            test.eq(retrieve.next_cursor, "1")
        end)

        test.it("rejects a missing query", function()
            local out, err = executor({ kb_ids = { "kb-1" } }):call(QUERY_TOOL, {})
            test.is_nil(out)
            test.not_nil(err)
            test.contains(tostring(err), "query is required")
        end)

        test.it("rejects an empty query", function()
            local out, err = executor({ kb_ids = { "kb-1" } }):call(QUERY_TOOL, { query = "" })
            test.is_nil(out)
            test.not_nil(err)
            test.contains(tostring(err), "query is required")
        end)

        test.it("reports no KBs when the trait context carries none", function()
            local out, err = executor({}):call(QUERY_TOOL, { query = "hello" })
            test.is_nil(out)
            test.not_nil(err)
            test.ok((tostring(err):find("no knowledge bases configured")))
            test.contains(tostring(err), "FindKnowledgeBases")
            test.contains(tostring(err), "kb_id")
        end)

        test.it("rejects malformed query limits", function()
            local out, err = executor({ kb_ids = { "kb-1" } }):call(QUERY_TOOL, { query = "hello", limit = "5" })
            test.is_nil(out)
            test.not_nil(err)
            test.contains(tostring(err), "limit must be an integer")

            local high, high_err = executor({ kb_ids = { "kb-1" } }):call(QUERY_TOOL, { query = "hello", limit = 101 })
            test.is_nil(high)
            test.not_nil(high_err)
            test.contains(tostring(high_err), "limit must be between 1 and 100")
        end)

        test.it("gives members identical discovery guidance for unknown and unreadable KBs", function()
            local scope = security.new_scope({ security.policy("app:limited_user") })
            local owner = funcs.new():with_actor(security.new_actor("kb_query_owner", {})):with_scope(scope)
            local member = funcs.new():with_actor(security.new_actor("kb_query_member", {})):with_scope(scope)
            local title = "Private KB retrieval reference"
            local kb, create_err = owner:call("kickside.knowledge.registry:kb_create", {
                name = title, kb_type = "bound", embedding_model = "fixture-embedding",
            })
            test.is_nil(create_err)
            test.not_nil(kb)
            local id = kb.component_id

            local found, find_err = owner:call("kickside.knowledge.traits:kb_find_tool", { q = title })
            test.is_nil(find_err)
            test.eq(found.knowledge_bases[1].kb_id, id)

            local unknown, unknown_err = member:call(QUERY_TOOL, {
                query = "reference", kb_id = "00000000-0000-4000-8000-000000000000",
            })
            local hidden, hidden_err = member:call(QUERY_TOOL, { query = "reference", kb_id = id })
            local by_title, title_err = member:with_context({ kb_ids = { title } })
                :call(QUERY_TOOL, { query = "reference" })
            test.is_nil(unknown)
            test.is_nil(hidden)
            test.is_nil(by_title)
            test.is_true(errors.is(unknown_err, errors.NOT_FOUND), tostring(unknown_err))
            test.is_true(errors.is(hidden_err, errors.NOT_FOUND), tostring(hidden_err))
            test.is_true(errors.is(title_err, errors.NOT_FOUND), tostring(title_err))
            test.contains(tostring(unknown_err), "FindKnowledgeBases")
            test.eq(tostring(hidden_err), tostring(unknown_err))
            test.eq(tostring(title_err), tostring(unknown_err))

            local _, delete_err = owner:call("kickside.knowledge.registry:kb_delete", { component_id = id })
            test.is_nil(delete_err)
        end)

        test.it("does not treat a storage not-found as a missing KB", function()
            local out, err = executor({ kb_ids = { "kb-1" }, storage_not_found = true })
                :call(PRESENTATION_TOOL, { query = "reference" })
            test.is_nil(out)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
            test.contains(tostring(err), "passages not found in store")
            test.is_nil(string.find(tostring(err), "FindKnowledgeBases", 1, true))
        end)
    end)

    test.describe("kickside.knowledge.traits:kb_embed_tool (via runtime ctx)", function()
        test.it("rejects missing content", function()
            local out, err = executor({ kb_ids = { "kb-1" } }):call(EMBED_TOOL, {})
            test.is_nil(out)
            test.not_nil(err)
            test.ok((tostring(err):find("content is required")))
        end)

        test.it("reports no KBs when the trait context carries none", function()
            local out, err = executor({}):call(EMBED_TOOL, { content = "x" })
            test.is_nil(out)
            test.not_nil(err)
            test.ok((tostring(err):find("no knowledge bases configured")))
        end)

        test.it("accepts an explicit kb_id without pinned trait context", function()
            -- Dynamic flow: FindKnowledgeBases -> EmbedToKB({ kb_id = ... }).
            -- The id is absent in this harness, so the component read fails after
            -- resolution instead of the old "no knowledge bases configured" gate.
            local out, err = executor({}):call(EMBED_TOOL, { content = "x", kb_id = "missing-kb" })
            test.is_nil(out)
            test.not_nil(err)
            test.ok((tostring(err):find("knowledge base not found")))
        end)

        test.it("rejects an explicit kb_id outside the configured set", function()
            local out, err = executor({ kb_ids = { "kb-1", "kb-2" } })
                :call(EMBED_TOOL, { content = "x", kb_id = "phantom" })
            test.is_nil(out)
            test.not_nil(err)
            test.ok((tostring(err):find("kb_id not in configured knowledge bases")))
        end)

        test.it("rejects a conflicting ID and guides a single-bound write without exposing IDs", function()
            local out, err = executor({ kb_ids = { "private-bound-kb" } })
                :call(EMBED_TOOL, { content = "x", kb_id = "conflicting-kb" })
            test.is_nil(out)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            local message = tostring(err)
            test.contains(message, "Omit kb_id to use the single configured knowledge base")
            test.is_true(message:find("private-bound-kb", 1, true) == nil)
            test.is_true(message:find("conflicting-kb", 1, true) == nil)
        end)

        test.it("requires kb_id for ambiguous writes", function()
            local out, err = executor({ kb_ids = { "kb-1", "kb-2" } })
                :call(EMBED_TOOL, { content = "x" })
            test.is_nil(out)
            test.not_nil(err)
            test.ok((tostring(err):find("kb_id is required")))
        end)

        test.it("resolves kb_ids from ctx then fails at the absent component", function()
            -- Passing the config gate proves ctx delivery; the configured KB has
            -- no component, so the open fails with a not-found rather than the
            -- configuration error.
            local out, err = executor({ kb_ids = { "missing-kb" } }):call(EMBED_TOOL, { content = "x" })
            test.is_nil(out)
            test.not_nil(err)
            test.ok((tostring(err):find("knowledge base not found")))
        end)
    end)

end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
