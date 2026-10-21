-- Materialization: the validated canvas IR -> the raw dataflow engine command
-- stream (CREATE_NODE / CREATE_DATA). Node ids in the emitted stream are the stable
-- def_node_ids (the canvas node ids); the run launcher remints them to fresh uuids
-- per run while preserving metadata.def_node_id, so the canvas overlay and replay
-- can map every engine node back to its canvas node. EVERY CREATE_NODE stamps
-- metadata.def_node_id + metadata.workflow_id + metadata.version. Notes never reach
-- here (they are not nodes).

local consts = require("consts")
local conditions = require("conditions")
local mapping = require("mapping")
local exact_flow_ref = require("flow_ref")
local blocks_lib = require("blocks")

local M = {}

M._blocks = blocks_lib

type Map = { [string]: any }

local NODE_TYPE_OF: { [string]: string } = {
    cycle = consts.NODE_TYPE.CYCLE,
    for_each = consts.NODE_TYPE.PARALLEL,
    -- Combine is a state node. Graph classification supplies inputs.required only
    -- for wait_all; first_wins intentionally fires on its first arrival.
    combine = consts.NODE_TYPE.STATE,
}

local DEFAULT_LOOP_BUDGET = 8
local DEFAULT_FOR_EACH_BATCH_SIZE = 8
local BOUNDARY_KINDS: { [string]: boolean } = { start = true, finish = true, ["error"] = true }

local function cfg_of(node: Map): Map
    return type(node.config) == "table" and (node.config :: Map) or {}
end

local function str(v: any): string
    if type(v) == "string" then return v end
    return ""
end

-- Engine config for a node, from its kind + canvas config + frozen ref.
local function base_config(node: Map, blocks: Map): (Map?, string?, string?)
    local kind = str(node.kind)
    local cfg = cfg_of(node)
    local config: Map = {}
    if kind == "block" then
        local block = blocks[str(node.ref)]
        if type(block) ~= "table" then return nil, nil, "unknown Block reference: " .. str(node.ref) end
        local plan, plan_err = M._blocks.plan_descriptor(block, {
            def_node_id = node.def_id,
            config = cfg,
        })
        if not plan then return nil, nil, plan_err end
        return (plan :: Map).config :: Map, str((plan :: Map).node_type), nil
    elseif kind == "flow" then
        local flow_ref, ref_err = exact_flow_ref.validate(cfg.flow_ref)
        if ref_err or not flow_ref then return nil, nil, tostring(ref_err) end
        config.func_id = consts.RUNTIME.EXPAND_FLOW
        config.args = { flow_ref = flow_ref }
        config.input_transform = { input = "input" }
    elseif kind == "combine" then
        config.output_mode = str(cfg.output_mode) ~= "" and cfg.output_mode or "object"
    elseif kind == "for_each" then
        config.source_array_key = str(cfg.source_array_key) ~= "" and cfg.source_array_key or "items"
        config.batch_size = tonumber(cfg.batch_size) or DEFAULT_FOR_EACH_BATCH_SIZE
        if cfg.continue_on_error == true then
            -- Preserve every attempted item in source order. Successful entries
            -- carry `result`; failed entries carry the engine's structured `error`.
            config.on_error = "continue"
            config.filter = "all"
            config.unwrap = false
        else
            -- The normal output is exactly the ordered results array. A failing item
            -- fails this node (and therefore the run unless a Failed port is wired).
            config.on_error = "fail_fast"
            config.filter = "successes"
            config.unwrap = true
        end
    elseif kind == "cycle" then
        local budget = tonumber(cfg.max_iterations) or DEFAULT_LOOP_BUDGET
        local continue: string
        if str(cfg.continue_condition) ~= "" then
            continue = conditions.compile(cfg.continue_condition, "state")
        else
            continue = "iteration < " .. tostring(budget - 1)
        end
        config.continue_condition = continue
        config.max_iterations = budget
        config.initial_state = type(cfg.initial_state) == "table" and cfg.initial_state or {}
    else return nil, nil, "no engine mapping for node kind: " .. kind end
    return config, kind == "flow" and consts.NODE_TYPE.FUNC or NODE_TYPE_OF[kind], nil
end

-- Resolve a node's engine node_type from the canonical executable kinds.
local function node_type_of(node: Map): string?
    local kind = str(node.kind)
    if NODE_TYPE_OF[kind] then return NODE_TYPE_OF[kind] end
    return nil
end

-- Resolve an edge transform to the engine's data_target.transform (an expr string).
local function edge_transform(transform: any, error_path: boolean): string?
    if error_path then return select(1, mapping.engine_error_expr(transform)) end
    return select(1, mapping.engine_expr(transform))
end

local function boundary_kinds(nodes: { Map }): Map
    local result: Map = {}
    for _, node in ipairs(nodes) do
        local kind = str(node.kind)
        if kind == "start" or kind == "finish" or kind == "error" then
            result[str(node.def_id)] = kind
        end
    end
    return result
end

