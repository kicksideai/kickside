local test = require("test")
local uuid = require("uuid")
local uuid_v4 = uuid.v4
local json = require("json")
local funcs = require("funcs")
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
local call_as = sc.call_as
local function define_tests()
    test.describe("Workflow compiler live dataflow execution", function()
        test.it("exposes every published Flow through one agent capability", function()
            local owner = "workflow-trait-owner-" .. uuid_v4()
            local created, create_err = call_as(owner, {
                op = "workflow_trait_create",
                title = "Broad Flow composition",
                publish = true,
            })
            test.is_nil(create_err)
            test.is_true((created :: Map).success, tostring((created :: Map).error))
            local id = tostring((created :: Map).workflow_id or "")
            test.is_true(id ~= "")

            local compiled, compile_err = call_as(owner, { op = "workflow_traits_compile" })
            test.is_nil(compile_err)
            test.is_true((compiled :: Map).success, tostring((compiled :: Map).error))
            local tools = (compiled :: Map).tools :: { Map }
            test.eq(#tools, 2)
            local by_id: Map = {}
            for _, tool in ipairs(tools) do by_id[tool.id] = tool end
            local run_tool = by_id["kickside.workflows.agent:flow_run_tool"] :: Map
            test.not_nil(run_tool)
            test.eq(((run_tool.schema :: Map).required :: { any })[1], "flow_ref")
            test.eq(((run_tool.schema :: Map).required :: { any })[2], "input")
            local discovery = by_id["kickside.workflows.agent:flows_read"] :: Map
            test.not_nil(discovery)
            test.eq(((discovery.schema :: Map).required :: { any })[1], "action")
            local prompt = tostring((compiled :: Map).prompt or "")
            test.contains(prompt, "Broad Flow composition")
            test.contains(prompt, "text: string")
            test.contains(prompt, "Finish: { kind?: string")

            local invoked, invoke_err = call_as(owner, {
                op = "workflow_traits_invoke",
                workflow_id = id,
                input = { text = "broad hello", count = 3 },
            })
            test.is_nil(invoke_err)
            test.is_true((invoked :: Map).success, tostring((invoked :: Map).error))
            test.eq((((invoked :: Map).result :: Map).text), "broad hello")
            test.eq((((invoked :: Map).result :: Map).transformed), "BROAD HELLO:3")

            local invalid = select(1, call_as(owner, {
                op = "workflow_traits_invoke", workflow_id = id, input = { text = 3 },
            })) :: Map
            test.is_false(invalid.success)
            test.contains(tostring(invalid.error), "input does not match Start schema")
        end)

        test.it("lists a published Flow for exact Automation binding selection", function()
            local owner = "workflow-destination-owner-" .. uuid_v4()
            local title = "Automation destination workflow"
            local created = select(1, call_as(owner, {
                op = "workflow_trait_create",
                title = title,
                publish = true,
            })) :: Map
            test.is_true(created.success, tostring(created.error))
            local id = tostring(created.workflow_id or "")
            test.is_true(id ~= "")

            local catalog, catalog_err = call_as(owner, { op = "workflow_published_catalog" })
            test.is_nil(catalog_err)
            test.is_true((catalog :: Map).success, tostring((catalog :: Map).error))
            local found: Map? = nil
            for _, raw in ipairs(((catalog :: Map).items or {}) :: { any }) do
                local item = raw :: Map
                if item.id == id then found = item end
            end
            test.not_nil(found)
            test.eq((found :: Map).label, title)
            test.eq(((found :: Map).flow_ref :: Map).kind, "flow")
            test.eq(((found :: Map).flow_ref :: Map).id, id)
            test.eq(((found :: Map).flow_ref :: Map).version, 1)
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
