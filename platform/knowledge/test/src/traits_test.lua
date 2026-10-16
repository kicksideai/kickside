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

        test.it("reads kb_ids from the trait ctx and queries each", function()
            -- The KB does not exist, so each per-id query yields nothing; the
            -- point is the tool resolved kb_ids from ctx (not a positional arg)
            -- and ran the search loop instead of bailing on configuration.
            local out, err = executor({ kb_ids = { "missing-kb" } }):call(QUERY_TOOL, { query = "hello" })
            test.is_nil(out)
            test.not_nil(err)
            test.contains(tostring(err), "knowledge query failed")
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
