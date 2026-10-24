local test = require("test")
local uuid = require("uuid")
local uuid_v4 = uuid.v4
local json = require("json")
local funcs = require("funcs")
local sql = require("sql")
local errors = require("errors")
local security = require("security")
local time = require("time")
local workflow = require("workflow")
local version_publish = require("version_publish")
local runs = require("runs")
local types = require("types")
local client = require("client")
local consts = require("consts")
local data_reader = require("data_reader")
local node_reader = require("node_reader")
local commit_repo = require("commit_repo")
local engine_scaffold = require("engine_scaffold")

type Map = { [string]: any }

local sc = engine_scaffold.new({
    test = test,
    uuid = uuid,
    json = json,
    funcs = funcs,
    security = security,
    time = time,
    workflow = workflow,
    version_publish = version_publish,
    runs = runs,
    types = types,
    client = client,
    consts = consts,
    data_reader = data_reader,
    node_reader = node_reader,
    commit_repo = commit_repo,
})
local wid = sc.wid
local n = sc.n
local fixture = sc.fixture
local fn = sc.fn
local e = sc.e
local apply_and_publish = sc.apply_and_publish
local call_as = sc.call_as
local launch_as = sc.launch_as
local output_for = sc.output_for
local wait_terminal = sc.wait_terminal
local wait_nonterminal = sc.wait_nonterminal
local wait_for_commit_type = sc.wait_for_commit_type
local wait_await_signal = sc.wait_await_signal

local function create_component_workflow(actor_id: string, title: string): string
    local created, create_err = call_as(actor_id, { op = "workflow_component_create", title = title })
    test.is_nil(create_err)
    test.not_nil(created)
    test.eq((created :: Map).success, true)
    local id = tostring((created :: Map).workflow_id or "")
    test.is_true(id ~= "")
    return id
end

local function change_component_access(actor_id: string, workflow_id: string, op: string,
    subject_id: string, subject_type: string, access_mask: number?): ()
    local changed, change_err = call_as(actor_id, {
        op = op,
        workflow_id = workflow_id,
        subject_id = subject_id,
        subject_type = subject_type,
        access_mask = access_mask,
    })
    test.is_nil(change_err)
    test.not_nil(changed)
    test.eq((changed :: Map).success, true)
end

local function stored_identity(dataflow_id: string): Map
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err)
    if not db then error("test database unavailable") end
    local rows, read_err = db:query(
        "SELECT execution_identity_json FROM workflow_runs WHERE dataflow_id=$1", { dataflow_id })
    db:release()
    test.is_nil(read_err)
    local decoded, decode_err = json.decode(tostring(rows[1].execution_identity_json))
    test.is_nil(decode_err)
    return decoded :: Map
end

-- Keep the workflow a real registered component while separating its durable
-- administrator from the principal that is allowed to run it.  The anchor
-- can change the runner's grant after the run has parked.
local function separate_workflow_access(actor_id: string, workflow_id: string): string
    local user_repo = require("user_repo")
    local user_groups_repo = require("user_groups_repo")
    local anchor_id = "await-access-anchor-" .. uuid_v4()
    local anchor, anchor_err = user_repo.create_passwordless({
        user_id = anchor_id, email = anchor_id .. "@test.local",
        full_name = "Await access anchor", status = "active",
    })
    test.is_nil(anchor_err)
    test.not_nil(anchor)
    test.not_nil(user_groups_repo.assign_user_to_group(anchor_id, "wippy.security:process"))
    change_component_access(actor_id, workflow_id, "workflow_component_grant", anchor_id, "user", 15)
    change_component_access(actor_id, workflow_id, "workflow_component_revoke", actor_id, "user")
    change_component_access(anchor_id, workflow_id, "workflow_component_grant", actor_id, "user", 1)
    return anchor_id
end

