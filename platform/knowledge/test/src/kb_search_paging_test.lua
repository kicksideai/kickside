local test = require("test")
local tools = require("tools")
local search = require("search")
local component = require("component")
local facade = require("facade")
local binding = require("binding")
local stores = require("stores")

return { run = test.run_cases(function()
    test.describe("knowledge engine page continuation", function()
        test.it("returns compact result rows across configured bases and pages them", function()
            local original_gate, original_query = component.validate_access, search.query
            local calls = {}
            component.validate_access = function() return 1, nil end
            search.query = function(kb_id, args)
                calls[#calls + 1] = { kb_id = kb_id, offset = args.offset, limit = args.limit }
                local items = {}
                local total = kb_id == "kb-a" and 3 or 2
                local offset = args.offset or 0
                for i = offset + 1, math.min(total, offset + args.limit) do
                    items[#items + 1] = { id = kb_id .. i, content = "whole result " .. i, metadata = { retained = true } }
                end
                return { success = true, items = items, next_offset = offset + #items < total and offset + #items or nil }
            end
            local pages, page_errors = {}, {}
            local cursor
            for i = 1, 3 do
                pages[i], page_errors[i] = tools.search({ query = "query", limit = 2, cursor = cursor }, { kb_ids = { "kb-a", "kb-b" } })
                cursor = pages[i] and pages[i].next_cursor
            end
            component.validate_access, search.query = original_gate, original_query
            for i = 1, 3 do test.is_nil(page_errors[i]) end
            test.not_nil(pages[1].next_cursor)
            test.not_nil(pages[2].next_cursor)
            test.eq(calls[2].offset, 2)
            test.eq(calls[3].kb_id, "kb-b")
            test.eq(calls[3].limit, 1)
            test.eq(calls[4].offset, 1)
            local ids = {}
            for _, page in ipairs(pages) do
                for _, row in ipairs(page.results) do
                    ids[#ids + 1] = row.id
                    test.is_nil(row.metadata)
                    test.is_nil(row.content)
                    test.not_nil(row.kb_id)
                end
            end
            test.eq(table.concat(ids, ","), "kb-a1,kb-a2,kb-a3,kb-b1,kb-b2")
            test.is_nil(pages[3].next_cursor)
        end)

        test.it("includes requested result fields without changing paging", function()
            local original_gate, original_query = component.validate_access, search.query
            component.validate_access = function() return 1, nil end
            search.query = function()
                return { items = { { id = "row", content = "whole result", metadata = { retained = true } } } }
            end
            local page, err = tools.search({ query = "query", kb_id = "kb", fields = { "content", "metadata" } }, {})
            component.validate_access, search.query = original_gate, original_query
            test.is_nil(err)
            test.eq(page.results[1].content, "whole result")
            test.is_true(page.results[1].metadata.retained)
        end)

        test.it("continues at the next base when a page ends at a base boundary", function()
            local original_gate, original_query = component.validate_access, search.query
            component.validate_access = function() return 1, nil end
            search.query = function(kb_id, args)
                if kb_id == "empty" then return { items = {} } end
                return { items = { { id = kb_id, content = "full" } } }
            end
            local context = { kb_ids = { "empty", "first", "last" } }
            local first, e1 = tools.search({ query = "query", limit = 1 }, context)
            local last, e2 = tools.search({ query = "query", limit = 1, cursor = first and first.next_cursor }, context)
            component.validate_access, search.query = original_gate, original_query
            test.is_nil(e1)
            test.is_nil(e2)
            test.eq(first.results[1].id, "first")
            test.not_nil(first.next_cursor)
            test.eq(last.results[1].id, "last")
            test.is_nil(last.next_cursor)
        end)

        test.it("rejects malformed paging before querying an engine", function()
            local original_gate, original_query = component.validate_access, search.query
            local calls = 0
            component.validate_access = function() return 1, nil end
            search.query = function() calls = calls + 1; return { items = {} } end
            local results, failures = {}, {}
            for i, args in ipairs({ { limit = 0 }, { limit = 51 }, { limit = 1.5 }, { cursor = "bad" }, { cursor = "0:0" }, { cursor = "2:0" }, { cursor = "1:-1" }, { cursor = 1 } }) do
                args.kb_id, args.query = "kb", "query"
                results[i], failures[i] = tools.search(args, {})
            end
            component.validate_access, search.query = original_gate, original_query
            test.eq(calls, 0)
            for i = 1, 8 do
                test.is_nil(results[i])
                test.is_true(errors.is(failures[i], errors.INVALID), tostring(failures[i]))
            end
        end)

        test.it("preserves an engine domain failure", function()
            local original_gate, original_query = component.validate_access, search.query
            local failure = { success = false, error = "unsupported query", code = "invalid_query" }
            component.validate_access = function() return 1, nil end
            search.query = function() return failure end
            local result, err = tools.search({ kb_id = "kb", query = "query" }, {})
            component.validate_access, search.query = original_gate, original_query
            test.is_nil(err)
            test.eq(result, failure)
        end)

        test.it("forwards offset through the facade to the engine binding", function()
            local original_service, original_resolve = component.get_service, stores.resolve_component_store
            component.get_service = function() return { get = function() return { success = true } end } end
            stores.resolve_component_store = function() return {}, {}, { query_binding = "engine:query" } end
            local result, err = facade.query("kb", { query = "query", limit = 1, offset = 2 })
            component.get_service, stores.resolve_component_store = original_service, original_resolve
            test.is_nil(err)
            test.eq(binding.request.offset, 2)
            test.eq(binding.request.limit, 1)
            test.eq(result, binding.result)
        end)
    end)
end) }
