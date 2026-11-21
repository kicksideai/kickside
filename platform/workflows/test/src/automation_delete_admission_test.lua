-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local json = require("json")
local time = require("time")
local sql = require("sql")
local jobs_claim = require("jobs_claim")
local lifecycle = require("lifecycle")
local repo = require("repo")
local workflow = require("workflow")
local publish = require("publish")
local automation = require("automation")
local component = require("component")
local store = require("store")
local delete_api = require("delete_api")
local worker = require("worker")
local users = require("users")
local groups = require("groups")
local reaper_consts = require("reaper_consts")
local writable = require("writable")
local inbox_reader = require("inbox_reader")
local inbox_resolve = require("inbox_resolve")
local maintenance = require("maintenance")

local function project_inbox(thread_id)
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query("SELECT c.id AS cursor_id,j.* FROM kickside_projection_cursor c"
        .. " JOIN kickside_projection p ON p.id=c.projection_id JOIN kickside_job j ON j.id=c.job_id"
        .. " WHERE p.thread_id=$1 AND p.kind='kickside.inbox:items' AND j.status='pending'", {thread_id}))
    if not rows[1] then db:release(); return end
    local job = rows[1]
    local dialect = assert(db:type())
    local tx = assert(db:begin())
    local token = uuid.v7()
    local leased, lease_err = jobs_claim.lease_row(tx, dialect, job.id, token,
        lifecycle.future_string(dialect, 60), lifecycle.now_string(dialect))
    if lease_err or not leased then tx:rollback(); db:release(); error(lease_err or "Inbox projection job not pending") end
    assert(tx:commit()); db:release()
    local result, err = funcs.call("kickside.core.projections:advance", {
        job={id=job.id,lease_token=token,execution_seq=leased.execution_seq,attempts=leased.attempts},
        payload={cursor_id=job.cursor_id}})
    test.is_nil(err, tostring(err)); test.not_nil(result)
end

local function query(statement, args)
    local db = assert(store.open_db())
    local rows, err = db:query(statement, args)
    db:release()
    test.is_nil(err, tostring(err))
    return rows
end

local function execute(statement, args)
    local db = assert(store.open_db())
    local _, err = db:execute(statement, args)
    db:release()
    test.is_nil(err, tostring(err))
end

local function refuse(id, route)
    local err
    if route == "http" then
        local status, body = delete_api.response_for(security.actor(), id, nil)
        test.eq(status, 409)
        test.eq(body.error.code, "conflict")
        test.eq(body.error.details.code, "automation_runs_active")
        test.is_false(body.error.retryable)
        return
    elseif route == "uninstall" then
        _, err = automation.uninstall(id)
    elseif route == "owner" then
        local accepted
        accepted, err = component.system_delete(id, "reparent_root")
        test.is_false(accepted)
    else
        local actor = assert(security.new_actor("system:lifecycle", {}))
        local scope = assert(security.new_scope({assert(security.policy("app:workflows_suite_policy"))}))
        _, err = funcs.new():with_actor(actor):with_scope(scope):call("kickside.core.lifecycle:reaper", {
            thread_id=reaper_consts.thread_id(), events={{type=reaper_consts.EVENT.COMPONENT_DELETED,
                body={subject_id="delete-owner:" .. id}}}, range={to_seq=1}, projection={body={}}})
    end
    test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
    test.eq(err:details().code, "automation_runs_active")
end