local function define_tests()
    test.describe("Workflow compiler live dataflow execution: branches, Awaits and items", function()


        test.it("routes an opaque Await payload through its provider-declared output ports", function()
            local id = wid()
            local actor_id = "await-route-" .. uuid_v4()
            apply_and_publish(id, {
                fixture("t"),
                n("h", "block", { ref = "app:block.test_external_wait", config = {} }),
                fn("a", { ref = "app:engine_arm_a" }),
                fn("b", { ref = "app:engine_arm_b" }),
            }, {
                e("e0", "t", "h"),
                e("continue", "h", "a", { source_port = "then" }),
                e("stop", "h", "b", { source_port = "else" }),
            })

            local launched, c = launch_as(actor_id, id, { amount = 3 }, "sync")
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            wait_nonterminal(c, dataflow_id)
            local signal = wait_await_signal(dataflow_id)
            local resumed, resume_err = c:signal(dataflow_id, tostring(signal.signal_id), {
                outcome = "stop",
                provider_value = { arbitrary = true },
            })
            test.is_nil(resume_err)
            test.not_nil(resumed)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local output = output_for(c, dataflow_id).result :: Map
            test.eq(output.arm, "B")
            test.eq((output.source :: Map).outcome, "stop")
            test.eq((((output.source :: Map).provider_value :: Map).arbitrary), true)
        end)

        test.it("keeps a direct Await pending when the registered workflow loses live READ", function()
            local user_repo = require("user_repo")
            local user_groups_repo = require("user_groups_repo")
            local actor_id = "await-workflow-read-" .. uuid_v4()
            local user, user_err = user_repo.create_passwordless({
                user_id = actor_id, email = actor_id .. "@test.local",
                full_name = "Await workflow READ test", status = "active",
            })
            test.is_nil(user_err)
            test.not_nil(user)
            test.not_nil(user_groups_repo.assign_user_to_group(actor_id, "wippy.security:process"))

            local id = create_component_workflow(actor_id, "Await current workflow access")
            apply_and_publish(id, {
                fixture("t"), n("h", "block", { ref = "app:block.test_external_wait", config = {} }),
                fn("a", { ref = "app:engine_arm_a" }),
            }, { e("e0", "t", "h"), e("continue", "h", "a", { source_port = "then" }) })
            local anchor_id = separate_workflow_access(actor_id, id)

            local launched, c = launch_as(actor_id, id, { amount = 55 }, "sync")
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            wait_nonterminal(c, dataflow_id)
            local signal = wait_await_signal(dataflow_id)
            test.is_nil((stored_identity(dataflow_id)).component_id)

            local payload = { outcome = "continue", retained = true }
            change_component_access(anchor_id, id, "workflow_component_revoke", actor_id, "user")
            local denied, deny_err = funcs.call("kickside.blocks:resume", {
                dataflow_id = dataflow_id, signal_id = tostring(signal.signal_id), payload = payload,
            })
            test.is_nil(denied)
            test.not_nil(deny_err)
            test.is_true(errors.is(deny_err, errors.PERMISSION_DENIED), tostring(deny_err))
            test.contains(tostring(deny_err), "workflow READ")
            wait_nonterminal(c, dataflow_id)

            change_component_access(anchor_id, id, "workflow_component_grant", actor_id, "user", 1)
            local resumed, resume_err = funcs.call("kickside.blocks:resume", {
                dataflow_id = dataflow_id, signal_id = tostring(signal.signal_id), payload = payload,
            })
            test.is_nil(resume_err)
            test.eq((resumed :: Map).ok, true)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            test.eq(((output_for(c, dataflow_id).result :: Map).source :: Map).retained, true)
        end)

        test.it("checks the workflow rather than a distinct component execution root", function()
            local user_repo = require("user_repo")
            local user_groups_repo = require("user_groups_repo")
            local actor_id = "await-component-root-" .. uuid_v4()
            local user, user_err = user_repo.create_passwordless({
                user_id = actor_id, email = actor_id .. "@test.local",
                full_name = "Await component root test", status = "active",
            })
            test.is_nil(user_err)
            test.not_nil(user)
            test.not_nil(user_groups_repo.assign_user_to_group(actor_id, "wippy.security:process"))

            local id = create_component_workflow(actor_id, "Await admitted workflow")
            local component_root = create_component_workflow(actor_id, "Await component root")
            apply_and_publish(id, {
                fixture("t"), n("h", "block", { ref = "app:block.test_external_wait", config = {} }),
                fn("a", { ref = "app:engine_arm_a" }),
            }, { e("e0", "t", "h"), e("continue", "h", "a", { source_port = "then" }) })
            local anchor_id = separate_workflow_access(actor_id, id)

            local identity = {
                version = 2,
                principal = { kind = "user", id = actor_id },
                authorized_by = { kind = "user", id = actor_id },
                component_id = component_root,
                captured_at = "2026-10-24T00:00:00Z",
            }
            local launched, c = launch_as(actor_id, id, { amount = 89 }, "sync", {
                execution_identity = identity,
            })
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            wait_nonterminal(c, dataflow_id)
            local signal = wait_await_signal(dataflow_id)
            test.eq((stored_identity(dataflow_id)).component_id, component_root)

            local payload = { outcome = "continue", component_root = true }
            change_component_access(anchor_id, id, "workflow_component_revoke", actor_id, "user")
            local denied, deny_err = funcs.call("kickside.blocks:resume", {
                dataflow_id = dataflow_id, signal_id = tostring(signal.signal_id), payload = payload,
            })
            test.is_nil(denied)
            test.not_nil(deny_err)
            test.is_true(errors.is(deny_err, errors.PERMISSION_DENIED), tostring(deny_err))
            test.contains(tostring(deny_err), "workflow READ")
            wait_nonterminal(c, dataflow_id)

            change_component_access(anchor_id, id, "workflow_component_grant", actor_id, "user", 1)
            local resumed, resume_err = funcs.call("kickside.blocks:resume", {
                dataflow_id = dataflow_id, signal_id = tostring(signal.signal_id), payload = payload,
            })
            test.is_nil(resume_err)
            test.eq((resumed :: Map).ok, true)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            test.eq(((output_for(c, dataflow_id).result :: Map).source :: Map).component_root, true)
        end)

        test.it("resumes a parked Await under stored identity without an ambient caller", function()
            local user_repo = require("user_repo")
            local user_lifecycle_repo = require("user_lifecycle_repo")
            local user_groups_repo = require("user_groups_repo")
            local id = wid()
            local actor_id = "await-callback-" .. uuid_v4()
            local user, user_err = user_repo.create_passwordless({
                user_id = actor_id,
                email = actor_id .. "@test.local",
                full_name = "Await Resume Test",
                status = "active",
            })
            test.is_nil(user_err)
            test.not_nil(user)
            local assigned, group_err = user_groups_repo.assign_user_to_group(
                actor_id, "wippy.security:process")
            test.is_nil(group_err)
            test.not_nil(assigned)
            apply_and_publish(id, {
                fixture("t"),
                n("h", "block", { ref = "app:block.test_external_wait", config = {} }),
                fn("a", { ref = "app:engine_arm_a" }),
                fn("b", { ref = "app:engine_arm_b" }),
            }, {
                e("e0", "t", "h"),
                e("continue", "h", "a", { source_port = "then" }),
                e("stop", "h", "b", { source_port = "else" }),
            })

            local launched, c = launch_as(actor_id, id, { amount = 21 }, "sync")
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            wait_nonterminal(c, dataflow_id)
            local signal = wait_await_signal(dataflow_id)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not db then error("test database unavailable") end
            local rows, read_err = db:query(
                "SELECT execution_identity_json FROM workflow_runs WHERE dataflow_id=$1", { dataflow_id })
            db:release()
            test.is_nil(read_err)
            local stored, decode_err = json.decode(tostring(rows[1].execution_identity_json))
            test.is_nil(decode_err)
            test.eq((stored :: Map).version, 2)
            test.eq(((stored :: Map).principal :: Map).id, actor_id)

            local suspended, suspend_err = user_lifecycle_repo.update(actor_id, { status = "suspended" })
            test.is_nil(suspend_err)
            test.not_nil(suspended)
            local denied, deny_err = funcs.call("kickside.blocks:resume", {
                dataflow_id = dataflow_id,
                signal_id = tostring(signal.signal_id),
                payload = { outcome = "continue", recovered = true },
            })
            test.is_nil(denied)
            test.not_nil(deny_err)
            test.contains(tostring(deny_err), "inactive")
            wait_nonterminal(c, dataflow_id)
            local restored, restore_err = user_lifecycle_repo.update(actor_id, { status = "active" })
            test.is_nil(restore_err)
            test.not_nil(restored)

            -- Component callbacks have no ambient HTTP actor. The resume entry
            -- resolves the run's immutable v2 identity, even when the callback
            -- happens to carry a different ambient test actor.
            local resumed, resume_err = funcs.call("kickside.blocks:resume", {
                dataflow_id = dataflow_id,
                signal_id = tostring(signal.signal_id),
                payload = { outcome = "continue", recovered = true },
            })
            test.is_nil(resume_err)
            test.eq((resumed :: Map).ok, true)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local output = output_for(c, dataflow_id).result :: Map
            test.eq(output.arm, "A")
            test.eq((output.source :: Map).recovered, true)
            test.not_nil(wait_for_commit_type(dataflow_id, "node.yield"))
        end)





    end)
end


local run_cases = test.run_cases(define_tests)
local function run_flow_control(options)
    return run_cases(options)
end

return { run_flow_control = run_flow_control }
