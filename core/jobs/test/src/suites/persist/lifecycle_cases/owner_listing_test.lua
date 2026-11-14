local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")
local jobs = require("jobs")

local function define_tests()
    test.describe("Thread owner job listings", function()
        test.it("pages component-owned slots completely and excludes foreign owner locators", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local owner, foreign = uuid.v7(), uuid.v7()
            local expected = {}
            for index = 1, 7 do
                local locator = index <= 5 and {kind = "component", id = owner}
                    or (index == 6 and {kind = "component", id = foreign} or {kind = "thread", id = owner})
                local id = assert(lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = locator, job_type = "test.owner_page", payload = {}, slot = true, parked = true,
                    job_identity = {namespace = "owner-page", scope = owner, key = tostring(index)},
                }))
                if index <= 5 then expected[#expected + 1] = id end
            end
            -- Equal timestamps exercise the id tie breaker on both engines.
            assert(db:execute("UPDATE kickside_job SET created_at='2026-01-01 00:00:00' WHERE owner_id IN ($1,$2)", {owner, foreign}))
            table.sort(expected, function(a, b) return a > b end)
            local locator = {kind = "component", id = owner}
            local after, received = nil, {}
            for page = 1, 3 do
                local rows, err, more = jobs.list_owner_jobs(locator, nil, 2, after)
                test.is_nil(err, tostring(err))
                test.eq(#rows, page < 3 and 2 or 1)
                test.eq(more, page < 3)
                for _, row in ipairs(rows) do
                    test.eq(row.owner_kind, "component")
                    test.eq(row.owner_id, owner)
                    test.is_true(row.slot)
                    received[#received + 1] = row.id
                end
                after = {id = rows[#rows].id, owner_id = owner}
            end
            for i, id in ipairs(expected) do test.eq(received[i], id) end
            local empty, err, more = jobs.list_owner_jobs(locator, nil, 2, after)
            test.is_nil(err)
            test.eq(#empty, 0)
            test.is_false(more)
            for _, other in ipairs({{kind = "component", id = foreign}, {kind = "thread", id = owner}}) do
                local rows, position_err = jobs.list_owner_jobs(other, nil, 2, after)
                test.is_nil(rows)
                test.is_true(errors.is(position_err, errors.INVALID))
            end
            local threads = assert(jobs.list_jobs({owner}, nil, 2))
            test.eq(#threads, 1)
            test.eq(threads[1].owner_kind, "thread")
            for _, bad in ipairs({{}, {kind = "component"}, {kind = "", id = owner}}) do
                local rows, invalid_err = jobs.list_owner_jobs(bad, nil, 2)
                test.is_nil(rows)
                test.is_true(errors.is(invalid_err, errors.INVALID))
            end
            local rows, limit_err = jobs.list_owner_jobs(locator, nil, 0)
            test.is_nil(rows)
            test.is_true(errors.is(limit_err, errors.INVALID))
            assert(db:execute("DELETE FROM kickside_job WHERE owner_id IN ($1,$2)", {owner, foreign}))
            db:release()
        end)

        test.it("distinguishes parked slots from due, scheduled and stranded work", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local owner = uuid.v7()
            local before = assert(jobs.health())
            local specs = {
                {key = "idle", slot = true, parked = true, due = false},
                {key = "due", slot = true, scheduled_at = "2000-01-01T00:00:00Z", due = true},
                {key = "scheduled", slot = false, scheduled_at = "2099-01-01T00:00:00Z", due = false},
                {key = "stranded", slot = false, parked = true, due = false},
            }
            local expected, ids = {}, {}
            for _, spec in ipairs(specs) do
                local id = assert(lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = {kind = "thread", id = owner},
                    job_type = "test.owner_listing", payload = {},
                    job_identity = {namespace = "owner-listing", scope = owner, key = spec.key},
                    slot = spec.slot, parked = spec.parked, scheduled_at = spec.scheduled_at,
                }))
                expected[id], ids[#ids + 1] = spec, id
                if spec.key == "stranded" then
                    assert(db:execute("UPDATE kickside_job SET last_error=$1 WHERE id=$2", {"worker output invalid", id}))
                end
            end
            local rows, read_err = jobs.list_jobs({owner}, {status = "pending"}, 100)
            test.is_nil(read_err)
            test.eq(#rows, 4)
            local due_count, idle_count = 0, 0
            for _, row in ipairs(rows) do
                local spec = expected[row.id]
                test.not_nil(spec)
                test.eq(row.status, "pending")
                test.eq(row.slot, spec.slot)
                test.eq(row.due, spec.due)
                test.eq(row.scheduled_at ~= nil, spec.scheduled_at ~= nil)
                if row.due then due_count = due_count + 1 end
                if row.slot and row.scheduled_at == nil then idle_count = idle_count + 1 end
                if spec.key == "stranded" then test.eq(row.last_error, "worker output invalid") end
            end
            test.eq(due_count, 1)
            test.eq(idle_count, 1)
            local exact = assert(jobs.get_jobs(ids))
            for id, spec in pairs(expected) do
                test.eq(exact[id].slot, spec.slot)
                test.eq(exact[id].due, spec.due)
                local single = assert(jobs.get_job(id))
                test.eq(single.slot, spec.slot)
                test.eq(single.due, spec.due)
            end
            local after = assert(jobs.health())
            test.eq(after.due_unclaimed_count, before.due_unclaimed_count + due_count)
            test.eq(after.failed_slots, before.failed_slots)
            local stranded = {}
            for _, issue in ipairs(after.issues) do
                if issue.code == "stranded_jobs" then
                    for _, id in ipairs(issue.job_ids) do stranded[id] = true end
                end
            end
            for id, spec in pairs(expected) do test.eq(stranded[id] == true, spec.key == "stranded") end
            assert(db:execute("DELETE FROM kickside_job WHERE owner_kind='thread' AND owner_id=$1", {owner}))
            test.is_nil(select(2, db:release()))
        end)

        test.it("lists canonical thread-owned jobs and runs without a stored thread_id", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype, type_err = db:type()
            test.is_nil(type_err)
            local owner = uuid.v7()
            local owned_id = ""
            local other_owned_id = ""
            for _, locator in ipairs({
                { kind = "thread", id = owner },
                { kind = "thread", id = uuid.v7() },
                { kind = "test", id = owner },
            }) do
                local id, enqueue_err = lifecycle.enqueue_job(db, tostring(dbtype), {
                    owner_locator = locator,
                    job_type = "test.owner_listing",
                    payload = {}, parked = true,
                    job_identity = { namespace = "owner-listing", scope = locator.id, key = locator.kind },
                })
                if not id then error("test job enqueue fails: " .. tostring(enqueue_err)) end
                test.is_nil(enqueue_err)
                if locator.kind == "thread" and locator.id == owner then owned_id = id end
                if locator.kind == "test" then other_owned_id = id end
                local job, lease_err = job_fixture.lease_own(db, tostring(dbtype), id)
                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.is_nil(job.thread_id)
                local run, run_err = lifecycle.start_job_run(db, tostring(dbtype), job, "owner-listing", 1)
                test.is_nil(run_err)
                test.not_nil(run)
            end
            local jobs, jobs_err = lifecycle.list_jobs(db, { owner }, nil, 100)
            test.is_nil(jobs_err)
            test.eq(#jobs, 1)
            test.eq(jobs[1].id, owned_id)
            test.eq(jobs[1].thread_id, owner)
            test.eq(jobs[1].slot, false)
            test.eq(jobs[1].due, false)
            local filtered, filtered_err = lifecycle.list_jobs(db, { owner }, { thread_id = owner }, 100)
            test.is_nil(filtered_err)
            test.eq(#filtered, 1)
            local runs, runs_err = lifecycle.list_job_runs(db, { owner }, { job_id = owned_id, thread_id = owner }, 100)
            test.is_nil(runs_err)
            test.eq(#runs, 1)
            test.eq(runs[1].job_id, owned_id)
            test.eq(runs[1].thread_id, owner)
            local absent, absent_err = lifecycle.list_job_runs(db, { uuid.v7() }, nil, 100)
            test.is_nil(absent_err)
            test.eq(#absent, 0)
            local exact, exact_err = lifecycle.get_job(db, other_owned_id)
            test.is_nil(exact_err)
            test.eq(exact.id, other_owned_id)
            test.eq(exact.owner_kind, "test")
            test.eq(exact.owner_id, owner)
            local missing, missing_err = lifecycle.get_job(db, uuid.v7())
            test.is_nil(missing_err)
            test.is_nil(missing)
            local _, release_err = db:release()
            test.is_nil(release_err)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
