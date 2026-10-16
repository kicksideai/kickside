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
local workflow_repo = require("workflow_repo")
local published_catalog = require("published_catalog")
local agent_compiler = require("agent_compiler")
local component = require("component")
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
local cmd = sc.cmd
local C = sc.C
local restore_real_engine = sc.restore_real_engine
local function seam(args: any): any
    local a = type(args) == "table" and (args :: Map) or {}
    if a.op == "agent_tool_create" or a.op == "workflow_trait_create" then
        local created, create_err = workflow_repo.create(a.title)
        if create_err or not created then return { success = false, error = tostring(create_err or "create failed") } end
        local id = tostring((created :: Map).id or "")
        local actor = security.actor()
        local actor_id = actor and tostring(actor:id() or "") or "engine-test"
        local _, apply_err = workflow.apply(id, {
            cmd(C.NODE_ADD, { id = "start", kind = "start", title = "Start", config = {
                input_schema = {
                    type = "object",
                    required = { "text" },
                    properties = { text = { type = "string" }, count = { type = "number" } },
                },
            } }),
            cmd(C.NODE_ADD, { id = "work", kind = "block", ref = "app:block.engine_linear", title = "Work" }),
            cmd(C.NODE_ADD, { id = "finish", kind = "finish", title = "Finish", config = {
                output_schema = { type = "object", properties = { kind = { type = "string" }, text = { type = "string" } } },
            } }),
            cmd(C.EDGE_ADD, { id = "start-work", source_id = "start", target_id = "work" }),
            cmd(C.EDGE_ADD, { id = "work-finish", source_id = "work", target_id = "finish" }),
        }, actor_id)
        if apply_err then return { success = false, error = tostring(apply_err) } end
        if a.op == "agent_tool_create" or a.publish == true then
            local published, publish_err = version_publish.publish(id, actor_id)
            if publish_err or type(published) ~= "table" or (published :: Map).ok ~= true then
                return { success = false, error = tostring(publish_err or "publish failed") }
            end
        end
        return { success = true, workflow_id = id }
    elseif a.op == "workflow_trait_publish" then
        local actor = security.actor()
        local actor_id = actor and tostring(actor:id() or "") or "engine-test"
        local published, publish_err = version_publish.publish(tostring(a.workflow_id or ""), actor_id)
        return { success = publish_err == nil and type(published) == "table" and (published :: Map).ok == true, error = publish_err }
    elseif a.op == "workflow_trait_grant_read" then
        local service, service_err = component.get_service()
        if service_err or not service then return { success = false, error = tostring(service_err or "component service unavailable") } end
        local result, grant_err = (service :: any):grant_subtree({
            root_component_id = tostring(a.workflow_id or ""),
            subject = { subject_id = tostring(a.subject_id or ""), subject_type = "user" },
            access_mask = workflow_repo.ACCESS.READ,
        })
        return { success = grant_err == nil and type(result) == "table" and (result :: Map).success == true, error = grant_err or (type(result) == "table" and (result :: Map).error or nil) }
    elseif a.op == "workflow_traits_compile" then
        local compiled, compile_err = agent_compiler.compile({
            id = "workflow-traits",
            model = "class:fast",
            prompt = "test",
            tools = {},
            traits = {
                "kickside.workflows:flow_access_trait",
            },
        })
        if compile_err or not compiled then return { success = false, error = tostring(compile_err or "agent compile failed") } end
        local tools: { Map } = {}
        for _, tool in pairs((compiled :: Map).tools or {}) do
            local item = tool :: Map
            tools[#tools + 1] = { id = item.registry_id, schema = item.schema, context = item.context }
        end
        return { success = true, tools = tools, prompt = (compiled :: Map).prompt }
    elseif a.op == "workflow_traits_invoke" then
        restore_real_engine()
        local actor = security.actor()
        local scope = security.scope()
        if not actor or not scope then return { success = false, error = "actor and scope are required" } end
        local result, invoke_err = funcs.new()
            :with_actor(actor)
            :with_scope(scope)
            :call("kickside.workflows.agent:flow_run_tool", {
                flow_ref = { kind = "flow", id = tostring(a.workflow_id or ""), version = tonumber(a.version) or 1 },
                input = type(a.input) == "table" and a.input or {},
            })
        return { success = invoke_err == nil, result = result, error = invoke_err }
    elseif a.op == "workflow_published_catalog" then
        local items, list_err = published_catalog.bindable_items()
        return { success = list_err == nil, items = items or {}, error = list_err }
    elseif a.op == "agent_tool_delete" then
        local ok, delete_err = workflow_repo.delete(tostring(a.workflow_id or ""))
        return { success = ok == true, error = delete_err }
    elseif a.op == "launch" then
        restore_real_engine()
        local result, err = runs.launch(tostring(a.workflow_id or ""), {
            version = tonumber(a.version) or 1,
            input = type(a.input) == "table" and a.input or {},
            mode = a.mode,
        })
        if err then return { success = false, error = tostring(err) } end
        return { success = true, result = result }
    elseif a.op == "simulate" then
        restore_real_engine()
        local result, err = runs.simulate(tostring(a.workflow_id or ""), { input = type(a.input) == "table" and a.input or {} })
        if err then return { success = false, error = tostring(err) } end
        return { success = true, result = result }
    elseif a.op == "get_status" then
        local c, err = client.new()
        if err then return { success = false, error = tostring(err) } end
        local result, status_err = c:get_status(tostring(a.dataflow_id or ""))
        if status_err then return { success = false, error = tostring(status_err) } end
        return { success = true, result = result }
    elseif a.op == "output" then
        local c, err = client.new()
        if err then return { success = false, error = tostring(err) } end
        local result, output_err = c:output(tostring(a.dataflow_id or ""))
        if output_err then return { success = false, error = tostring(output_err) } end
        return { success = true, result = result }
    elseif a.op == "signal" then
        local c, err = client.new()
        if err then return { success = false, error = tostring(err) } end
        local result, signal_err = c:signal(
            tostring(a.dataflow_id or ""),
            tostring(a.signal_id or ""),
            type(a.payload) == "table" and a.payload or {}
        )
        if signal_err then return { success = false, error = tostring(signal_err) } end
        return { success = true, result = result }
    end
    return { success = false, error = "unknown op" }
end

local function await_arm(_args: any): Map
    return { success = true }
end

return { seam = seam, await_arm = await_arm }