-- Runtime commands must follow the graph rather than creation timestamps. Kahn order
-- enforces dependencies; the folded document order preserves the author's stable visual
-- intent among concurrently-ready siblings (def id is only an impossible-rank fallback).
-- Boundaries participate in ordering but are filtered from the returned runtime nodes.
local function ordered_runtime_nodes(nodes: { Map }, boundaries: Map): { Map }
    local by_id: Map = {}
    local rank: { [string]: number } = {}
    local indegree: { [string]: number } = {}
    local outgoing: Map = {}
    for index, node in ipairs(nodes) do
        local id = str(node.def_id)
        by_id[id] = node
        rank[id] = index
        indegree[id] = 0
        outgoing[id] = {}
    end
    for _, node in ipairs(nodes) do
        local source = str(node.def_id)
        local function include(raw: any)
            for _, edge in ipairs(type(raw) == "table" and (raw :: { Map }) or {}) do
                local target = str(edge.to)
                if indegree[target] ~= nil then
                    outgoing[source][#outgoing[source] + 1] = target
                    indegree[target] = (indegree[target] or 0) + 1
                end
            end
        end
        include(node.out_edges)
        include(node.error_edges)
    end
    for _, node in ipairs(nodes) do
        local child = str(node.def_id)
        local parent = str(node.template_parent_id)
        if parent ~= "" and parent ~= child and outgoing[parent] and indegree[child] ~= nil then
            outgoing[parent][#outgoing[parent] + 1] = child
            indegree[child] = (indegree[child] or 0) + 1
        end
    end
    local ready: { string } = {}
    for id, degree in pairs(indegree) do if degree == 0 then ready[#ready + 1] = id end end
    local function stable_sort(ids: { string })
        table.sort(ids, function(a: string, b: string): boolean
            local ar, br = rank[a] or math.huge, rank[b] or math.huge
            if ar == br then return a < b end
            return ar < br
        end)
    end
    local function outgoing_for(id: string): { string }
        for source, targets in pairs(outgoing) do
            if source == id and type(targets) == "table" then return targets :: { string } end
        end
        return {}
    end
    stable_sort(ready)
    local ordered: { Map } = {}
    local visited: { [string]: boolean } = {}
    while #ready > 0 do
        local id = tostring(table.remove(ready, 1) or "")
        visited[id] = true
        if boundaries[id] == nil then ordered[#ordered + 1] = by_id[id] :: Map end
        local targets = outgoing_for(id)
        stable_sort(targets)
        for _, target in ipairs(targets) do
            indegree[target] = (indegree[target] or 0) - 1
            if indegree[target] == 0 then ready[#ready + 1] = target; stable_sort(ready) end
        end
    end
    -- graph.build rejects cycles; keep command generation deterministic if another IR
    -- producer ever omits that validation.
    local rest: { string } = {}
    for id, _ in pairs(by_id) do if not visited[id] and boundaries[id] == nil then rest[#rest + 1] = id end end
    stable_sort(rest)
    for _, id in ipairs(rest) do ordered[#ordered + 1] = by_id[id] :: Map end
    return ordered
end

local function routed_target(out: Map, boundaries: Map, error_path: boolean, source_id: string?): Map
    local target_kind = str(boundaries[str(out.to)])
    local target: Map
    if target_kind == "finish" or target_kind == "error" then
        target = {
            data_type = consts.DATA_TYPE.WORKFLOW_OUTPUT,
            content_type = consts.CONTENT_TYPE.JSON,
        }
        if target_kind == "error" then
            target.discriminator = "error"
            -- Dataflow's error router does not infer producer lineage the way
            -- successful output routing does.
            target.node_id = source_id
        else target.key = "result" end
    else
        target = {
            data_type = consts.DATA_TYPE.NODE_INPUT,
            node_id = str(out.to),
            discriminator = str(out.discriminator) ~= "" and out.discriminator or "default",
        }
    end
    if type(out.condition) == "string" and out.condition ~= "" then target.condition = out.condition end
    local transform = edge_transform(out.transform, error_path)
    if transform then target.transform = transform
    elseif error_path then
        target.transform = "{ code: type(error) == 'string' ? 'execution_failed' : error.code, message: type(error) == 'string' ? error : error.message }"
    end
    if type(out.via_branch) == "string" and out.via_branch ~= "" then target.def_node_id = out.via_branch end
    return target
end

-- emit(ir, opts) -> (commands, err). opts: { workflow_id, version }. Node ids in the
-- stream are the def_node_ids; the launcher remints to fresh uuids.
function M.emit(ir: any, opts: any): ({ Map }?, string?)
    if type(ir) ~= "table" then return nil, "ir is required" end
    local g = ir :: Map
    local nodes = type(g.nodes) == "table" and (g.nodes :: { Map }) or {}
    local entry_id = str(g.entry_id)
    if entry_id == "" then return nil, "ir has no entry node" end
    opts = type(opts) == "table" and opts or {}
    local workflow_id = str((opts :: Map).workflow_id)
    local version = tonumber((opts :: Map).version) or 0
    local blocks: Map = (type((opts :: Map).blocks) == "table") and ((opts :: Map).blocks :: Map) or {}
    local boundaries = boundary_kinds(nodes)
    local runtime_nodes = ordered_runtime_nodes(nodes, boundaries)

    local commands: { Map } = {}
    local entry_commands: { Map } = {}
    local display_order: Map = {}
    for index, node in ipairs(runtime_nodes) do display_order[str(node.def_id)] = index end

    -- Preserve the workflow input for lineage and route its resolved payload directly
    -- to each real entry step.
    commands[#commands + 1] = {
        type = consts.COMMAND_TYPES.CREATE_DATA,
        payload = {
            data_id = "__workflow_input__",
            data_type = consts.DATA_TYPE.WORKFLOW_INPUT,
            content = {},
            content_type = consts.CONTENT_TYPE.JSON,
        },
    }
    local entry_node: Map? = nil
    for _, node in ipairs(nodes) do if str(node.def_id) == entry_id then entry_node = node :: Map; break end end
    if not entry_node then return nil, "ir entry node is missing" end
    local entry_routes = type((entry_node :: Map).out_edges) == "table" and (((entry_node :: Map).out_edges) :: { Map }) or {}
    if boundaries[entry_id] == "start" then
        for index, out in ipairs(entry_routes) do
            local payload = routed_target(out :: Map, boundaries, false, nil)
            payload.data_id = "__entry_input__:" .. tostring(index)
            payload.content = {}
            payload.content_type = consts.CONTENT_TYPE.JSON
            -- remint evaluates these fields against the concrete run input and
            -- removes them before Dataflow receives the CREATE_DATA command.
            payload._workflow_input_condition = payload.condition
            payload._workflow_input_transform = payload.transform
            payload.condition = nil
            payload.transform = nil
            entry_commands[#entry_commands + 1] = { type = consts.COMMAND_TYPES.CREATE_DATA, payload = payload }
        end
    else return nil, "validated Flow entry must be the virtual Start boundary" end

    for _, node in ipairs(runtime_nodes) do
        local config, native_type, cerr = base_config(node :: Map, blocks)
        if not config then return nil, cerr end

        local data_targets: { Map } = {}
        for _, out in ipairs(type(node.out_edges) == "table" and (node.out_edges :: { Map }) or {}) do
            data_targets[#data_targets + 1] = routed_target(out, boundaries, false, str(node.def_id))
        end
        -- A leaf routes its result to the workflow output.
        if #data_targets == 0 then
            local is_template = str(node.template_parent_id) ~= ""
            data_targets[#data_targets + 1] = {
                data_type = is_template and consts.DATA_TYPE.NODE_OUTPUT or consts.DATA_TYPE.WORKFLOW_OUTPUT,
                key = "result",
                content_type = consts.CONTENT_TYPE.JSON,
            }
        end
        config.data_targets = data_targets

        local error_targets: { Map } = {}
        for _, out in ipairs(type(node.error_edges) == "table" and (node.error_edges :: { Map }) or {}) do
            error_targets[#error_targets + 1] = routed_target(out, boundaries, true, str(node.def_id))
        end
        if #error_targets > 0 then config.error_targets = error_targets end

        if type(node.required_inputs) == "table" and #(node.required_inputs :: { any }) > 0 then
            config.inputs = { required = node.required_inputs }
        end

        local iteration_routes = type(node.iteration_input_routes) == "table"
            and (node.iteration_input_routes :: { Map }) or {}
        if #iteration_routes > 0 then
            config.iteration_input_routes = {}
            for _, route in ipairs(iteration_routes) do
                local target: Map = {
                    node_id = str(route.target),
                    discriminator = str(route.discriminator) ~= "" and route.discriminator or "default",
                }
                local transform = edge_transform(route.transform, false)
                if transform then target.transform = transform end
                config.iteration_input_routes[#config.iteration_input_routes + 1] = target
            end
        end

        local payload: Map = {
            node_id = str(node.def_id),
            node_type = native_type or node_type_of(node :: Map),
            status = str(node.template_parent_id) ~= "" and consts.STATUS.TEMPLATE or consts.STATUS.PENDING,
            config = config,
            metadata = {
                title = str(node.title) ~= "" and node.title or (str(node.ref) ~= "" and node.ref or node.kind),
                def_node_id = str(node.def_id),
                workflow_id = workflow_id,
                version = version,
                presentation = { hidden = false, order = tonumber(display_order[str(node.def_id)]) or 0 },
            },
        }
        if str(node.template_parent_id) ~= "" then payload.parent_node_id = str(node.template_parent_id) end

        commands[#commands + 1] = {
            type = consts.COMMAND_TYPES.CREATE_NODE,
            payload = payload,
        }
    end

    -- PostgreSQL enforces dataflow_data.node_id immediately. Seed entry inputs
    -- only after every target node exists; this is also the native Dataflow
    -- compiler's command topology. SQLite must not define ordering semantics.
    for _, command in ipairs(entry_commands) do commands[#commands + 1] = command end

    return commands, nil
end

return M