local function exercise(args)
    local created, create_err = repo.create("Automation deletion review")
    test.is_nil(create_err, tostring(create_err))
    local id = created.id
    local _, edit_err = workflow.apply(id, {
        {type="node.add", body={id="review",kind="block",ref="kickside.inbox:block.review",
            config={prompt="Approve before deleting Automation?"}}},
    }, "deletion-test")
    test.is_nil(edit_err, tostring(edit_err))
    local published, publish_err = publish.publish(id, "deletion-test")
    test.is_nil(publish_err, tostring(publish_err)); test.is_true(published.ok, json.encode(published))
    local installed, install_err = automation.install_type("kickside.automation.manual:task", {
        target={kind="workflow",flow_ref={kind="flow",id=id,version=1},input={}},
    })
    test.is_nil(install_err, tostring(install_err))
    local aid = installed.id
    if args.route == "cascade" then
        -- Isolate the Automation from its workflow and Inbox fixtures in the owner's cascade.
        execute("UPDATE kickside_component_meta SET value=$1 WHERE component_id=$2 AND key='owner'",
            {"delete-owner:" .. aid, aid})
    end
    local rid, item
    if args.status then
        rid = uuid.v4()
        execute("INSERT INTO workflow_runs (run_id,workflow_id,version,trigger_id,status,started_at,terminal_event_pending)"
            .. " VALUES ($1,$2,1,$3,$4,'2026-11-17T00:00:00Z',$5)",
            {rid,id,aid,args.status,args.status == "completed"})
    else
        local result = writable.write({config={flow_ref={kind="flow",id=id,version=1}},
            automation_ref={kind="automation",id=aid,revision=1},origin=aid,
            input={},identity_key="review",idempotency_key=uuid.v4(),sink_op="create"})
        test.is_true(result.success, json.encode(result))
        rid = result.dest_ref.run_id
        local inbox_id = component.singleton_component_id(security.actor():id(), "kickside.inbox")
        for _ = 1, 100 do
            -- The shared harness disables the Jobs worker. Advance only this
            -- Inbox's projection by claiming its exact native Jobs slot.
            project_inbox(inbox_id)
            local items, read_err = inbox_reader.query():all()
            test.is_nil(read_err, tostring(read_err))
            for _, candidate in ipairs(items) do
                if candidate.metadata.run_id == rid then item = candidate end
            end
            if item then break end
            time.sleep("50ms")
        end
        test.not_nil(item, "launched run must wait on a real Inbox review")
        test.eq(item.status, "pending")
        local row = query("SELECT trigger_id,execution_identity_json FROM workflow_runs WHERE run_id=$1", {rid})[1]
        test.eq(row.trigger_id, aid)
        test.eq(json.decode(row.execution_identity_json).component_id, aid)
    end
    local before_run = query("SELECT * FROM workflow_runs WHERE run_id=$1", {rid})
    local before_drives = query("SELECT * FROM kickside_automation_drive WHERE automation_id=$1 ORDER BY drive_key", {aid})
    local before_component = query("SELECT * FROM kickside_components WHERE component_id=$1", {aid})
    refuse(aid, args.route)
    test.eq(json.encode(query("SELECT * FROM workflow_runs WHERE run_id=$1", {rid})), (json.encode(before_run)))
    test.eq(json.encode(query("SELECT * FROM kickside_automation_drive WHERE automation_id=$1 ORDER BY drive_key", {aid})), (json.encode(before_drives)))
    test.eq(json.encode(query("SELECT * FROM kickside_components WHERE component_id=$1", {aid})), (json.encode(before_component)))
    test.eq(#query("SELECT id FROM kickside_job WHERE owner_kind='component' AND owner_id=$1", {aid}), 0)
    if item then
        local unchanged, read_err = inbox_reader.get(item.id)
        test.is_nil(read_err, tostring(read_err)); test.eq(json.encode(unchanged), (json.encode(item)))
        local approved, approve_err = inbox_resolve.apply(item.id, "approve")
        test.is_nil(approve_err, tostring(approve_err)); test.eq(approved.status, "approved")
        for _ = 1, 100 do
            local row = query("SELECT status FROM workflow_runs WHERE run_id=$1", {rid})[1]
            if row.status == "completed" then break end
            time.sleep("50ms")
        end
        test.eq(query("SELECT status FROM workflow_runs WHERE run_id=$1", {rid})[1].status, "completed")
    end
    -- Terminal persistence alone is insufficient: the publication must be acknowledged.
    execute("UPDATE workflow_runs SET status='completed',terminal_event_pending=TRUE,terminal_event_check_at='2000-01-01T00:00:00Z' WHERE run_id=$1", {rid})
    refuse(aid, "uninstall")
    if item then
        local stats, tick_err = maintenance.tick(10, rid)
        test.is_nil(tick_err, tostring(tick_err)); test.eq(stats.failures, 0)
        test.eq(stats.published, 1)
    else
        execute("UPDATE workflow_runs SET terminal_event_pending=FALSE WHERE run_id=$1", {rid})
    end
    local result, delete_err = automation.delete_automation(aid)
    test.is_nil(delete_err, tostring(delete_err)); test.not_nil(result)
    local finished, finish_err = worker.run(aid)
    test.is_nil(finish_err, tostring(finish_err)); test.is_true(finished.deleted)
    test.eq(#query("SELECT component_id FROM kickside_components WHERE component_id=$1", {aid}), 0)
    test.eq(#query("SELECT run_id FROM workflow_runs WHERE run_id=$1", {rid}), 1)
end

return {exercise=exercise, run=test.run_cases(function()
    test.describe("Automation deletion admission", function()
        for _, args in ipairs({{route="http"},{route="uninstall"},{route="owner"},{route="cascade"},
            {route="http",status="pending"},{route="http",status="running"},{route="http",status="completed"}}) do
            test.it(args.route .. "/" .. (args.status or "Inbox review"), function()
                local owner = "automation-delete-" .. uuid.v4()
                local _, user_err = users.create_passwordless({user_id=owner,email=owner .. "@test.local",full_name=owner,status="active"})
                test.is_nil(user_err, tostring(user_err))
                test.not_nil(groups.assign_user_to_group(owner, "app:automation_test"))
                local actor = assert(security.new_actor(owner, {}))
                local scope = assert(security.new_scope({assert(security.policy("app:workflows_suite_policy"))}))
                local _, err = funcs.new():with_actor(actor):with_scope(scope):call("app:automation_delete_admission_exercise", args)
                test.is_nil(err, tostring(err))
            end)
        end
    end)
end)}
