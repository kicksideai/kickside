local test = require("test")
local funcs = require("funcs")
local security = require("security")

local TOOL = "kickside.knowledge.traits:knowledge_manager_tool"

local function executor(): any
    return funcs.new()
        :with_actor(security.new_actor("knowledge_manager_test_user", {}))
        :with_scope(security.named_scope("wippy.security:process"))
end

local function define_tests()
    test.describe("Knowledge manager trait", function()
        test.it("discovers installed engines through the Knowledge owner", function()
            local result, err = executor():call(TOOL, { action = "list_kb_engines" })
            test.is_nil(err)
            test.eq(type(result.kb_engines), "table")
            local seen = false
            for _, row in ipairs(result.kb_engines) do
                if row.kb_type == "wiki" then seen = true end
            end
            test.is_true(seen, "harness knowledge engine missing")
        end)

        test.it("lists knowledge bases through the owner contract", function()
            local result, err = executor():call(TOOL, { action = "list_knowledge_bases" })
            test.is_nil(err)
            test.eq(type(result.knowledge_bases), "table")
        end)

        test.it("returns compact engine rows by default", function()
            local result, err = executor():call(TOOL, { action = "list_kb_engines", limit = 100 })
            test.is_nil(err)
            test.is_true(#result.kb_engines > 0)
            for _, row in ipairs(result.kb_engines) do
                test.not_nil(row.id)
                test.is_nil(row.engine_id)
                test.is_nil(row.impl_id)
                test.is_nil(row.default_config)
                if row.kb_type == "wiki" then
                    test.eq(type(row.label), "string")
                end
            end
        end)

        test.it("includes requested engine fields", function()
            local result, err = executor():call(TOOL, { action = "list_kb_engines", fields = { "default_config" } })
            test.is_nil(err)
            for _, row in ipairs(result.kb_engines) do
                if row.kb_type == "wiki" then test.eq(row.default_config.chunk_size, 400) end
            end
        end)

        test.it("pages the engine catalog in id order with a cursor", function()
            local all, all_err = executor():call(TOOL, { action = "list_kb_engines", include_config = false, limit = 100 })
            test.is_nil(all_err)
            local seen: { string } = {}
            local cursor: string? = nil
            repeat
                local page, page_err = executor():call(TOOL, { action = "list_kb_engines", include_config = false, limit = 1, cursor = cursor })
                test.is_nil(page_err)
                test.is_true(#page.kb_engines <= 1)
                for _, row in ipairs(page.kb_engines) do seen[#seen + 1] = row.id end
                cursor = page.next_cursor
            until cursor == nil
            test.eq(#seen, #all.kb_engines)
            for index = 2, #seen do test.is_true(seen[index] > seen[index - 1]) end

            local invalid, invalid_err = executor():call(TOOL, { action = "list_kb_engines", limit = 0 })
            test.is_nil(invalid)
            test.is_true(errors.is(invalid_err, errors.INVALID))
        end)

        test.it("explains the embedding prerequisite as a typed input error", function()
            local result, err = executor():call(TOOL, {
                action = "upsert_knowledge_base", name = "missing embedding prerequisite", kb_type = "wiki",
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.contains(tostring(err), "class:embed")
            test.contains(tostring(err), "Embedding")
        end)

        test.it("keeps enrichment-agent validation at the Knowledge write boundary", function()
            local result, err = executor():call(TOOL, {
                action = "upsert_knowledge_base",
                name = "knowledge-manager-invalid-agent",
                kb_type = "wiki",
                embedding_model = "class:embed",
                enrichment_agent_id = "missing-agent",
            })
            test.is_nil(result)
            test.not_nil(err)
            test.contains(tostring(err), "enrichment_agent_id")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
