-- Threads binding integration. Drives the kickside.core:threads contract under real
-- actors through contract.get():with_actor():with_scope():open() so the component
-- contract resolves the acting actor: create registers a component (visible via a
-- kickside_components row), list is access-filtered to the owner, a non-member is
-- excluded, upsert is idempotent on a natural key, and a registered
-- projection is removed via its rollback. Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local json = require("json")
local cursor_waiters = require("cursor_waiters")
local time = require("time")

local DB = "app:db"
local THREADS = "kickside.core:threads"

local CREATE = "create"
local FIND = "find"
local LOCATE = "upsert"
local UPDATE = "update"
local DELETE = "delete"
local LIST = "list"
local LIST_EVENTS = "list_events"
local FIND_EXTERNAL = "find_event_by_external"
local APPEND_EVENTS = "append_events"
local APPEND_EVENT = "append_event"
local EMIT = "emit"
local LIST_CHILDREN = "list_children"
local LIST_EDGES = "list_edges"
local LIST_CLASSES = "list_classes"
local REGISTER_PROJECTION = "register_projection"
local LIST_PROJECTIONS = "list_projections"
local CATCH_UP_PROJECTION = "catch_up_projection"
local PAUSE_PROJECTION = "pause_projection"
local RESUME_PROJECTION = "resume_projection"
local REMOVE_PROJECTION = "remove_projection"
local TEST_WORKER = "app:test_count_worker"
local PROCESS_SCOPE = "wippy.security:process"

local fixture = require("fixture")

