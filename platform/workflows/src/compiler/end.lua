-- Assemble runtime routes, required inputs, and the frozen allowlist.
local M = {}
type Map = { [string]: any }
type Err = { code: string, message: string, node_id: string?, edge_id: string? }
type Edge = { id: string, source: string, target: string, source_port: string, transform: any, is_failure: boolean, discriminator: string?, condition: string?, via_branch: string?, via_branch_arm: string? }
function M.assemble(nodes: { [string]: Map }, order: { string }, edges: { Edge }, incoming: { [string]: { Edge } },
    finishes: { string }, entry_id: string, template_parent: { [string]: string },
    doc: Map, synthesized_start: boolean, errors: { Err }, blocks: Map, I: any): (Map?, { Err })
local str, is_str, err = I.str, I.is_str, I.err
local JOIN_KINDS, BOUNDARY_KINDS = I.JOIN_KINDS, I.BOUNDARY_KINDS
local exact_flow_ref, copy_tree, generic_object_schema = I.exact_flow_ref, I.copy_tree, I.generic_object_schema
    -- ── convergence classification + discriminators ──────────────────────
    for id, ins in pairs(incoming) do
        local n = (nodes[id] or {}) :: Map
        local cfg = type(n.config) == "table" and (n.config :: Map) or {}
        local first_arrival = str(cfg.mode) == "first_wins"
        if #ins > 1 and JOIN_KINDS[str(n.kind)] and not first_arrival then
            for k, e in ipairs(ins) do e.discriminator = "in" .. tostring(k) end
        else
            for _, e in ipairs(ins) do e.discriminator = "default" end
        end
    end

    -- ── runtime routes ───────────────────────────────────────────────────
    local out_by_source: { [string]: { Edge } } = {}
    local error_by_source: { [string]: { Edge } } = {}
    for _, e in ipairs(edges) do
        if e.is_failure then
            error_by_source[e.source] = error_by_source[e.source] or {}
            error_by_source[e.source][#error_by_source[e.source] + 1] = e
        else
            out_by_source[e.source] = out_by_source[e.source] or {}
            out_by_source[e.source][#out_by_source[e.source] + 1] = e
        end
    end
    -- ── assemble IR ──────────────────────────────────────────────────────
    local ir_nodes: { Map } = {}
    local allow_set: { [string]: { [string]: boolean } } = { tools = {}, agents = {}, signals = {}, ports = {}, workflows = {} }
    for _, id in ipairs(order) do
        local n = (nodes[id] or {}) :: Map
        local kind = str(n.kind)
        if kind == "flow" then
            local cfg = type(n.config) == "table" and (n.config :: Map) or {}
            local flow_ref = select(1, exact_flow_ref.validate(cfg.flow_ref))
            if flow_ref then allow_set.workflows[flow_ref.id] = true end
        elseif kind == "block" then
            local declared = blocks[str(n.ref)]
            local execution = type(declared) == "table" and type((declared :: Map).execution) == "table"
                and ((declared :: Map).execution :: Map) or {}
            if execution.kind == "function" and is_str(execution.function_id) then allow_set.tools[str(execution.function_id)] = true end
            if execution.kind == "tool" and is_str(execution.tool_id) then allow_set.tools[str(execution.tool_id)] = true end
            if execution.kind == "agent" and is_str(execution.agent_id) then allow_set.agents[str(execution.agent_id)] = true end
            if execution.kind == "wait" and is_str(execution.arm_id) then allow_set.tools[str(execution.arm_id)] = true end
        end
        local outs: { Map } = {}
        for _, e in ipairs(out_by_source[id] or {}) do
            outs[#outs + 1] = {
                to = e.target,
                discriminator = e.discriminator or "default",
                condition = e.condition,
                transform = e.transform,
                -- the dissolved branch this routing came from (run-overlay attribution).
                via_branch = e.via_branch,
            }
        end
        local error_outs: { Map } = {}
        for _, e in ipairs(error_by_source[id] or {}) do
            error_outs[#error_outs + 1] = {
                to = e.target,
                discriminator = e.discriminator or "default",
                condition = e.condition,
                transform = e.transform,
                via_branch = e.via_branch,
            }
        end

        if #finishes > 0 and not BOUNDARY_KINDS[kind] and str(template_parent[id]) == "" and #outs == 0 then
            err(errors, "workflow_leaf_must_finish", "workflow success paths must terminate at Finish, not " .. id, id)
        end

        local required: { string }? = nil
        local ins = incoming[id]
        local cfg = type(n.config) == "table" and (n.config :: Map) or {}
        local first_arrival = str(cfg.mode) == "first_wins"
        if ins and #ins > 1 and JOIN_KINDS[kind] and not first_arrival then
            local req: { string } = {}
            for _, e in ipairs(ins) do req[#req + 1] = e.discriminator :: string end
            required = req
        end

        ir_nodes[#ir_nodes + 1] = {
            def_id = id,
            kind = kind,
            ref = n["ref"],
            title = n.title,
            config = cfg,
            is_entry = id == entry_id,
            is_leaf = #outs == 0,
            out_edges = outs,
            error_edges = error_outs,
            required_inputs = required,
            template_parent_id = template_parent[id],
        }
    end

    local function sorted_keys(set: { [string]: boolean }): { string }
        local out: { string } = {}
        for k in pairs(set) do out[#out + 1] = k end
        table.sort(out)
        return out
    end
    local allowlist: Map = {
        tools = sorted_keys(allow_set.tools),
        agents = sorted_keys(allow_set.agents),
        signals = sorted_keys(allow_set.signals),
        ports = sorted_keys(allow_set.ports),
        workflows = sorted_keys(allow_set.workflows),
    }

    return {
        nodes = ir_nodes,
        entry_id = entry_id,
        allowlist = allowlist,
        params = type(doc.params) == "table" and doc.params or {},
        input_schema = (function(): Map
            local entry_node = (entry_id and nodes[entry_id]) or nil
            local cfg = entry_node and type((entry_node :: Map).config) == "table" and ((entry_node :: Map).config :: Map) or {}
            if type(cfg.input_schema) == "table" then return copy_tree(cfg.input_schema) :: Map end
            return generic_object_schema() :: Map
        end)(),
        synthesized_start = synthesized_start,
    }, errors
end
return M
