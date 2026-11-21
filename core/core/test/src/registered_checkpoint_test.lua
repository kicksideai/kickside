-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")
local contract = require("contract")
local jobs = require("jobs")
local json = require("json")
local process = require("process")
local registry = require("registry")
local security = require("security")
local projections = require("projections")
local sql = require("sql")
local test = require("test")
local threads = require("threads")
local time = require("time")
local uuid = require("uuid")

local TRIGGER = "kickside.test.threads:trigger"
local CHANGED = "kickside.test.threads:changed"
local PUBLIC = "proc://core.owned.fixture:registered_checkpoint_ordinary"

local function in_db(run)
    local db = assert(sql.get("app:db"))
    local ok, data = pcall(run, db)
    assert(select(2, db:release()) == nil)
    if not ok then error(data) end
    return data
end

local function await(read, predicate)
    local deadline = time.now():add("20s")
    local current
    repeat
        current = read()
        if predicate(current) then return current end
        if current.cursor_status == "invalid" then break end
        time.sleep("20ms")
    until time.now():after(deadline)
    error("registered projection did not settle: " .. assert(json.encode(current)))
end

local function test_case(options, assertions)
    local f = fixture.new()
    local source = uuid.v7()
    local thread_id = options.nonprimary and uuid.v7() or source
    local targets = {uuid.v7(), uuid.v7()}
    local impl = "app:registered_checkpoint_component"
    f.register_bare_component(f.owner, source, impl, {})
    for _, id in ipairs(targets) do f.register_bare_component(f.owner, id, impl, {}) end
    local member = options.grantee and f.stranger or f.owner
    if options.grantee then
        local owner = assert(security.new_actor(f.owner, {security_groups = {}}))
        local service = assert(contract.get("kickside.component:component_service"))
        local components = assert(service:with_actor(owner):with_scope(f.test_scope()):open())
        for _, id in ipairs({source, targets[1], targets[2]}) do
            local result = assert(components:grant_subtree({
                root_component_id = id,
                subject = {subject_id = member, subject_type = "user"},
                access_mask = options.read_only_target and id == targets[2] and 1 or 3,
            }))
            assert(result.success, tostring(result.error))
        end
    end
    in_db(function(db)
        -- Register the public proc on a non-primary thread of the same Component.
        assert(db:execute("INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)",
            {thread_id, source}))
        if thread_id ~= source then
            assert(db:execute("INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)",
                {source, source}))
        end
        assert(db:execute([[CREATE TABLE IF NOT EXISTS registered_checkpoint_effect (
            thread_id TEXT NOT NULL, event_id TEXT NOT NULL, destination TEXT NOT NULL, actor_id TEXT NOT NULL,
            PRIMARY KEY (thread_id,event_id,destination))]]))
        assert(db:execute([[CREATE TABLE IF NOT EXISTS registered_checkpoint_gate (
            thread_id TEXT PRIMARY KEY, mode TEXT NOT NULL, calls INTEGER NOT NULL, pid TEXT)]]))
        assert(db:execute("INSERT INTO registered_checkpoint_gate (thread_id,mode,calls) VALUES ($1,$2,0)",
            {thread_id, options.mode or "ready"}))
        assert(threads.append_system(db, thread_id, {
            {type=TRIGGER, role="system", body_json="{}"},
            {type=CHANGED, role="system", body_json="{}"},
            {type=TRIGGER, role="system", body_json="{}"},
        }))
    end)
    local args = {
        thread_id = thread_id, kind = "registered_fixture", worker_ref = options.worker or PUBLIC,
        worker_input_mode = "prefetch_events", events = not options.unfiltered and {input = {{type = TRIGGER}}} or nil,
        worker_config = {test_actor = member, output_thread = source,
            shape = assert(json.decode('{"empty_object":{},"empty_array":[]}')),
            destinations = options.single and {targets[1]} or targets},
    }
    local result, registration_err = f.run_as(member, "register_projection", args)
    assert(result, tostring(registration_err))
    local current = assert(result.projection)
    local function read()
        return in_db(function(db)
            local row = assert(db:query([[SELECT c.status AS cursor_status,c.last_seq,c.last_error,c.actor_id,p.body,p.reset_generation,
                j.status AS job_status,j.attempts,j.scheduled_at,g.calls,g.pid FROM kickside_projection_cursor c
                JOIN kickside_projection p ON p.id=c.projection_id JOIN kickside_job j ON j.id=c.job_id
                JOIN registered_checkpoint_gate g ON g.thread_id=CAST(c.thread_id AS TEXT) WHERE c.id=$1]], {current.cursor_id}))[1]
            row.body = type(row.body) == "table" and row.body or assert(json.decode(row.body))
            row.effects = assert(db:query([[SELECT destination,actor_id FROM registered_checkpoint_effect
                WHERE thread_id=$1 ORDER BY event_id,destination]], {thread_id}))
            row.outputs = assert(db:query("SELECT id FROM kickside_event WHERE thread_id IN ($1,$2) AND type=$3",
                {thread_id, source, CHANGED}))
            return row
        end)
    end
    local function set_mode(mode)
        in_db(function(db)
            assert(db:execute("UPDATE registered_checkpoint_gate SET mode=$1 WHERE thread_id=$2", {mode, thread_id}))
        end)
    end
    local function retry(mode)
        set_mode(mode)
        in_db(function(db)
            assert(db:execute("UPDATE kickside_job SET scheduled_at=created_at WHERE id=$1", {current.job_id}))
        end)
        assert(jobs.nudge_workers())
    end
    local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
    local ok, err = pcall(function()
        local unused, direct_err = f.as_owner("register_projection", {
            thread_id = thread_id, kind = "direct_writer", worker_ref = "proc://core.owned.fixture:registered_checkpoint_writer",
            worker_input_mode = "prefetch_events",
        })
        test.is_nil(unused)
        if not options.nonprimary then
            test.is_true(errors.is(direct_err, errors.PERMISSION_DENIED), tostring(direct_err))
        end
        assert(jobs.nudge_workers())
        local function choose(method, params)
            params = params or {}
            params.thread_id, params.projection_id, params.cursor_id = thread_id, current.projection_id, current.cursor_id
            return assert(f.run_as(member, method, params))
        end
        assertions(read, retry, member, {set_mode = set_mode, choose = choose, registration = args, source = source, owner = f.owner})
    end)
    process.terminate(scheduler)
    in_db(function(db)
        assert(projections.remove_projection(db, thread_id, {projection_id=current.projection_id}))
        assert(db:execute("DELETE FROM registered_checkpoint_effect WHERE thread_id=$1", {thread_id}))
        assert(db:execute("DELETE FROM registered_checkpoint_gate WHERE thread_id=$1", {thread_id}))
        assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {thread_id}))
        assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {thread_id}))
        if thread_id ~= source then
            assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {source}))
            assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {source}))
        end
        for _, id in ipairs({source, targets[1], targets[2]}) do
            assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id}))
            assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
        end
    end)
    if not ok then error(err) end
