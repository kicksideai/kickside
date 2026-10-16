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
local funcs = require("funcs")
local time = require("time")
local json = require("json")
local process = require("process")
local channel = require("channel")

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
local worker_pid: string? = nil
local worker_events: any? = nil

local function start_jobs_pool(): ()
    if worker_pid then return end
    worker_events = process.events()
    local pid, spawn_err = process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes")
    if spawn_err or not pid then error("projection Jobs pool failed to start: " .. tostring(spawn_err)) end
    worker_pid = tostring(pid)
end

local function stop_jobs_pool(): ()
    local pid = worker_pid
    if not pid then return end
    local _, cancel_err = process.cancel(pid)
    if cancel_err then error("projection Jobs pool cancellation failed: " .. tostring(cancel_err)) end
    while true do
        local selected = channel.select({ (worker_events :: any):case_receive() })
        local event = selected.value
        if type(event) == "table" and tostring(event.from) == pid and event.kind == process.event.EXIT then
            worker_pid = nil
            worker_events = nil
            return
        end
    end
end

local function define_tests()
    test.describe("Threads Contract", function()
        test.after_each(stop_jobs_pool)
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

        local function user_append_scope(): any
            local policy, policy_err = security.policy("app:threads_test_user_append_scope")
            if policy_err or not policy then error("user append test policy unavailable: " .. tostring(policy_err)) end
            local scope, scope_err = security.new_scope({ policy })
            if scope_err or not scope then error("user append test scope unavailable: " .. tostring(scope_err)) end
            return scope
        end

        local function restricted_as_owner(target: string, args: any): (any?, error?)
            local actor = security.new_actor(owner, { security_groups = {} })
            local def, get_err = contract.get(THREADS)
            if get_err or not def then error("threads contract unavailable: " .. tostring(get_err)) end
            local inst, open_err = (def :: any):with_actor(actor):with_scope(user_append_scope()):open()
            if open_err or not inst then error("open Threads under narrow user scope failed: " .. tostring(open_err)) end
            return (inst :: any)[target]((inst :: any), args)
        end

        test.it("does not let an output publisher claim authorship for an input event", function()
            local thread_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = thread_id,
                impl_id = "kickside.test.threads:thread_kind",
                thread_class = "test-output-input-authorship-" .. suffix,
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local funcs = require("funcs")
            local actor = security.new_actor(owner, { security_groups = {} })
            for _, event in ipairs({
                { type = "kickside.test.threads:trigger", role = "system", body = {} },
                { type = "kickside.test.threads:trigger", role = "assistant", body = {} },
                { type = "kickside.test.threads:trigger", role = "user", external = {
                    external_source = "kickside.external", external_id = "forged",
                }, body = {} },
                { type = "kickside.test.threads:trigger", role = "user", created_at = "2000-01-01T00:00:00Z", body = {} },
            }) do
                local appended, append_err = funcs.new():with_actor(actor):with_scope(user_append_scope())
                    :call("app:test_output_publisher", { thread_id = thread_id, event = event })
                test.is_nil(appended)
                test.not_nil(append_err)
                test.eq((append_err :: any):kind(), errors.PERMISSION_DENIED)
            end
            test.eq(event_type_count(thread_id, "kickside.test.threads:trigger"), 0)
        end)

        test.it("re-registering a declared projection preserves the read-model and never writes private_context", function()
            local thread_id = uuid.v4()

            -- First emit declares + first-touches the test.count projection.
            local first, first_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-rr-1-" .. suffix },
            })
            test.is_nil(first_err)
            test.eq(first.inserted, 1)

            -- Fold the history: the worker accumulates a read-model in the body.
            start_jobs_pool()
            local caught, cerr = as_owner(CATCH_UP_PROJECTION, { thread_id = thread_id, kind = "test.count", max_ticks = 5 })
            test.is_nil(cerr)
            -- The resident projection worker may have caught up first; the
            -- contract must still report the durable cursor at sequence 1.
            local folded = projection_body_of(thread_id, "test.count") :: table
            test.eq(tonumber((folded.stats :: table).count), 1)
            -- The fold is durable now, so park the worker: the re-registration
            -- assertions below must observe a quiescent read-model, not race it.
            stop_jobs_pool()

            -- A component owner writes its private state (the poller's install/patch
            -- seam). This blob must be inert to any projection re-registration.
            set_private_context_raw(thread_id, "{\"cursor\":\"abc\",\"frozen\":1}")
            local before = private_context_raw(thread_id)

            folded.events = {input = {{type = "older.event"}}}
            local stale_db = assert(sql.get(DB))
            assert(stale_db:execute("UPDATE kickside_projection SET body=$1 WHERE thread_id=$2 AND kind='test.count'",
                {assert(json.encode(folded)), thread_id}))
            assert(stale_db:release())

            -- Re-emit with the impl_id: emit converges declared projections, which
            -- re-registers test.count over a thread that already has folded history.
            local second, second_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-rr-2-" .. suffix },
                external = { external_source = "actor:" .. owner, external_id = "rr-2-" .. suffix, external_version = "v1" },
            })
            test.is_nil(second_err)
            test.eq(second.inserted, 1)

            -- The read-model survives the re-registration: the count is not reset.
            local after_reg = projection_body_of(thread_id, "test.count") :: table
            test.eq(tonumber((after_reg.stats :: table).count), 1)
            test.is_nil(after_reg.events)
            local listed, list_err = as_owner(LIST_PROJECTIONS, { thread_id = thread_id })
            test.is_nil(list_err)
            local last_seq = tonumber(listed.cursors[1].last_seq)
            test.is_true(last_seq >= 1)
            test.eq(tonumber((after_reg.stats :: table).count), last_seq)

            -- private_context is byte-identical: no provisioning/registration path
            -- touched the component's owned state.
            test.eq(private_context_raw(thread_id), before)

            -- The re-registered projection still folds: restart the worker and
            -- catch up the second event exactly once.
            start_jobs_pool()
            local reconverged, reconverge_err = as_owner(CATCH_UP_PROJECTION,
                { thread_id = thread_id, kind = "test.count", max_ticks = 5 })
            test.is_nil(reconverge_err)
            local refolded = projection_body_of(thread_id, "test.count") :: table
            test.eq(tonumber((refolded.stats :: table).count), 2)
        end)

        test.it("catch_up_projection advances a first-touch declared projection", function()
            local thread_id = uuid.v4()

            local emitted, emit_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-catchup-" .. suffix },
                external = {
                    external_source = "actor:" .. owner,
                    external_id = "catchup-" .. suffix,
                    external_version = "v1",
                },
            })
            test.is_nil(emit_err)
            test.not_nil(emitted)
            test.eq(emitted.inserted, 1)

            local _, register_err = process.registry.register("app:projection_catchup_test")
            test.is_nil(register_err)
            local ready, listen_err = process.listen("projection.test.worker", { message = true })
            test.is_nil(listen_err)
            test.not_nil(ready)
            worker_events = process.events()
            local envelope, call_err = funcs.new():with_actor(security.new_actor(owner, { security_groups = {} }))
                :with_scope(test_scope()):call("app:catchup_after_commit", {
                thread_id = thread_id,
                kind = "test.count",
                max_ticks = 5,
            })
            local cerr = call_err or (envelope and envelope.error)
            if not envelope and not cerr then cerr = "missing catch-up reply" end
            local caught = envelope and envelope.result
            if cerr then
                local pending = channel.select({ ready:case_receive(), default = true })
                if pending.channel == ready then worker_pid = tostring(pending.value:payload():data().pid) end
                process.unlisten(ready)
                local _, unregister_err = process.registry.unregister("app:projection_catchup_test")
                test.is_nil(unregister_err)
                error(tostring(cerr))
            end
            local started = ready:receive()
            worker_pid = tostring(started:payload():data().pid)
            local _, monitor_err = process.monitor(worker_pid)
            test.is_nil(monitor_err)
            worker_events = process.events()
            process.unlisten(ready)
            local _, unregister_err = process.registry.unregister("app:projection_catchup_test")
            test.is_nil(unregister_err)
            test.is_nil(cerr)
            test.not_nil(caught)
            test.eq(caught.thread_id, thread_id)
            test.eq(caught.processed, 1)
            test.eq(caught.last_seq, 1)
            test.eq(caught.status, "active")

            local listed, lerr = as_owner(LIST_PROJECTIONS, { thread_id = thread_id })
            test.is_nil(lerr)
            test.eq(listed.event_count, 1)
            test.eq(tonumber(listed.cursors[1].last_seq), 1)
        end)

        test.it("list_children and list_classes return arrays for the owner", function()
            local cls = "ct_topo_" .. suffix
            local created = as_owner(CREATE, { thread_class = cls })
            local thread_id = created.thread_id

            local kids, kerr = as_owner(LIST_CHILDREN, { thread_id = thread_id })
            test.is_nil(kerr)
            test.eq(type(kids.children), "table")

            local classes, cerr = as_owner(LIST_CLASSES, {})
            test.is_nil(cerr)
            test.eq(type(classes.classes), "table")
            test.is_true(index_of(classes.classes, cls) ~= nil)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
