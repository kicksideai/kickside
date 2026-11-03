-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local http = require("http")
local get_kb = require("get_kb")
local engines = require("engines")
local stores = require("stores")

local function exercise(row: any, store_contract: string?): (any, any, any)
    local status, response
    local calls = { open = 0, get = 0 }
    local engine = { kb_type = "records", store_contract = store_contract, stats_spec = {
        { path = "document_count", singular = "document", plural = "documents" },
    } }
    local original_resolve, original_open = engines.resolve, stores.open_engine_store
    engines.resolve = function() return engine end
    stores.open_engine_store = function()
        calls.open = calls.open + 1
        return { get_store = function(_, args)
            test.eq(args.component_id, "records")
            calls.get = calls.get + 1
            return row, nil
        end }, nil
    end
    local instance = get_kb.new({
        http = {
            CONTENT = http.CONTENT, STATUS = http.STATUS,
            request = function() return { param = function() return "records" end } end,
            response = function() return {
                set_content_type = function() end,
                set_status = function(_, value) status = value end,
                write_json = function(_, value) response = value end,
            } end,
        },
        security = { actor = function() return {} end },
        component = {
            ACCESS = { READ = 1 }, validate_access = function() return true end,
            get_service = function() return { get = function() return {
                success = true, component_id = "records",
                meta = { title = "Records", kb_type = "records", document_count = "20" },
            } end } end,
        },
    })
    instance.handler()
    engines.resolve, stores.open_engine_store = original_resolve, original_open
    return status, response, calls
end

return { run = test.run_cases(function()
    test.describe("Knowledge detail statistics", function()
        test.it("uses the existing store read for both labels and numeric statistics", function()
            local counters = { node_count = 2, edge_count = 3, embedding_count = 4, document_count = 5,
                concept_count = 6, chunk_count = 7, summary_count = 8, claim_count = 9 }
            local status, response, calls = exercise({ config = { chunk_size = 400 }, stats = counters }, "test:store")
            test.eq(status, 200)
            test.eq(response.stat_items[1].value, 5)
            for name, value in pairs(counters) do test.eq(response[name], value, name) end
            test.eq(response.config.chunk_size, 400)
            test.eq(calls.open, 1)
            test.eq(calls.get, 1)
        end)
        test.it("treats an empty statistics object as zero instead of stale metadata", function()
            local status, response, calls = exercise({ stats = {} }, "test:store")
            test.eq(status, 200)
            test.eq(response.document_count, 0)
            test.eq(response.stat_items[1].value, 0)
            test.eq(calls.get, 1)
        end)
        test.it("retains public statistics when an older store omits the statistics field", function()
            local status, response, calls = exercise({ config = {} }, "test:store")
            test.eq(status, 200)
            test.eq(response.document_count, 20)
            test.eq(response.stat_items[1].value, 20)
            test.eq(calls.get, 1)
        end)
        test.it("does not open a store for an engine without that contract", function()
            local status, response, calls = exercise(nil, nil)
            test.eq(status, 200)
            test.eq(response.document_count, 20)
            test.eq(calls.open, 0)
            test.eq(calls.get, 0)
        end)
    end)
end) }
