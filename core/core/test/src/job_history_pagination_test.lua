local test = require("test")
local uuid = require("uuid")
local history = require("history")

local function row(id, owner, timestamp, collection)
    local out = { id = id, thread_id = owner }
    out[collection == "runs" and "started_at" or "created_at"] = timestamp
    return out
end

return { run = test.run_cases(function()
    test.describe("Authorized job history pages", function()
        for _, collection in ipairs({ "jobs", "runs" }) do
            local name = collection
            test.it("merges " .. name .. " across every scope page and timestamp shape", function()
                local owner, other = uuid.v7(), uuid.v7()
                local first, second, third = uuid.v7(), uuid.v7(), uuid.v7()
                local calls = {}
                local fixture_jobs = {}
                fixture_jobs[name == "jobs" and "list_jobs" or "list_job_runs"] = function(ids, _, limit, after)
                    calls[#calls + 1] = { ids = ids, limit = limit, after = after }
                    if ids[1] == owner then
                        return { row(third, owner, "2026-01-01 00:00:00", name) }, nil, false
                    end
                    return { row(second, other, "2026-01-01T00:00:00.500000Z", name),
                        row(first, other, "2026-01-01T01:00:00.500001+01:00", name) }, nil, false
                end
                local instance = history.new({ jobs = fixture_jobs,
                    threads_contract = { readable_threads = function(args)
                        if args.offset == 0 then
                            return { thread_ids = { owner }, has_more = true, next_offset = 100 }, nil
                        end
                        test.eq(args.offset, 100)
                        return { thread_ids = { other }, has_more = false, next_offset = 101 }, nil
                    end },
                })
                local result, err = instance.list(name, {}, 2, nil)
                test.is_nil(err)
                test.eq(result.rows[1].id, first)
                test.eq(result.rows[2].id, second)
                test.eq(result.has_more, true)
                test.not_nil(result.cursor)
                test.eq(#calls, 2)
                test.eq(calls[1].limit, 3)
            end)
            test.it("returns a complete empty " .. name .. " page after unmapped scope pages", function()
                local calls = 0
                local instance = history.new({ jobs = {}, threads_contract = { readable_threads = function(args)
                    calls = calls + 1
                    return { thread_ids = {}, has_more = args.offset == 0, next_offset = args.offset + 100 }, nil
                end } })
                local result, err = instance.list(name, {}, 2, nil)
                test.is_nil(err)
                test.eq(#result.rows, 0)
                test.eq(result.has_more, false)
                test.is_nil(result.cursor)
                test.eq(calls, 2)
            end)
            test.it("reauthorizes " .. name .. " anchor owners before any Jobs query", function()
                local id, owner = uuid.v7(), uuid.v7()
                local cursor = "v1:" .. name .. ":" .. id .. ":" .. owner
                local instance = history.new({ jobs = {}, thread_resource = { find = function(args)
                    test.eq(args.thread_id, owner)
                    return nil, nil
                end }, threads_contract = { readable_threads = function() error("scope read after refused anchor") end } })
                local result, err = instance.list(name, {}, 2, cursor)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
            end)
            test.it("deduplicates authorized " .. name .. " anchor-owner rows across scopes", function()
                local id, owner, other = uuid.v7(), uuid.v7(), uuid.v7()
                local repeated, newer = uuid.v7(), uuid.v7()
                local read = function(ids, _, _, after)
                    test.eq(after.id, id)
                    test.eq(after.owner_id, owner)
                    test.eq(ids[#ids], owner)
                    local rows = { row(repeated, owner, "2026-01-01 00:00:00", name) }
                    if ids[1] == other then rows[#rows + 1] = row(newer, other, "2026-01-01 00:00:01", name) end
                    return rows, nil, false
                end
                local instance = history.new({ jobs = { list_jobs = read, list_job_runs = read },
                    thread_resource = { find = function() return { id = owner }, nil end },
                    threads_contract = { readable_threads = function(args)
                        return { thread_ids = args.offset == 0 and { owner } or { other },
                            has_more = args.offset == 0, next_offset = args.offset + 100 }, nil
                    end },
                })
                local result, err = instance.list(name, {}, 3, "v1:" .. name .. ":" .. id .. ":" .. owner)
                test.is_nil(err)
                test.eq(#result.rows, 2)
                test.eq(result.rows[1].id, newer)
                test.eq(result.rows[2].id, repeated)
                test.eq(result.has_more, false)
                test.is_nil(result.cursor)
            end)
            test.it("uses ids to break equal " .. name .. " timestamps", function()
                local owner, a, b = uuid.v7(), uuid.v7(), uuid.v7()
                local ids = { a, b }
                table.sort(ids, function(x, y) return x > y end)
                local read = function()
                    return { row(ids[2], owner, "2026-01-01 00:00:00", name),
                        row(ids[1], owner, "2026-01-01T00:00:00Z", name) }, nil, false
                end
                local instance = history.new({ jobs = { list_jobs = read, list_job_runs = read },
                    threads_contract = { readable_threads = function()
                        return { thread_ids = { owner }, has_more = false, next_offset = 1 }, nil
                    end },
                })
                local result, err = instance.list(name, {}, 1)
                test.is_nil(err)
                test.eq(result.rows[1].id, ids[1])
                test.eq(result.cursor, "v1:" .. name .. ":" .. ids[1] .. ":" .. owner)
            end)
        end
        for _, value in ipairs({ "invalid", "v2:jobs:id:owner", "v1:runs:" .. uuid.v7() .. ":" .. uuid.v7(),
                "v1:jobs:invalid:" .. uuid.v7(), "v1:jobs:" .. uuid.v7() .. ":invalid" }) do
            local cursor = value
            test.it("rejects malformed or cross-collection cursor " .. cursor, function()
                local instance = history.new({ jobs = {}, threads_contract = {} })
                local result, err = instance.list("jobs", {}, 2, cursor)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
            end)
        end
        for _, stage in ipairs({ "scope", "anchor", "rows" }) do
            local boundary = stage
            test.it("preserves typed " .. boundary .. " failures", function()
                local failure = errors.new({ kind = errors.UNAVAILABLE, message = "history unavailable" })
                local owner = uuid.v7()
                local instance = history.new({
                    thread_resource = { find = function() return nil, failure end },
                    threads_contract = { readable_threads = function()
                        if boundary == "scope" then return nil, failure end
                        return { thread_ids = { owner }, has_more = false, next_offset = 1 }, nil
                    end }, jobs = { list_jobs = function() return nil, failure end },
                })
                local cursor = boundary == "anchor" and ("v1:jobs:" .. uuid.v7() .. ":" .. owner) or nil
                local result, err = instance.list("jobs", {}, 2, cursor)
                test.is_nil(result)
                test.eq(err, failure)
            end)
        end
        test.it("reads rows beyond the former five-thousand-thread cutoff", function()
            local owner, id = uuid.v7(), uuid.v7()
            local calls = 0
            local instance = history.new({ jobs = { list_jobs = function()
                return { row(id, owner, "2026-01-01 00:00:00", "jobs") }, nil, false
            end }, threads_contract = { readable_threads = function(args)
                calls = calls + 1
                return { thread_ids = args.offset == 5000 and { owner } or {},
                    has_more = args.offset < 5000, next_offset = args.offset + 100 }, nil
            end } })
            local result, err = instance.list("jobs", {}, 2)
            test.is_nil(err)
            test.eq(result.rows[1].id, id)
            test.eq(calls, 51)
            test.eq(result.has_more, false)
        end)
        test.it("refuses a scope page that does not advance", function()
            local instance = history.new({ jobs = {}, threads_contract = { readable_threads = function()
                return { thread_ids = {}, has_more = true, next_offset = 0 }, nil
            end } })
            local result, err = instance.list("jobs", {}, 2)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL))
        end)
        test.it("refuses malformed stored timestamps", function()
            local owner = uuid.v7()
            local instance = history.new({ jobs = { list_jobs = function()
                return { row(uuid.v7(), owner, "invalid", "jobs") }, nil, false
            end }, threads_contract = { readable_threads = function()
                return { thread_ids = { owner }, has_more = false, next_offset = 1 }, nil
            end } })
            local result, err = instance.list("jobs", {}, 2)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL))
        end)
    end)
end) }
