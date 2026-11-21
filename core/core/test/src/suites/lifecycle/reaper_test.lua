local deletion_worker = require("deletion_worker")
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
local claim = require("claim")
local time = require("time")
local registry = require("registry")
local json = require("json")
local lifecycle_log = require("lifecycle_log")

local COMPONENT_SERVICE = "kickside.component:component_service"
local TEST_IMPL = "kickside.test:reap"
local RETRY_IMPL = "kickside.core.lifecycle:reaper_retry_binding"
-- Direct typed worker probes use a sequence outside the materialized test queue.
local PROBE_SEQ = 1000000

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
                    (component_id,impl_id,private_context,position,path,secrets_incarnation,owner_type,owner_kind,owner_id,custody_legacy)
                    VALUES ($1,$2,'{}','n',$3,$4,'principal','user',$5,0)]], { id, TEST_IMPL, path, uuid.v4(), principal })
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
        local function finish_owner(subject_id: string?): (boolean, error?)
            local rows, list_err = component.list_system({meta = {owner = subject_id or owner_id}, include = {meta = false}, limit = 100})
            if list_err then return false, list_err end
            for _, row in ipairs(rows) do
                local finished, finish_err = deletion_worker.run(row.component_id)
                if finish_err then return false, finish_err end
                test.is_true(finished.deleted)
            end
            return true, nil
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
                events = { { type = "kickside.lifecycle.events:principal.deleted", role = "system", id = uuid.v7(), seq = PROBE_SEQ,
                    body = { subject_id = subject_id or owner_id, principal_kind = "user" } } },
                range = { to_seq = PROBE_SEQ },
                projection = { body = {} },
            })
        end

        local function component_tick(id: string, incarnation: string?): (table?, error?)
            return run_as_system({
                thread_id = lifecycle_thread_id(),
                events = {{type = "kickside.lifecycle.events:component.deleted", role = "system",
                    body = {subject_id = id, incarnation = incarnation}}},
                range = {to_seq = 1},
            })
        end

        local function query(statement: string, id: string): any
            local db = assert(sql.get("app:db"))
            local rows, err = db:query(statement, {id})
            assert(db:release())
            assert(rows, tostring(err))
            return rows
        end

        local function job_count(id: string): number
            return #query("SELECT id FROM kickside_job WHERE owner_kind='component' AND owner_id=$1", id)
        end

        local function instance(id: string): string
            return assert(query("SELECT secrets_incarnation FROM kickside_components WHERE component_id=$1", id)[1]).secrets_incarnation
        end

        test.it("keeps a WRITE-only metadata edit from assigning lifecycle custody", function()
            local owner, writer = "custody-owner-" .. suffix, "custody-writer-" .. suffix
            local victim = register_impl(RETRY_IMPL, "backing data", owner)
            local custodian = register("writer's component", writer)
            local incarnation = instance(custodian)
            local db = assert(sql.get("app:db"))
            assert(db:execute([[CREATE TABLE IF NOT EXISTS kickside_test_lifecycle_reaper_retry
                (component_id TEXT PRIMARY KEY)]]))
            assert(db:execute("INSERT INTO kickside_test_lifecycle_reaper_retry (component_id) VALUES ($1)", {victim}))
            assert(db:release())

            local granted = assert(as_owner(owner):grant_subtree({root_component_id = victim,
                subject = {subject_type = "user", subject_id = writer}, access_mask = 2}))
            test.is_true(granted.success, tostring(granted.error))
            local svc = as_owner(writer)
            local update = assert(svc:set_meta({component_id = victim, fields = {owner = custodian}}))
            test.is_true(update.success, tostring(update.error))
            local sharing = assert(as_owner(owner):list_access({component_id = victim}))
            test.eq(sharing.owner, owner)
            local rows = assert(as_owner(owner):query({component_ids = {victim}, principal_owner = owner,
                include = {principal_owner = true, meta = true}})).components
            test.eq(#rows, 1)
            test.eq(rows[1].principal_owner, owner)
            test.eq(rows[1].meta.owner, custodian)
            test.eq(assert(svc:delete({component_id = victim})).kind, errors.PERMISSION_DENIED)
            test.is_true(assert(svc:delete({component_id = custodian})).in_progress)
            test.is_true(assert(deletion_worker.run(custodian)).deleted)
            local result, err = component_tick(custodian, incarnation)
            test.eq(job_count(victim), 0, "forged metadata must never enroll a deletion")
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.not_nil(instance(victim))
            test.eq(#query("SELECT component_id FROM kickside_test_lifecycle_reaper_retry WHERE component_id=$1", victim), 1)
        end)

        test.it("retires only typed dependants when principal and component IDs collide", function()
            local collision = uuid.v4()
            local actor_id = "custody-operator-" .. suffix
            local svc = as_owner(actor_id)
            local principal_child = register("principal-owned", collision)
            local function register_custodian()
                local result = assert(svc:register({impl_id = TEST_IMPL, component_id = collision}))
                test.is_true(result.success, tostring(result.error))
                return instance(collision)
            end

            local previous = register_custodian()
            test.is_true(assert(svc:delete({component_id = collision})).in_progress)
            test.is_true(assert(deletion_worker.run(collision)).deleted)
            test.eq(job_count(principal_child), 0, "request deletion must preserve the colliding principal's component")
            local current = register_custodian()
            test.is_true(current ~= previous)
            local producer = funcs.new():with_actor(security.new_actor(actor_id, {})):with_scope(scope())
            local child = assert(producer:call("kickside.core.lifecycle:reaper_register_child",
                {impl_id = TEST_IMPL, parent_id = collision}))
            test.is_true(child.success, tostring(child.error))
            local component_child = child.component_id

            local reporter = security.new_actor("report-admin-" .. suffix, {security_groups = {"app.security:admin"}})
            local published = assert(funcs.new():with_actor(reporter):with_scope(admin_scope())
                :call("kickside.core.lifecycle:reaper_report_probe", {subject_id = collision, component = true}))
            test.is_true(published.reported, tostring(published.error))
            local source = assert(query([[SELECT id,seq,type,body FROM kickside_event
                WHERE external_source='lifecycle' AND external_id=$1]],
                "kickside.lifecycle.events:component.deleted:" .. collision)[1])
            local invocation = {thread_id = lifecycle_thread_id(), events = {source}, range = {to_seq = source.seq}}
            local legacy, legacy_err = run_as_system(invocation)
            test.eq(job_count(principal_child) + job_count(component_child), 0, "an ID-only report has no custody authority")
            test.is_nil(legacy_err, tostring(legacy_err))
            test.eq(legacy.last_seq, source.seq)
            local saved = query([[SELECT event_id,event_seq,subject_id,reason,witness_id,witness_incarnation
                FROM kickside_lifecycle_custody_disposition WHERE event_id=$1]], source.id)
            test.eq(#saved, 1)
            test.eq(saved[1].event_seq, source.seq)
            test.eq(saved[1].subject_id, collision)
            test.eq(saved[1].reason, "missing_component_incarnation")
            test.is_nil(saved[1].witness_id)
            test.is_nil(saved[1].witness_incarnation)
            test.eq(assert(run_as_system(invocation)).last_seq, source.seq)
            test.eq(#query("SELECT event_id FROM kickside_lifecycle_custody_disposition WHERE event_id=$1", source.id), 1)
            test.eq(instance(collision), current)
            local stale, stale_err = component_tick(collision, previous)
            test.is_nil(stale_err, tostring(stale_err))
            test.not_nil(stale)
            test.eq(job_count(principal_child) + job_count(component_child), 0)

            local pending = tick(collision)
            test.is_nil(pending)
            test.eq(job_count(principal_child), 1)
            test.eq(job_count(component_child), 0)
            test.is_true(assert(deletion_worker.run(principal_child)).deleted)
            test.not_nil(assert(tick(collision)))
            test.eq(instance(collision), current)

            local component_pending = component_tick(collision, current)
            test.is_nil(component_pending)
            test.eq(job_count(component_child), 1)
            test.is_true(assert(deletion_worker.run(component_child)).deleted)
            test.not_nil(assert(component_tick(collision, current)))
            test.eq(instance(collision), current)
        end)

        test.it("rechecks the reported principal at the descendant deletion fence after adoption", function()
            local prior = "custody-prior-" .. suffix
            local custodian = register("adoptable custodian", prior)
            local incarnation = instance(custodian)
            local producer = funcs.new():with_actor(security.new_actor(prior, {})):with_scope(scope())
            local child = assert(producer:call("kickside.core.lifecycle:reaper_register_child",
                {impl_id = TEST_IMPL, parent_id = custodian}))
            test.is_true(child.success, tostring(child.error))
            local child_id = child.component_id

            -- The report's selection precedes the authorized adoption of the orphan.
            local expected = {
                owner = {type = "component", id = custodian, incarnation = incarnation},
                incarnation = instance(child_id),
                principal_root = {id = custodian, incarnation = incarnation,
                    owner = {type = "principal", kind = "user", id = prior}},
            }
            local db = assert(sql.get("app:db"))
            assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {custodian}))
            assert(db:release())
            local adopter = "custody-adopter-" .. suffix
            local adopted = assert(as_owner(adopter):adopt({component_id = custodian}))
            test.is_true(adopted.success, tostring(adopted.error))

            local _, err = component.system_delete(child_id, "reparent_root", expected)
            test.eq(job_count(child_id), 0, "adoption must invalidate the former principal's authority")
            test.is_nil(err, tostring(err))
            test.eq(job_count(custodian), 0)
        end)

        test.it("can process a typed principal report alongside unclassified upgrade data", function()
            local principal = "custody-known-" .. suffix
            local legacy = register("unclassified upgrade data", "custody-legacy-" .. suffix)
            local known = register("new principal component", principal)
            local db = assert(sql.get("app:db"))
            assert(db:execute([[UPDATE kickside_components SET owner_type='unresolved',owner_kind=NULL,owner_id=NULL,
                custody_legacy=1 WHERE component_id=$1]], {legacy}))
            assert(db:release())

            tick(principal)
            local enrolled = job_count(known)
            if enrolled == 1 then test.is_true(assert(deletion_worker.run(known)).deleted) end
            local completed, report_err = tick(principal)
            db = assert(sql.get("app:db"))
            assert(db:execute([[UPDATE kickside_components SET owner_type='principal',owner_kind='user',owner_id=$1
                WHERE component_id=$2]], {"custody-legacy-" .. suffix, legacy}))
            assert(db:release())
            test.eq(enrolled, 1, "unclassified rows must not stall typed retirement")
            test.eq(job_count(legacy), 0)
            test.is_nil(report_err, tostring(report_err))
            test.not_nil(completed)
            test.not_nil(instance(legacy))
        end)

        for _, actor_id in ipairs({"system:knowledge.injection", "system:unlisted"}) do
            test.it("refuses a direct reaper call from " .. actor_id, function()
                local result, err = run_as_system({thread_id = lifecycle_thread_id(), events = {},
                    projection = {body = {}}}, actor_id)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end)
            test.it("refuses lifecycle publication from " .. actor_id, function()
                local thread_id = lifecycle_thread_id()
                local result, err = threads_as(actor_id):append_events({thread_id = thread_id, events = {{
                    type = "kickside.lifecycle.events:principal.deleted", role = "system",
                    body = {subject_id = "unowned-" .. suffix, subject_type = "user"},
                    external = {external_source = "lifecycle", external_id = uuid.v4()},
                }}})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end)
            test.it("refuses a system projection from " .. actor_id, function()
                local thread_id = lifecycle_thread_id()
                -- The existing admin group supplies WRITE; system identity still needs framework membership.
                local result, err = threads_as(actor_id, {"app:admin"}):register_projection({
                    thread_id = thread_id, kind = "unlisted-" .. uuid.v4(),
                    worker_ref = "func://kickside.core.lifecycle:reaper"})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end)
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

        test.it("preserves an explicit child lifecycle cursor through upgrade, replacement and revocation", function()
            local singleton = lifecycle_thread_id()
            local admin = as_owner("lifecycle-admin-" .. suffix, { "app:admin" })
            local editor_id = "lifecycle-editor-" .. suffix
            local subject = { subject_id = editor_id, subject_type = "user" }
            test.is_true(assert(admin:grant_subtree({ root_component_id = singleton,
                subject = subject, access_mask = 8 })).success)

            local template = assert(registry.get("app:lifecycle_folder"))
            local binding = {id = "app:explicit_lifecycle_parent_" .. suffix, kind = template.kind,
                data = template.data, meta = {title = "Explicit lifecycle parent"}}
            local changes = assert(registry.snapshot()):changes()
            changes:create(binding)
            assert(changes:apply())
            local owner = as_owner()
            local parent = assert(owner:register({impl_id = binding.id})).component_id
            local child = assert(owner:register({impl_id = TEST_IMPL, parent_id = parent})).component_id
            local thread_id = lifecycle_log.thread_id(child)
            local spec = {thread_id = thread_id, kind = "test.child.lifecycle", projection_key = "parent:" .. parent,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                worker_config = {parent_component_id = parent, child_component_id = child}}
            local editor = threads_as(editor_id)
            local original = assert(editor:register_projection(spec)).projection
            local system_scope = assert(security.named_scope(lifecycle_consts.SYSTEM_SCOPE))
            local executor = funcs.new():with_actor(security.new_actor("system:kickside.jobs", {})):with_scope(system_scope)
            local function advance(seq: integer, generation: integer): any
                local db = assert(sql.get("app:db"))
                local dialect = assert(db:type())
                local tx = assert(db:begin())
                local token = uuid.v4()
                local now = time.now():utc()
                local lease = assert(claim.lease_row(tx, dialect, original.job_id, token,
                    now:add("45s"):format_rfc3339(), now:format_rfc3339()))
                assert(tx:commit())
                assert(db:release())
                local result = assert(executor:call("kickside.core.projections:advance", {
                    job = {id = original.job_id, lease_token = token, execution_seq = lease.execution_seq},
                    payload = {cursor_id = original.cursor_id},
                }))
                test.eq(tonumber(result.last_seq), seq)
                db = assert(sql.get("app:db"))
                local cursor = assert(db:query([[SELECT p.body,k.last_seq,k.generation,k.actor_id,k.execution_identity_json
                    FROM kickside_projection p JOIN kickside_projection_cursor k ON k.projection_id=p.id
                    WHERE k.id=$1]], {original.cursor_id}))[1]
                assert(db:release())
                test.eq(tonumber(cursor.last_seq), seq)
                test.eq(tonumber(cursor.generation), generation)
                test.is_nil(cursor.actor_id)
                test.is_nil(cursor.execution_identity_json)
                return assert(json.decode(cursor.body))
            end
            test.eq(advance(1, original.generation).stats.count, 1)

            binding.meta = {title = "Upgraded lifecycle parent"}
            changes = assert(registry.snapshot()):changes()
            changes:update(binding)
            assert(changes:apply())
            local lifecycle_actor = security.new_actor(lifecycle_consts.SYSTEM_ACTOR,
                {system = true, groups = {"system", "lifecycle"}})
            local continuation: table? = nil
            repeat
                local summary = assert(provision.converge(lifecycle_actor, system_scope, continuation))
                continuation = summary.continuation
            until not continuation
            test.is_true(assert(owner:set_meta({component_id = child, fields = {status = "after upgrade"}})).success)
            test.eq(advance(2, original.generation).stats.count, 2)

            spec.worker_ref = "func://kickside.core.lifecycle:child_lifecycle_projection"
            local replacement = assert(editor:register_projection(spec)).projection
            test.eq(replacement.projection_id, original.projection_id)
            test.eq(replacement.cursor_id, original.cursor_id)
            test.eq(replacement.job_id, original.job_id)
            test.eq(tonumber(replacement.generation), assert(tonumber(original.generation)) + 1)

            test.is_true(assert(admin:revoke_subtree({root_component_id = singleton, subject = subject})).success)
            spec.worker_ref = "func://app:test_count_worker"
            local refused, err = editor:register_projection(spec)
            test.is_nil(refused)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.is_true(assert(owner:set_meta({component_id = child, fields = {status = "after revocation"}})).success)
            local body = advance(3, replacement.generation)
            test.eq(body.meta.worker_ref, replacement.worker_ref)
            test.eq(body.stats.count, 2)
            test.eq(body.child.component_id, child)
            test.eq(body.child.parent_component_id, parent)
            test.eq(tonumber(body.child.last_event_seq), 3)
            test.eq(body.child.last_event_type, lifecycle_log.EVENT.UPDATED)

            test.is_true(assert(owner:delete({component_id = child})).success)
            assert(deletion_worker.run(child))
            test.is_true(assert(owner:delete({component_id = parent})).success)
            assert(deletion_worker.run(parent))
            changes = assert(registry.snapshot()):changes()
            changes:delete(binding.id)
            assert(changes:apply())
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

        test.it("publishes one component report per incarnation", function()
            local component_id, first, second = uuid.v4(), uuid.v4(), uuid.v4()
            local actor = security.new_actor("report-admin-" .. suffix, {security_groups = {"app.security:admin"}})
            local caller = funcs.new():with_actor(actor):with_scope(admin_scope())
            for _, incarnation in ipairs({first, first, second}) do
                local result = assert(caller:call("kickside.core.lifecycle:reaper_report_probe",
                    {subject_id = component_id, incarnation = incarnation}))
                test.is_true(result.reported, tostring(result.error))
            end
            local db = assert(sql.get("app:db"))
            for _, incarnation in ipairs({first, second}) do
                local rows = assert(db:query([[SELECT id FROM kickside_event WHERE thread_id=$1
                    AND external_source='lifecycle' AND external_id=$2 AND type='kickside.lifecycle.events:component.deleted']],
                    {lifecycle_thread_id(), "kickside.lifecycle.events:component.deleted:" .. component_id .. ":" .. incarnation}))
                test.eq(#rows, 1)
            end
            assert(db:release())
        end)

        test.it("repairs a legacy lifecycle binding and advances the existing actorless reaper", function()
            local thread_id = lifecycle_thread_id()
            local principal = "queued-report-" .. suffix
            local actor = security.new_actor("report-admin-" .. suffix, { security_groups = { "app.security:admin" } })
            local reported = assert(funcs.new():with_actor(actor):with_scope(admin_scope())
                :call("kickside.core.lifecycle:reaper_report_probe", { subject_id = principal }))
            test.is_true(reported.reported, tostring(reported.error))

            local lifecycle_actor = assert(security.new_actor(lifecycle_consts.SYSTEM_ACTOR,
                {system = true, groups = {"system", "lifecycle"}}))
            local dispatcher_scope = assert(security.named_scope(lifecycle_consts.SYSTEM_SCOPE))
            local _, converge_err = provision.converge(lifecycle_actor, dispatcher_scope)
            test.is_nil(converge_err)

            local db = assert(sql.get("app:db"))
            local cursor = assert(db:query([[SELECT k.id,k.job_id,k.last_seq,k.generation,k.actor_id,k.execution_identity_json
                FROM kickside_projection_cursor k JOIN kickside_projection p ON p.id=k.projection_id
                WHERE p.thread_id=$1 AND p.kind='lifecycle.reap']], {thread_id}))[1]
            local report = assert(db:query([[SELECT id,seq FROM kickside_event
                WHERE thread_id=$1 AND external_source='lifecycle' AND external_id=$2]],
                {thread_id, "kickside.lifecycle.events:principal.deleted:" .. principal}))[1]
            assert(db:execute("UPDATE kickside_components SET impl_id='kickside.core:thread' WHERE component_id=$1", {thread_id}))
            assert(db:execute([[UPDATE kickside_projection_cursor SET status='invalid',
                last_error='thread_event_read_denied: access denied' WHERE id=$1]], {cursor.id}))
            assert(db:execute("UPDATE kickside_projection SET state='invalid' WHERE thread_id=$1 AND kind='lifecycle.reap'", {thread_id}))
            assert(db:release())

            local migration = "kickside.core.migrations:18_lifecycle_binding"
            local result, migration_err = funcs.call(migration, {database_id="app:db", id=migration .. ":test:" .. suffix})
            test.is_nil(migration_err, tostring(migration_err))
            test.eq(result.status, "complete", tostring(result.error))

            db = assert(sql.get("app:db"))
            local repaired = assert(db:query([[SELECT c.impl_id,k.status,k.last_seq,k.job_id,k.generation,k.last_error
                FROM kickside_projection_cursor k JOIN kickside_components c ON c.component_id=k.thread_id
                WHERE k.id=$1]], {cursor.id}))[1]
            test.eq(repaired.impl_id, "kickside.core.lifecycle:system_lifecycle")
            test.eq(repaired.status, "active")
            test.eq(repaired.job_id, cursor.job_id)
            test.eq(tonumber(repaired.last_seq), tonumber(cursor.last_seq))
            test.eq(tonumber(repaired.generation), assert(tonumber(cursor.generation)) + 1)
            test.is_nil(repaired.last_error)
            local dialect = assert(db:type())
            local tx = assert(db:begin())
            local token = uuid.v4()
            local now = time.now():utc()
            local lease = assert(claim.lease_row(tx, dialect, cursor.job_id, token,
                now:add("45s"):format_rfc3339(), now:format_rfc3339()))
            assert(tx:commit())
            assert(db:release())
            test.is_nil(cursor.actor_id)
            test.is_nil(cursor.execution_identity_json)
            test.is_true(tonumber(cursor.last_seq) < tonumber(report.seq))

            local jobs_actor = assert(security.new_actor("system:kickside.jobs", {}))
            local dispatcher = assert(funcs.new():with_actor(jobs_actor):with_scope(dispatcher_scope))
            local advanced, err = dispatcher:call("kickside.core.projections:advance", {
                job = {id = cursor.job_id, lease_token = token, execution_seq = tonumber(lease.execution_seq)},
                payload = {cursor_id = cursor.id},
            })
            test.is_nil(err)
            db = assert(sql.get("app:db"))
            local saved = assert(db:query("SELECT last_seq,status,last_error FROM kickside_projection_cursor WHERE id=$1",
                {cursor.id}))[1]
            local preserved = assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1 AND seq=$2",
                {thread_id, report.seq}))[1]
            assert(db:release())
            test.eq(saved.status, "active", tostring(saved.last_error))
            test.is_true(tonumber(saved.last_seq) >= tonumber(report.seq))
            test.eq(tonumber(advanced.last_seq), tonumber(saved.last_seq))
            test.eq(preserved.id, report.id)
        end)

        test.it("reaps every component the deleted principal owned, idempotently", function()
            register("first")
            register("second")
            test.eq(owned_count(), 2)

            local pending, pending_err = tick()
            test.is_nil(pending); test.not_nil(pending_err)
            test.is_true((finish_owner()))
            local out = tick()
            test.is_true(type(out) == "table")
            test.eq(out.last_seq, PROBE_SEQ)
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
            local pending, pending_err = tick(principal)
            test.is_nil(pending); test.not_nil(pending_err)
            test.is_true((finish_owner(principal)))
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
            local producer = funcs.new():with_actor(security.new_actor(principal, {})):with_scope(scope())
            local child = assert(producer:call("kickside.core.lifecycle:reaper_register_child",
                {impl_id = RETRY_IMPL, parent_id = parent}))
            test.is_true(child.success, tostring(child.error))
            local out, err = tick(principal)
            test.is_nil(out)
            test.not_nil(err)
            test.eq(owned_count(principal), 1, "parent remains a durable ownership pointer")
            test.eq(owned_count(parent), 1, "child remains for retry")
            local child_finished, child_err = finish_owner(parent)
            test.is_false(child_finished); test.not_nil(child_err)
            test.is_true((finish_owner(parent)))
            local parent_pending, parent_err = tick(principal)
            test.is_nil(parent_pending); test.not_nil(parent_err)
            test.is_true((finish_owner(principal)))
            local retried, retry_err = tick(principal)
            test.is_nil(retry_err, tostring(retry_err))
            test.not_nil(retried)
            test.eq(owned_count(principal), 0)
            test.eq(owned_count(parent), 0)
        end)

        test.it("keeps a dead component deletion terminal across reaper ticks", function()
            local principal = "terminal-reap-" .. uuid.v4():sub(1, 8)
            local id = register_impl(RETRY_IMPL, "terminal cleanup", principal)
            local first, first_err = tick(principal)
            test.is_nil(first); test.not_nil(first_err)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_job SET max_attempts=1 WHERE owner_kind='component' AND owner_id=$1", {id}))
            assert(db:release())
            local finished, failure = finish_owner(principal)
            test.is_false(finished); test.not_nil(failure)
            for _ = 1, 2 do
                local result, err = tick(principal)
                test.is_nil(result); test.not_nil(err)
            end
            db = assert(sql.get("app:db"))
            local jobs = assert(db:query("SELECT id,status FROM kickside_job WHERE owner_kind='component' AND owner_id=$1", {id}))
            assert(db:release())
            test.eq(#jobs, 1); test.eq(jobs[1].status, "dead")
            local retry = as_owner(principal):delete({component_id = id})
            test.is_true(retry.success); test.is_true(retry.job_id ~= jobs[1].id)
            test.is_true((finish_owner(principal)))
        end)

        test.it("drains a large owner's components over bounded retry ticks", function()
            local principal = "page-reap-" .. uuid.v4():sub(1, 8)
            seed_owned_page(principal)
            local first, first_err = tick(principal)
            test.is_nil(first)
            test.not_nil(first_err)
            test.eq(owned_count(principal), 51, "enrollment retains components until their workers run")
            local db = assert(sql.get("app:db"))
            local marked, mark_err = db:query("SELECT COUNT(*) AS n FROM kickside_components c JOIN kickside_component_meta m ON m.component_id=c.component_id WHERE m.key='owner' AND m.value=$1 AND c.deleting_at IS NOT NULL", {principal})
            db:release()
            test.is_nil(mark_err)
            test.eq(tonumber(marked[1].n), 50, "the reaper enrolls its bounded independent page")
            local rows = component.list_system({meta = {owner = principal}, include = {meta = false}, limit = 100})
            for _, row in ipairs(rows) do
                local db = assert(sql.get("app:db"))
                local marked = db:query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", {row.component_id})
                db:release()
                if marked[1].deleting_at ~= nil then test.not_nil((deletion_worker.run(row.component_id))) end
            end
            test.eq(owned_count(principal), 1)
            local pending, pending_err = tick(principal)
            test.is_nil(pending); test.not_nil(pending_err)
            test.is_true((finish_owner(principal)))
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

        test.it("blocks a legacy custodian while a live attachment has no installed manifest", function()
            local owner = "removed-manifest-" .. suffix
            local custodian = register("legacy custodian", owner)
            local attachment = register_impl("kickside.test:lifecycle", "legacy attachment kind", owner)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET custody_legacy=1 WHERE component_id=$1", {custodian}))
            assert(db:execute([[UPDATE kickside_components SET custody_legacy=1,owner_type='unresolved',owner_kind=NULL,owner_id=NULL
                WHERE component_id=$1]], {attachment}))
            assert(db:release())

            local denied = assert(as_owner(owner):delete({component_id = custodian}))
            db = assert(sql.get("app:db"))
            assert(db:execute([[UPDATE kickside_components SET owner_type='principal',owner_kind='user',owner_id=$1
                WHERE component_id=$2]], {owner, attachment}))
            assert(db:release())
            test.eq(job_count(custodian), 0)
            test.eq(denied.kind, errors.CONFLICT)
            test.eq(denied.details.code, "custody_unresolved")
        end)

        test.it("blocks possible legacy custodians until a paged root attachment is physically absent", function()
            local owner = "legacy-custodian-" .. suffix
            local svc = as_owner(owner)
            local custodian = register("legacy custodian", owner)
            local fresh = register("new custodian", owner)
            local attachment = register_impl("kickside.test:custody_attachment", "legacy attachment", owner)
            test.is_true(assert(svc:delete({component_id = attachment})).in_progress)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET custody_legacy=1 WHERE component_id=$1", {custodian}))
            assert(db:execute([[UPDATE kickside_components SET custody_legacy=1,owner_type='unresolved',owner_kind=NULL,owner_id=NULL
                WHERE component_id=$1]], {attachment}))
            assert(db:execute("DELETE FROM kickside_component_meta WHERE component_id=$1", {attachment}))
            assert(db:execute([[UPDATE kickside_component_access SET access_mask=1
                WHERE component_id=$1 AND subject_type='user' AND subject_id=$2]], {attachment, owner}))
            assert(db:release())

            local denied = assert(svc:delete({component_id = custodian, child_policy = "reparent_root"}))
            test.eq(denied.kind, errors.CONFLICT)
            test.eq(denied.details.code, "custody_unresolved")
            test.eq(job_count(custodian), 0)
            local pending, pending_err = tick(owner)
            test.is_nil(pending)
            test.eq(pending_err:details().code, "custody_unresolved")
            test.eq(job_count(fresh), 0)

            test.is_true(assert(svc:delete({component_id = fresh})).in_progress)
            test.is_true(assert(deletion_worker.run(attachment)).deleted)
            test.is_true(assert(svc:delete({component_id = custodian})).in_progress)
        end)

        test.it("persists an admitted root attachment edge and leaves placement at root", function()
            local owner = "root-custodian-" .. suffix
            local custodian = register("custodian", owner)
            local attachment = uuid.v4()
            local producer = funcs.new():with_actor(security.new_actor(owner, {})):with_scope(scope())
            local child = assert(producer:call("kickside.core.lifecycle:reaper_register_child",
                {impl_id = "kickside.test:custody_attachment", component_id = attachment,
                    custodian_id = custodian, plugin_id = "kickside.test:custody_plugin"}))
            test.is_true(child.success, tostring(child.error))
            local row = query([[SELECT parent_id,owner_type,owner_kind,owner_id,owner_incarnation,owner_producer
                FROM kickside_components WHERE component_id=$1]], attachment)[1]
            test.is_nil(row.parent_id)
            test.is_nil(row.owner_kind)
            test.eq(row.owner_type, "component")
            test.eq(row.owner_id, custodian)
            test.eq(row.owner_incarnation, instance(custodian))
            test.eq(row.owner_producer, "kickside.core.lifecycle:reaper_register_child")
        end)

        test.it("advances after the declared principal cleanup succeeds", function()
            local out = tick()
            test.eq((out :: any).last_seq, PROBE_SEQ)
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
