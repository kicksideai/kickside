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

        test.it("resumes an already-live projection successfully through the contract", function()
            local created = as_owner(CREATE, { thread_class = "ct_resume_live_" .. suffix })
            local thread_id = created.thread_id
            local registered, register_err = as_owner(REGISTER_PROJECTION, {
                thread_id = thread_id,
                kind = "resume-live",
                worker_ref = "func://" .. TEST_WORKER,
            })
            test.is_nil(register_err)
            test.not_nil(registered)

            local before, list_err = as_owner(LIST_PROJECTIONS, { thread_id = thread_id })
            test.is_nil(list_err)
            local cursor = nil
            for _, item in ipairs((before.cursors or {}) :: { any }) do
                if tostring(item.projection_id) == tostring(registered.projection_id) then
                    cursor = item
                    break
                end
            end
            test.not_nil(cursor)
            test.eq(cursor.status, "active")

            local resumed, resume_err = as_owner(RESUME_PROJECTION, {
                thread_id = thread_id,
                projection_id = registered.projection_id,
            })
            test.is_nil(resume_err)
            test.not_nil(resumed)
            test.eq(resumed.status, "active")
            test.is_true(resumed.already_active)

            local after, after_err = as_owner(LIST_PROJECTIONS, { thread_id = thread_id })
            test.is_nil(after_err)
            local after_cursor = nil
            for _, item in ipairs((after.cursors or {}) :: { any }) do
                if tostring(item.projection_id) == tostring(registered.projection_id) then
                    after_cursor = item
                    break
                end
            end
            test.not_nil(after_cursor)
            test.eq(after_cursor.status, "active")
        end)

        test.it("ensure_thread marks a component-first component as a thread and preserves its meta", function()
            local component_id = uuid.v4()
            register_bare_component(owner, component_id, "kickside.core:thread", {
                class = "knowledge_base",
                title = "Ensure KB " .. suffix,
            })

            -- Component-first baseline: the component carries its own class/title but no
            -- thread marker, so the picker (meta.type=thread) cannot see it yet.
            local before = component_meta(component_id)
            test.eq(before.class, "knowledge_base")
            test.eq(before.title, "Ensure KB " .. suffix)
            test.is_nil(before.type)

            -- First ensure_thread attaches the thread (the thread row does not exist yet),
            -- so it runs the create path: ensure_thread_component resolves the pre-existing
            -- component (CONFLICT) and the create branch stamps it as a thread.
            local ensured, ensure_err = as_owner("ensure_thread", {
                component_id = component_id,
                thread_class = "kickside.knowledge.injection",
            })
            test.is_nil(ensure_err)
            test.not_nil(ensured)
            test.eq(ensured.thread_id, component_id)
            test.is_true(ensured.created == true)

            -- The thread now advertises as a thread with its class, and the pre-existing
            -- class/title meta is untouched (per-key merge, not a clobber).
            local after = component_meta(component_id)
            test.eq(after.type, "thread")
            test.eq(after.thread_class, "kickside.knowledge.injection")
            test.eq(after.class, "knowledge_base")
            test.eq(after.title, "Ensure KB " .. suffix)

            -- A repeat ensure_thread now hits the found fast-path (the thread exists). It
            -- must not touch the already-stamped meta -- the marker and class/title stand.
            local again, again_err = as_owner("ensure_thread", {
                component_id = component_id,
                thread_class = "kickside.knowledge.injection",
            })
            test.is_nil(again_err)
            test.is_true(again.created == false)
            local steady = component_meta(component_id)
            test.eq(steady.type, "thread")
            test.eq(steady.thread_class, "kickside.knowledge.injection")
            test.eq(steady.class, "knowledge_base")
            test.eq(steady.title, "Ensure KB " .. suffix)

            -- The now-typed component is reachable through the access-scoped thread list.
            local listed, list_err = as_owner(LIST, { thread_class = "kickside.knowledge.injection" })
            test.is_nil(list_err)
            test.not_nil(index_of(thread_ids(listed), component_id))
        end)

        test.it("delete removes the thread and its component", function()
            local created = as_owner(CREATE, { thread_class = "ct_delete_" .. suffix })
            local thread_id = created.thread_id
            local component_id = created.component_id

            local deleted, derr = as_owner(DELETE, { thread_id = thread_id })
            test.is_nil(derr)
            test.not_nil(deleted)
            test.is_true(deleted.deleted == true)

            test.is_nil(component_id_of(thread_id))
            test.is_nil(component_row_exists(component_id))
        end)

        local DROP_TYPE = "kickside.automation.poller.events:trigger.dropped"

        test.it("delete fires a projection's declared drop_notify onto the subscriber thread", function()
            -- A subscriber (e.g. a trigger automation) registers a projection on a
            -- SOURCE thread and declares a drop_notify pointing at its OWN thread. When
            -- the source thread is deleted the projection is cascade-reaped; the declared
            -- drop_notify must append a typed event to the subscriber thread so the
            -- subscriber surfaces "source deleted" instead of silently going dead.
            local subscriber = as_owner(CREATE, { thread_class = "ct_drop_sub_" .. suffix })
            local source = as_owner(CREATE, { thread_class = "ct_drop_src_" .. suffix })

            local _, rerr = as_owner(REGISTER_PROJECTION, {
                thread_id = source.thread_id,
                kind = "count",
                worker_ref = "func://" .. TEST_WORKER,
                drop_notify = {
                    thread_id = subscriber.thread_id,
                    type = DROP_TYPE,
                    body = { reason = "source deleted", source_binding = "bind:x" },
                },
            })
            test.is_nil(rerr)

            test.eq(event_type_count(subscriber.thread_id, DROP_TYPE), 0)

            local deleted, derr = as_owner(DELETE, { thread_id = source.thread_id })
            test.is_nil(derr)
            test.is_true(deleted.deleted == true)

            test.eq(event_type_count(subscriber.thread_id, DROP_TYPE), 1)
        end)

        test.it("purge fires a projection's declared drop_notify onto the subscriber thread", function()
            -- The component-driven teardown (a deleted component reaping its own primary
            -- thread) must surface the same drop_notify as the thread-driven delete.
            local subscriber = as_owner(CREATE, { thread_class = "ct_purge_sub_" .. suffix })
            local source = as_owner(CREATE, { thread_class = "ct_purge_src_" .. suffix })

            local _, rerr = as_owner(REGISTER_PROJECTION, {
                thread_id = source.thread_id,
                kind = "count",
                worker_ref = "func://" .. TEST_WORKER,
                drop_notify = {
                    thread_id = subscriber.thread_id,
                    type = DROP_TYPE,
                    body = { reason = "source deleted" },
                },
            })
            test.is_nil(rerr)

            test.eq(event_type_count(subscriber.thread_id, DROP_TYPE), 0)

            local purged, perr = as_owner("purge", { component_id = source.thread_id })
            test.is_nil(perr)
            test.is_true(purged.purged == true)

            test.eq(event_type_count(subscriber.thread_id, DROP_TYPE), 1)
        end)

        local function register_drop(source_id, subscriber_id)
            local _, rerr = as_owner(REGISTER_PROJECTION, {
                thread_id = source_id,
                kind = "count",
                worker_ref = "func://" .. TEST_WORKER,
                drop_notify = { thread_id = subscriber_id, type = DROP_TYPE, body = { reason = "source deleted" } },
            })
            test.is_nil(rerr)
        end

        local function thread_exists(thread_id)
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err)) end
            local rows = db:query("SELECT 1 AS one FROM kickside_thread WHERE id = $1", { thread_id })
            db:release()
            return #(rows or {}) == 1
        end

        test.it("a teardown whose drop hook is malformed fails and keeps the thread", function()
            local subscriber = as_owner(CREATE, { thread_class = "ct_drop_bad_sub_" .. suffix })
            local source = as_owner(CREATE, { thread_class = "ct_drop_bad_src_" .. suffix })
            register_drop(source.thread_id, subscriber.thread_id)
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err)) end
            local _, corrupt_err = db:execute("UPDATE kickside_projection SET body = $1 WHERE thread_id = $2", { "{\"drop_notify\":\"not a hook\"}", source.thread_id })
            db:release()
            test.is_nil(corrupt_err)

            local _, derr = as_owner(DELETE, { thread_id = source.thread_id })
            test.not_nil(derr)
            test.is_true(errors.is(derr, errors.INTERNAL))
            test.is_false(derr:retryable())
            test.eq(derr:details().code, "drop_notify_response")
            test.eq(derr:details().field, "drop_notify")
            test.is_true(thread_exists(source.thread_id))
            local _, perr = as_owner("purge", { component_id = source.thread_id })
            test.not_nil(perr)
            test.is_true(errors.is(perr, errors.INTERNAL))
            test.is_false(perr:retryable())
            test.eq(perr:details().code, "drop_notify_response")
            test.eq(perr:details().field, "drop_notify")
            test.is_true(thread_exists(source.thread_id))
            test.eq(event_type_count(subscriber.thread_id, DROP_TYPE), 0)
        end)

        test.it("a drop hook whose subscriber thread is gone notifies no one and the teardown commits", function()
            local subscriber = as_owner(CREATE, { thread_class = "ct_drop_gone_sub_" .. suffix })
            local source = as_owner(CREATE, { thread_class = "ct_drop_gone_src_" .. suffix })
            register_drop(source.thread_id, subscriber.thread_id)
            local _, sub_err = as_owner(DELETE, { thread_id = subscriber.thread_id })
            test.is_nil(sub_err)

            local deleted, derr = as_owner(DELETE, { thread_id = source.thread_id })
            test.is_nil(derr)
            test.is_true(deleted.deleted == true)
            test.is_false(thread_exists(source.thread_id))
            test.is_false(thread_exists(subscriber.thread_id))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