local function define_tests()
    test.describe("Threads Contract", function()
        local context = fixture.new()
        local suffix, owner, stranger = context.suffix, context.owner, context.stranger
        local test_scope = context.test_scope
        local run_as = context.run_as
        local as_owner = context.as_owner
        local component_id_of = context.component_id_of
        local component_row_exists = context.component_row_exists
        local component_meta = context.component_meta
        local register_bare_component = context.register_bare_component
        local projection_count = context.projection_count
        local projection_body_of = context.projection_body_of
        local set_private_context_raw = context.set_private_context_raw
        local private_context_raw = context.private_context_raw
        local insert_orphan_thread = context.insert_orphan_thread
        local event_type_count = context.event_type_count
        local delete_thread_only = context.delete_thread_only
        local thread_ids = context.thread_ids
        local index_of = context.index_of

        test.it("pages the global class vocabulary with an exclusive cursor", function()
            local prefix = "paging_" .. suffix .. "_"
            for _, ending in ipairs({ "a", "a", "b", "c" }) do
                local _, err = as_owner(CREATE, { thread_class = prefix .. ending })
                test.is_nil(err)
            end
            local first, first_err = run_as(stranger, LIST_CLASSES, { limit = 2, cursor = prefix })
            test.is_nil(first_err)
            test.eq(#first.classes, 2)
            test.eq(first.classes[1], prefix .. "a")
            test.eq(first.classes[2], prefix .. "b")
            test.eq(first.next_cursor, prefix .. "b")
            local second, second_err = run_as(stranger, LIST_CLASSES, { limit = 2, cursor = first.next_cursor })
            test.is_nil(second_err)
            test.eq(second.classes[1], prefix .. "c")
            test.is_true(#second.classes <= 2)
            local empty, empty_err = as_owner(LIST_CLASSES, { limit = 2, cursor = "zzzzzzzz" })
            test.is_nil(empty_err)
            test.eq(#empty.classes, 0)
            test.is_nil(empty.next_cursor)
        end)

        test.it("validates class paging before reading", function()
            for _, args in ipairs({ {limit = 0}, {limit = 1001}, {limit = "2"}, {cursor = 4} }) do
                local result, err = as_owner(LIST_CLASSES, args)
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.INVALID))
            end
        end)

        test.it("keeps a registered cursor waiter through partial commits", function()
            local cursor_id = uuid.v7()
            local waiter, begin_err = cursor_waiters.begin_wait(cursor_id, 2, 10000)
            test.is_nil(begin_err)
            test.not_nil(waiter)

            local _, first_err = cursor_waiters.notify_cursor(cursor_id, 1, "active")
            test.is_nil(first_err)
            local first, first_timed_out, first_wait_err = cursor_waiters.wait_until_reached(waiter :: table)
            test.is_nil(first_wait_err)
            test.is_false(first_timed_out)
            test.eq(first.kind, "changed")
            test.eq(tonumber(first.last_seq), 1)

            local _, second_err = cursor_waiters.notify_cursor(cursor_id, 2, "active")
            test.is_nil(second_err)
            local second, second_timed_out, second_wait_err = cursor_waiters.wait_until_reached(waiter :: table)
            test.is_nil(second_wait_err)
            test.is_false(second_timed_out)
            test.eq(tonumber(second.last_seq), 2)
            cursor_waiters.close_wait(waiter :: table)
        end)

        test.it("completes a frozen cursor checkpoint when a peer commits beyond it", function()
            local id = uuid.v7()
            local waiter, begin_err = cursor_waiters.begin_wait(id, 2, 10000)
            test.is_nil(begin_err)
            local _, notify_err = cursor_waiters.notify_cursor(id, 5, "active")
            test.is_nil(notify_err)
            local result, timed_out, wait_err = cursor_waiters.wait_until_reached(waiter :: table)
            test.is_nil(wait_err)
            test.is_false(timed_out)
            test.eq(tonumber(result.last_seq), 5)
            cursor_waiters.close_wait(waiter :: table)
        end)

        test.it("rejects malformed numeric read options at the contract boundary", function()
            local created = as_owner(CREATE, { thread_class = "ct_numeric_" .. suffix })
            local thread_id = created.thread_id

            local function assert_invalid(method: string, args: table, expected: string)
                local result, err = as_owner(method, args)
                test.is_nil(result)
                test.not_nil(err)
                test.contains(tostring(err), expected)
            end

            assert_invalid(LIST, { limit = "10" }, "limit must be an integer")
            assert_invalid(LIST, { limit = 1.5 }, "limit must be an integer")
            assert_invalid(LIST, { limit = 1001 }, "limit must be <= 1000")
            assert_invalid(LIST_EVENTS, { thread_id = thread_id, before = "3" }, "before must be an integer")
            assert_invalid(LIST_EVENTS, { thread_id = thread_id, from_seq = -1 }, "from_seq must be >= 0")
            assert_invalid(LIST_EVENTS, { thread_id = thread_id, ascending = "true" }, "ascending must be a boolean")
            assert_invalid(LIST_CHILDREN, { thread_id = thread_id, limit = 0 }, "limit must be >= 1")
            assert_invalid(LIST_EDGES, { thread_id = thread_id, limit = 1001 }, "limit must be <= 1000")
            assert_invalid(LIST_PROJECTIONS, { thread_id = thread_id, limit = 2.5 }, "limit must be an integer")
            assert_invalid(CATCH_UP_PROJECTION, { thread_id = thread_id, kind = "x", max_ticks = 0 }, "max_ticks must be >= 1")
        end)

        test.it("find resolves the owner's thread and is nil for a non-member", function()
            local created = as_owner(CREATE, { thread_class = "ct_find_" .. suffix })
            local thread_id = created.thread_id

            local found, ferr = as_owner(FIND, { thread_id = thread_id })
            test.is_nil(ferr)
            test.not_nil(found)
            test.eq(found.id, thread_id)

            local stranger_found, sferr = run_as(stranger, FIND, { thread_id = thread_id })
            test.is_nil(sferr)
            test.is_nil(stranger_found)
        end)

        test.it("upsert is idempotent on (thread_class, external_ref)", function()
            local cls = "ct_upsert_" .. suffix
            local ext = "ext-" .. uuid.v4():sub(1, 8)

            local first, ferr = as_owner(LOCATE, { thread_class = cls, external_ref = ext })
            test.is_nil(ferr)
            test.not_nil(first)
            test.is_true(first.created == true)

            local second, serr = as_owner(LOCATE, { thread_class = cls, external_ref = ext })
            test.is_nil(serr)
            test.not_nil(second)
            test.is_false(second.created == true)
            test.eq(second.thread_id, first.thread_id)
        end)

        test.it("upsert is idempotent on an explicit thread_id", function()
            local tid = uuid.v4()

            local first, ferr = as_owner(LOCATE, { thread_id = tid, thread_class = "ct_explicit_" .. suffix })
            test.is_nil(ferr)
            test.not_nil(first)
            test.is_true(first.created == true)
            test.eq(first.thread_id, tid)

            local second, serr = as_owner(LOCATE, { thread_id = tid, thread_class = "ct_explicit_" .. suffix })
            test.is_nil(serr)
            test.not_nil(second)
            test.is_false(second.created == true, "a repeat upsert by the same thread_id must not create a duplicate")
            test.eq(second.thread_id, tid)
        end)

        test.it("upsert heals a component-only partial thread", function()
            local tid = uuid.v4()

            local first, ferr = as_owner(CREATE, {
                id = tid,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
            })
            test.is_nil(ferr)
            test.not_nil(first)
            test.eq(first.thread_id, tid)
            test.not_nil(component_row_exists(tid))

            delete_thread_only(tid)
            local missing, merr = as_owner(FIND, { thread_id = tid })
            test.is_nil(merr)
            test.is_nil(missing)

            local healed, herr = as_owner(LOCATE, {
                thread_id = tid,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
            })
            test.is_nil(herr)
            test.not_nil(healed)
            test.eq(healed.thread_id, tid)
            test.is_true(healed.created == true)
            test.eq(component_id_of(tid), tid)
            test.is_true(projection_count(tid) >= 1)
        end)

        test.it("reaches and exits every declared thread lifecycle state through the contract", function()
            for _, state in ipairs({ "open", "closed", "archived", "error" }) do
                local created, create_err = as_owner(CREATE, { title = "Lifecycle " .. state })
                test.is_nil(create_err)
                test.eq(created.thread.state, "open")
                local entered, enter_err = as_owner(UPDATE, { thread_id = created.thread_id, state = state })
                test.is_nil(enter_err)
                test.eq(entered.thread.state, state)
                local visible, read_err = as_owner(FIND, { thread_id = created.thread_id })
                test.is_nil(read_err)
                test.eq(visible.state, state)
                local next_state = state == "open" and "closed" or "open"
                local exited, exit_err = as_owner(UPDATE, { thread_id = created.thread_id, state = next_state })
                test.is_nil(exit_err)
                test.eq(exited.thread.state, next_state)
                local removed, remove_err = as_owner(DELETE, { thread_id = created.thread_id })
                test.is_nil(remove_err)
                test.is_true(removed.deleted)
                local absent, absent_err = as_owner(FIND, { thread_id = created.thread_id })
                test.is_nil(absent_err)
                test.is_nil(absent)
                test.is_nil(component_row_exists(created.thread_id))
            end
        end)

        test.it("update patches state and a non-member cannot", function()
            local created = as_owner(CREATE, { thread_class = "ct_update_" .. suffix })
            local thread_id = created.thread_id

            local updated, uerr = as_owner(UPDATE, { thread_id = thread_id, state = "closed" })
            test.is_nil(uerr)
            test.not_nil(updated)
            test.eq(updated.thread.state, "closed")

            local _, serr = run_as(stranger, UPDATE, { thread_id = thread_id, state = "open" })
            test.not_nil(serr)
        end)

        test.it("register_projection then remove via its rollback", function()
            local created = as_owner(CREATE, { thread_class = "ct_proj_" .. suffix })
            local thread_id = created.thread_id

            local reg, rerr = as_owner(REGISTER_PROJECTION, {
                thread_id = thread_id,
                kind = "count",
                worker_ref = "func://" .. TEST_WORKER,
            })
            test.is_nil(rerr)
            test.not_nil(reg)
            test.not_nil(reg.projection_id)
            test.not_nil(reg.rollback)
            test.eq(reg.rollback.method, "remove_projection")

            local removed, remerr = as_owner(REMOVE_PROJECTION, (reg.rollback.args :: any))
            test.is_nil(remerr)
            test.not_nil(removed)
            test.eq(removed.projection_id, reg.projection_id)
        end)

        test.it("register_projection validates worker_ref before writing", function()
            local created = as_owner(CREATE, { thread_class = "ct_proj_validate_" .. suffix })
            local thread_id = created.thread_id

            local _, scheme_err = as_owner(REGISTER_PROJECTION, {
                thread_id = thread_id,
                kind = "count",
                worker_ref = TEST_WORKER,
            })
            test.not_nil(scheme_err)

            local _, missing_err = as_owner(REGISTER_PROJECTION, {
                thread_id = thread_id,
                kind = "count",
                worker_ref = "func://kickside.core.projections:no_such_worker",
            })
            test.not_nil(missing_err)
        end)

        test.it("list_projections reads empty for a never-emitted (lazy) thread", function()
            -- A component whose primary thread was never created (no emit yet) has no
            -- thread row; listing its projections must read as empty, not surface a
            -- "thread not found" error to the caller (inbox/skills/knowledge reads).
            local res, err = as_owner(LIST_PROJECTIONS, { thread_id = uuid.v4() })
            test.is_nil(err)
            test.not_nil(res)
            test.eq(#res.projections, 0)
            test.eq(#res.cursors, 0)
        end)

        -- A synchronous consumer waits on the projection slot only until its own
        -- deadline (a round's work deadline), then gets a retriable failure.
        local function lagging_projection(label: string): string
            local thread_id = uuid.v4()
            local _, create_err = as_owner(CREATE, { id = thread_id,
                impl_id = "kickside.test.threads:thread_kind", thread_class = "ct_deadline_" .. label .. "_" .. suffix })
            test.is_nil(create_err)
            -- The idle debounce holds the slot well past every deadline below.
            local _, register_err = as_owner(REGISTER_PROJECTION, {
                thread_id = thread_id, kind = "count", projection_key = "deadline", cursor_key = "default",
                worker_ref = "func://" .. TEST_WORKER, debounce_idle_ms = 600000, debounce_max_ms = 600000,
            })
            test.is_nil(register_err)
            local _, append_err = as_owner(APPEND_EVENT, { thread_id = thread_id,
                event = { type = "kickside.test.threads:trigger", role = "user", body = {} } })
            test.is_nil(append_err)
            return thread_id
        end

        local function utc_after(ms: integer): string
            return time.now():add(ms * time.MILLISECOND):utc():format(time.RFC3339)
        end

        test.it("ends a catch-up wait at the caller's deadline with a retriable failure", function()
            local thread_id = lagging_projection("future")
            local started = time.now()
            local result, err = as_owner(CATCH_UP_PROJECTION, { thread_id = thread_id, kind = "count",
                max_ticks = 1000, deadline = utc_after(2000) })
            local waited_ms = math.floor((time.now():sub(started) :: any):milliseconds())
            test.is_nil(result)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.UNAVAILABLE)
            test.is_true((err :: any):retryable(), "a deadline is a retriable outcome")
            test.contains(tostring(err), "deadline")
            test.is_true(waited_ms < 10000, "the wait ends at the deadline, not the tick bound: " .. tostring(waited_ms))
        end)

        test.it("refuses a catch-up whose deadline has already passed without waiting", function()
            local thread_id = lagging_projection("past")
            local result, err = as_owner(CATCH_UP_PROJECTION, { thread_id = thread_id, kind = "count",
                deadline = utc_after(-1000) })
            test.is_nil(result)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.UNAVAILABLE)
            test.is_true((err :: any):retryable())
        end)

        test.it("rejects a malformed catch-up deadline", function()
            local thread_id = lagging_projection("malformed")
            local result, err = as_owner(CATCH_UP_PROJECTION, { thread_id = thread_id, kind = "count",
                deadline = "tomorrow" })
            test.is_nil(result)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
        end)

        test.it("lists, pauses, and resumes projection cursors through the contract", function()
            local created = as_owner(CREATE, { thread_class = "ct_proj_lifecycle_" .. suffix })
            local thread_id = created.thread_id

            local reg, rerr = as_owner(REGISTER_PROJECTION, {
                thread_id = thread_id,
                kind = "count",
                projection_key = "lifecycle",
                cursor_key = "default",
                worker_ref = "func://" .. TEST_WORKER,
            })
            test.is_nil(rerr)
            test.not_nil(reg)
            test.not_nil(reg.projection_id)

            local listed, lerr = as_owner(LIST_PROJECTIONS, { thread_id = thread_id })
            test.is_nil(lerr)
            test.not_nil(listed)
            test.eq(tonumber(listed.event_count), 0)
            test.is_true(#listed.projections >= 1)
            test.is_true(#listed.cursors >= 1)

            local paused, perr = as_owner(PAUSE_PROJECTION, {
                thread_id = thread_id,
                kind = "count",
                projection_key = "lifecycle",
                cursor_key = "default",
            })
            test.is_nil(perr)
            test.not_nil(paused)
            test.eq(paused.status, "paused")

            local resumed, rserr = as_owner(RESUME_PROJECTION, {
                thread_id = thread_id,
                cursor_id = paused.cursor_id,
            })
            test.is_nil(rserr)
            test.not_nil(resumed)
            test.eq(resumed.status, "active")
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