end

local function pending_failure(row)
    return row.job_status == "pending" and tonumber(row.attempts) > 0 and row.last_error ~= nil
end

local function parked(row)
    return row.job_status == "pending" and row.scheduled_at == nil and tonumber(row.last_seq) >= 3
end

return {run = test.run_cases(function()
    test.describe("registered ordinary filtered publication", function()
        test.it("rolls back a failed destination write and settles the exact filtered range on retry", function()
            test_case({mode = "before_commit"}, function(read, retry, actor)
                local failed = await(read, pending_failure)
                test.eq(tonumber(failed.last_seq), 0)
                test.eq(#failed.effects, 0)
                test.eq(#failed.outputs, 1)
                test.contains(failed.last_error, "fixture writer stopped before commit")
                retry("ready")
                local done = await(read, parked)
                test.eq(tonumber(done.last_seq), 4)
                test.eq(tonumber(done.calls), 2)
                test.eq(done.body.meta.worker_ref, PUBLIC)
                test.eq(done.body.publications, 1)
                test.eq(done.body.offered, 2)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
                for _, row in ipairs(done.effects) do test.eq(row.actor_id, actor) end
            end)
        end)

        test.it("preserves an already committed range when the process loses its reply", function()
            test_case({mode = "lost_return"}, function(read, retry)
                local committed = await(read, function(row) return tonumber(row.last_seq) == 3 end)
                assert(process.terminate(committed.pid))
                local failed = await(read, pending_failure)
                test.eq(tonumber(failed.last_seq), 3)
                test.eq(#failed.effects, 4)
                test.eq(#failed.outputs, 2)
                retry("ready")
                local done = await(read, parked)
                test.eq(tonumber(done.last_seq), 4)
                test.eq(tonumber(done.calls), 1)
                test.eq(done.body.publications, 1)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
            end)
        end)

        test.it("rereads the filtered range after the worker receives its assigned events", function()
            test_case({mode = "change_range"}, function(read, retry)
                local failed = await(read, pending_failure)
                test.eq(tonumber(failed.last_seq), 0)
                test.eq(#failed.effects, 0)
                test.eq(#failed.outputs, 1)
                test.contains(failed.last_error, "projection checkpoint input changed")
                retry("ready")
                local done = await(read, parked)
                test.eq(tonumber(done.last_seq), 4)
                test.eq(done.body.offered, 1)
                test.eq(#done.effects, 2)
                test.eq(#done.outputs, 2)
            end)
        end)

        test.it("refuses a destination grant revoked during preparation", function()
            test_case({mode = "revoke"}, function(read)
                local denied = await(read, function(row) return row.cursor_status == "invalid" end)
                test.eq(tonumber(denied.last_seq), 0)
                test.eq(tonumber(denied.calls), 1)
                test.eq(#denied.effects, 0)
                test.eq(#denied.outputs, 1)
                test.contains(denied.last_error, "access denied")
            end)
        end)

        test.it("retries after a destination identity changes during preparation", function()
            test_case({mode = "change_target"}, function(read, retry)
                local stale = await(read, pending_failure)
                test.eq(tonumber(stale.last_seq), 0)
                test.eq(#stale.effects, 0)
                test.eq(#stale.outputs, 1)
                test.contains(stale.last_error, "registered checkpoint component changed during preparation")
                retry("ready")
                local done = await(read, parked)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
            end)
        end)

        test.it("fences a source thread rebound during preparation", function()
            test_case({mode = "rebind_source", nonprimary = true}, function(read, retry, _, control)
                local stale = await(read, pending_failure)
                test.eq(tonumber(stale.last_seq), 0)
                test.eq(#stale.effects, 0)
                test.eq(#stale.outputs, 1)
                test.contains(stale.last_error, "source binding changed during preparation")
                in_db(function(db)
                    assert(db:execute("UPDATE kickside_thread SET component_id=$1 WHERE id=$2",
                        {control.source, control.registration.thread_id}))
                end)
                retry("ready")
                local done = await(read, parked)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
            end)
        end)

        test.it("resumes without publishing the attempt paused during preparation", function()
            test_case({mode = "hold"}, function(read, _, _, control)
                await(read, function(row) return tonumber(row.calls) == 1 end)
                test.eq(control.choose("pause_projection").status, "paused")
                local paused = read()
                test.eq(tonumber(paused.last_seq), 0)
                test.eq(#paused.effects, 0)
                control.set_mode("ready")
                test.eq(control.choose("resume_projection").status, "active")
                local done = await(read, parked)
                test.eq(tonumber(done.calls), 2)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
            end)
        end)

        test.it("fences a same-position reset while the old worker prepares", function()
            test_case({mode = "hold"}, function(read, _, _, control)
                local before = await(read, function(row) return tonumber(row.calls) == 1 end)
                local registration = control.registration
                registration.reset, registration.start_seq = true, 0
                assert(control.choose("register_projection", registration))
                control.set_mode("ready")
                local done = await(read, parked)
                test.eq(tonumber(done.reset_generation), assert(tonumber(before.reset_generation)) + 1)
                test.eq(tonumber(done.calls), 2)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
            end)
        end)

        test.it("retries when a registry publication replaces the admitted declaration", function()
            test_case({mode = "hold"}, function(read, retry, _, control)
                await(read, function(row) return tonumber(row.calls) == 1 end)
                local original = assert(registry.current_version())
                local snapshot = assert(registry.snapshot())
                local entry = assert(snapshot:get("core.owned.fixture:registered_checkpoint_db"))
                local changes = snapshot:changes()
                changes:update({id = entry.id, kind = entry.kind, data = entry.data,
                    meta = {db_id = "app:sql_transient_first"}})
                assert(changes:apply())
                local ok, err = pcall(function()
                    control.set_mode("ready")
                    local stale = await(read, pending_failure)
                    test.eq(tonumber(stale.last_seq), 0)
                    test.eq(#stale.effects, 0)
                    test.eq(#stale.outputs, 1)
                    test.contains(stale.last_error, "registered checkpoint registry changed")
                end)
                assert(registry.apply_version(original))
                if not ok then error(err) end
                retry("ready")
                local done = await(read, parked)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
            end)
        end)

        test.it("keeps the registering grantee on a non-primary source", function()
            test_case({grantee = true, nonprimary = true}, function(read, _, actor)
                local done = await(read, parked)
                test.eq(tonumber(done.last_seq), 3)
                test.eq(tonumber(done.calls), 1)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
                for _, row in ipairs(done.effects) do test.eq(row.actor_id, actor) end
            end)
        end)

        test.it("requires destination WRITE from the registering grantee", function()
            test_case({grantee = true, read_only_target = true}, function(read)
                local denied = await(read, function(row) return row.cursor_status == "invalid" end)
                test.eq(tonumber(denied.last_seq), 0)
                test.eq(tonumber(denied.calls), 0)
                test.eq(#denied.effects, 0)
                test.contains(denied.last_error, "access denied")
            end)
        end)

        test.it("keeps destination grant authority through publication", function()
            test_case({mode = "probe_grant_lock", grantee = true}, function(read)
                local done = await(read, parked)
                test.eq(tonumber(done.calls), 1)
                test.eq(#done.effects, 4)
                test.eq(#done.outputs, 2)
            end)
        end)

        local ordinary = {
            {label = "one recipient", single = true, grantee = true},
            {label = "a split resource", worker = "proc://core.owned.fixture:registered_checkpoint_split", grantee = true},
            {label = "an unfiltered input", unfiltered = true, grantee = true},
        }
        for _, options in ipairs(ordinary) do
            test.it("keeps " .. options.label .. " on the ordinary worker", function()
                test_case(options, function(read, _, _, control)
                    local done = await(read, parked)
                    test.eq(done.body.ordinary_calls, 1)
                    test.eq(done.actor_id, control.owner)
                    test.eq(tonumber(done.calls), 0)
                    test.eq(#done.effects, 0)
                end)
            end)
        end
    end)
end)}
