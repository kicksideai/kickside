local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local scope = require("component_scope")
local component = require("component")

return { run = test.run_cases(function()
    test.describe("Readable thread scope pages", function()
        test.it("starts the component service at the requested offset and returns its verdict", function()
            local seen: { [string]: any } = {}
            local svc = { list = function(_, args)
                seen = args
                return { components = { { component_id = "page-a" }, { component_id = "page-b" } }, has_more = true }, nil
            end }
            local definition = { with_actor = function(self) return self end,
                with_scope = function(self) return self end, open = function() return svc, nil end }
            local instance = component.new({ contract = { get = function() return definition, nil end },
                security = { actor = function() return {} end, scope = function() return {} end } })
            local ids, err, _, page = instance.list_thread_components(nil, 1, 2, 100)
            test.is_nil(err)
            test.eq(ids[1], "page-a")
            test.eq(ids[2], "page-b")
            test.eq(seen.pagination.offset, 100)
            test.eq(seen.pagination.limit, 2)
            test.eq(page.has_more, true)
            test.eq(page.next_offset, 102)
        end)
        for _, result in ipairs({
            { components = {}, has_more = true },
            { components = {} },
            { components = { { component_id = "a" }, { component_id = "b" }, { component_id = "c" } }, has_more = true },
            { components = { {} }, has_more = false },
        }) do
            local malformed = result
            test.it("refuses malformed component page " .. tostring(#malformed.components) .. ":" .. tostring(malformed.has_more), function()
                local definition = { with_actor = function(self) return self end,
                    with_scope = function(self) return self end,
                    open = function() return { list = function() return malformed, nil end }, nil end }
                local instance = component.new({ contract = { get = function() return definition, nil end },
                    security = { actor = function() return {} end, scope = function() return {} end } })
                local ids, err = instance.list_thread_components(nil, 1, 2, 100)
                test.is_nil(ids)
                test.is_true(errors.is(err, errors.INTERNAL))
            end)
        end
        test.it("returns continuation for component pages including an unmapped page", function()
            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            local component_ids = { uuid.v7(), uuid.v7(), uuid.v7() }
            local thread_id = uuid.v7()
            local _, insert_err = sql.builder.insert("kickside_thread")
                :set_map({ id = thread_id, component_id = component_ids[3], thread_class = "scope-pagination" })
                :run_with(db):exec()
            test.is_nil(insert_err)
            local _, release_err = db:release()
            test.is_nil(release_err)
            local calls = {}
            local instance = scope.new({ component = {
                list_thread_components = function(_, _, limit, offset)
                    calls[#calls + 1] = { limit = limit, offset = offset }
                    local position = offset or 0
                    local ids = {}
                    for i = position + 1, math.min(#component_ids, position + limit) do
                        ids[#ids + 1] = component_ids[i]
                    end
                    return ids, nil, {}, { has_more = position + #ids < #component_ids,
                        next_offset = position + #ids }
                end,
            } })
            local first, first_err = instance.readable_threads({ limit = 2, offset = 0 })
            test.is_nil(first_err)
            test.eq(#first.thread_ids, 0)
            test.eq(first.has_more, true)
            test.eq(first.next_offset, 2)
            local last, last_err = instance.readable_threads({ limit = 2, offset = first.next_offset })
            test.is_nil(last_err)
            test.eq(#last.thread_ids, 1)
            test.eq(last.thread_ids[1], thread_id)
            test.eq(last.has_more, false)
            test.eq(last.next_offset, 3)
            test.eq(calls[2].offset, 2)
        end)
        for _, value in ipairs({ -1, 0.5, "invalid" }) do
            local offset = value
            test.it("rejects invalid scope offset " .. tostring(offset), function()
                local value, err = scope.readable_threads({ limit = 2, offset = offset })
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INVALID))
            end)
        end
        test.it("preserves typed component listing failures", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "scope service unavailable" })
            local instance = scope.new({ component = { list_thread_components = function() return nil, failure end } })
            local value, err = instance.readable_threads({ limit = 2, offset = 0 })
            test.is_nil(value)
            test.eq(err, failure)
        end)
    end)
end) }
