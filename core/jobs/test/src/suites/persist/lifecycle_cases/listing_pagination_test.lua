local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local jobs = require("jobs")
local job_fixture = require("job_fixture")

local function fixture()
    local db, err = sql.get("app:db")
    if err or not db then error(tostring(err)) end
    local dialect, type_err = db:type()
    if type_err then error(tostring(type_err)) end
    local owner = uuid.v7()
    local ids, run_ids = {}, {}
    for index = 1, 5 do
        local id, enqueue_err = lifecycle.enqueue_job(db, tostring(dialect), {
            owner_locator = { kind = "thread", id = owner },
            job_type = "test.listing_pagination", payload = {}, parked = true,
            job_identity = { namespace = "listing-pagination", scope = owner, key = tostring(index) },
        })
        if enqueue_err or not id then error(tostring(enqueue_err)) end
        local job, lease_err = job_fixture.lease_own(db, tostring(dialect), id)
        if lease_err or not job then error(tostring(lease_err)) end
        local run, run_err = lifecycle.start_job_run(db, tostring(dialect), job, "listing-pagination", 1)
        if run_err or not run then error(tostring(run_err)) end
        local finalize_err = lifecycle.finalize_job_run(db, tostring(dialect), run, "success", {}, {}, nil)
        if finalize_err then error(tostring(finalize_err)) end
        local complete_err = lifecycle.complete_job(db, job, tostring(dialect), { terminal = true })
        if complete_err then error(tostring(complete_err)) end
        ids[#ids + 1] = id
        run_ids[#run_ids + 1] = run.id
    end
    for _, spec in ipairs({ { "kickside_job", "created_at" }, { "kickside_job_run", "started_at" } }) do
        local _, update_err = sql.builder.update(spec[1]):set(spec[2], "2026-01-01 00:00:00")
            :where(sql.builder.eq({ owner_id = owner })):run_with(db):exec()
        if update_err then error(tostring(update_err)) end
    end
    table.sort(ids, function(a, b) return a > b end)
    table.sort(run_ids, function(a, b) return a > b end)
    return db, owner, ids, run_ids
end

local function cleanup(db, owner)
    local _, release_err = db:release()
    test.is_nil(release_err)
    local page, page_err = jobs.cleanup_thread_page(owner, 0)
    test.is_nil(page_err)
    test.not_nil(page)
    local acknowledged, ack_err = jobs.ack_thread_cleanup_page(owner, 0, true)
    test.is_nil(ack_err)
    test.eq(acknowledged, true)
end

local function define_tests()
    test.describe("Job history keyset continuation", function()
        for _, alias in ipairs({ "absent", "same", "other" }) do
            local stored = alias
            test.it("purges canonical thread-owned jobs and runs with " .. stored .. " thread reference", function()
                local db, owner = fixture()
                if stored ~= "absent" then
                    local reference = stored == "same" and owner or uuid.v7()
                    local _, create_err = sql.builder.insert("kickside_thread")
                        :set_map({ id = reference, component_id = reference, thread_class = "owner-cleanup" })
                        :run_with(db):exec()
                    test.is_nil(create_err)
                    for _, name in ipairs({ "kickside_job", "kickside_job_run" }) do
                        local _, update_err = sql.builder.update(name):set("thread_id", reference)
                            :where(sql.builder.eq({ owner_kind = "thread", owner_id = owner })):run_with(db):exec()
                        test.is_nil(update_err)
                    end
                end
                cleanup(db, owner)
                local verify, connect_err = sql.get("app:db")
                test.is_nil(connect_err)
                if not verify then error("verification database is absent") end
                for _, name in ipairs({ "kickside_job", "kickside_job_run" }) do
                    local rows, read_err = sql.builder.select("id"):from(name)
                        :where(sql.builder.eq({ owner_kind = "thread", owner_id = owner })):run_with(verify):query()
                    test.is_nil(read_err)
                    test.eq(#rows, 0)
                end
                local _, release_err = verify:release()
                test.is_nil(release_err)
            end)
        end
        for _, collection in ipairs({ "jobs", "runs" }) do
            local name = collection
            test.it("pages " .. name .. " in timestamp and id order without repeats", function()
                local db, owner, ids, run_ids = fixture()
                local expected = name == "jobs" and ids or run_ids
                local read = name == "jobs" and jobs.list_jobs or jobs.list_job_runs
                local after = nil
                local received = {}
                for page_no = 1, 3 do
                    local rows, err, more = read({ owner }, nil, 2, after)
                    test.is_nil(err)
                    test.eq(#rows, page_no == 3 and 1 or 2)
                    test.eq(more, page_no < 3)
                    for _, row in ipairs(rows) do received[#received + 1] = row.id end
                    after = { id = rows[#rows].id, owner_id = owner }
                end
                for index, id in ipairs(expected) do test.eq(received[index], id) end
                local empty, empty_err, empty_more = read({ owner }, nil, 2, after)
                test.is_nil(empty_err)
                test.eq(#empty, 0)
                test.eq(empty_more, false)
                cleanup(db, owner)
            end)
            for _, reason in ipairs({ "absent", "foreign", "malformed", "filtered", "spent" }) do
                local why = reason
                test.it("rejects " .. why .. " " .. name .. " positions", function()
                    local db, owner, ids, run_ids = fixture()
                    local expected = name == "jobs" and ids or run_ids
                    local read = name == "jobs" and jobs.list_jobs or jobs.list_job_runs
                    local after = { id = expected[1], owner_id = owner }
                    local scope = { owner }
                    local filters = nil
                    if why == "absent" then after.id = uuid.v7() end
                    if why == "foreign" then scope = { uuid.v7() } end
                    if why == "malformed" then after.id = "invalid-id" end
                    if why == "filtered" then filters = { status = "missing-status" } end
                    if why == "spent" then
                        local page, purge_err = jobs.cleanup_thread_page(owner, 0)
                        test.is_nil(purge_err)
                        test.not_nil(page)
                    end
                    local rows, err = read(scope, filters, 2, after)
                    test.is_nil(rows)
                    test.is_true(errors.is(err, errors.INVALID))
                    cleanup(db, owner)
                end)
            end
            test.it("continues " .. name .. " within a fractional second", function()
                local db, owner, ids, run_ids = fixture()
                local expected = name == "jobs" and ids or run_ids
                local table_name = name == "jobs" and "kickside_job" or "kickside_job_run"
                local field = name == "jobs" and "created_at" or "started_at"
                local _, update_err = sql.builder.update(table_name):set(field, "2026-01-01 00:00:00.123456")
                    :where(sql.builder.eq({ owner_kind = "thread", owner_id = owner })):run_with(db):exec()
                test.is_nil(update_err)
                local read = name == "jobs" and jobs.list_jobs or jobs.list_job_runs
                local first, first_err, more = read({ owner }, nil, 2)
                test.is_nil(first_err)
                test.eq(more, true)
                local second, second_err, second_more = read({ owner }, nil, 2,
                    { id = first[2].id, owner_id = owner })
                test.is_nil(second_err)
                test.eq(#second, 2)
                test.eq(second[1].id, expected[3])
                test.eq(second[2].id, expected[4])
                test.eq(second_more, true)
                cleanup(db, owner)
            end)
            test.it("returns precise " .. name .. " timestamps for cross-scope merging", function()
                local db, owner = fixture()
                local table_name = name == "jobs" and "kickside_job" or "kickside_job_run"
                local field = name == "jobs" and "created_at" or "started_at"
                local _, update_err = sql.builder.update(table_name):set(field, "2026-01-01 00:00:00.123456")
                    :where(sql.builder.eq({ owner_kind = "thread", owner_id = owner })):run_with(db):exec()
                test.is_nil(update_err)
                local read = name == "jobs" and jobs.list_jobs or jobs.list_job_runs
                local rows, err = read({ owner }, nil, 2)
                test.is_nil(err)
                test.is_true(rows[1][field]:find(".123456", 1, true) ~= nil)
                cleanup(db, owner)
            end)
            test.it("orders " .. name .. " by timestamp before the id tie-breaker", function()
                local db, owner, ids, run_ids = fixture()
                local expected = name == "jobs" and ids or run_ids
                local promoted = table.remove(expected)
                table.insert(expected, 1, promoted)
                local _, update_err = sql.builder.update(name == "jobs" and "kickside_job" or "kickside_job_run")
                    :set(name == "jobs" and "created_at" or "started_at", "2026-01-02 00:00:00")
                    :where(sql.builder.eq({ id = promoted })):run_with(db):exec()
                test.is_nil(update_err)
                local read = name == "jobs" and jobs.list_jobs or jobs.list_job_runs
                local after, received = nil, {}
                for _ = 1, 3 do
                    local rows, err = read({ owner }, nil, 2, after)
                    test.is_nil(err)
                    for _, row in ipairs(rows) do received[#received + 1] = row.id end
                    after = { id = rows[#rows].id, owner_id = owner }
                end
                for index, id in ipairs(expected) do test.eq(received[index], id) end
                cleanup(db, owner)
            end)
            for _, value in ipairs({ 0, -1, 0.5 }) do
                local limit = value
                test.it("rejects invalid " .. name .. " page limit " .. tostring(limit), function()
                    local read = name == "jobs" and jobs.list_jobs or jobs.list_job_runs
                    local rows, err = (read :: any)({}, nil, limit)
                    test.is_nil(rows)
                    test.is_true(errors.is(err, errors.INVALID))
                end)
            end
            test.it("reports complete empty " .. name .. " scope", function()
                local read = name == "jobs" and jobs.list_jobs or jobs.list_job_runs
                local rows, err, more = read({}, nil, 2)
                test.is_nil(err)
                test.eq(#rows, 0)
                test.eq(more, false)
            end)
        end
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
