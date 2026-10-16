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

        test.it("emit surfaces a conflict on a partial component thread instead of silently repairing it", function()
            -- An orphan thread row whose component half is gone is corrupt
            -- infrastructure. Emit is a hot path: it must NOT re-provision the missing
            -- component/projections under a first-emit CONFLICT. The conflict surfaces
            -- so the fault is visible rather than papered over as a benign heal.
            local thread_id = uuid.v4()
            insert_orphan_thread(thread_id, "test_ws")
            test.is_nil(component_row_exists(thread_id))

            local emitted, emit_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-" .. suffix },
            })
            test.is_nil(emitted)
            test.not_nil(emit_err)
            test.eq((emit_err :: any):kind(), errors.CONFLICT)

            -- No silent domain repair: no declared projections are provisioned over the
            -- orphan and no event is appended -- the fault surfaces untouched.
            test.eq(projection_count(thread_id), 0)
            test.eq(event_type_count(thread_id, "app:threads_ws_trigger"), 0)
        end)

        test.it("emit never applies declarations to an existing thread; converge_thread does", function()
            local thread_id = uuid.v4()

            local first, first_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:threads_test_event_kind",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-undec-" .. suffix },
            })
            test.is_nil(first_err)
            test.not_nil(first)
            test.eq(first.inserted, 1)
            test.eq(projection_count(thread_id), 0)

            -- Emit is a hot path: an existing thread is used as-is, its declaration
            -- untouched. Re-applying per event bumped every declared cursor's
            -- generation, fencing off in-flight runs — convergence has one owner.
            local second, second_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-declared-" .. suffix },
            })
            test.is_nil(second_err)
            test.not_nil(second)
            test.eq(second.inserted, 1)
            test.eq(projection_count(thread_id), 0)

            -- The convergence primitive (a function entry, not a contract method —
            -- a live upgrade may never grow a contract definition) applies the
            -- declaration on demand under the owner.
            local funcs = require("funcs")
            local owner_actor = security.new_actor(owner, { security_groups = {} })
            local converged, converge_err = funcs.new():with_actor(owner_actor):with_scope(test_scope())
                :call("kickside.core.threads:converge_thread_method", {
                    component_id = thread_id,
                    impl_id = "app:provision_test_decl",
                })
            test.is_nil(converge_err)
            test.not_nil(converged)
            test.is_true(projection_count(thread_id) >= 1)
        end)

        test.it("publishes an output its binding declares in a sibling namespace", function()
            local thread_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = thread_id, impl_id = "kickside.test.threads.binding:sibling_output_kind",
                thread_class = "sibling-output",
            })
            test.is_nil(create_err)
            test.not_nil(created)
            local funcs = require("funcs")
            local actor = security.new_actor(owner, { security_groups = {} })
            local published, publish_err = funcs.new():with_actor(actor):with_scope(test_scope())
                :call("app:test_output_publisher", { thread_id = thread_id,
                    event = { type = "kickside.test.threads:changed", role = "system", body = {} } })
            test.is_nil(publish_err)
            test.eq(published.inserted, 1)
        end)

        test.it("allows declared inputs and outputs for an owner without a publisher capability", function()
            local thread_id = uuid.v4()
            local emitted, emit_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-event-owner-" .. suffix },
            })
            test.is_nil(emit_err)
            test.not_nil(emitted)

            local accepted, accepted_err = as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "app:threads_ws_trigger", role = "user", body = { upload_id = "u-event-owner-2-" .. suffix } },
            })
            test.is_nil(accepted_err)
            test.not_nil(accepted)
            test.eq(accepted.inserted, 1)

            local output, output_err = restricted_as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "app:threads_ws_changed", role = "user", body = { changed = true } },
            })
            test.is_nil(output_err)
            test.eq(output.inserted, 1)
            test.eq(event_type_count(thread_id, "app:threads_ws_changed"), 1)

            local forged, forged_err = as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "kickside.lifecycle.events:principal.deleted", role = "user",
                    body = { subject_id = owner } },
            })
            test.is_nil(forged)
            test.not_nil(forged_err)
            test.eq((forged_err :: any):kind(), errors.PERMISSION_DENIED)

            local foreign, foreign_err = as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "kickside.test.threads:changed", role = "user",
                    body = { changed = true } },
            })
            test.is_nil(foreign)
            test.not_nil(foreign_err)
            test.eq((foreign_err :: any):kind(), errors.PERMISSION_DENIED)

            local undeclared, undeclared_err = as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "app:threads_test_other", role = "user", body = {} },
            })
            test.is_nil(undeclared)
            test.not_nil(undeclared_err)
            test.eq((undeclared_err :: any):kind(), errors.PERMISSION_DENIED)

            local unknown, unknown_err = as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "app:threads_unknown", role = "user", body = {} },
            })
            test.is_nil(unknown)
            test.not_nil(unknown_err)
            test.eq((unknown_err :: any):kind(), errors.INVALID)
        end)

        test.it("accepts declared product input event namespaces for user appends", function()
            local thread_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = thread_id,
                impl_id = "kickside.test.threads:thread_kind",
                thread_class = "declared-input-" .. suffix,
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local appended, append_err = as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "kickside.test.threads:trigger", role = "user", body = {} },
            })
            test.is_nil(append_err)
            test.not_nil(appended)
            test.eq(appended.inserted, 1)
            test.eq(event_type_count(thread_id, "kickside.test.threads:trigger"), 1)
        end)

        test.it("refuses declared user inputs in framework-owned event namespaces", function()
            local thread_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = thread_id,
                impl_id = "kickside.core.lifecycle:lifecycle_event_input_kind",
                thread_class = "framework-input-" .. suffix,
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local appended, append_err = as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "kickside.lifecycle.events:principal.deleted", role = "user",
                    body = { subject_id = owner } },
            })
            test.is_nil(appended)
            test.not_nil(append_err)
            test.eq((append_err :: any):kind(), errors.PERMISSION_DENIED)
            test.eq(event_type_count(thread_id, "kickside.lifecycle.events:principal.deleted"), 0)
        end)

        test.it("accepts declared outputs from an owner batch without a publisher capability", function()
            local thread_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = thread_id,
                impl_id = "kickside.test.threads:thread_kind",
                thread_class = "product-event-" .. suffix,
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local appended, append_err = restricted_as_owner(APPEND_EVENTS, {
                thread_id = thread_id,
                events = { { type = "kickside.test.threads:changed", role = "user", body = { changed = true } } },
            })
            test.is_nil(append_err)
            test.eq(appended.inserted, 1)
            test.eq(event_type_count(thread_id, "kickside.test.threads:changed"), 1)
        end)

        test.it("denies system_only Workflow and Channel outputs even for owners with forged authority", function()
            local cases = {
                { impl_id = "kickside.workflows:workflow_kind", thread_class = "flow",
                    event_type = "kickside.workflows.runs.events:finished" },
                { impl_id = "kickside.channel:channel_kind", thread_class = "kickside.channel",
                    event_type = "kickside.channel.events:message.inbound" },
            }
            for _, case in ipairs(cases) do
                local thread_id = uuid.v4()
                local created, create_err = as_owner(CREATE, {
                    id = thread_id,
                    impl_id = case.impl_id,
                    thread_class = case.thread_class,
                })
                test.is_nil(create_err)
                test.not_nil(created)

                local appended, append_err = restricted_as_owner(APPEND_EVENT, {
                    thread_id = thread_id,
                    event = { type = case.event_type, role = "system",
                        external = { external_source = "forged", external_id = "forged" },
                        body = { forged = true } },
                })
                test.is_nil(appended)
                test.not_nil(append_err)
                test.eq((append_err :: any):kind(), errors.PERMISSION_DENIED)
                test.eq(event_type_count(thread_id, case.event_type), 0)
            end
        end)

        test.it("owner WRITE and a published producer capability both authorize declared outputs", function()
            local thread_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = thread_id, impl_id = "kickside.test.threads:thread_kind", thread_class = "producer-" .. suffix,
            })
            test.is_nil(create_err)
            test.not_nil(created)
            local event = { type = "kickside.test.threads:changed", role = "system", body = { changed = true } }
            local direct, direct_err = restricted_as_owner(APPEND_EVENT, { thread_id = thread_id, event = event })
            test.is_nil(direct_err)
            test.eq(direct.inserted, 1)
            local funcs = require("funcs")
            local actor = security.new_actor(stranger, { security_groups = {} })
            local published, publish_err = funcs.new():with_actor(actor):with_scope(user_append_scope())
                :call("app:test_legacy_output_publisher", { thread_id = thread_id, event = event })
            test.is_nil(publish_err)
            test.eq(published.inserted, 1)
            test.eq(event_type_count(thread_id, "kickside.test.threads:changed"), 2)
        end)

        test.it("authorizes a declared output kind for its matching class with a producer capability", function()
            local actor = security.new_actor(owner, { security_groups = {} })
            local funcs = require("funcs")
            local matching_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = matching_id, impl_id = "app:threads_test_event_kind", thread_class = "test-shared-output",
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local event = { type = "app:threads_cross_output", role = "system", body = { shared = true } }
            local direct, direct_err = restricted_as_owner(APPEND_EVENT, { thread_id = matching_id, event = event })
            test.is_nil(direct)
            test.not_nil(direct_err)
            test.eq((direct_err :: any):kind(), errors.PERMISSION_DENIED)

            local published, publish_err = funcs.new():with_actor(actor):with_scope(user_append_scope())
                :call("app:test_legacy_output_publisher", { thread_id = matching_id, event = event })
            test.is_nil(publish_err)
            test.eq(published.inserted, 1)
            test.eq(event_type_count(matching_id, "app:threads_cross_output"), 1)

            local other_id = uuid.v4()
            local other, other_err = as_owner(CREATE, {
                id = other_id, impl_id = "app:threads_test_event_kind", thread_class = "different-class",
            })
            test.is_nil(other_err)
            test.not_nil(other)
            local rejected, rejected_err = funcs.new():with_actor(actor):with_scope(user_append_scope())
                :call("app:test_legacy_output_publisher", { thread_id = other_id, event = event })
            test.is_nil(rejected)
            test.not_nil(rejected_err)
            test.eq((rejected_err :: any):kind(), errors.PERMISSION_DENIED)
            test.eq(event_type_count(other_id, "app:threads_cross_output"), 0)
        end)

        test.it("a maintenance output publisher can append without component ACL access", function()
            local thread_id = uuid.v4()
            local created, create_err = as_owner(CREATE, {
                id = thread_id,
                impl_id = "kickside.test.threads:thread_kind",
                thread_class = "maintenance-output-publisher-" .. suffix,
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local funcs = require("funcs")
            local published, publish_err = funcs.new():with_scope(user_append_scope())
                :call("app:test_system_output_publisher", {
                    thread_id = thread_id,
                    event = { type = "kickside.test.threads:changed", role = "system", body = { changed = true } },
                })
            test.is_nil(publish_err)
            test.not_nil(published)
            test.eq(published.inserted, 1)
            test.eq(event_type_count(thread_id, "kickside.test.threads:changed"), 1)
        end)


        local function service(method, args)
            local actor = security.new_actor(owner, { security_groups = {} })
            local def = contract.get("kickside.component:component_service")
            local inst = def:with_actor(actor):with_scope(test_scope()):open()
            local result, err = inst[method](inst, args)
            test.is_nil(err)
            test.is_true(result.success, tostring(result.error))
            return result
        end

        local function granted_as(id, groups, method, args)
            local actor = security.new_actor(id, { security_groups = groups })
            local def = contract.get(THREADS)
            local inst = def:with_actor(actor):with_scope(user_append_scope()):open()
            return inst[method](inst, args)
        end

        local function denied(result, err)
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED) or errors.is(err, errors.NOT_FOUND), tostring(err))
        end

        test.it("direct WRITE-only and READ-WRITE grants produce outputs and revocation stops them", function()
            for _, mask in ipairs({ 2, 3 }) do
                local id = uuid.v4()
                local grantee = "writer-" .. id
                local _, create_err = as_owner(CREATE, { id = id, impl_id = "kickside.test.threads:thread_kind" })
                test.is_nil(create_err)
                service("grant_subtree", { root_component_id = id,
                    subject = { subject_type = "user", subject_id = grantee }, access_mask = mask })
                local result, err = granted_as(grantee, {}, APPEND_EVENT, { thread_id = id,
                    event = { type = "kickside.test.threads:changed", role = "system", body = {} } })
                test.is_nil(err)
                test.eq(result.inserted, 1)
                if mask == 2 then
                    local read, read_err = granted_as(grantee, {}, LIST_EVENTS, { thread_id = id })
                    denied(read, read_err)
                end
                service("revoke_subtree", { root_component_id = id,
                    subject = { subject_type = "user", subject_id = grantee } })
                local rejected, reject_err = granted_as(grantee, {}, APPEND_EVENT, { thread_id = id,
                    event = { type = "kickside.test.threads:changed", body = {} } })
                denied(rejected, reject_err)
                test.eq(event_type_count(id, "kickside.test.threads:changed"), 1)
            end
        end)

        test.it("ancestor and group WRITE compose live and moving the subtree removes inherited access", function()
            local root, mid, leaf, other = uuid.v4(), uuid.v4(), uuid.v4(), uuid.v4()
            for _, spec in ipairs({ { id = root }, { id = mid, parent_id = root },
                { id = leaf, parent_id = mid }, { id = other } }) do
                spec.impl_id = "kickside.test.threads:thread_kind"
                local _, err = as_owner(CREATE, spec)
                test.is_nil(err)
            end
            local group = "writer-group-" .. suffix
            service("grant_subtree", { root_component_id = root,
                subject = { subject_type = "group", subject_id = group }, access_mask = 2 })
            service("grant_subtree", { root_component_id = leaf,
                subject = { subject_type = "user", subject_id = stranger }, access_mask = 1 })
            local result, err = granted_as(stranger, { group }, APPEND_EVENT, { thread_id = leaf,
                event = { type = "kickside.test.threads:changed", body = {} } })
            test.is_nil(err)
            test.eq(result.inserted, 1)
            local rejected, reject_err = granted_as(stranger, {}, APPEND_EVENT, { thread_id = leaf,
                event = { type = "kickside.test.threads:changed", body = {} } })
            denied(rejected, reject_err)
            service("set_placement", { component_id = mid, parent_id = other })
            rejected, reject_err = granted_as(stranger, { group }, APPEND_EVENT, { thread_id = leaf,
                event = { type = "kickside.test.threads:changed", body = {} } })
            denied(rejected, reject_err)
            test.eq(event_type_count(leaf, "kickside.test.threads:changed"), 1)
        end)

        test.it("first-touch emit preserves stored owner and identity for WRITE-only grantees", function()
            local id = uuid.v4()
            register_bare_component(owner, id, "kickside.test.threads:thread_kind", {})
            local before = private_context_raw(id)
            service("grant_subtree", { root_component_id = id,
                subject = { subject_type = "user", subject_id = stranger }, access_mask = 2 })
            local result, err = granted_as(stranger, {}, EMIT, { component_id = id,
                impl_id = "app:threads_test_event_kind", type = "kickside.test.threads:changed", body = {} })
            test.is_nil(err)
            test.eq(result.inserted, 1)
            test.eq(private_context_raw(id), before)
            local found, find_err = as_owner(FIND, { thread_id = id })
            test.is_nil(find_err)
            local attrs = type(found.attrs) == "string" and json.decode(found.attrs) or found.attrs
            test.eq(attrs.user_ids[1], owner)
            test.eq(#attrs.user_ids, 1)
            local body, body_err = granted_as(stranger, {}, LIST_EVENTS, { thread_id = id })
            denied(body, body_err)
        end)

        for _, race in ipairs({ { name = "another owner's ACL", foreign = true },
            { name = "the actual winning kind", kind = "kickside.test.threads:shared_output_kind" } }) do
            test.it("first-touch registration loser checks " .. race.name .. " before attaching a thread", function()
                local id = uuid.v4()
                local funcs = require("funcs")
                local actor = security.new_actor(owner, { security_groups = {} })
                local result, err = funcs.new():with_actor(actor):with_scope(test_scope()):call("app:first_touch_race_probe", {
                    winner_actor = race.foreign and stranger or owner,
                    winner_kind = race.kind or "kickside.test.threads:thread_kind",
                    emit = { component_id = id, impl_id = "kickside.test.threads:thread_kind",
                        type = "kickside.test.threads:changed", body = {} },
                })
                denied(result, err)
                local row = component_row_exists(id)
                test.not_nil(row)
                test.eq(row.impl_id, race.kind or "kickside.test.threads:thread_kind")
                test.is_nil(component_id_of(id))
                test.eq(event_type_count(id, "kickside.test.threads:changed"), 0)
                local db, db_err = sql.get(DB)
                test.is_nil(db_err)
                local owners, owner_err = db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner'", { id })
                test.is_nil(owner_err)
                test.eq(owners[1].value, race.foreign and stranger or owner)
                db:release()
            end)
        end

        test.it("read-only and strangers cannot create a thread through declared outputs", function()
            for _, mask in ipairs({ 0, 1 }) do
                local id = uuid.v4()
                register_bare_component(owner, id, "kickside.test.threads:thread_kind", {})
                if mask == 1 then
                    service("grant_subtree", { root_component_id = id,
                        subject = { subject_type = "user", subject_id = stranger }, access_mask = 1 })
                end
                local result, err = granted_as(stranger, {}, EMIT, { component_id = id,
                    impl_id = "kickside.test.threads:thread_kind", type = "kickside.test.threads:changed", body = {} })
                denied(result, err)
                test.is_nil(component_id_of(id))
                test.eq(event_type_count(id, "kickside.test.threads:changed"), 0)
            end
        end)

        test.it("one denied target or system-only event rolls back the entire batch", function()
            local own, foreign = uuid.v4(), uuid.v4()
            local _, own_err = as_owner(CREATE, { id = own, impl_id = "kickside.test.threads:thread_kind" })
            test.is_nil(own_err)
            local _, foreign_err = run_as(stranger, CREATE, { id = foreign, impl_id = "kickside.test.threads:thread_kind" })
            test.is_nil(foreign_err)
            local result, err = restricted_as_owner(APPEND_EVENTS, { writes = {
                { thread_id = own, events = { { type = "kickside.test.threads:changed", body = {} } } },
                { thread_id = foreign, events = { { type = "kickside.test.threads:changed", body = {} } } },
            } })
            denied(result, err)
            test.eq(event_type_count(own, "kickside.test.threads:changed"), 0)
            test.eq(event_type_count(foreign, "kickside.test.threads:changed"), 0)
            result, err = restricted_as_owner(APPEND_EVENTS, { thread_id = own, events = {
                { type = "kickside.test.threads:trigger", role = "user", body = {} },
                { type = "kickside.test.threads:attested", role = "system", body = {} },
            } })
            denied(result, err)
            test.eq(event_type_count(own, "kickside.test.threads:trigger"), 0)
            test.eq(event_type_count(own, "kickside.test.threads:attested"), 0)
        end)

        test.it("duplicate input declaration cannot override system-only and maintenance needs no capability", function()
            local id = uuid.v4()
            local _, create_err = as_owner(CREATE, { id = id, impl_id = "kickside.test.threads:thread_kind" })
            test.is_nil(create_err)
            local result, err = restricted_as_owner(APPEND_EVENT, { thread_id = id, system = true,
                event = { type = "kickside.test.threads:attested", role = "system", body = { system_only = false } } })
            denied(result, err)
            local funcs = require("funcs")
            result, err = funcs.new():with_scope(user_append_scope()):call("app:test_system_output_publisher", {
                thread_id = id, event = { type = "kickside.test.threads:attested", role = "system", body = {} } })
            test.is_nil(err)
            test.eq(result.inserted, 1)
            test.eq(event_type_count(id, "kickside.test.threads:attested"), 1)
        end)

        test.it("corrupt output declarations and malformed UUID or JSON fail without writes", function()
            for _, kind in ipairs({ "bad_boolean_kind", "contradictory_kind" }) do
                local id = uuid.v4()
                local _, create_err = as_owner(CREATE, { id = id, impl_id = "kickside.test.threads:" .. kind })
                test.is_nil(create_err)
                local result, err = restricted_as_owner(APPEND_EVENT, { thread_id = id,
                    event = { type = "kickside.test.threads:changed", body = {} } })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.eq(event_type_count(id, "kickside.test.threads:changed"), 0)
            end
            for _, args in ipairs({ { thread_id = "invalid-uuid", event = { type = "kickside.test.threads:changed", body = {} } },
                { thread_id = uuid.v4(), event = { type = "kickside.test.threads:changed", body_json = "{" } } }) do
                local result, err = restricted_as_owner(APPEND_EVENT, args)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
            end
        end)

        test.it("an owner confined to another subtree cannot append or lazily emit outputs", function()
            local existing, bare = uuid.v4(), uuid.v4()
            local _, create_err = as_owner(CREATE, { id = existing, impl_id = "kickside.test.threads:thread_kind" })
            test.is_nil(create_err)
            service("register", { component_id = bare, impl_id = "kickside.test.threads:thread_kind" })
            local actor = security.new_actor(owner, { security_groups = {}, access_filter = { prefixes = {} } })
            local definition = contract.get(THREADS)
            local instance = definition:with_actor(actor):with_scope(user_append_scope()):open()
            local result, err = instance:append_event({ thread_id = existing,
                event = { type = "kickside.test.threads:changed", body = {} } })
            denied(result, err)
            result, err = instance:emit({ component_id = bare, type = "kickside.test.threads:changed", body = {} })
            denied(result, err)
            test.eq(event_type_count(existing, "kickside.test.threads:changed"), 0)
            test.eq(event_type_count(bare, "kickside.test.threads:changed"), 0)
            local found = as_owner(FIND, { thread_id = bare })
            test.is_nil(found)
        end)

        test.it("malformed batch arrays reject every event before insertion", function()
            local id = uuid.v4()
            local _, create_err = as_owner(CREATE, { id = id, impl_id = "kickside.test.threads:thread_kind" })
            test.is_nil(create_err)
            local event = { type = "kickside.test.threads:changed", body = {} }
            for _, request in ipairs({
                { thread_id = id, events = { event, ignored = event } },
                { writes = { { thread_id = id, events = { event } }, ignored = { thread_id = id, events = { event } } } },
                { thread_id = id, events = { event, [3] = event } },
                { thread_id = id, events = { { type = event.type, body_json = false } } },
            }) do
                local result, err = restricted_as_owner(APPEND_EVENTS, request)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.eq(event_type_count(id, event.type), 0)
            end
        end)

        test.it("constrains user supplied event authorship and time", function()
            local thread_id = uuid.v4()
            local emitted, emit_err = as_owner(EMIT, {
                component_id = thread_id,
                impl_id = "app:provision_test_decl",
                thread_class = "test_ws",
                type = "app:threads_ws_trigger",
                body = { upload_id = "u-input-fields-" .. suffix },
            })
            test.is_nil(emit_err)
            test.not_nil(emitted)

            for _, event in ipairs({
                { type = "app:threads_ws_trigger", role = "system", body = { upload_id = "auth-system" } },
                { type = "app:threads_ws_trigger", role = "assistant", body = { upload_id = "auth-assistant" } },
                { type = "app:threads_ws_trigger", role = "", body = { upload_id = "auth-empty-role" } },
                { type = "app:threads_ws_trigger", role = "user", external = {
                    external_source = "kickside.workflow_run", external_id = "foreign-run", external_version = "1",
                }, body = { upload_id = "auth-external" } },
                { type = "app:threads_ws_trigger", role = "user", external = {
                    external_source = "actor:someone-else", external_id = "foreign-run",
                }, body = { upload_id = "auth-foreign-actor" } },
                { type = "app:threads_ws_trigger", role = "user", created_at = "2000-01-01T00:00:00Z",
                    body = { upload_id = "auth-time" } },
            }) do
                local appended, append_err = restricted_as_owner(APPEND_EVENT, { thread_id = thread_id, event = event })
                test.is_nil(appended)
                test.not_nil(append_err)
                test.eq((append_err :: any):kind(), errors.PERMISSION_DENIED)
            end

            local allowed, allowed_err = restricted_as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "app:threads_ws_trigger", role = "user",
                    external = { external_source = "actor:" .. owner, external_id = "own-event" },
                    body = { accepted = true } },
            })
            test.is_nil(allowed_err)
            test.not_nil(allowed)
            test.eq(allowed.inserted, 1)

            local defaulted, default_err = restricted_as_owner(APPEND_EVENT, {
                thread_id = thread_id,
                event = { type = "app:threads_ws_trigger", body = { upload_id = "auth-default-role" } },
            })
            test.is_nil(default_err)
            test.not_nil(defaulted)
            local events, list_err = as_owner(LIST_EVENTS, { thread_id = thread_id, ascending = true })
            test.is_nil(list_err)
            test.eq(events.events[#events.events].role, "user")
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
