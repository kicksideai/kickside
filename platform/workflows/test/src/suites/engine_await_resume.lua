local test = require("test")
local uuid = require("uuid")
local uuid_v4 = uuid.v4
local json = require("json")
local funcs = require("funcs")
local sql = require("sql")
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
local launch_as = sc.launch_as
local output_for = sc.output_for
local wait_terminal = sc.wait_terminal
local wait_nonterminal = sc.wait_nonterminal
local wait_for_commit_type = sc.wait_for_commit_type
local wait_await_signal = sc.wait_await_signal
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
