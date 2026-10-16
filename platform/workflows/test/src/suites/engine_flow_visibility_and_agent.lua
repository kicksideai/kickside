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
local maintenance = require("maintenance")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
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
local agent_step = sc.agent_step
local e = sc.e
local apply_and_publish = sc.apply_and_publish
local call_as = sc.call_as
local launch = sc.launch
local output_for = sc.output_for
local wait_terminal = sc.wait_terminal
local function define_tests()
    test.describe("Workflow compiler live dataflow execution", function()


        test.it("scopes Flow awareness to the acting user and drops draft and deleted Flows", function()
            local owner = "workflow-trait-owner-" .. uuid_v4()
            local stranger = "workflow-trait-stranger-" .. uuid_v4()
            for _, id in ipairs({ owner, stranger }) do
                local user, user_err = user_repo.create_passwordless({
                    user_id = id, email = id .. "@test.local", full_name = id, status = "active",
                })
                test.is_nil(user_err)
                test.not_nil(user)
                local assigned, group_err = user_groups_repo.assign_user_to_group(id, "wippy.security:process")
                test.is_nil(group_err)
                test.not_nil(assigned)
            end
            local title = "Catalog lifecycle workflow"
            local created = select(1, call_as(owner, {
                op = "workflow_trait_create",
                title = title,
                publish = false,
            })) :: Map
            test.is_true(created.success, tostring(created.error))
            local id = tostring(created.workflow_id or "")
            test.is_true(id ~= "")

            local function prompt_for(actor_id: string): string
                local result, err = call_as(actor_id, { op = "workflow_traits_compile" })
                test.is_nil(err)
                test.is_true((result :: Map).success, tostring((result :: Map).error))
                return tostring((result :: Map).prompt or "")
            end

            -- A draft has no published Start/Finish contract, so it cannot appear.
            test.is_true(string.find(prompt_for(owner), title, 1, true) == nil)

            local published = select(1, call_as(owner, { op = "workflow_trait_publish", workflow_id = id })) :: Map
            test.is_true(published.success, tostring(published.error))
            test.contains(prompt_for(owner), title)

            -- A user with neither READ nor WRITE cannot learn the name or execute it.
            test.is_true(string.find(prompt_for(stranger), title, 1, true) == nil)
            local denied = select(1, call_as(stranger, {
                op = "workflow_traits_invoke", workflow_id = id, input = { text = "nope" },
            })) :: Map
            test.is_false(denied.success)
            test.contains(tostring(denied.error), "not published and callable")

            -- READ is the use grant: a READ-granted user sees the published Flow
            -- in the runnable catalog and can execute it; changing it still
            -- requires WRITE on the write paths.
            local granted = select(1, call_as(owner, {
                op = "workflow_trait_grant_read", workflow_id = id, subject_id = stranger,
            })) :: Map
            test.is_true(granted.success, tostring(granted.error))
            test.contains(prompt_for(stranger), title)

            local shared_catalog = select(1, call_as(stranger, { op = "workflow_published_catalog" })) :: Map
            test.is_true(shared_catalog.success, tostring(shared_catalog.error))
            local shared_found = false
            for _, raw in ipairs((shared_catalog.items or {}) :: { any }) do
                if tostring((raw :: Map).id) == id then shared_found = true end
            end
            test.is_true(shared_found)

            local read_only = select(1, call_as(stranger, {
                op = "workflow_traits_invoke", workflow_id = id, input = { text = "read only", count = 1 },
            })) :: Map
            test.is_true(read_only.success, tostring(read_only.error))

            local blocked = select(1, call_as(owner, { op = "agent_tool_delete", workflow_id = id })) :: Map
            test.is_false(blocked.success)
            test.contains(tostring(blocked.error), "active run or unpublished terminal event")
            test.is_true(errors.is(blocked.error, errors.CONFLICT))
            local d, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not d then error("test database unavailable") end
            local run_rows, run_err = d:query("SELECT run_id FROM workflow_runs WHERE workflow_id=$1", { id })
            d:release()
            test.is_nil(run_err)
            test.eq(#run_rows, 1)
            local tick, tick_err = maintenance.tick(1, tostring(run_rows[1].run_id))
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            local deleted = select(1, call_as(owner, { op = "agent_tool_delete", workflow_id = id })) :: Map
            test.is_true(deleted.success, tostring(deleted.error))
            test.is_true(string.find(prompt_for(owner), title, 1, true) == nil)
        end)

        test.it("runs a published linear workflow to completed output", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("linear", { ref = "app:engine_linear" }),
            }, {
                e("e0", "t", "linear"),
            })

            local launched, c = launch(id, { text = "hello", count = 7 })
            local status = wait_terminal(c, tostring((launched :: Map).dataflow_id or ""))
            test.eq(status, consts.STATUS.COMPLETED_SUCCESS)

            local output = output_for(c, tostring((launched :: Map).dataflow_id or ""))
            test.eq((output.result :: Map).kind, "linear")
            test.eq((output.result :: Map).text, "hello")
            test.eq((output.result :: Map).transformed, "HELLO:7")
            test.eq(((output.result :: Map).input_echo :: Map).count, 7)
        end)

        test.it("runs an inline agent from arena instructions and returns typed Finish output", function()
            local id = wid()
            apply_and_publish(id, {
                n("start", "start", { config = {
                    input_schema = { type = "object", properties = { text = { type = "string" } } },
                } }),
                agent_step("agent", { config = {
                    instructions = "INLINE_AGENT_INSTRUCTIONS: call Finish with the typed greeting.",
                    model = "inline-agent-test-model",
                    exit_schema = {
                        type = "object",
                        required = { "greeting" },
                        properties = { greeting = { type = "string" } },
                    },
                } }),
                n("finish", "finish", { config = {
                    output_schema = {
                        type = "object",
                        required = { "greeting" },
                        properties = { greeting = { type = "string" } },
                    },
                } }),
            }, {
                e("start-agent", "start", "agent"),
                e("agent-finish", "agent", "finish"),
            })

            local launched, c = launch(id, { text = "hello" })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, dataflow_id).result :: Map
            test.eq(tostring(result.greeting), "instructions honored")
        end)






    end)
end

-- The live engine proofs run as two test entries so each entry's live
-- dataflow work stays well inside the runner's per-entry budget.

local run_cases = test.run_cases(define_tests)
local function run(options)
    return run_cases(options)
end

return { run = run }
