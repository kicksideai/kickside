-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local http = require("http")
local get_kb = require("get_kb")
local list_kb = require("list_kb")
local engines = require("engines")

local function exercise(endpoint, row, failure)
    local status, response
    local engine = { kb_type = "records", store_contract = "test:store", stats_spec = {
        { path = "file_count", singular = "file", plural = "files" },
    } }
    local comp = { success = true, component_id = "records", meta = {
        title = "Records", kb_type = "records", file_count = "20",
    } }
    local instance = endpoint.new({
        http = {
            CONTENT = http.CONTENT, STATUS = http.STATUS,
            request = function() return {
                param = function() return "records" end,
                query = function() return nil end,
            } end,
            response = function() return {
                set_content_type = function() end,
                set_status = function(_, value) status = value end,
                write_json = function(_, value) response = value end,
            } end,
        },
        security = { actor = function() return {} end },
        component = {
            ACCESS = { READ = 1 }, validate_access = function() return true end,
            get_service = function() return { get = function() return comp end } end,
        },
        engines = {
            resolve = function() return engine end, list = function() return {engine} end,
            format_stats = engines.format_stats,
        },
        stores = { open_engine_store = function() return {
            get_store = function() return row, failure end,
        } end },
        listing_page = { collect = function() return {components = {comp}} end },
    })
    instance.handler()
    return status, response
end

local function define_tests()
    test.describe("Knowledge store statistics", function()
        test.it("uses authoritative store statistics in detail and list responses", function()
            for _, endpoint in ipairs({get_kb, list_kb}) do
                local status, response = exercise(endpoint, {stats = {file_count = 2}})
                test.eq(status, 200)
                local item = response.items and response.items[1] or response
                test.eq(item.stat_items[1].value, 2)
            end
        end)
        test.it("retains metadata statistics for stores without a statistics field", function()
            for _, endpoint in ipairs({get_kb, list_kb}) do
                local status, response = exercise(endpoint, {config = {}})
                test.eq(status, 200)
                local item = response.items and response.items[1] or response
                test.eq(item.stat_items[1].value, 20)
            end
        end)
        test.it("reports a missing store without stale detail statistics", function()
            local status = exercise(get_kb, nil, errors.new({kind = errors.NOT_FOUND, message = "Store missing"}))
            test.eq(status, 404)
            local list_status, response = exercise(list_kb, nil, errors.new({kind = errors.NOT_FOUND, message = "Store missing"}))
            test.eq(list_status, 200)
            test.eq(response.items[1].stat_items[1].value, 0)
            test.eq(response.items[1].status, "missing")
        end)
        test.it("preserves store failures in detail and list responses", function()
            for _, endpoint in ipairs({get_kb, list_kb}) do
                local status, response = exercise(endpoint, nil, errors.new({kind = errors.UNAVAILABLE, message = "Store unavailable"}))
                test.eq(status, 503)
                test.is_true(response.error:find("Store unavailable", 1, true) ~= nil)
            end
        end)
    end)
end
return {run = test.run_cases(define_tests)}
