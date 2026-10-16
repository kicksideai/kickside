-- Threads binding integration. Drives the kickside.core:threads contract under real
-- actors through contract.get():with_actor():with_scope():open() so the component
-- contract resolves the acting actor: create registers a component (visible via a
-- kickside_components row), list is access-filtered to the owner, a non-member is
-- excluded, upsert is idempotent on a natural key, and a registered
-- projection is removed via its rollback. Runs on SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local uuid = require("uuid")
local sql = require("sql")
local pin = require("pin")
local retention_repo = require("retention_repo")

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
local PAUSE_PROJECTION = "pause_projection"
local RESUME_PROJECTION = "resume_projection"
local REMOVE_PROJECTION = "remove_projection"
local TEST_WORKER = "app:test_count_worker"
local fixture = require("fixture")

local function define_tests()
    test.describe("Threads Contract", function()
        local context = fixture.new()
        local suffix, owner, stranger = context.suffix, context.owner, context.stranger
        local test_scope = context.test_scope
        local run_as = context.run_as
        local as_owner = context.as_owner
        local publish_as_owner = context.publish_as_owner
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

        test.it("carries subject expectations, append versions and subject reads through the binding", function()
            local created, create_err = as_owner(CREATE, { title = "Subject contracts", impl_id = "app:threads_test_event_kind" })
            test.is_nil(create_err)
            local id = created.thread_id
            local before, read_err = as_owner(FIND, { thread_id = id, subject = "settings" })
            test.is_nil(read_err)
            test.eq(before.subject_version, 0)
            local appended, err = as_owner(APPEND_EVENT, { thread_id = id,
                expect = { subject = "settings", version = 0 },
                event = { type = "app:threads_test_external", subject = "settings", body = {} } })
            test.is_nil(err)
            test.eq(appended.events[1].subject_version, 1)
            local _, stale = as_owner(APPEND_EVENTS, { thread_id = id,
                expect = { subject = "settings", version = 0 },
                events = { { type = "app:threads_test_external", subject = "settings", body = {} } } })
            test.eq(stale:kind(), errors.CONFLICT)
            local found, find_err = as_owner(FIND, { thread_id = id, subject = "settings" })
            test.is_nil(find_err)
            test.eq(found.subject, "settings")
            test.eq(found.subject_version, 1)
            local page, list_err = as_owner(LIST_EVENTS, { thread_id = id, ascending = true })
            test.is_nil(list_err)
            local event = page.events[#page.events]
            test.eq(event.subject, "settings")
            test.eq(event.subject_version, 1)
            local hidden, hidden_err = run_as(stranger, FIND, { thread_id = id, subject = "settings" })
            test.is_nil(hidden_err)
            test.is_nil(hidden)
        end)

        test.it("preserves a nested table through an identity-bound contract call", function()
            -- This deliberately uses the production contract path rather than a
            -- stub: contract.get -> with_actor -> with_scope -> open -> method call.
            -- The persisted attrs make the callee's received nested value observable.
            local created, err = run_as(owner, CREATE, {
                thread_class = "nested-contract-" .. suffix,
                attrs = {
                    source = { kind = "binding", id = "binding-" .. suffix },
                    payload = { lead = { email = "round5@example.test" }, tags = { "round5", "boundary" } },
                },
            })
            test.is_nil(err)
            if type(created) ~= "table" or type(created.thread) ~= "table" then
                error("thread create returned no thread payload")
            end
            local attrs = created.thread.attrs
            if type(attrs) ~= "string" then
                error("thread create returned non-string attrs")
            end
            local decoded, decode_err = json.decode(attrs)
            test.is_nil(decode_err)
            test.eq((((decoded :: table).source :: table).kind), "binding")
            test.eq((((((decoded :: table).payload :: table).lead :: table).email)), "round5@example.test")
            test.eq((((((decoded :: table).payload :: table).tags :: { any })[2])), "boundary")
        end)

        test.it("create exposes the declared parent in children and graph reads", function()
            local parent, parent_err = as_owner(CREATE, { title = "Parent" })
            test.is_nil(parent_err)
            local child, child_err = as_owner(CREATE, { title = "Child", parent_id = parent.thread_id })
            test.is_nil(child_err)
            local children, children_err = as_owner(LIST_CHILDREN, { thread_id = parent.thread_id })
            test.is_nil(children_err)
            test.eq(#children.children, 1)
            test.eq(children.children[1].id, child.thread_id)
            local graph, graph_err = as_owner(LIST_EDGES, { thread_id = parent.thread_id })
            test.is_nil(graph_err)
            test.eq(#graph.edges, 1)
            test.eq(graph.edges[1].from_thread_id, child.thread_id)
            test.eq(graph.edges[1].to_thread_id, parent.thread_id)
            test.eq(graph.edges[1].edge_type, "parent")
            local _, denied = run_as(stranger, LIST_CHILDREN, { thread_id = parent.thread_id })
            test.not_nil(denied)
        end)

        test.it("create registers a thread component owned by the actor", function()
            local res, err = as_owner(CREATE, { thread_class = "ct_create_" .. suffix, title = "Hello" })
            test.is_nil(err)
            test.not_nil(res)
            test.not_nil(res.thread_id)
            test.not_nil(res.component_id)

            local cid = component_id_of(res.thread_id :: string)
            test.eq(cid, res.component_id)

            local row = component_row_exists(res.component_id :: string)
            test.not_nil(row)
            test.eq(row.impl_id, "kickside.core:thread")
        end)

        test.it("list returns the owner's threads and excludes a non-member", function()
            local cls = "ct_list_" .. suffix
            local created, err = as_owner(CREATE, { thread_class = cls })
            test.is_nil(err)
            local thread_id = created.thread_id

            -- Owner sees it.
            local owner_list = as_owner(LIST, { thread_class = cls })
            test.not_nil(owner_list)
            test.is_true(index_of(thread_ids(owner_list), thread_id) ~= nil)

            -- A stranger with no grant does not.
            local stranger_list, slerr = run_as(stranger, LIST, { thread_class = cls })
            test.is_nil(slerr)
            test.is_false(index_of(thread_ids(stranger_list), thread_id) ~= nil)
        end)

        test.it("list_events returns an events array for the owner and denies a non-member", function()
            local created = as_owner(CREATE, { thread_class = "ct_events_" .. suffix })
            local thread_id = created.thread_id

            -- Owner: READ passes, events is an array (empty for a fresh thread).
            local res, err = as_owner(LIST_EVENTS, { thread_id = thread_id })
            test.is_nil(err)
            test.not_nil(res)
            test.eq(type(res.events), "table")

            -- Stranger: READ gate denies.
            local _, serr = run_as(stranger, LIST_EVENTS, { thread_id = thread_id })
            test.not_nil(serr)
        end)

        test.it("a declared event source commits its empty primary thread with its component", function()
            local id = register_bare_component(owner, uuid.v4(),
                "app:threads_empty_source_kind", { title = "Empty source" })
            test.not_nil(component_row_exists(id))
            test.eq(component_id_of(id), id)
            local thread, thread_err = as_owner(FIND, { thread_id = id })
            test.is_nil(thread_err)
            test.eq(thread.thread_class, "test.empty.source")
            test.eq(thread.attrs.owner_principal.kind, "user")
            test.eq(thread.attrs.owner_principal.id, owner)
            test.eq(thread.attrs.user_ids[1], owner)

            local head, head_err = as_owner(LIST_EVENTS, { thread_id = id, limit = 1 })
            test.is_nil(head_err)
            test.eq(#head.events, 0)
            test.eq(head.max_pruned_seq, 0)
            test.eq(head.next_seq, 1)
            test.is_nil(head.source_gap)

            local window, window_err = as_owner(LIST_EVENTS, {
                thread_id = id, from_seq = 7, ascending = true, event_type = "app:threads_test_external",
            })
            test.is_nil(window_err)
            test.eq(#window.events, 0)
            test.eq(window.max_pruned_seq, 0)
            test.eq(window.next_seq, 7)
            test.is_nil(window.source_gap)
            test.eq(component_id_of(id), id)
            test.eq(event_type_count(id, "app:threads_test_external"), 0)

            local emitted, emit_err = publish_as_owner({ operation = "emit", component_id = id,
                type = "app:threads_test_external", body = { first = true } })
            test.is_nil(emit_err)
            test.not_nil(emitted)
            local page, page_err = as_owner(LIST_EVENTS, {
                thread_id = id, from_seq = head.next_seq, ascending = true,
            })
            test.is_nil(page_err)
            test.eq(#page.events, 1)
            test.eq(tonumber(page.events[1].seq), head.next_seq)
            test.eq(page.events[1].type, "app:threads_test_external")
            test.eq(page.next_seq, 2)
            test.eq(component_id_of(id), id)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local policy, policy_err = retention_repo.find_by_thread(db, id)
            test.is_nil(policy_err)
            test.not_nil(policy)
            local _, update_err = retention_repo.upsert(db, id, { event_hot_retention_days = 37 })
            db:release()
            test.is_nil(update_err)
            local _, again_err = publish_as_owner({ operation = "emit", component_id = id,
                type = "app:threads_test_external", body = { second = true } })
            test.is_nil(again_err)
            db, db_err = sql.get("app:db")
            if db_err or not db then error("retention db unavailable: " .. tostring(db_err)) end
            policy, policy_err = retention_repo.find_by_thread(db, id)
            db:release()
            test.is_nil(policy_err)
            test.eq(policy.event_hot_retention_days, 37)
        end)

        test.it("a never-emitted declared source accepts its first retention pin", function()
            local id = register_bare_component(owner, uuid.v4(),
                "app:threads_empty_source_kind", { title = "Pinned empty source" })
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local receipt, pin_err = pin.pin_lower(db, { thread_id = id,
                consumer_key = "empty-source-reader", command_id = "subscribe", command_generation = 1,
                target_cursor = 0 })
            db:release()
            test.is_nil(pin_err)
            test.eq(receipt.target_cursor, 0)
            test.eq(receipt.pin_generation, 1)
            test.eq(event_type_count(id, "app:threads_test_external"), 0)
        end)

        test.it("failed first-emission completion preserves the registered primary row and its pin", function()
            local id = register_bare_component(owner, uuid.v4(),
                "app:threads_empty_invalid_projection_kind", { title = "Pinned initialization failure" })
            local db, db_err = sql.get("app:db")
            if db_err or not db then error("test db unavailable: " .. tostring(db_err)) end
            local receipt, pin_err = pin.pin_lower(db, { thread_id = id,
                consumer_key = "initialization-reader", command_id = "subscribe", command_generation = 1,
                target_cursor = 0 })
            db:release()
            test.is_nil(pin_err)
            test.eq(receipt.pin_generation, 1)
            local _, emit_err = publish_as_owner({ operation = "emit", component_id = id,
                type = "app:threads_test_external", body = {} })
            test.not_nil(emit_err)
            db, db_err = sql.get("app:db")
            if db_err or not db then error("test db unavailable: " .. tostring(db_err)) end
            local rows, rows_err = db:query("SELECT event_count, deleting_at FROM kickside_thread WHERE id = $1", { id })
            local held, read_err = pin.read(db, id, "initialization-reader")
            db:release()
            test.is_nil(rows_err)
            test.eq(#rows, 1)
            test.is_nil(rows[1].deleting_at)
            test.eq(tonumber(rows[1].event_count), 0)
            test.is_nil(read_err)
            test.not_nil(held)
            test.eq(held.generation, 1)
            test.eq(held.cursor_seq, 0)
        end)

        test.it("a never-emitted declared source still requires READ access", function()
            local id = register_bare_component(owner, uuid.v4(),
                "app:threads_empty_source_kind", { title = "Hidden empty source" })
            local denied, denied_err = run_as(stranger, LIST_EVENTS, { thread_id = id })
            test.is_nil(denied)
            test.not_nil(denied_err)
            test.eq(denied_err:kind(), errors.PERMISSION_DENIED)
            local missing, missing_err = as_owner(LIST_EVENTS, { thread_id = uuid.v4() })
            test.is_nil(missing)
            test.not_nil(missing_err)
            test.eq(missing_err:kind(), errors.NOT_FOUND)
            test.eq(component_id_of(id), id)
        end)

        test.it("find_event_by_external is exact and READ-gated", function()
            local created = as_owner(CREATE, { thread_class = "ct_external_" .. suffix,
                impl_id = "app:threads_test_event_kind" })
            local thread_id = created.thread_id
            for _, version in ipairs({ 1, 2 }) do
                local appended, append_err = publish_as_owner({ thread_id = thread_id, event = {
                    type = "app:threads_test_external", role = "system", body = { version = version }, external = {
                        external_source = "contract-test", external_id = "item", external_version = "v" .. tostring(version),
                    },
                } })
                test.is_nil(append_err)
                test.eq(appended.inserted, 1)
            end

            local found, found_err = as_owner(FIND_EXTERNAL, {
                thread_id = thread_id, event_type = "app:threads_test_external",
                external_source = "contract-test", external_id = "item", external_version = "v2",
            })
            test.is_nil(found_err)
            test.not_nil(found.event)
            test.eq(found.event.external_version, "v2")
            local body = assert(json.decode(found.event.body))
            test.eq(body.version, 2)

            local missing, missing_err = as_owner(FIND_EXTERNAL, {
                thread_id = thread_id, event_type = "app:threads_test_other",
                external_source = "contract-test", external_id = "item", external_version = "v2",
            })
            test.is_nil(missing_err)
            test.is_nil(missing.event)

            local _, denied_err = run_as(stranger, FIND_EXTERNAL, {
                thread_id = thread_id, event_type = "app:threads_test_external",
                external_source = "contract-test", external_id = "item", external_version = "v2",
            })
            test.not_nil(denied_err)
        end)

        test.it("append_event stores typed events and wakes through the durable writer", function()
            local created = as_owner(CREATE, { thread_class = "ct_append_" .. suffix,
                impl_id = "app:threads_test_event_kind" })
            local thread_id = created.thread_id

            local appended, aerr = publish_as_owner({
                thread_id = thread_id,
                event = {
                    type = "app:threads_knowledge_created",
                    role = "system",
                    body = { text = "hello", nested = { ok = true } },
                    external = {
                        external_source = "test",
                        external_id = "event-" .. suffix,
                        external_version = "v1",
                    },
                    trace_context = {
                        trace_id = "trace-" .. suffix,
                        run_id = "run-" .. suffix,
                        correlation_key = "kb:test:" .. suffix,
                    },
                },
            })
            test.is_nil(aerr)
            test.not_nil(appended)
            test.eq(appended.inserted, 1)
            test.eq(appended.duplicates, 0)

            local events, lerr = as_owner(LIST_EVENTS, { thread_id = thread_id, ascending = true })
            test.is_nil(lerr)
            test.not_nil(events)
            test.eq(#events.events, 1)
            test.eq(events.events[1].type, "app:threads_knowledge_created")
            test.eq(events.events[1].external_source, "test")
            test.eq(events.events[1].external_id, "event-" .. suffix)
            test.eq(events.events[1].trace_context.trace_id, "trace-" .. suffix)
            test.eq(events.events[1].trace_context.run_id, "run-" .. suffix)
            test.eq(events.events[1].trace_context.correlation_key, "kb:test:" .. suffix)
            test.is_nil(events.events[1].trace_id)

            local _, serr = run_as(stranger, APPEND_EVENTS, {
                thread_id = thread_id,
                events = { { type = "app:threads_knowledge_denied", body = {} } },
            })
            test.not_nil(serr)
        end)

        test.it("emit appends through the component primary-thread seam", function()
            local created = as_owner(CREATE, { thread_class = "ct_emit_" .. suffix,
                impl_id = "app:threads_test_event_kind" })
            local thread_id = created.thread_id

            local emitted, emit_err = publish_as_owner({
                operation = "emit",
                component_id = thread_id,
                type = "app:threads_knowledge_emitted",
                body = { ok = true },
                external = {
                    external_source = "test",
                    external_id = "emit-" .. suffix,
                    external_version = "v1",
                },
            })
            test.is_nil(emit_err)
            test.not_nil(emitted)
            test.eq(emitted.inserted, 1)

            local duplicate, dup_err = publish_as_owner({
                operation = "emit",
                component_id = thread_id,
                type = "app:threads_knowledge_emitted",
                body = { ok = true },
                external = {
                    external_source = "test",
                    external_id = "emit-" .. suffix,
                    external_version = "v1",
                },
            })
            test.is_nil(dup_err)
            test.not_nil(duplicate)
            test.eq(duplicate.inserted, 0)
            test.eq(duplicate.duplicates, 1)

            local events, lerr = as_owner(LIST_EVENTS, { thread_id = thread_id, ascending = true })
            test.is_nil(lerr)
            test.eq(#events.events, 1)
            test.eq(events.events[1].type, "app:threads_knowledge_emitted")
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
