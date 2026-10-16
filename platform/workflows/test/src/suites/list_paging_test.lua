local test = require("test")
local repo = require("workflow_repo")

local function fixture_rows()
    local rows = {}
    for i = 1, 205 do
        rows[i] = { component_id = string.format("listing-%03d", i),
            meta = { title = "Workflow " .. i }, created_at = "2000-01-01T00:00:00Z",
            updated_at = "2000-01-01T00:00:00Z" }
    end
    table.sort(rows, function(a, b) return a.component_id > b.component_id end)
    return rows
end

local function query_page(rows, filter)
    local page = {}
    local start = (filter.offset or 0) + 1
    for i = start, math.min(#rows, start + filter.limit - 1) do page[#page + 1] = rows[i] end
    return page, nil
end

local function define_tests()
    local original
    test.describe("Complete workflow listing", function()
        test.before_each(function() original = repo._component_query end)
        test.after_each(function() repo._component_query = original end)
        test.it("returns location enrichment failure without partial success", function()
            local original_enrich = repo.enrich_locations
            repo._component_query = function(filter) return query_page(fixture_rows(), filter) end
            repo.enrich_locations = function() return false, errors.new({ kind = errors.UNAVAILABLE, message = "location read fails" }) end
            local result, err = repo.list({limit = 1})
            repo.enrich_locations = original_enrich
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:message(), "location read fails")
        end)
        test.it("reads only one bounded component page per request", function()
            local source = fixture_rows()
            local calls = 0
            repo._component_query = function(filter)
                calls = calls + 1
                test.eq(filter.limit, 3)
                test.eq(filter.offset, 3)
                return query_page(source, filter)
            end
            local rows, err, next_offset = repo.list({limit = 2, offset = 3})
            test.is_nil(err)
            test.eq(calls, 1)
            test.eq(#rows, 2)
            test.eq(next_offset, 5)
            local seen = {}
            for _, row in ipairs(rows) do seen[row.id] = true end
            test.is_true(seen["listing-202"])
            test.is_true(seen["listing-201"])
            test.is_nil(seen["listing-200"])
        end)
        test.it("includes workflows beyond the first component page", function()
            local source = fixture_rows()
            repo._component_query = function(filter) return query_page(source, filter) end
            local rows = {}
            local offset = 0
            repeat
                local page, err, next_offset = repo.list({offset = offset})
                test.is_nil(err)
                test.is_true(#page <= 25)
                for _, row in ipairs(page) do rows[#rows + 1] = row end
                if next_offset then test.is_true(next_offset > offset) end
                offset = next_offset
            until offset == nil
            test.eq(#rows, #source)
            local seen = {}
            for _, row in ipairs(rows) do seen[row.id] = true end
            test.is_true(seen["listing-001"])
            test.is_true(seen["listing-205"])
        end)
        test.it("orders tied workflow timestamps by descending id", function()
            local source = fixture_rows()
            repo._component_query = function(filter) return query_page(source, filter) end
            local rows, err = repo.list()
            test.is_nil(err)
            for i = 2, #rows do test.ok(rows[i - 1].id > rows[i].id) end
        end)
        test.it("returns a later-page failure instead of an incomplete list", function()
            local source = fixture_rows()
            repo._component_query = function(filter)
                if (filter.offset or 0) > 0 then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "component store unavailable" }) end
                return query_page(source, filter)
            end
            local first, first_err, next_offset = repo.list()
            test.is_nil(first_err)
            test.eq(#first, 25)
            test.eq(next_offset, 25)
            local rows, err = repo.list({offset = next_offset})
            test.is_nil(rows)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:message(), "component store unavailable")
        end)
    end)
end
return { run = test.run_cases(define_tests) }
