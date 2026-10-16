local test = require("test")
local adapter = require("adapter")
local http = require("http")

local function rows(count)
    local source = {}
    for i = count, 1, -1 do
        source[#source + 1] = { component_id = string.format("kb-%04d", i), impl_id = "fixture:kb",
            meta = { title = "KB " .. i, kb_type = "document", comment = "Catalog fixture" },
            created_at = "2000-01-01T00:00:00Z", updated_at = "2000-01-01T00:00:00Z" }
    end
    return source
end

local function fixture(source, options)
    options = options or {}
    local status, body, parameters
    local reads, broad_reads = 0, 0
    local function query(filter)
        reads = reads + 1
        if not filter.component_ids then broad_reads = broad_reads + 1 end
        if options.late_error and (filter.offset or 0) >= 200 then return nil, options.late_error end
        local selected, ids = {}, nil
        if filter.component_ids then
            ids = {}
            for _, id in ipairs(filter.component_ids) do ids[id] = true end
        end
        for _, row in ipairs(source) do
            if not ids or ids[row.component_id] then selected[#selected + 1] = row end
        end
        local page = {}
        local start = (filter.offset or 0) + 1
        for i = start, math.min(#selected, start + (filter.limit or 50) - 1) do page[#page + 1] = selected[i] end
        return page, nil
    end
    local component_double = { query = query }
    local http_double = {
        CONTENT = http.CONTENT, STATUS = http.STATUS,
        request = function() return { query = function(_, key) return parameters[key] end } end,
        response = function() return {
            set_content_type = function() end,
            set_status = function(_, value) status = value end,
            write_json = function(_, value) body = value end,
        } end,
    }
    local instance = adapter.new({ http = http_double, component = component_double,
        security = { actor = function() return { id = function() return "listing-member" end } end },
        engines = {
            list = function()
                if options.engine_error then return nil, options.engine_error end
                if options.no_engines then return {}, nil end
                return { { impl_id = "fixture:kb", kb_type = "document", stats_spec = {} } }, nil
            end,
            format_stats = function() return {} end,
        },
    })
    return {
        call = function(input)
            parameters, status, body = input or {}, nil, nil
            instance.handler()
            return status, body
        end,
        reads = function() return reads, broad_reads end,
    }
end

local function define_tests()
    test.describe("Knowledge catalog continuation", function()
        test.it("returns the complete ordinary catalog beyond one component page", function()
            local status, body = fixture(rows(205)).call({})
            test.eq(status, 200)
            test.eq(body.count, 205)
            test.eq(body.has_more, false)
            test.is_nil(body.cursor)
        end)
        test.it("finds an older substring match beyond one component page", function()
            local source = rows(205)
            source[#source].meta.title = "Older needle"
            local status, body = fixture(source).call({ q = "NEEDLE" })
            test.eq(status, 200)
            test.eq(body.count, 1)
            test.eq(body.items[1].id, "kb-0001")
            test.eq(body.has_more, false)
        end)
        test.it("pages every matching KB once and reports exhaustion", function()
            local catalog, seen, cursor = fixture(rows(205)), {}, nil
            local total = 0
            for _ = 1, 40 do
                local status, body = catalog.call({ q = "KB", limit = "7", cursor = cursor })
                test.eq(status, 200)
                test.ok(body.count <= 7)
                test.eq(type(body.has_more), "boolean")
                for _, item in ipairs(body.items) do
                    test.is_nil(seen[item.id])
                    seen[item.id] = true
                    total = total + 1
                end
                if not body.has_more then test.is_nil(body.cursor); break end
                test.not_nil(body.cursor)
                cursor = body.cursor
            end
            test.eq(total, 205)
        end)
        test.it("continues beyond the 2000-row response ceiling", function()
            local catalog = fixture(rows(2001))
            local status, body = catalog.call({})
            test.eq(status, 200)
            test.eq(body.count, 2000)
            test.eq(body.has_more, true)
            test.not_nil(body.cursor)
            local last_status, last = catalog.call({ cursor = body.cursor })
            test.eq(last_status, 200)
            test.eq(last.count, 1)
            test.eq(last.items[1].id, "kb-0001")
            test.eq(last.has_more, false)
        end)
        test.it("addresses selected ids exactly and ignores q and limit for those chips", function()
            local catalog = fixture(rows(205))
            local status, body = catalog.call({ ids = "kb-0001,kb-0205,kb-0001", q = "missing", limit = "1" })
            test.eq(status, 200)
            test.eq(body.count, 2)
            local _, broad = catalog.reads()
            test.eq(broad, 0)
            test.eq(body.has_more, false)
        end)
        test.it("batches a selected set larger than one component page without a broad scan", function()
            local source, ids = rows(205), {}
            for _, row in ipairs(source) do ids[#ids + 1] = row.component_id end
            local catalog = fixture(source)
            local status, body = catalog.call({ ids = table.concat(ids, ",") })
            test.eq(status, 200)
            test.eq(body.count, 205)
            local _, broad = catalog.reads()
            test.eq(broad, 0)
        end)
        test.it("does not publish a partial catalog after a later-page failure", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "component store unavailable" })
            local status, body = fixture(rows(205), { late_error = failure }).call({})
            test.eq(status, 503)
            test.eq(body.success, false)
            test.is_nil(body.items)
        end)
        test.it("propagates a discovery failure through the HTTP owner", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "engine catalog unavailable" })
            local status, body = fixture({}, { engine_error = failure }).call({})
            test.eq(status, 503)
            test.eq(body.success, false)
        end)
        test.it("returns no rows without installed engines and never broadens that query", function()
            local catalog = fixture(rows(205), { no_engines = true })
            local status, body = catalog.call({})
            test.eq(status, 200)
            test.eq(body.count, 0)
            test.eq(body.has_more, false)
            local reads = catalog.reads()
            test.eq(reads, 0)
        end)
        test.it("rejects malformed and query-mismatched continuation tokens", function()
            local catalog = fixture(rows(205))
            local status, body = catalog.call({ cursor = "invalid%%%" })
            test.eq(status, 400)
            test.eq(body.success, false)
            local _, first = catalog.call({ q = "KB", limit = "7" })
            test.not_nil(first.cursor)
            local mismatch_status, mismatch = catalog.call({ q = "different", cursor = first.cursor })
            test.eq(mismatch_status, 400)
            test.eq(mismatch.success, false)
        end)
    end)
end
return { run = test.run_cases(define_tests) }
