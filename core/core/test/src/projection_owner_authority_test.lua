local test = require("test")
local execution_identity = require("execution_identity")
local identity_ops = require("identity_ops")
local worker = require("worker")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local lifecycle = require("lifecycle")
local invoke = require("invoke")
local projection_claim = require("projection_claim")
local apply = require("apply")
local fixture = require("fixture")
local callback_invoke = require("callback_invoke")
local callback_fixture = require("callback_fixture")
local component_lifecycle = require("component_lifecycle")
local writer = require("writer")
local funcs = require("funcs")
local json = require("json")
local provision = require("provision")
local threads_writer = require("threads_writer")

local function service(actor_id: string)
    return assert(contract.get("kickside.component:component_service"))
        :with_actor(assert(security.new_actor(actor_id, {security_groups = {}})))
        :with_scope(assert(security.named_scope("wippy.security:process"))):open()
end
local function create(impl_id: string?, actor_id: string?)
    local id = uuid.v4()
    local svc = service(actor_id or "system:lifecycle")
    local result, err = svc:register({component_id = id, impl_id = impl_id or "app:provision_owner_seeded_system_decl"})
    test.is_nil(err); test.is_true(result.success, tostring(result.error))
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query([[SELECT c.id,c.job_id FROM kickside_projection_cursor c
        JOIN kickside_projection p ON p.id=c.projection_id WHERE p.thread_id=$1 AND p.kind='test.owner_seed']], {lifecycle.thread_id(id)}))
    assert(db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,'owner_test.invoked','0')", {uuid.v4(), id}))
    local cursor = rows[1]
    local job = projection_claim.claim(db, cursor.job_id)
    db:release()
    return id, cursor, job
end
local function admit(snapshot)
    local _, err, frame = worker.run({actor_id = snapshot.actor_id, actor_context = snapshot.execution_identity_json,
        component_authority = snapshot.component_authority, worker_ref = "func://app:projection_owner_probe_worker",
        worker_runtime = "func", target_id = "app:projection_owner_probe_worker", system_identity = true},
        {projection = {body = {}}, range = {to_seq = 1}})
    test.is_nil(err); test.not_nil(frame)
    snapshot.execution_frame = frame
end
local function next_invocation(id, cursor)
    local db = assert(sql.get("app:db"))
    assert(threads_writer.append_system(db, lifecycle.thread_id(id),
        {{type = lifecycle.EVENT.UPDATED, body_json = "{}", role = "system"}}))
    local job = projection_claim.claim(db, cursor.job_id)
    assert(db:release())
    return job
