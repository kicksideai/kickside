-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local json = require("json")
local sql = require("sql")
local time = require("time")
local users = require("users")
local groups = require("groups")
local repo = require("repo")
local workflow = require("workflow")
local publish = require("publish")
local automation = require("automation")

local function exercise(): any
    local created, create_err = repo.create("Automation scope workflow")
    test.is_nil(create_err, tostring(create_err))
    local id = created.id
    local _, apply_err = workflow.apply(id, {
        {type="node.add", body={id="start", kind="start", config={input_schema={type="object"}}}},
        {type="node.add", body={id="work", kind="block", ref="app:block.engine_linear"}},
        {type="node.add", body={id="finish", kind="finish", config={output_schema={type="object"}}}},
        {type="edge.add", body={id="entry", source_id="start", target_id="work"}},
        {type="edge.add", body={id="exit", source_id="work", target_id="finish"}},
    }, "scope-test")
    test.is_nil(apply_err, tostring(apply_err))
    local published, publish_err = publish.publish(id, "scope-test")
    test.is_nil(publish_err, tostring(publish_err))
    test.is_true(published.ok, json.encode(published))
    local installed, install_err = automation.install_type("kickside.automation.manual:task", {
        target={kind="workflow", flow_ref={kind="flow", id=id, version=1}, input=json.decode("{}")},
    })
    test.is_nil(install_err, tostring(install_err))
    test.not_nil(installed)
    return {workflow_id=id, automation_id=installed.id}
end

local function define_tests()
    test.describe("automation composed execution scope", function()
        for _, case in ipairs({
            {name="native groups", extra="app:automation_delivery_extra", native_count=2, policy_count=0},
            {name="a group and authored policies", extra="app:automation_delivery_authored", native_count=1, policy_count=1},
        }) do
            test.it("starts a workflow run with " .. case.name .. " and no scope creation grant", function()
                local owner = "scope-member-" .. uuid.v4()
                local user, user_err = users.create_passwordless({user_id=owner,
                    email=owner .. "@test.local", full_name="Workflow member", status="active"})
                test.is_nil(user_err, tostring(user_err))
                test.not_nil(user)
                test.not_nil(groups.assign_user_to_group(owner, "app:automation_test"))
                local actor, actor_err = security.new_actor(owner, {security_groups={"app:automation_test"}})
                test.is_nil(actor_err, tostring(actor_err))
                local scope, scope_err = security.named_scope("wippy.security:process")
                test.is_nil(scope_err, tostring(scope_err))
                local caller = funcs.new():with_actor(actor):with_scope(scope)
                local env, setup_err = caller:call("app:automation_scope_create_exercise", {})
                test.is_nil(setup_err, tostring(setup_err))
                test.not_nil(env)
                local controlled, control_err = caller:call("kickside.automation.agent:automations_manage", {
                    action="control", id=env.automation_id, control="run_now", request_id=uuid.v7(),
                })
                test.is_nil(control_err, tostring(control_err))
                test.not_nil(controlled)
                test.not_nil(groups.remove_user_from_group(owner, "app:automation_test"))
                for _, group in ipairs({"app:automation_delivery_member", case.extra}) do
                    test.not_nil(groups.assign_user_to_group(owner, group))
                end
                local resolved, resolve_err = caller:call("kickside.users.binding:scope_resolver_func", {
                    principal={kind="user", id=owner},
                })
                test.is_nil(resolve_err, tostring(resolve_err))
                test.eq(#resolved.groups, 2, "delivery resolves both live member groups")
                test.eq(#resolved.scope_groups, case.native_count)
                test.eq(#resolved.scope_policy_ids, case.policy_count)
                local member_scope, member_scope_err = security.named_scope("app:automation_delivery_member")
                test.is_nil(member_scope_err, tostring(member_scope_err))
                test.eq(member_scope:evaluate(actor, "security.scope.create", "custom"), "undefined")
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err, tostring(db_err))
                local rows, read_err = db:query("SELECT job_id FROM kickside_automation_drive WHERE automation_id=$1 AND drive_key='main'", {env.automation_id})
                test.is_nil(read_err, tostring(read_err))
                test.eq(#rows, 1)
                local job = {id=rows[1].job_id, lease_token=uuid.v7(), execution_seq=1,
                    lease_until=time.now():utc():add(60*time.SECOND):format(time.RFC3339)}
                job.deadline = job.lease_until
                local _, lease_err = db:execute("UPDATE kickside_job SET status='running', lease_token=$1, lease_until=$2, execution_seq=$3 WHERE id=$4",
                    {job.lease_token, job.lease_until, job.execution_seq, job.id})
                test.is_nil(lease_err, tostring(lease_err))
                local _, round_err = caller:call("kickside.automation:round", {
                    job=job, payload={automation_id=env.automation_id, drive_key="main"},
                })
                test.is_nil(round_err, tostring(round_err))
                local runs, runs_err = db:query("SELECT admission_state, dataflow_id FROM workflow_runs WHERE workflow_id=$1", {env.workflow_id})
                local history, history_err = db:query("SELECT state,error_json FROM kickside_automation_delivery_history WHERE automation_id=$1", {env.automation_id})
                db:release()
                test.is_nil(history_err, tostring(history_err))
                test.is_nil(runs_err, tostring(runs_err))
                test.eq(#runs, 1, "automation delivery starts one workflow run: " .. json.encode(history))
                test.eq(runs[1].admission_state, "admitted")
                test.is_true(type(runs[1].dataflow_id)=="string" and runs[1].dataflow_id~="")
            end)
        end
    end)
end
return {run=test.run_cases(define_tests), exercise=exercise}
