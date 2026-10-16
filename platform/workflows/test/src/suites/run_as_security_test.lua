local test = require("test")
local funcs = require("funcs")
local json = require("json")
local security = require("security")
local store = require("store")
local workflow = require("workflow")
local version_publish = require("version_publish")

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    test.is_nil(policy_err)
    test.not_nil(policy)
    local scope, scope_err = security.new_scope({ policy })
    test.is_nil(scope_err)
    test.not_nil(scope)
    return scope
end

local function publishable_workflow(id: string)
    local _, apply_err = workflow.apply(id, {
        { type = "node.add", body = { id = "entry", kind = "block", ref = "app:block.engine_linear" } },
        { type = "node.add", body = { id = "finish", kind = "block", ref = "app:block.engine_linear" } },
        { type = "edge.add", body = { id = "edge", source_id = "entry", target_id = "finish" } },
    }, "run-as-workflow-test")
    test.is_nil(apply_err)
    local published, publish_err = version_publish.publish(id, "run-as-workflow-test")
    test.is_nil(publish_err)
    test.eq(published.ok, true)
end

local function stored_identity(run_id: string): any
    local db, open_err = store.open_db()
    test.is_nil(open_err)
    test.not_nil(db)
    local rows, read_err = db:query("SELECT execution_identity_json FROM workflow_runs WHERE run_id=$1", { run_id })
    db:release()
    test.is_nil(read_err)
    test.eq(#rows, 1)
    local decoded, decode_err = json.decode(rows[1].execution_identity_json)
    test.is_nil(decode_err)
    return decoded
end

local function define_tests()
    test.describe("workflow admitted identity propagation", function()
        test.it("retains the original authorizer and restrictions when a nested workflow launch captures identity", function()
            local workflow_id = require("uuid").v4()
            publishable_workflow(workflow_id)
            local admitted = {
                version = 2,
                principal = { kind = "user", id = "nested-bot" },
                authorized_by = { kind = "user", id = "configuring-admin" },
                component_id = "automation-root",
                credential_id = "credential-boundary",
                link_id = "link-boundary",
                captured_at = "2026-10-07T00:00:00Z",
            }
            local actor, actor_err = security.new_actor("nested-bot", {
                principal = admitted.principal,
                execution_identity = admitted,
                component_id = "ambient-root",
                credential_id = "ambient-credential",
                link_id = "ambient-link",
            })
            test.is_nil(actor_err)
            test.not_nil(actor)
            local launched, launch_err = funcs.new():with_actor(actor):with_scope(suite_scope())
                :call("app:run_as_workflow_launch_probe", { workflow_id = workflow_id })
            test.is_nil(launch_err)
            test.eq(launched.success, true, tostring(launched.error))
            local identity = stored_identity(launched.run_id)
            test.eq(identity.principal.id, "nested-bot")
            test.eq(identity.authorized_by.id, "configuring-admin")
            test.eq(identity.component_id, "automation-root")
            test.eq(identity.credential_id, "credential-boundary")
            test.eq(identity.link_id, "link-boundary")
        end)
    end)
end

local cases = test.run_cases(define_tests)

local function run(options: any): any
    local actor, actor_err = security.new_actor("run-as-workflow-suite", {})
    if actor_err or not actor then error(tostring(actor_err)) end
    local result, run_err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:run_as_workflow_security_actor_run", options or {})
    if run_err then error(tostring(run_err)) end
    return result
end

return { run = run, actor_run = function(options: any): any return cases(options) end }
