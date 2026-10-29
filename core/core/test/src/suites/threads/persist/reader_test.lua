-- Threads reader behavior under a real actor, driven through the read HTTP handlers
-- so the component-contract READ check resolves the actor. Covers: event listing
-- with a seq window + type filter, thread-class vocabulary, and that a non-member is
-- denied a per-thread read (the access scoping is the component contract's job, not
-- a SQL join). Runs on SQLite and PostgreSQL.

local test = require("test")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local sql = require("sql")

local THREADS = "kickside.core:threads"
local POST = "app:test_post_message"
local GET = "app:test_get_thread"
local LIST_EVENTS = "app:test_list_events"
local FIND_EXTERNAL = "app:test_find_event_by_external"
local OUTPUT_PUBLISHER = "app:test_output_publisher"

local function define_tests()
    test.describe("Threads Reader", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "tr-owner-" .. suffix
        local stranger = "tr-stranger-" .. suffix

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id, target, args)
            local actor = security.new_actor(user_id, { security_groups = {} })
            return funcs.new()
                :with_actor(actor)
                :with_scope(test_scope())
                :call(target, args)
        end

        local function as_owner(target, args)
            return run_as(owner, target, args)
        end

        local function publish_as_owner(thread_id, event)
            return funcs.new():with_actor(security.new_actor(owner, { security_groups = {} }))
                :with_scope(test_scope()):call(OUTPUT_PUBLISHER, { thread_id = thread_id, event = event })
        end

        -- Open the threads contract framed as the given user.
        local function open_threads(user_id)
            local actor = security.new_actor(user_id, { security_groups = {} })
            local svc, cerr = contract.get(THREADS)
            if cerr or not svc then error("threads contract unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open threads contract failed: " .. tostring(oerr)) end
            return inst
        end

        local function new_thread_with_events(n)
            local created, err = open_threads(owner):create({ thread_class = "tr_" .. suffix })
            if err then error("create failed: " .. tostring(err)) end
            local thread_id = created.thread_id
            for i = 1, n do
                local res, perr = as_owner(POST, { thread_id = thread_id, text = "msg-" .. tostring(i) })
                if perr or not res.ok then error("post failed: " .. tostring(perr or res.error)) end
            end
            return thread_id
        end

        test.it("filters kinds sharing a thread class before applying the list limit", function()
            local threads = open_threads(owner)
            local selected, create_err = threads:upsert({ thread_class = "shared.events",
                impl_id = "app:threads_test_event_kind", external_ref = "selected:" .. suffix, title = "Selected kind" })
            test.is_nil(create_err)
            local other, other_err = threads:upsert({ thread_class = "shared.events",
                external_ref = "other:" .. suffix, title = "Other kind" })
            test.is_nil(other_err)
            local filtered, list_err = threads:list({ thread_class = "shared.events", impl_id = "app:threads_test_event_kind", limit = 1 })
            test.is_nil(list_err)
            test.eq(#filtered.threads, 1)
            test.eq(filtered.threads[1].component_id, selected.thread_id)
            local all, all_err = threads:list({ thread_class = "shared.events" })
            test.is_nil(all_err)
            test.eq(#all.threads, 2)
        end)

        test.it("list_events returns the thread's events newest-first by default", function()
            local thread_id = new_thread_with_events(3)
            local res, err = as_owner(LIST_EVENTS, { thread_id = thread_id })
            test.is_nil(err)
            test.is_true(res.ok)
            test.eq(#res.result.events, 3)
            -- Default order is seq DESC.
            test.is_true(tonumber(res.result.events[1].seq) > tonumber(res.result.events[#res.result.events].seq))
        end)

        test.it("list_events honors a from_seq window", function()
            local thread_id = new_thread_with_events(4)
            local res, err = as_owner(LIST_EVENTS, { thread_id = thread_id, from_seq = 3 })
            test.is_nil(err)
            test.is_true(res.ok)
            test.eq(#res.result.events, 2)
            for _, ev in ipairs(res.result.events) do
                test.is_true(tonumber(ev.seq) >= 3)
            end
        end)

        -- Delete the thread's events at or below through_seq and record the
        -- boundary, as a prune transaction leaves them.
        local function prune_through(thread_id, through_seq)
            local db, db_err = sql.get("app:db")
            if db_err then error(tostring(db_err)) end
            local _, del_err = db:execute("DELETE FROM kickside_event WHERE thread_id = $1 AND seq <= $2", { thread_id, through_seq })
            local _, upd_err = db:execute("UPDATE kickside_thread SET max_pruned_seq = $1 WHERE id = $2", { through_seq, thread_id })
            db:release()
            if del_err or upd_err then error(tostring(del_err or upd_err)) end
        end

        local function page(thread_id, window)
            window.thread_id = thread_id
            local result, err = open_threads(owner):list_events(window)
            if err then error("list_events failed: " .. tostring(err)) end
            return result
        end

        test.it("list_events pages forward with max_pruned_seq and next_seq", function()
            local thread_id = new_thread_with_events(4)
            local result = page(thread_id, { from_seq = 2, limit = 2, ascending = true })
            test.eq(#result.events, 2)
            test.eq(tonumber(result.events[1].seq), 2)
            test.eq(tonumber(result.events[2].seq), 3)
            test.eq(result.max_pruned_seq, 0)
            test.eq(result.next_seq, 4)
            test.is_nil(result.source_gap)

            local tail = page(thread_id, { from_seq = 5, limit = 2, ascending = true })
            test.eq(#tail.events, 0)
            test.eq(tail.next_seq, 5)
        end)

        test.it("list_events reports a source gap for a position below the prune boundary", function()
            local thread_id = new_thread_with_events(5)
            prune_through(thread_id, 2)

            local gap = page(thread_id, { from_seq = 2, limit = 10, ascending = true })
            test.eq(#gap.events, 0)
            test.eq(gap.max_pruned_seq, 2)
            test.not_nil(gap.source_gap)
            test.eq(gap.source_gap.max_pruned_seq, 2)
            test.eq(gap.source_gap.earliest_seq, 3)
            test.eq(gap.next_seq, 2)

            local resumed = page(thread_id, { from_seq = 3, limit = 10, ascending = true })
            test.is_nil(resumed.source_gap)
            test.eq(#resumed.events, 3)
            test.eq(tonumber(resumed.events[1].seq), 3)
            test.eq(resumed.next_seq, 6)
        end)

        test.it("list_events tells a fully pruned thread from a new one", function()
            local pruned_id = new_thread_with_events(3)
            prune_through(pruned_id, 3)
            local pruned = page(pruned_id, { from_seq = 1, limit = 10, ascending = true })
            test.eq(#pruned.events, 0)
            test.eq(pruned.max_pruned_seq, 3)
            test.eq(pruned.source_gap.earliest_seq, 4)
            local after = page(pruned_id, { from_seq = 4, limit = 10, ascending = true })
            test.is_nil(after.source_gap)
            test.eq(#after.events, 0)
            test.eq(after.next_seq, 4)

            local fresh_id = new_thread_with_events(0)
            for _, from in ipairs({ 0, 1 }) do
                local fresh = page(fresh_id, { from_seq = from, limit = 10, ascending = true })
                test.eq(#fresh.events, 0)
                test.eq(fresh.max_pruned_seq, 0)
                test.is_nil(fresh.source_gap)
            end
        end)

        test.it("find_event_by_external matches exact type and nullable version", function()
            local created, create_err = open_threads(owner):create({ thread_class = "tr_external_" .. suffix,
                impl_id = "app:threads_test_event_kind" })
            if create_err then error("create failed: " .. tostring(create_err)) end
            local thread_id = created.thread_id
            for _, event in ipairs({
                { type = "app:threads_test_external", role = "system", body = { version = 1 }, external = {
                    external_source = "reader-test", external_id = "item-1", external_version = "v1",
                } },
                { type = "app:threads_test_external", role = "system", body = { version = 0 }, external = {
                    external_source = "reader-test", external_id = "item-unversioned",
                } },
            }) do
                local appended, append_err = publish_as_owner(thread_id, event)
                if append_err then error("append failed: " .. tostring(append_err)) end
                test.eq(appended.inserted, 1)
            end

            local found, found_err = as_owner(FIND_EXTERNAL, {
                thread_id = thread_id, event_type = "app:threads_test_external",
                external_source = "reader-test", external_id = "item-1", external_version = "v1",
            })
            test.is_nil(found_err)
            test.is_true(found.ok)
            test.eq(found.result.external_version, "v1")

            local wrong_version = assert(as_owner(FIND_EXTERNAL, {
                thread_id = thread_id, event_type = "app:threads_test_external",
                external_source = "reader-test", external_id = "item-1",
            }))
            test.is_true(wrong_version.ok)
            test.is_nil(wrong_version.result)

            local unversioned = assert(as_owner(FIND_EXTERNAL, {
                thread_id = thread_id, event_type = "app:threads_test_external",
                external_source = "reader-test", external_id = "item-unversioned",
            }))
            test.is_true(unversioned.ok)
            test.eq(unversioned.result.external_id, "item-unversioned")
        end)

        test.it("a non-member cannot read the thread", function()
            local thread_id = new_thread_with_events(1)
            -- Owner reads it.
            local owner_res, oerr = as_owner(GET, { thread_id = thread_id })
            test.is_nil(oerr)
            test.is_true(owner_res.ok)

            -- Stranger is denied (no grant); the wrapper surfaces the access error.
            local stranger_res = run_as(stranger, GET, { thread_id = thread_id })
            test.not_nil(stranger_res)
            test.is_false(stranger_res.ok == true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
