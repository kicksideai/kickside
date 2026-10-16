-- Reaper: a kickside.lifecycle.events:principal.deleted report reaps every component the named owner still owns,
-- through the trusted component.system_delete. Registers real components owned by a
-- test user, drives one reaper tick over a constructed event batch, and asserts the
-- owner's components are gone and the tick is idempotent. Runs under a real actor so
-- ownership flows through the normal component access path.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local funcs = require("funcs")
local component = require("component")
local provision = require("provision")
local lifecycle_consts = require("lifecycle_consts")
local projection_worker = require("projection_worker")
local framework_events = require("framework_events")

local COMPONENT_SERVICE = "kickside.component:component_service"
local TEST_IMPL = "kickside.test:reap"
local RETRY_IMPL = "kickside.core.lifecycle:reaper_retry_binding"

local function define_tests()
    test.describe("Lifecycle Reaper", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner_id = "reap-owner-" .. suffix

        local function scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end
        local function empty_scope()
            local test_scope, scope_err = security.new_scope({})
            if scope_err or not test_scope then error("empty test scope: " .. tostring(scope_err)) end
            return test_scope
        end
        local function admin_scope()
            local delete_policy, delete_err = security.policy("app:test_lifecycle_report_access")
            if delete_err or not delete_policy then error("admin delete policy: " .. tostring(delete_err)) end
            local call_policy, call_err = security.policy("app:test_lifecycle_report_call")
            if call_err or not call_policy then error("admin report-call policy: " .. tostring(call_err)) end
            local test_scope, scope_err = security.new_scope({ delete_policy, call_policy })
            if scope_err or not test_scope then error("admin test scope: " .. tostring(scope_err)) end
            return test_scope
        end
        local function as_owner(subject_id: string?, groups: { string }?)
            local actor = security.new_actor(subject_id or owner_id, { security_groups = groups or {} })
            local def, gerr = contract.get(COMPONENT_SERVICE)
            if gerr or not def then error("component_service unavailable: " .. tostring(gerr)) end
            local inst, oerr = def:with_actor(actor):with_scope(scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst
        end
        local function threads_as(subject_id: string, groups: { string }?)
            local actor = security.new_actor(subject_id, { security_groups = groups or {} })
            local def, gerr = contract.get("kickside.core:threads")
            if gerr or not def then error("threads unavailable: " .. tostring(gerr)) end
            local inst, oerr = def:with_actor(actor):with_scope(scope()):open()
            if oerr or not inst then error("open threads failed: " .. tostring(oerr)) end
            return inst
        end
        local function lifecycle_thread_id(): string
            local thread_id = lifecycle_consts.thread_id()
            local rows, err = component.list_system({ component_ids = { thread_id }, include = { meta = false }, limit = 1 })
            if err then error("system lifecycle lookup failed: " .. tostring(err)) end
            if not rows or not rows[1] then
                local actor = security.new_actor(lifecycle_consts.SYSTEM_ACTOR,
                    { system = true, groups = { "system", "lifecycle" } })
                local process_scope, scope_err = security.named_scope(lifecycle_consts.SYSTEM_SCOPE)
                if not actor or not process_scope then
                    error("system lifecycle setup identity unavailable: " .. tostring(scope_err))
                end
                local _, ensure_err = provision.ensure_system(actor, process_scope)
                if ensure_err then error("system lifecycle setup failed: " .. tostring(ensure_err)) end
                local _, converge_err = provision.converge(actor, process_scope)
                if converge_err then error("system lifecycle convergence failed: " .. tostring(converge_err)) end
                rows, err = component.list_system({ component_ids = { thread_id }, include = { meta = false }, limit = 1 })
            end
            if err or not rows or not rows[1] then error("system lifecycle component unavailable: " .. tostring(err)) end
            return thread_id
        end
        local function register_impl(impl_id: string, label: string, subject_id: string?)
            local res, err = as_owner(subject_id):register({ impl_id = impl_id, meta = { label = label } })
            if err or not res or not res.component_id then
                error("register failed: " .. tostring(err or (res and (res :: any).error)))
            end
            return res.component_id
        end
        local function register(label: string, subject_id: string?)
            return register_impl(TEST_IMPL, label, subject_id)
        end
        -- The 51-row page cases exercise the reaper, not registration. Seed
        -- canonical owner pointers in one transaction so runner load cannot
        -- spend the 30-second case budget on 51 service round trips.
        local function seed_owned_page(principal: string, grant_to: string?): ()
            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            local tx, begin_err = db:begin()
            if begin_err or not tx then db:release(); error(tostring(begin_err)) end
            local dbtype = tostring(db:type())
            for index = 1, 51 do
                local id = uuid.v7()
                local path = dbtype == sql.type.POSTGRES and id:gsub("%-", "") or "/" .. id .. "/"
                local _, component_err = tx:execute([[INSERT INTO kickside_components
                    (component_id,impl_id,private_context,position,path)
                    VALUES ($1,$2,'{}','n',$3)]], { id, TEST_IMPL, path })
                if component_err then tx:rollback(); db:release(); error(tostring(component_err)) end
                local _, meta_err = tx:execute([[INSERT INTO kickside_component_meta
                    (meta_id,component_id,key,value) VALUES ($1,$2,'owner',$3)]],
                    { uuid.v7(), id, principal })
                if meta_err then tx:rollback(); db:release(); error(tostring(meta_err)) end
                local _, ancestor_err = tx:execute([[INSERT INTO kickside_component_ancestor
                    (component_id,ancestor_id,depth) VALUES ($1,$1,0)]], { id })
                if ancestor_err then tx:rollback(); db:release(); error(tostring(ancestor_err)) end
                if grant_to then
                    local _, grant_err = tx:execute([[INSERT INTO kickside_component_access
                        (access_id,subject_type,subject_id,component_id,source_component_id,access_mask,inherited)
                        VALUES ($1,'user',$2,$3,$4,1,0)]], { uuid.v7(), grant_to, id, id })
                    if grant_err then tx:rollback(); db:release(); error(tostring(grant_err)) end
                end
            end
            local _, commit_err = tx:commit()
            db:release()
            if commit_err then error(tostring(commit_err)) end
        end
        local function owned_count(subject_id: string?)
            local rows = component.list_system({ meta = { owner = subject_id or owner_id }, include = { meta = false } })
            return rows and #rows or 0
        end
        local function run_as_system(input: table, actor_id: string?): (table?, error?)
            local actor = security.new_actor(actor_id or lifecycle_consts.SYSTEM_ACTOR,
                { system = true, groups = { "system", "lifecycle" } })
            local process_scope, scope_err = security.named_scope(lifecycle_consts.SYSTEM_SCOPE)
            if not actor or not process_scope then error("system lifecycle identity unavailable: " .. tostring(scope_err)) end
            return funcs.new():with_actor(actor):with_scope(process_scope):call("kickside.core.lifecycle:reaper", input)
        end
        local function tick(subject_id: string?)
            return run_as_system({
                thread_id = lifecycle_thread_id(),
                events = { { type = "kickside.lifecycle.events:principal.deleted", role = "system",
                    body = { subject_id = subject_id or owner_id } } },
                range = { to_seq = 1 },
                projection = { body = {} },
            })
        end

        test.it("host administrators share the system singleton with independent READ and ADMIN grants", function()
            local thread_id = lifecycle_thread_id()
            local admin = as_owner("lifecycle-admin-" .. suffix, { "app:admin" })
            local reader_id, recipient_id = "lifecycle-reader-" .. suffix, "lifecycle-recipient-" .. suffix
            local subject = { subject_id = reader_id, subject_type = "user" }
            local granted, grant_err = admin:grant_subtree({ root_component_id = thread_id,
                subject = subject, access_mask = 1 })
            test.is_nil(grant_err, tostring(grant_err))
            test.is_true(granted.success, granted.error)
            local reader = as_owner(reader_id)
            local readable, read_err = reader:get({ component_id = thread_id })
            test.is_nil(read_err, tostring(read_err))
            test.is_true(readable.success, readable.error)
            local denied, denied_err = reader:grant_subtree({ root_component_id = thread_id,
                subject = { subject_id = recipient_id, subject_type = "user" }, access_mask = 1 })
            test.is_nil(denied_err, tostring(denied_err))
            test.is_false(denied.success)
            test.eq(denied.kind, errors.PERMISSION_DENIED)
            local delegated, delegate_err = admin:grant_subtree({ root_component_id = thread_id,
                subject = subject, access_mask = 9 })
            test.is_nil(delegate_err, tostring(delegate_err))
            test.is_true(delegated.success, delegated.error)
            local reshared, reshare_err = reader:grant_subtree({ root_component_id = thread_id,
                subject = { subject_id = recipient_id, subject_type = "user" }, access_mask = 1 })
            test.is_nil(reshare_err, tostring(reshare_err))
            test.is_true(reshared.success, reshared.error)
            local recipient, recipient_err = as_owner(recipient_id):get({ component_id = thread_id })
            test.is_nil(recipient_err, tostring(recipient_err))
            test.is_true(recipient.success, recipient.error)
            local no_delete, delete_err = reader:delete({ component_id = thread_id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_false(no_delete.success)
            test.eq(no_delete.kind, errors.PERMISSION_DENIED)
            local revoked, revoke_err = admin:revoke_subtree({ root_component_id = thread_id, subject = subject })
            test.is_nil(revoke_err, tostring(revoke_err))
            test.is_true(revoked.success, revoked.error)
            local hidden, hidden_err = reader:get({ component_id = thread_id })
            test.is_nil(hidden_err, tostring(hidden_err))
            test.is_false(hidden.success)
            test.is_true(hidden.kind == errors.PERMISSION_DENIED or hidden.kind == errors.NOT_FOUND)
        end)

        test.it("system setup installs and can dispatch the private lifecycle reaper", function()
            local thread_id = lifecycle_thread_id()
            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            local rows, query_err = db:query([[SELECT p.body, c.actor_id, c.execution_identity_json
                FROM kickside_projection p
                JOIN kickside_projection_cursor c ON c.projection_id = p.id
                WHERE p.thread_id=$1 AND p.kind='lifecycle.reap']], { thread_id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.not_nil(rows)
            test.eq(#rows, 1, "the system lifecycle declaration must register one reaper")
            test.is_nil(rows[1].actor_id)
            test.is_nil(rows[1].execution_identity_json)
            test.is_true(tostring(rows[1].body):find("kickside.core.lifecycle:reaper", 1, true) ~= nil)

            local binding, parse_err = projection_worker.parse("func://kickside.core.lifecycle:reaper", true)
            test.is_nil(parse_err)
            local system_binding = binding :: any
            system_binding.system_identity = true
            local system_actor = security.new_actor(lifecycle_consts.SYSTEM_ACTOR,
                { system = true, groups = { "system", "lifecycle" } })
            local process_scope, scope_err = security.named_scope(lifecycle_consts.SYSTEM_SCOPE)
            test.is_nil(scope_err)
            local system_funcs, actor_err = funcs.new():with_actor(system_actor):with_scope(process_scope)
            test.is_nil(actor_err)
            local dispatched, dispatch_err = system_funcs:call("kickside.core.lifecycle:reaper_dispatch_probe", {
                binding = system_binding,
                input = { thread_id = thread_id, events = {}, range = { to_seq = 0 }, projection = { body = {} } },
            })
            test.is_nil(dispatch_err, tostring(dispatch_err))
            test.is_nil(dispatched.error)
            test.not_nil(dispatched.output)
        end)

        test.it("publishes authorized principal deletion reports through the scoped audit capability", function()
            local principal = "legitimate-reporter-" .. suffix
            local actor = security.new_actor("report-admin-" .. suffix, { security_groups = { "app.security:admin" } })
            local caller = funcs.new():with_actor(actor):with_scope(admin_scope())
            local first, first_err = caller:call("kickside.core.lifecycle:reaper_report_probe", { subject_id = principal })
            test.is_nil(first_err, tostring(first_err))
            test.not_nil(first)
            test.is_true(first.reported, tostring(first.error))
            local second, second_err = caller:call("kickside.core.lifecycle:reaper_report_probe", { subject_id = principal })
            test.is_nil(second_err, tostring(second_err))
            test.not_nil(second)
            test.is_true(second.reported)

            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            local rows, query_err = db:query([[SELECT role, type FROM kickside_event
                WHERE thread_id=$1 AND external_source='lifecycle' AND external_id=$2]],
                { lifecycle_thread_id(), "kickside.lifecycle.events:principal.deleted:" .. principal })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.not_nil(rows)
            test.eq(#rows, 1)
            test.eq(rows[1].role, "system")
            test.eq(rows[1].type, "kickside.lifecycle.events:principal.deleted")
        end)

        test.it("reaps every component the deleted principal owned, idempotently", function()
            register("first")
            register("second")
            test.eq(owned_count(), 2)

            local out = tick()
            test.is_true(type(out) == "table")
            test.eq(out.last_seq, 1)
            test.eq(owned_count(), 0)

            -- Idempotent: a retried tick over the same report reaps nothing and never errors.
            local out2 = tick()
            test.is_true(type(out2) == "table")
            test.eq(owned_count(), 0)
        end)

        test.it("does not reap from a user-owned thread even when its event body names a victim", function()
            local victim = "provenance-victim-" .. suffix
            local victim_component = register("provenance-victim", victim)
            local attacker = "provenance-attacker-" .. suffix
            local created, create_err = threads_as(attacker):create({ thread_class = "provenance-" .. suffix })
            test.is_nil(create_err)
            test.not_nil(created)

            local out, run_err = run_as_system({
                thread_id = created.thread_id,
                events = { { type = "kickside.lifecycle.events:principal.deleted", role = "system",
                    body = { subject_id = victim } } },
                range = { to_seq = 1 },
                projection = { body = {} },
            })
            test.is_nil(out)
            test.not_nil(run_err)
            test.eq((run_err :: any):kind(), errors.PERMISSION_DENIED)
            test.eq(owned_count(victim), 1)
            test.not_nil(component.list_system({ component_ids = { victim_component }, include = { meta = false }, limit = 1 })[1])
        end)

        test.it("rejects a malformed event subject on the lifecycle thread", function()
            local victim = "malformed-subject-victim-" .. suffix
            local victim_component = register("malformed-subject-victim", victim)
            local out, run_err = run_as_system({
                thread_id = lifecycle_thread_id(),
                events = { { type = "kickside.lifecycle.events:principal.deleted", role = "system",
                    body = { subject_id = { victim } } } },
                range = { to_seq = 1 },
                projection = { body = {} },
            })
            test.is_nil(out)
            test.not_nil(run_err)
            test.eq((run_err :: any):kind(), errors.INVALID)
            test.eq(owned_count(victim), 1)
            test.not_nil(component.list_system({ component_ids = { victim_component }, include = { meta = false }, limit = 1 })[1])
        end)

        test.it("accepts a framework dispatcher actor on the lifecycle thread", function()
            local out, run_err = run_as_system({
                thread_id = lifecycle_thread_id(),
                events = {},
                range = { to_seq = 0 },
                projection = { body = {} },
            }, "system:kickside.jobs")
            test.is_nil(run_err, tostring(run_err))
            test.not_nil(out)
        end)

        test.it("the full user attack cannot register, append to, or call the private lifecycle reaper", function()
            local victim = "full-attack-victim-" .. suffix
            local victim_component = register("full-attack-victim", victim)
            local attacker = "full-attack-attacker-" .. suffix
            local user_groups = { "app.security:user", "app:user" }
            local attacker_actor = security.new_actor(attacker, { security_groups = user_groups })
            local threads = threads_as(attacker, user_groups)
            local created, create_err = threads:create({ thread_class = "full-attack-" .. suffix })
            test.is_nil(create_err)
            local thread_id = tostring(created.thread_id)

            local registered, register_err = funcs.new():with_actor(attacker_actor):with_scope(scope()):call(
                "app:test_register_projection", { thread_id = thread_id,
                    body = { kind = "forged-reaper", worker_ref = "func://kickside.core.lifecycle:reaper",
                        worker_input_mode = "prefetch_events" } })
            test.is_nil(register_err)
            test.eq(registered.status, 403)

            local contract_registered, contract_register_err = threads:register_projection({
                thread_id = thread_id,
                kind = "contract-forged-reaper",
                worker_ref = "func://kickside.core.lifecycle:reaper",
                worker_input_mode = "prefetch_events",
            })
            test.is_nil(contract_registered)
            test.not_nil(contract_register_err)
            test.eq((contract_register_err :: any):kind(), errors.PERMISSION_DENIED, "user registration on own thread")

            local system_registered, system_register_err = threads:register_projection({
                thread_id = lifecycle_thread_id(),
                kind = "attacker-on-system-thread",
                worker_ref = "func://kickside.core.lifecycle:reaper",
                worker_input_mode = "prefetch_events",
            })
            test.is_nil(system_registered)
            test.not_nil(system_register_err)
            test.eq((system_register_err :: any):kind(), errors.PERMISSION_DENIED, "user registration on system thread")

            local own_append, own_append_err = threads:append_event({ thread_id = thread_id, event = {
                type = "kickside.lifecycle.events:principal.deleted", role = "user", body = { subject_id = victim },
            } })
            test.is_nil(own_append)
            test.not_nil(own_append_err)
            test.eq((own_append_err :: any):kind(), errors.PERMISSION_DENIED,
                "forged append on own thread: " .. tostring(own_append_err))

            local audit_append, audit_append_err = funcs.new():with_actor(attacker_actor):with_scope(empty_scope()):call(
                "kickside.core.threads:append_event_method", { thread_id = lifecycle_thread_id(),
                audit = true, audit_thread = { impl_id = "kickside.core.lifecycle:system_lifecycle",
                    thread_class = lifecycle_consts.CLASS,
                    audience_principal = { kind = "service", id = lifecycle_consts.SYSTEM_ACTOR } },
                event = { type = "kickside.lifecycle.events:principal.deleted", role = "system",
                    body = { subject_id = victim }, external = { external_source = "lifecycle",
                        external_id = "forged:" .. victim } },
            })
            test.is_nil(audit_append)
            test.not_nil(audit_append_err)
            test.eq((audit_append_err :: any):kind(), errors.PERMISSION_DENIED, "user cannot use the audit bypass")

            local direct_publish, direct_publish_err = funcs.new():with_actor(attacker_actor):with_scope(empty_scope()):call(
                "kickside.core.lifecycle:publish_report", {
                    event_type = "kickside.lifecycle.events:principal.deleted", subject_id = victim,
                })
            test.is_nil(direct_publish)
            test.not_nil(direct_publish_err)
            test.eq((direct_publish_err :: any):kind(), errors.PERMISSION_DENIED,
                "user cannot invoke the private framework reporter")

            local report_probe, report_probe_err = funcs.new():with_actor(attacker_actor):with_scope(empty_scope()):call(
                "kickside.core.lifecycle:reaper_report_probe", { subject_id = victim })
            test.is_nil(report_probe_err, tostring(report_probe_err))
            test.not_nil(report_probe)
            test.is_false(report_probe.reported, "the public report library cannot delegate an unauthorized delete")
            test.not_nil(report_probe.error)

            local queue_append, queue_append_err = threads:append_event({ thread_id = lifecycle_thread_id(), event = {
                type = "kickside.lifecycle.events:principal.deleted", role = "user", body = { subject_id = victim },
            } })
            test.is_nil(queue_append)
            test.not_nil(queue_append_err)
            test.eq((queue_append_err :: any):kind(), errors.PERMISSION_DENIED, "forged append on lifecycle thread")

            local direct_call, direct_call_err = funcs.new():with_actor(attacker_actor):with_scope(scope()):call(
                "kickside.core.lifecycle:reaper", {
                    thread_id = lifecycle_thread_id(),
                    events = { { type = "kickside.lifecycle.events:principal.deleted",
                        body = { subject_id = victim } } },
                    range = { to_seq = 1 },
                    projection = { body = {} },
                })
            test.is_nil(direct_call)
            test.not_nil(direct_call_err)
            test.eq((direct_call_err :: any):kind(), errors.PERMISSION_DENIED, "direct worker call by user")

            local out, wrong_thread_err = run_as_system({
                thread_id = thread_id,
                events = { { type = "kickside.lifecycle.events:principal.deleted", body = { subject_id = victim } } },
                range = { to_seq = 1 },
                projection = { body = {} },
            })
            test.is_nil(out)
            test.not_nil(wrong_thread_err)
            test.eq((wrong_thread_err :: any):kind(), errors.PERMISSION_DENIED, "system worker input from wrong thread")
            test.eq(owned_count(victim), 1)
            test.not_nil(component.list_system({ component_ids = { victim_component }, include = { meta = false }, limit = 1 })[1])
            test.is_nil(framework_events.append_framework_event, "no parallel framework append entry point")
        end)

        test.it("publishes a legitimate lifecycle report through the caller's authorized delete frame", function()
            local principal = "authorized-report-" .. suffix
            local actor = security.new_actor("report-admin-" .. suffix, { security_groups = { "app.security:admin" } })
            local result, call_err = funcs.new():with_actor(actor):with_scope(admin_scope()):call(
                "kickside.core.lifecycle:reaper_report_probe", { subject_id = principal })
            test.is_nil(call_err, tostring(call_err))
            test.not_nil(result)
            test.is_true(result.reported, tostring(result.error))

            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            local rows, query_err = db:query([[SELECT role, type FROM kickside_event
                WHERE thread_id=$1 AND external_source='lifecycle' AND external_id=$2]],
                { lifecycle_thread_id(), "kickside.lifecycle.events:principal.deleted:" .. principal })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.not_nil(rows)
            test.eq(#rows, 1)
            test.eq(rows[1].role, "system")
            test.eq(rows[1].type, "kickside.lifecycle.events:principal.deleted")
        end)

        test.it("reaps stored plain-thread containers after an installation update", function()
            local principal = "stored-containers-" .. suffix
            local ids = {}
            for _, class in ipairs({ "kickside.inbox", "kickside.uploads" }) do
                local created, err = threads_as(principal):create({ thread_class = class })
                test.is_nil(err, tostring(err))
                test.not_nil(created)
                ids[#ids + 1] = created.thread_id
            end
            local root = lifecycle_thread_id()
            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            local original, read_err = db:query("SELECT impl_id FROM kickside_components WHERE component_id=$1", { root })
            if read_err then db:release(); error(read_err) end
            local _, seed_err = db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2",
                { "kickside.core:thread", root })
            if seed_err then db:release(); error(seed_err) end
            local actor = security.new_actor("report-admin-" .. suffix, { security_groups = { "app.security:admin" } })
            local result, call_err = funcs.new():with_actor(actor):with_scope(admin_scope()):call(
                "kickside.core.lifecycle:reaper_report_probe", { subject_id = principal })
            local stored, stored_err = db:query("SELECT impl_id FROM kickside_components WHERE component_id=$1", { root })
            local _, restore_err = db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2",
                { original[1].impl_id, root })
            local _, release_err = db:release()
            test.is_nil(stored_err, tostring(stored_err))
            test.eq(stored[1].impl_id, "kickside.core:thread")
            test.is_nil(restore_err, tostring(restore_err))
            test.is_nil(release_err, tostring(release_err))
            test.is_nil(call_err, tostring(call_err))
            test.not_nil(result)
            test.is_true(result.reported, tostring(result.error))
            local out, err = tick(principal)
            test.is_nil(err, tostring(err))
            test.not_nil(out)
            test.eq(owned_count(principal), 0)
            test.eq(#component.list_system({ component_ids = ids, limit = 2 }), 0)
            local handle, handle_err = sql.get("app:db")
            if handle_err or not handle then error(tostring(handle_err)) end
            for _, id in ipairs(ids) do
                local rows, query_err = handle:query("SELECT id FROM kickside_thread WHERE id=$1", { id })
                test.is_nil(query_err, tostring(query_err))
                test.eq(#rows, 0)
            end
            local _, close_err = handle:release()
            test.is_nil(close_err, tostring(close_err))
        end)

        test.it("keeps a parent as retry evidence when a child delete fails", function()
            local principal = "nested-reap-" .. uuid.v4():sub(1, 8)
            local parent = register("parent", principal)
            local child = register_impl(RETRY_IMPL, "child", parent)
            local out, err = tick(principal)
            test.is_nil(out)
            test.not_nil(err)
            test.eq(owned_count(principal), 1, "parent remains a durable ownership pointer")
            test.eq(owned_count(parent), 1, "child remains for retry")
            local retried, retry_err = tick(principal)
            test.is_nil(retry_err, tostring(retry_err))
            test.not_nil(retried)
            test.eq(owned_count(principal), 0)
            test.eq(owned_count(parent), 0)
        end)

        test.it("drains a large owner's components over bounded retry ticks", function()
            local principal = "page-reap-" .. uuid.v4():sub(1, 8)
            seed_owned_page(principal)
            local first, first_err = tick(principal)
            test.is_nil(first)
            test.not_nil(first_err)
            test.eq(owned_count(principal), 1, "one row remains after the bounded pass: " .. tostring(first_err))
            local second, second_err = tick(principal)
            test.is_nil(second_err, tostring(second_err))
            test.not_nil(second)
            test.eq(owned_count(principal), 0)
        end)

        test.it("removes a deleted user's grant while preserving a shared component", function()
            local sharer = "shared-owner-" .. uuid.v4():sub(1, 8)
            local deleted = "shared-recipient-" .. uuid.v4():sub(1, 8)
            local shared = register("shared", sharer)
            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            local _, insert_err = db:execute([[INSERT INTO kickside_component_access
                (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, inherited)
                VALUES ($1, 'user', $2, $3, $4, 1, 0)]], { uuid.v7(), deleted, shared, shared })
            test.is_nil(insert_err, tostring(insert_err))
            local out, tick_err = tick(deleted)
            test.is_nil(tick_err, tostring(tick_err))
            test.not_nil(out)
            local rows, query_err = db:query([[SELECT access_id FROM kickside_component_access
                WHERE subject_type='user' AND subject_id=$1 AND component_id=$2]], { deleted, shared })
            test.is_nil(query_err, tostring(query_err))
            test.eq(#rows, 0, "deleted recipient's grant must be removed")
            test.eq(owned_count(sharer), 1, "the sharer's component must survive")
            db:release()
        end)

        test.it("drains shared-component grants in bounded retry pages", function()
            local sharer = "grant-owner-" .. uuid.v4():sub(1, 8)
            local deleted = "grant-recipient-" .. uuid.v4():sub(1, 8)
            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err)) end
            seed_owned_page(sharer, deleted)
            local function grant_count(): integer
                local rows, err = db:query([[SELECT COUNT(*) AS n FROM kickside_component_access
                    WHERE subject_type='user' AND subject_id=$1]], { deleted })
                if err then error(tostring(err)) end
                return tonumber(rows[1].n) :: integer
            end
            local first, first_err = tick(deleted)
            test.is_nil(first)
            test.not_nil(first_err)
            test.eq(grant_count(), 1, "only one grant remains after a bounded page")
            local second, second_err = tick(deleted)
            test.is_nil(second_err, tostring(second_err))
            test.not_nil(second)
            test.eq(grant_count(), 0)
            test.eq(owned_count(sharer), 51, "the shared components survive")
            db:release()
        end)

        test.it("advances after the declared principal cleanup succeeds", function()
            local out = tick()
            test.eq((out :: any).last_seq, 1)
        end)

        test.it("fails the tick when a declared principal cleanup fails", function()
            local out, err = tick("cleanup-fail-" .. suffix)
            test.is_nil(out)
            test.is_true(tostring(err):find("cleanup down", 1, true) ~= nil, tostring(err))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