end
return {run = test.run_cases(function()
    test.describe("projection component owner authority", function()
        for _, attack in ipairs({"missing-owner", "changed-owner", "revoked-access", "legacy-binding", "invalid-identity", "unknown-owner"}) do
            test.it("parks " .. attack .. " without invoking the worker", function()
                local id, cursor, job = create()
                local db = assert(sql.get("app:db"))
                if attack == "missing-owner" then
                    assert(db:execute("DELETE FROM kickside_component_meta WHERE component_id=$1 AND key='owner'", {id}))
                elseif attack == "changed-owner" then
                    assert(db:execute("UPDATE kickside_component_meta SET value='system:kickside.jobs' WHERE component_id=$1 AND key='owner'", {id}))
                elseif attack == "revoked-access" then
                    assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id}))
                elseif attack == "invalid-identity" then
                    assert(db:execute("UPDATE kickside_components SET private_context=$1 WHERE component_id=$2", {'{"_execution_identity":{"version":1}}', id}))
                elseif attack == "unknown-owner" then
                    assert(db:execute("UPDATE kickside_component_meta SET value='unknown' WHERE component_id=$1 AND key='owner'", {id}))
                    assert(db:execute("UPDATE kickside_projection SET actor_id='unknown' WHERE thread_id=$1", {lifecycle.thread_id(id)}))
                    assert(db:execute("UPDATE kickside_projection_cursor SET actor_id='unknown' WHERE id=$1", {cursor.id}))
                else
                    assert(db:execute("UPDATE kickside_projection SET actor_id=NULL,actor_context=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
                    assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE id=$1", {cursor.id}))
                end
                db:release()
                local result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
                test.is_nil(err); test.is_true(result.invalid)
                db = assert(sql.get("app:db"))
                local row = assert(db:query("SELECT status,last_seq,last_error FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
                local context = assert(db:query("SELECT private_context FROM kickside_components WHERE component_id=$1", {id}))[1]
                local invoked = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner_test.invoked'", {id}))[1]
                db:release()
                test.eq(invoked.value, "0", "owner admission precedes worker entry")
                test.eq(row.status, "invalid"); test.eq(tonumber(row.last_seq), 0)
                test.not_nil(row.last_error); test.is_nil(require("json").decode(context.private_context).seeded)
            end)
        end
        test.it("repairs every legacy cursor identity and rearms a parked owner failure", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_projection SET actor_id=NULL,actor_context=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
            assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE id=$1", {cursor.id}))
            db:release()
            local failed, failure_err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(failure_err); test.is_true(failed.invalid)
            db = assert(sql.get("app:db"))
            local declaration = assert(require("json").decode(assert(db:query("SELECT body FROM kickside_projection WHERE thread_id=$1", {lifecycle.thread_id(id)}))[1].body))
            local secondary = assert(writer.register_projection(db, lifecycle.thread_id(id), {
                kind = "test.owner_seed", worker_ref = "func://app:test_lifecycle_seed_worker",
                worker_input_mode = "prefetch_events", cursor_key = "secondary", ensure = true, system_identity = true,
                events = declaration.events, worker_config = declaration.worker_config, drop_notify = declaration.drop_notify,
            }))
            assert(db:execute("UPDATE kickside_projection_cursor SET status='paused' WHERE id=$1", {secondary.cursor_id}))
            local before = assert(db:query("SELECT id,generation,last_seq,status FROM kickside_projection_cursor WHERE thread_id=$1 ORDER BY id", {lifecycle.thread_id(id)}))
            local tx = assert(db:begin())
            local _, converge_err = component_lifecycle.converge_own(tx, tostring(db:type()), id, "app:provision_owner_seeded_system_decl")
            if converge_err then assert(tx:rollback()) else assert(tx:commit()) end
            test.is_nil(converge_err)
            local after = assert(db:query("SELECT id,actor_id,execution_identity_json,generation,last_seq,status FROM kickside_projection_cursor WHERE thread_id=$1 ORDER BY id", {lifecycle.thread_id(id)}))
            db:release()
            test.eq(#after, 2)
            for index, value in ipairs(after) do
                test.eq(value.actor_id, "system:lifecycle"); test.is_nil(value.execution_identity_json)
                test.eq(tonumber(value.generation), (tonumber(before[index].generation) :: number) + 1)
                test.eq(value.last_seq, before[index].last_seq)
                test.eq(value.status, value.id == secondary.cursor_id and "paused" or "active")
            end
        end)
        test.it("reports an invalid declaration while repairing unrelated projection owners", function()
            local id, cursor, job = create()
            local f = fixture.new()
            local broken = uuid.v4()
            local _, initialization_err = f.as_owner("upsert", {thread_id = broken,
                impl_id = "app:threads_empty_invalid_projection_kind", thread_class = "test.empty.invalid.projection"})
            test.not_nil(initialization_err)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_projection SET actor_id=NULL,actor_context=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
            assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE id=$1", {cursor.id}))
            db:release()
            local summary, err = provision.converge(assert(security.new_actor("system:lifecycle", {})),
                assert(security.named_scope("wippy.security:process")))
            local removed, remove_err = service(f.owner):delete({component_id = broken})
            test.is_nil(remove_err); test.is_true(removed.success, tostring(removed.error))
            test.is_nil(err)
            local reported = false
            for _, skipped in ipairs(summary.skipped) do
                if skipped.component_id == broken then
                    reported = true; test.eq(skipped.error.kind, errors.INVALID)
                end
            end
            test.is_true(reported)
            db = assert(sql.get("app:db"))
            local after = assert(db:query("SELECT actor_id FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            db:release(); test.eq(after.actor_id, "system:lifecycle")
        end)
        test.it("keeps thread heads and component generations in the batched lock snapshot", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            local tx = assert(db:begin())
            local queries = 0
            local executor: any = {query = function(_, statement, args)
                queries = queries + 1
                return tx:query(statement, args)
            end}
            local threads, err, components, cursors = threads_writer.lock_thread_rows_tx(executor, tostring(db:type()),
                {lifecycle.thread_id(id)}, {id}, cursor.id)
            local closed, close_err: any = nil, nil
            if err then closed, close_err = tx:rollback() else closed, close_err = tx:commit() end
            local released, release_err = db:release()
            test.is_nil(err); test.is_nil(close_err); test.is_nil(release_err)
            test.is_true(closed == true); test.is_true(released == true)
            test.eq(queries, 1); test.eq(#cursors, 1); test.eq(cursors[1].job_id, cursor.job_id)
            test.eq(tonumber(cursors[1].last_seq), 0)
            test.is_true(tonumber(threads[lifecycle.thread_id(id)].event_count) == 1, assert(json.encode(threads)))
            test.eq(tonumber(components[id].identity_generation), 0)
        end)
        test.it("binds current IDs and generations when reusing lock SQL shapes", function()
            local first, first_cursor = create()
            local second, second_cursor = create()
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET identity_generation=3 WHERE component_id=$1", {second}))
            local tx = assert(db:begin())
            for _, item in ipairs({{first, first_cursor, 0}, {second, second_cursor, 3}, {first, first_cursor, 0}}) do
                local threads, err, components, cursors = threads_writer.lock_thread_rows_tx(tx, tostring(db:type()),
                    {lifecycle.thread_id(item[1])}, {item[1]}, item[2].id)
                test.is_nil(err); test.not_nil(threads[lifecycle.thread_id(item[1])])
                test.eq(tonumber(components[item[1]].identity_generation), item[3])
                test.eq(cursors[1].job_id, item[2].job_id)
            end
            assert(tx:commit()); assert(db:release())
        end)
        test.it("shares ancestor authority locks between sibling projections and fences authority writers", function()
            local svc = service("system:lifecycle")
            local parent = assert(svc:register({impl_id = "app:lifecycle_folder"}))
            test.is_true(parent.success)
            local children = {}
            for index = 1, 2 do
                children[index] = assert(svc:register({impl_id = "app:provision_owner_seeded_system_decl", parent_id = parent.component_id}))
                test.is_true(children[index].success)
            end
            local db = assert(sql.get("app:db"))
            local dialect = tostring(db:type())
            local tx = assert(db:begin())
            local first, first_err = threads_writer.lock_thread_rows_tx(tx, dialect,
                {lifecycle.thread_id(children[1].component_id)}, {children[1].component_id})
            local shared, share_err, writer_err, tree_writer: any = nil, nil, nil, nil
            if dialect == sql.type.POSTGRES then
                local other = assert(sql.get("app:db"))
                local reader = assert(other:begin())
                shared, share_err = reader:query("SELECT component_id FROM kickside_components WHERE component_id=$1 FOR SHARE NOWAIT", {parent.component_id})
                assert(reader:rollback())
                local tree = assert(other:begin())
                tree_writer = assert(tree:query("SELECT pg_try_advisory_xact_lock(hashtextextended('kickside.component.placement',0)) AS acquired"))[1].acquired
                assert(tree:rollback())
                local mutator = assert(other:begin())
                local _, denied = mutator:query("SELECT component_id FROM kickside_components WHERE component_id=$1 FOR NO KEY UPDATE NOWAIT", {parent.component_id})
                writer_err = denied
                assert(mutator:rollback()); assert(other:release())
            end
            assert(tx:rollback()); assert(db:release())
            test.is_nil(first_err); test.not_nil(first)
            if dialect == sql.type.POSTGRES then
                test.is_nil(share_err); test.not_nil(shared)
                test.is_false(tree_writer, "structural writers wait before taking component locks")
                test.not_nil(writer_err, "authority mutation conflicts with an active authority reader")
            end
        end)
        test.it("fences inherited authority when a subtree moves away and back", function()
            local svc = service("system:lifecycle")
            local root = assert(svc:register({impl_id = "app:lifecycle_folder"})).component_id
            local branch = assert(svc:register({impl_id = "app:lifecycle_folder",parent_id = root})).component_id
            local child = assert(svc:register({impl_id = "app:provision_owner_seeded_system_decl",parent_id = branch})).component_id
            local db = assert(sql.get("app:db"))
            local cursor = assert(db:query("SELECT id,job_id FROM kickside_projection_cursor WHERE thread_id=$1 AND actor_id=$2", {lifecycle.thread_id(child),"system:lifecycle"}))[1]
            local job = projection_claim.claim(db,cursor.job_id)
            local snapshot = assert(invoke.snapshot(db,cursor.id,job.id)); assert(db:release())
            test.is_true(assert(svc:set_placement({component_id = branch,parent_id = false})).success)
            test.is_true(assert(svc:set_placement({component_id = branch,parent_id = root})).success)
            local result, err = apply.advance("app:db",job,snapshot,1,{body = {obsolete_ancestry = true}})
            test.is_nil(err);test.is_true(result.stale)
        end)
        test.it("runs retained lifecycle work after repairing legacy identity copies", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_projection SET actor_id=NULL,actor_context=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
            assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE id=$1", {cursor.id}))
            local tx = assert(db:begin())
            local _, repair_err = component_lifecycle.converge_own(tx, tostring(db:type()), id, "app:provision_owner_seeded_system_decl")
            if repair_err then assert(tx:rollback()) else assert(tx:commit()) end
            db:release(); test.is_nil(repair_err)
            local result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.eq(tonumber(result.last_seq), 1)
            db = assert(sql.get("app:db"))
            local context = assert(json.decode(assert(db:query("SELECT private_context FROM kickside_components WHERE component_id=$1", {id}))[1].private_context))
            local body = assert(json.decode(assert(db:query("SELECT body FROM kickside_projection WHERE thread_id=$1", {lifecycle.thread_id(id)}))[1].body))
            db:release(); test.is_true(context.seeded); test.eq(body.seeded_by, "system:lifecycle")
        end)
        test.it("denies a returned cross-component write atomically under the maintenance owner", function()
            local id, cursor, job = create()
            local f = fixture.new()
            local target = uuid.v4()
            test.is_nil(select(2, f.as_owner("create", {id = target, impl_id = "kickside.test.threads:thread_kind"})))
            local db = assert(sql.get("app:db"))
            local snapshot, snapshot_err = invoke.snapshot(db, cursor.id, job.id)
            test.is_nil(snapshot_err); snapshot = assert(snapshot); db:release()
            local result, err = apply.advance("app:db", job, snapshot, 1, {
                body = {forbidden_fold = true},
                append_events = {{thread_id = target, events = {{type = "kickside.test.threads:changed", body = {}}}}},
            })
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            db = assert(sql.get("app:db"))
            local after = assert(db:query("SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            db:release()
            test.eq(tonumber(after.last_seq), 0); test.eq(f.event_type_count(target, "kickside.test.threads:changed"), 0)
        end)
        for _, mode in ipairs({"generation", "revoke"}) do
            test.it("revalidates the owner before a post-commit callback/" .. mode, function()
                local id, cursor, job = create("app:projection_owner_callback_kind", mode == "revoke" and "callback-user-" .. uuid.v4() or nil)
                local db = assert(sql.get("app:db"))
                assert(db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,'owner_test.callback','0')", {uuid.v4(), id}))
                db:release()
                callback_fixture.mode = mode
                local result, err = callback_invoke.run({job = job, payload = {cursor_id = cursor.id}})
                test.is_nil(err)
                test.is_true(mode == "generation" and result.stale or mode == "revoke" and result.invalid)
                db = assert(sql.get("app:db"))
                local callback = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner_test.callback'", {id}))[1]
                local after = assert(db:query("SELECT last_seq,status,last_error FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
                db:release()
                test.eq(callback.value, "0"); test.eq(tonumber(after.last_seq), 1)
                if mode == "revoke" then test.eq(after.status, "invalid"); test.not_nil(after.last_error) end
            end)
        end
        test.it("retains maintenance callback admission for the round and denies revoked access next invocation", function()
            local id, cursor, job = create("app:projection_owner_callback_kind")
            local db = assert(sql.get("app:db"))
            assert(db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,'owner_test.callback','0')", {uuid.v4(), id}))
            assert(db:release())
            callback_fixture.mode = "revoke"
            local result, err = callback_invoke.run({job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.is_nil(result.invalid); test.is_nil(result.stale)
            db = assert(sql.get("app:db"))
            local callback = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner_test.callback'", {id}))[1]
            assert(db:release()); test.eq(callback.value, "system:lifecycle")
            local denied, denied_err = invoke.run({job = next_invocation(id, cursor), payload = {cursor_id = cursor.id}})
            test.is_nil(denied_err); test.is_true(denied.invalid)
            db = assert(sql.get("app:db"))
            local after = assert(db:query("SELECT status,last_seq,last_error FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            assert(db:release()); test.eq(after.status, "invalid"); test.not_nil(after.last_error); test.eq(tonumber(after.last_seq), 1)
        end)
        test.it("authorizes allowed and denied maintenance destinations as one atomic result", function()
            local id, cursor, job = create()
            local f = fixture.new()
            local allowed, denied = uuid.v4(), uuid.v4()
            for _, target in ipairs({allowed, denied}) do
                test.is_nil(select(2, f.as_owner("create", {id = target, impl_id = "kickside.test.threads:thread_kind"})))
            end
            local granted = assert(service(f.owner):grant_subtree({root_component_id = allowed,
                subject = {subject_type = "user", subject_id = "system:lifecycle"}, access_mask = 3}))
            test.is_true(granted.success, tostring(granted.error))
            local db = assert(sql.get("app:db"))
            local snapshot = assert(invoke.snapshot(db, cursor.id, job.id)); db:release()
            local function write(target)
                return {thread_id = target, events = {{type = "kickside.test.threads:changed", body = {value = "owner"}}}}
            end
            local result, err = apply.advance("app:db", job, snapshot, 1,
                {body = {mixed_fold = true}, append_events = {write(allowed), write(denied)}})
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.eq(f.event_type_count(allowed, "kickside.test.threads:changed"), 0)
            test.eq(f.event_type_count(denied, "kickside.test.threads:changed"), 0)
            result, err = apply.advance("app:db", job, snapshot, 1,
                {body = {allowed_fold = true}, append_events = {write(allowed)}})
            test.is_nil(err, tostring(err)); test.eq(tonumber(result.last_seq), 1)
            test.eq(f.event_type_count(allowed, "kickside.test.threads:changed"), 1)
        end)
        for _, change in ipairs({"revoke", "reduce"}) do
            test.it("fences inherited maintenance access/" .. change, function()
                local svc = service("system:lifecycle")
                local parent = assert(svc:register({impl_id = "app:lifecycle_folder"}))
                local child = assert(svc:register({impl_id = "app:provision_owner_seeded_system_decl", parent_id = parent.component_id}))
                test.is_true(parent.success); test.is_true(child.success)
                local subject = {subject_type = "user", subject_id = "system:lifecycle"}
                test.is_true(assert(svc:revoke_subtree({root_component_id = child.component_id, subject = subject})).success)
                local db = assert(sql.get("app:db"))
                local cursor = assert(db:query("SELECT id,job_id FROM kickside_projection_cursor WHERE thread_id=$1 AND projection_id IN (SELECT id FROM kickside_projection WHERE kind='test.owner_seed')", {lifecycle.thread_id(child.component_id)}))[1]
                local job = projection_claim.claim(db, cursor.job_id)
                local snapshot = assert(invoke.snapshot(db, cursor.id, cursor.job_id)); db:release()
                local changed: any = nil
                if change == "revoke" then changed = assert(svc:revoke_subtree({root_component_id = parent.component_id, subject = subject}))
                else changed = assert(svc:grant_subtree({root_component_id = parent.component_id, subject = subject, access_mask = 1})) end
                test.is_true(changed.success, tostring(changed.error))
                local result, err = apply.advance("app:db", job, snapshot, 1, {body = {stale_acl = true}})
                test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
                test.is_nil(err); test.is_true(result.invalid)
            end)
        end
        for _, phase in ipairs({"admission", "apply", "round"}) do
            for _, status in ipairs({"deleted", "disabled"}) do
                test.it("resolves current v2 principal status/" .. status .. "/" .. phase, function()
                    local id, cursor, job = create(nil, "transition-" .. uuid.v4())
                    local db = assert(sql.get("app:db"))
                    local snapshot = assert(invoke.snapshot(db, cursor.id, cursor.job_id))
                    if phase == "round" then db:release(); admit(snapshot); db = assert(sql.get("app:db")) end
                    assert(db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,'core_test.principal_state',$3)", {uuid.v4(), id, status}))
                    db:release()
                    if phase == "apply" then
                        local result, err = apply.advance("app:db", job, snapshot, 1, {body = {stale_principal = true}})
                        test.is_nil(result); test.not_nil(err)
                        test.is_true(errors.is(err, errors.PERMISSION_DENIED) or errors.is(err, errors.NOT_FOUND))
                    end
                    if phase == "round" then
                        local applied, apply_err = apply.advance("app:db", job, snapshot, 1, {body = {admitted_fold = true}})
                        test.is_nil(apply_err); test.eq(applied.last_seq, 1)
                        job = next_invocation(id, cursor)
                    end
                    local result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
                    test.is_nil(err); test.is_true(result.invalid)
                    db = assert(sql.get("app:db"))
                    local row = assert(db:query("SELECT last_seq,status FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
                    db:release(); test.eq(tonumber(row.last_seq), phase == "round" and 1 or 0); test.eq(row.status, "invalid")
                end)
            end
        end
        for _, phase in ipairs({"admission", "apply", "round"}) do
            for _, revoked in ipairs({"authorizer", "membership", "credential", "delegation"}) do
                test.it("revalidates v2 authority/" .. revoked .. "/" .. phase, function()
                    local operator = "transition-" .. uuid.v4()
                    local id, cursor, job = create(nil, operator)
                    local svc = service(operator)
                    if revoked == "membership" then
                        test.is_true(assert(svc:grant_subtree({root_component_id = id,
                            subject = {subject_type = "group", subject_id = "core_test"}, access_mask = 15})).success)
                        test.is_true(assert(svc:revoke_subtree({root_component_id = id,
                            subject = {subject_type = "user", subject_id = operator}})).success)
                    end
                    local db = assert(sql.get("app:db"))
                    if revoked == "credential" or revoked == "delegation" then
                        local context = assert(json.decode(assert(db:query("SELECT private_context FROM kickside_components WHERE component_id=$1", {id}))[1].private_context))
                        local identity = context._execution_identity
                        identity.credential_id = id
                        local row = assert(execution_identity.to_row(identity))
                        local hash = identity_ops.canonical_identity(identity.principal, identity.authorized_by, identity.component_id,
                            identity.captured_at, identity.credential_id, identity.link_id)
                        assert(db:execute("UPDATE kickside_components SET private_context=$1,identity_hash=$2 WHERE component_id=$3", {assert(json.encode(context)),hash,id}))
                        assert(db:execute("UPDATE kickside_projection SET actor_id=$1,actor_context=$2 WHERE id=(SELECT projection_id FROM kickside_projection_cursor WHERE id=$3)", {row.actor_id,row.actor_context,cursor.id}))
                        assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=$1,execution_identity_json=$2 WHERE id=$3", {row.actor_id,row.actor_context,cursor.id}))
                    end
                    local snapshot = assert(invoke.snapshot(db, cursor.id, job.id)); test.is_nil(snapshot.authority_error)
                    db:release()
                    local actor, _, resolve_err = worker.resolve_binding_identity({actor_id = snapshot.actor_id,
                        actor_context = snapshot.execution_identity_json, component_authority = snapshot.component_authority})
                    test.is_nil(resolve_err); test.not_nil(actor)
                    if phase == "round" then admit(snapshot) end
                    if revoked == "authorizer" then
                        test.is_true(assert(svc:grant_subtree({root_component_id = id,
                            subject = {subject_type = "user", subject_id = "projection-administrator-" .. uuid.v4()}, access_mask = 15})).success)
                        local changed = assert(svc:grant_subtree({root_component_id = id,
                            subject = {subject_type = "user", subject_id = operator}, access_mask = 3}))
                        test.is_true(changed.success, tostring(changed.error))
                    end
                    db = assert(sql.get("app:db"))
                    assert(db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,$3,'revoked')",
                        {uuid.v4(),id,"core_test." .. revoked .. "_state"}))
                    db:release()
                    if phase == "apply" then
                        local applied, apply_err = apply.advance("app:db", job, snapshot, 1, {body = {revoked_fold = true}})
                        test.is_nil(applied); test.is_true(errors.is(apply_err, errors.PERMISSION_DENIED), tostring(apply_err))
                    end
                    if phase == "round" then
                        local applied, apply_err = apply.advance("app:db", job, snapshot, 1, {body = {admitted_fold = true}})
                        test.is_nil(apply_err); test.eq(applied.last_seq, 1)
                        job = next_invocation(id, cursor)
                    end
                    local result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
                    test.is_nil(err); test.is_true(result.invalid)
                    db = assert(sql.get("app:db"))
                    local after = assert(db:query("SELECT last_seq,status,last_error FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
                    local invoked = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner_test.invoked'", {id}))[1]
                    db:release(); test.eq(tonumber(after.last_seq), phase == "round" and 1 or 0); test.eq(after.status, "invalid")
                    test.not_nil(after.last_error); test.eq(invoked.value, "0")
                end)
            end
        end
        test.it("uses admitted maintenance authority for the round and denies the next invocation", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            local snapshot = assert(invoke.snapshot(db, cursor.id, job.id)); db:release()
            local _, run_err, frame = worker.run({actor_id = snapshot.actor_id, actor_context = snapshot.execution_identity_json,
                component_authority = snapshot.component_authority, worker_ref = "func://app:projection_owner_probe_worker",
                worker_runtime = "func", target_id = "app:projection_owner_probe_worker", system_identity = true}, {projection = {body = {}}, range = {to_seq = 1}})
            test.is_nil(run_err); test.not_nil(frame); test.not_nil(frame.access)
            snapshot.execution_frame = frame
            test.is_true(assert(service("system:lifecycle"):revoke_subtree({root_component_id = id,
                subject = {subject_type = "user", subject_id = "system:lifecycle"}})).success)
            local result, err = apply.advance("app:db", job, snapshot, 1, {body = {admitted_frame = true}})
            test.is_nil(err); test.eq(result.last_seq, 1)
            job = next_invocation(id, cursor)
            result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.is_true(result.invalid)
        end)
        for _, principal_kind in ipairs({"user", "group"}) do
            test.it("runs both component projection categories under exact v2/" .. principal_kind, function()
                local operator = "projection-v2-" .. uuid.v4()
                local id, ignored_cursor, ignored_job = create("app:projection_owner_full_kind", operator)
                local actor = assert(security.new_actor(operator, {security_groups = {}}))
                local scope = assert(security.named_scope("wippy.security:process"))
                local principal = {kind = principal_kind, id = principal_kind == "user" and operator or "projection-owner-group"}
                if principal_kind == "group" then
                    local changed, change_err = funcs.new():with_actor(actor):with_scope(scope):call("app:projection_owner_set_identity",
                        {component_id = id, principal = principal, request_id = uuid.v4(), expected_identity_generation = 0})
                    test.is_nil(change_err); test.not_nil(changed)
                    test.is_true(assert(service(operator):grant_subtree({root_component_id = id,
                        subject = {subject_type = "group", subject_id = principal.id}, access_mask = 3})).success)
                end
                local summary, converge_err = provision.converge(actor, scope)
                test.is_nil(converge_err)
                local db = assert(sql.get("app:db"))
                assert(threads_writer.append_system(db, id, {{type = "app:threads_cv_trigger", body_json = "{}"}}))
                assert(require("jobs_wake").wake_job(db, ignored_job.id, {control = true}, tostring(db:type())))
                -- The already-claimed lifecycle slot keeps its lease during convergence.
                local rows = assert(db:query("SELECT c.id,c.job_id,c.thread_id FROM kickside_projection_cursor c WHERE c.thread_id IN ($1,$2)", {id,lifecycle.thread_id(id)}))
                test.eq(#rows, 2)
                local work: {table} = {}
                for _, cursor in ipairs(rows) do
                    local selected = cursor.id == ignored_cursor.id and ignored_job or projection_claim.claim(db, cursor.job_id)
                    test.not_nil(selected)
                    local snapshot = assert(invoke.snapshot(db, cursor.id, cursor.job_id))
                    test.is_nil(snapshot.authority_error)
                    test.eq(snapshot.component_authority.identity.principal.kind, principal_kind)
                    test.eq(snapshot.component_authority.identity.principal.id, principal.id)
                    test.eq(snapshot.component_authority.identity.authorized_by.id, operator)
                    test.eq(snapshot.component_authority.component_id, id)
                    work[#work + 1] = {cursor = cursor, job = selected, head = snapshot.event_count}
                end
                db:release()
                for _, item in ipairs(work) do
                    local result, err = invoke.run({job = item.job, payload = {cursor_id = item.cursor.id}})
                    test.is_nil(err)
                    if result.invalid then
                        local failed_db = assert(sql.get("app:db"))
                        local failure = assert(failed_db:query("SELECT last_error FROM kickside_projection_cursor WHERE id=$1", {item.cursor.id}))[1]
                        failed_db:release(); test.is_false(result.invalid, failure.last_error)
                    end
                    test.eq(tonumber(result.last_seq), tonumber(item.head))
                end
                db = assert(sql.get("app:db"))
                local bodies = assert(db:query("SELECT body FROM kickside_projection WHERE thread_id IN ($1,$2)", {id,lifecycle.thread_id(id)}))
                db:release()
                local expected = principal_kind == "user" and operator or "principal:group:" .. principal.id
                for _, row in ipairs(bodies) do test.eq(assert(json.decode(row.body)).ran_as, expected) end
            end)
        end
        test.it("preserves maintenance updates after creation event retention", function()
            local id, cursor, job = create()
            local folded, fold_err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(fold_err); test.eq(tonumber(folded.last_seq), 1)
            local svc = service("system:lifecycle")
            local before, before_err = svc:update({component_id = id,
                commands = {{type = "PATCH_CONTEXT", payload = {patch = {before_retention = true}}}}})
            test.is_nil(before_err); test.is_true(before.success, tostring(before.error))
            local db = assert(sql.get("app:db"))
            assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1 AND external_id=$2",
                {lifecycle.thread_id(id), "created:" .. id}))
            local owner = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner'", {id}))[1]
            local prior = assert(db:query("SELECT last_seq,generation FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            assert(db:execute("UPDATE kickside_projection SET actor_id=NULL,actor_context=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
            assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE id=$1", {cursor.id}))
            db:release(); test.eq(owner.value, "system:lifecycle")
            local summary, converge_err = provision.converge(assert(security.new_actor("system:lifecycle", {})),
                assert(security.named_scope("wippy.security:process")))
            test.is_nil(converge_err)
            for _, skipped in ipairs(summary.skipped) do test.is_false(skipped.component_id == id, tostring(skipped.reason)) end
            db = assert(sql.get("app:db"))
            local repaired = assert(db:query([[SELECT c.actor_id,c.execution_identity_json,c.last_seq,c.generation,p.actor_id AS projection_owner
                FROM kickside_projection_cursor c JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]], {cursor.id}))[1]
            db:release()
            test.eq(repaired.actor_id, "system:lifecycle"); test.eq(repaired.projection_owner, "system:lifecycle")
            test.is_nil(repaired.execution_identity_json); test.eq(repaired.last_seq, prior.last_seq)
            test.eq(tonumber(repaired.generation), (tonumber(prior.generation) :: number) + 1)
            local after, after_err = svc:update({component_id = id,
                commands = {{type = "PATCH_CONTEXT", payload = {patch = {after_retention = true}}}}})
            test.is_nil(after_err); test.is_true(after.success, tostring(after.error))
        end)
        test.it("parks missing reserved ownership at the head through normal convergence", function()
            local id, cursor, job = create("app:projection_owner_proc_kind")
            test.not_nil(assert(invoke.run({job = job, payload = {cursor_id = cursor.id}})))
            local db = assert(sql.get("app:db"))
            local before = assert(db:query("SELECT last_seq,generation FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            assert(db:execute("UPDATE kickside_projection SET actor_id=NULL,actor_context=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
            assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE id=$1", {cursor.id}))
            assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1 AND external_id=$2", {lifecycle.thread_id(id), "created:" .. id}))
            assert(db:execute("DELETE FROM kickside_component_meta WHERE component_id=$1 AND key='owner'", {id}))
            db:release()
            local actor = assert(security.new_actor("system:lifecycle", {security_groups = {}}))
            local scope = assert(security.named_scope("wippy.security:process"))
            local summary, converge_err = provision.converge(actor, scope)
            test.is_nil(converge_err)
            local reported = false
            for _, skipped in ipairs(summary.skipped) do if skipped.component_id == id then reported = true end end
            test.is_true(reported)
            db = assert(sql.get("app:db"))
            local selected = projection_claim.claim(db, cursor.job_id)
            db:release()
            local result, err = invoke.run({job = selected, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.is_true(result.invalid)
            db = assert(sql.get("app:db"))
            local after = assert(db:query("SELECT status,last_seq,generation,last_error FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            db:release(); test.eq(after.status, "invalid"); test.not_nil(after.last_error)
            test.eq(after.last_seq, before.last_seq)
        end)
        test.it("authorizes returned events for an explicit framework registration without identity JSON", function()
            local source, target = uuid.v4(), uuid.v4()
            local f = fixture.new()
            test.is_nil(select(2, f.as_owner("create", {id = target, impl_id = "kickside.test.threads:thread_kind"})))
            local db = assert(sql.get("app:db"))
            assert(db:execute("INSERT INTO kickside_thread (id,thread_class,event_count) VALUES ($1,'test',0)", {source}))
            local registered = assert(writer.register_projection(db, source,
                {kind = "framework", worker_ref = "func://app:test_count_worker", system_identity = true}))
            assert(require("jobs_wake").wake_job(db, registered.job_id, {control = true}, tostring(db:type())))
            local job = projection_claim.claim(db, registered.job_id)
            local snapshot = assert(invoke.snapshot(db, registered.cursor_id, registered.job_id))
            db:release()
            local result, err = apply.advance("app:db", job, snapshot, 0,
                {body = {unauthorized_fold = true}, append_events = {{thread_id = target, events = {{type = "undeclared:event", body = {}}}}}})
            test.is_nil(result); test.not_nil(err)
            db = assert(sql.get("app:db"))
            local body = assert(json.decode(assert(db:query("SELECT body FROM kickside_projection WHERE id=$1", {registered.projection_id}))[1].body))
            db:release(); test.is_nil(body.unauthorized_fold)
        end)
        test.it("does not fence equivalent serialized v2 identities during reconciliation", function()
            local id, cursor, job = create(nil, "projection-user-" .. uuid.v4())
            local db = assert(sql.get("app:db"))
            local prior = assert(db:query("SELECT p.actor_context,c.generation FROM kickside_projection p JOIN kickside_projection_cursor c ON c.projection_id=p.id WHERE c.id=$1", {cursor.id}))[1]
            assert(db:execute("UPDATE kickside_projection SET actor_context=$1 WHERE thread_id=$2", {" " .. prior.actor_context, lifecycle.thread_id(id)}))
            assert(db:execute("UPDATE kickside_projection_cursor SET execution_identity_json=$1 WHERE id=$2", {" " .. prior.actor_context, cursor.id}))
            local tx = assert(db:begin())
            local _, converge_err = component_lifecycle.converge_own(tx, tostring(db:type()), id, "app:provision_owner_seeded_system_decl")
            if converge_err then assert(tx:rollback()) else assert(tx:commit()) end
            test.is_nil(converge_err)
            local after = assert(db:query("SELECT generation FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            db:release(); test.eq(after.generation, prior.generation)
        end)
        for _, owner in ipairs({"system:lifecycle", "deletion-owner"}) do
            test.it("drains own deletion events before releasing trusted authority/" .. owner, function()
                local id, cursor, job = create("app:projection_owner_delete_kind", owner)
                local teardown = require("teardown")
                local marked, mark_step, mark_err = teardown.begin_delete(id)
                test.is_nil(mark_err); test.is_true(marked); test.is_nil(mark_step)
                local removed, step, pending = teardown.unregister(id)
                test.is_nil(removed); test.eq(step, "pending"); test.not_nil(pending)
                local db = assert(sql.get("app:db"))
                local live = assert(db:query("SELECT identity_generation FROM kickside_components WHERE component_id=$1", {id}))[1]
                local events = assert(db:query("SELECT type FROM kickside_event WHERE thread_id=$1 ORDER BY seq", {lifecycle.thread_id(id)}))
                db:release(); test.not_nil(live); test.eq(events[#events].type, lifecycle.EVENT.DELETED)
                local result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
                test.is_nil(err); test.is_nil(result.invalid); test.eq(tonumber(result.last_seq), #events)
                db = assert(sql.get("app:db"))
                local body = assert(json.decode(assert(db:query("SELECT body FROM kickside_projection WHERE thread_id=$1", {lifecycle.thread_id(id)}))[1].body))
                db:release(); test.eq(body.ran_as, owner); test.eq(body.last_type, lifecycle.EVENT.DELETED)
                local finished, finish_step, finish_err = teardown.unregister(id)
                test.is_nil(finish_err); test.is_nil(finish_step); test.is_true(finished.deleted)
                db = assert(sql.get("app:db"))
                local absent = assert(db:query("SELECT component_id FROM kickside_components WHERE component_id=$1", {id}))
                local final_events = assert(db:query("SELECT type FROM kickside_event WHERE thread_id=$1 ORDER BY seq", {lifecycle.thread_id(id)}))
                db:release(); test.eq(#absent, 0); test.eq(#final_events, #events)
            end)
        end
        for _, status in ipairs({"paused", "invalid"}) do
            test.it("does not retain deleted authority for a nonrunnable cursor/" .. status, function()
                local id, cursor, job = create("app:projection_owner_delete_kind")
                local db = assert(sql.get("app:db"))
                assert(db:execute("UPDATE kickside_projection_cursor SET status=$1 WHERE id=$2", {status,cursor.id}))
                assert(db:release())
                local teardown = require("teardown")
                test.is_true(assert(teardown.begin_delete(id)))
                local removed, step, err = teardown.unregister(id)
                test.is_nil(err); test.is_nil(step); test.is_true(removed.deleted)
                local result, run_err = invoke.run({job = job,payload = {cursor_id = cursor.id}})
                test.is_nil(run_err); test.is_true(result.stale)
            end)
        end
        test.it("rejects public owner writes and deletion from a WRITE holder", function()
            local id, cursor, job = create()
            local writer_id = "projection-writer-" .. uuid.v4()
            local granted = assert(service("system:lifecycle"):grant_subtree({root_component_id = id,
                subject = {subject_type = "user", subject_id = writer_id}, access_mask = 3}))
            test.is_true(granted.success, tostring(granted.error))
            for _, args in ipairs({{fields = {owner = "system:kickside.jobs"}}, {fields = {}, delete_keys = {"owner"}}}) do
                args.component_id = id
                local result, err = service(writer_id):set_meta(args)
                test.is_nil(err); test.is_false(result.success)
            end
            local db = assert(sql.get("app:db"))
            local row = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner'", {id}))[1]
            db:release(); test.eq(row.value, "system:lifecycle")
        end)
        test.it("preserves trusted child lifecycle registration across identity convergence", function()
            local svc = service("system:lifecycle")
            local parent = assert(svc:register({impl_id = "app:lifecycle_folder"}))
            test.is_true(parent.success, tostring(parent.error))
            local child = assert(svc:register({impl_id = "app:provision_owner_seeded_system_decl", parent_id = parent.component_id}))
            test.is_true(child.success, tostring(child.error))
            local db = assert(sql.get("app:db"))
            local thread_id = lifecycle.thread_id(child.component_id)
            local before = assert(db:query([[SELECT p.id,c.id AS cursor_id,c.actor_id,c.execution_identity_json,c.generation
                FROM kickside_projection p JOIN kickside_projection_cursor c ON c.projection_id=p.id
                WHERE p.thread_id=$1 AND p.kind='test.child.lifecycle']], {thread_id}))[1]
            test.not_nil(before)
            assert(db:execute("UPDATE kickside_projection SET actor_id=NULL,actor_context=NULL WHERE thread_id=$1 AND kind='test.owner_seed'", {thread_id}))
            assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE thread_id=$1 AND projection_id<>$2", {thread_id,before.id}))
            local tx = assert(db:begin())
            assert(component_lifecycle.converge_own(tx, tostring(db:type()), child.component_id, "app:provision_owner_seeded_system_decl"))
            assert(tx:commit())
            local after = assert(db:query("SELECT actor_id,execution_identity_json,generation FROM kickside_projection_cursor WHERE id=$1", {before.cursor_id}))[1]
            for key, value in pairs(after) do test.eq(value, before[key]) end
            local cursor = assert(db:query("SELECT id,job_id FROM kickside_projection_cursor WHERE id=$1", {before.cursor_id}))[1]
            local selected = projection_claim.claim(db, cursor.job_id)
            db:release()
            local result, err = invoke.run({job = selected, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.eq(tonumber(result.last_seq), 1)
        end)
        test.it("rejects null authority on a lifecycle registration without a framework declaration", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_projection SET kind='undeclared',actor_id=NULL,actor_context=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
            assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=NULL,execution_identity_json=NULL WHERE id=$1", {cursor.id}))
            db:release()
            local result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.is_true(result.invalid)
            db = assert(sql.get("app:db"))
            local invoked = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='owner_test.invoked'", {id}))[1]
            db:release(); test.eq(invoked.value, "0")
        end)
        test.it("parks a rescheduled invalid cursor without retrying its identity failure", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            assert(db:execute("DELETE FROM kickside_component_meta WHERE component_id=$1 AND key='owner'", {id}))
            db:release()
            local failed = assert(invoke.run({job = job, payload = {cursor_id = cursor.id}}))
            test.is_true(failed.invalid)
            db = assert(sql.get("app:db"))
            assert(require("jobs_wake").wake_job(db, cursor.job_id, {control = true}, tostring(db:type())))
            local selected = projection_claim.claim(db, cursor.job_id)
            db:release()
            local result, err = invoke.run({job = selected, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.not_nil(result); test.is_true(result.self_completed); test.is_true(result.stale)
        end)
        test.it("fences actual adoption and identity changes away and back", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            local snapshot = assert(invoke.snapshot(db, cursor.id, job.id))
            db:release()
            local operator = "projection-operator-" .. uuid.v4()
            local svc = service(operator)
            local adopted, adopt_err = svc:adopt({component_id = id})
            test.is_nil(adopt_err); test.is_true(adopted.success, tostring(adopted.error))
            local result, err = apply.advance("app:db", job, snapshot, 1, {body = {stale_adoption = true}})
            test.is_nil(err); test.is_true(result.stale)
            local actor = assert(security.new_actor(operator, {security_groups = {}}))
            local scope = assert(security.named_scope("wippy.security:process"))
            local summary, converge_err = provision.converge(actor, scope)
            test.is_nil(converge_err)
            db = assert(sql.get("app:db"))
            local selected = projection_claim.claim(db, cursor.job_id)
            snapshot = assert(invoke.snapshot(db, cursor.id, cursor.job_id))
            test.eq(snapshot.component_authority.identity.principal.id, operator)
            local generation = tonumber(adopted.identity_generation)
            db:release()
            for _, principal in ipairs({{kind = "group", id = "projection-group"}, {kind = "user", id = operator}}) do
                local changed, change_err = funcs.new():with_actor(actor):with_scope(scope):call("app:projection_owner_set_identity",
                    {component_id = id, principal = principal, request_id = uuid.v4(), expected_identity_generation = generation})
                test.is_nil(change_err); test.not_nil(changed)
                generation = changed.identity_generation
            end
            result, err = apply.advance("app:db", selected, snapshot, 1, {body = {stale_set = true}})
            test.is_nil(err); test.is_true(result.stale)
            db = assert(sql.get("app:db"))
            local after = assert(db:query("SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            db:release(); test.eq(tonumber(after.last_seq), 0)
        end)
        test.it("binds maintenance process execution and callbacks to the reserved owner", function()
            local id, cursor, job = create("app:projection_owner_proc_kind")
            local result, err = invoke.run({job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.eq(tonumber(result.last_seq), 1)
            local db = assert(sql.get("app:db"))
            local body = assert(json.decode(assert(db:query("SELECT body FROM kickside_projection WHERE thread_id=$1", {lifecycle.thread_id(id)}))[1].body))
            db:release(); test.eq(body.ran_as, "system:lifecycle")
        end)
        test.it("does not invoke maintenance work without the runtime actor grant", function()
            local id, cursor, job = create()
            local denied = assert(security.policy("app:projection_owner_deny_actor"))
            local base = assert(security.policy("app:test_scope_policy"))
            local scope = assert(security.new_scope({base, denied}))
            local result, err = funcs.new():with_scope(scope):call("kickside.core.projections:advance",
                {job = job, payload = {cursor_id = cursor.id}})
            test.is_nil(err); test.is_true(result.invalid)
            local db = assert(sql.get("app:db"))
            local row = assert(db:query("SELECT last_error FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            db:release(); test.is_true(string.find(row.last_error, "actor creation is not granted", 1, true) ~= nil)
        end)
        test.it("fences ownership changes away and back without changing cursor generation", function()
            local id, cursor, job = create()
            local db = assert(sql.get("app:db"))
            local snapshot, snapshot_err = invoke.snapshot(db, cursor.id, job.id)
            test.is_nil(snapshot_err)
            snapshot = assert(snapshot)
            assert(db:execute("UPDATE kickside_components SET identity_generation=identity_generation+2 WHERE component_id=$1", {id}))
            db:release()
            local result, err = apply.advance("app:db", job, snapshot, 1, {body = {stale_fold = true}})
            test.is_nil(err); test.is_true(result.stale)
            db = assert(sql.get("app:db"))
            local after = assert(db:query("SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", {cursor.id}))[1]
            db:release()
            test.eq(tonumber(after.last_seq), 0)
        end)
    end)
end)}
