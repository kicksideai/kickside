-- Graph validation and IR construction over the folded canvas document (the
-- PRIMARY compiler IR). The canvas nodes ARE the engine nodes; edges own their
-- predicates. This phase is pure and engine-agnostic: it validates the graph
-- (Start entry, reachability, no accidental cycles, ref/port presence),
-- classifies every convergence (exclusive-IF vs parallel join → the inputs.required
-- rule), compiles each edge predicate (condition + negation for else edges), and
-- freezes the exact-id allowlist. materialize.lua turns the result into engine
-- commands. Errors are structured (code + message + node/edge id) so publish can
-- report them and refuse.

local conditions = require("conditions")
local mapping = require("mapping")
local config_schema = require("config_schema")
local exact_flow_ref = require("flow_ref")
local types = require("types")
local workflow_state = require("workflow_state")

local M = {}

type Map = { [string]: any }
type Err = { code: string, message: string, node_id: string?, edge_id: string? }

-- Node kinds that carry an executable ref that freezes into the allowlist.
-- Kinds whose multi-input convergence is a parallel fan-in (every branch runs, the
-- scheduler must wait for all). Everything else that converges is exclusive (exactly
-- one branch runs; declaring inputs.required would deadlock the untaken one) — a Merge
-- is deliberately NOT here, so branch arms reconverge without inputs.required.
local JOIN_KINDS: { [string]: boolean } = { combine = true, for_each = true }

local ALL_KINDS: { [string]: boolean } = {
    block = true, cycle = true, for_each = true, combine = true,
    branch = true, flow = true,
    start = true, finish = true, ["error"] = true,
}

local BOUNDARY_KINDS: { [string]: boolean } = {
    start = true,
    finish = true,
    ["error"] = true,
}

local function branch_predicate(node: Map): string
    local cfg = type(node.config) == "table" and (node.config :: Map) or {}
    if type(cfg.predicate) == "string" and cfg.predicate ~= "" then return cfg.predicate end
    return ""
end

-- The accepted config fields per kind come from the kind spec, so the vocabulary
-- the agent catalog publishes and the one this phase enforces are the same table.
local CONFIG_FIELDS = types.NODE_CONFIG_FIELDS

local function combine_mode(config: any): string
    local cfg = type(config) == "table" and (config :: Map) or {}
    return cfg.mode == "first_wins" and "first_wins" or "wait_all"
end

local function err(list: { Err }, code: string, message: string, node_id: string?, edge_id: string?)
    list[#list + 1] = { code = code, message = message, node_id = node_id, edge_id = edge_id }
end

local function expr_error(source: string): string?
    local s = source:gsub("^%s+", ""):gsub("%s+$", "")
    if s == "" then return nil end
    local stack: { string } = {}
    local quote: string? = nil
    local pairs: { [string]: string } = { [")"] = "(", ["}"] = "{", ["]"] = "[" }
    for i = 1, #s do
        local ch = s:sub(i, i)
        if quote then
            if ch == quote and s:sub(i - 1, i - 1) ~= "\\" then quote = nil end
        elseif ch == "'" or ch == '"' then
            quote = ch
        elseif ch == "(" or ch == "{" or ch == "[" then
            stack[#stack + 1] = ch
        elseif pairs[ch] then
            if stack[#stack] ~= pairs[ch] then return "unbalanced delimiter" end
            stack[#stack] = nil
        end
    end
    if quote then return "unterminated string" end
    if #stack > 0 then return "unbalanced delimiter" end
    if s:match("[=!<>]=?%s*$") or s:match("[&|][&|]%s*$") or s:match("[,:%+%-%*/%%]%s*$") then
        return "incomplete expression"
    end
    return nil
end

local function transform_expr(transform: any): string
    return select(1, mapping.expr(transform))
end

local function str(v: any): string
    if type(v) == "string" then return v end
    return ""
end

local is_str = workflow_state.is_str

local function is_reserved_id(id: string): boolean
    return id:match("^__") ~= nil
end

local SYNTH_START_ID = "__start__"

local function generic_object_schema(): Map
    return {
        ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
        type = "object",
        additionalProperties = true,
    }
end

local function is_bound_config(value: any): boolean
    if value == nil then return false end
    if type(value) == "string" then return value ~= "" end
    return true
end

local function required_config_fields(kind_def: any): { any }
    local declared = type(kind_def) == "table" and (kind_def :: Map) or {}
    if type(declared.config_required) == "table" then return declared.config_required :: { any } end
    local schema = type(declared.config_schema) == "table" and (declared.config_schema :: Map) or {}
    return type(schema.required) == "table" and (schema.required :: { any }) or {}
end

-- validate_config_requirements(document, blocks) -> structured compiler errors.
-- This is deliberately module-level: the dataflow engine only validates graph
-- mechanics, not application node configuration. It remains public through the
-- compiler facade so the run plane can repeat the gate before launch.
function M.validate_config_requirements(document: any, blocks: any): { Err }
    local doc = type(document) == "table" and (document :: Map) or {}
    local catalog = type(blocks) == "table" and (blocks :: Map) or {}
    local errors: { Err } = {}
    for _, raw in ipairs(type(doc.nodes) == "table" and (doc.nodes :: { any }) or {}) do
        local node = type(raw) == "table" and (raw :: Map) or {}
        local id = str(node.id)
        local kind = str(node.kind)
        local declared = kind == "block" and catalog[str(node.ref)] or nil
        if id ~= "" and type(declared) == "table" and not BOUNDARY_KINDS[kind] then
            local config = type(node.config) == "table" and (node.config :: Map) or {}
            for _, raw_field in ipairs(required_config_fields(declared)) do
                local field = str(raw_field)
                if field ~= "" then
                    local value = config[field]
                    if not is_bound_config(value) then
                        err(errors, "node_config_missing", "node " .. id .. " config." .. field
                            .. " is required; set it before publishing", id)
                    end
                end
            end
            local schema = (declared :: Map).config_schema
            if type(schema) == "table" then
                local invalid = config_schema.validate(config, schema)
                if invalid then
                    err(errors, "node_config_invalid", "node " .. id .. " " .. tostring(invalid), id)
                end
            end
        end
    end
    return errors
end

-- build(document, opts) -> (ir, errors). ir is nil when errors is non-empty.
local graph_start = require("graph_start")
local graph_edges = require("graph_edges")
local graph_branch = require("graph_branch")
local graph_step = require("graph_step")
local graph_end = require("graph_end")
type Edge = { id: string, source: string, target: string, source_port: string, transform: any, is_failure: boolean, discriminator: string?, condition: string?, via_branch: string?, via_branch_arm: string? }
function M.build(document: any, opts: any): (Map?, { Err })
    opts = type(opts) == "table" and opts or {}
    local blocks: Map = (type((opts :: Map).blocks) == "table") and ((opts :: Map).blocks :: Map) or {}
    local errors: { Err } = {}
    local doc = type(document) == "table" and (document :: Map) or {}
    local raw_nodes = type(doc.nodes) == "table" and (doc.nodes :: { any }) or {}
    local raw_edges = type(doc.edges) == "table" and (doc.edges :: { any }) or {}
    local I: any = {
        str = str, is_str = is_str, is_reserved_id = is_reserved_id, err = err,
        expr_error = expr_error, transform_expr = transform_expr,
        branch_predicate = branch_predicate, combine_mode = combine_mode,
        exact_flow_ref = exact_flow_ref, generic_object_schema = generic_object_schema,
        copy_tree = mapping.copy_tree, conditions = conditions,
        ALL_KINDS = ALL_KINDS, CONFIG_FIELDS = CONFIG_FIELDS,
        JOIN_KINDS = JOIN_KINDS, BOUNDARY_KINDS = BOUNDARY_KINDS,
        SYNTH_START_ID = SYNTH_START_ID,
    }
    local indexed = graph_start.build(raw_nodes, doc, blocks, errors, I, M.validate_config_requirements)
    local nodes, order = indexed.nodes, indexed.order
    local starts, finishes, error_boundaries = indexed.starts, indexed.finishes, indexed.error_boundaries
    local entry_id, synthesized_start, has_boundary = indexed.entry_id, indexed.synthesized_start, indexed.has_boundary
    local edges = graph_edges.validate(raw_edges, nodes, blocks, errors, I)
    if #errors > 0 or not entry_id then return nil, errors end
    if synthesized_start then graph_edges.synthesize(raw_edges, nodes, order, edges, I) end
    edges, order = graph_branch.dissolve(nodes, order, edges, errors, I)
    local executable_nodes = 0
    for _, id in ipairs(order) do
        local node = nodes[id]
        if node and not BOUNDARY_KINDS[str(node.kind)] then executable_nodes = executable_nodes + 1 end
    end
    if executable_nodes == 0 then
        err(errors, "workflow_empty", "Add at least one step between Start and Finish.")
    end

    if #errors > 0 then
        return nil, errors
    end

    -- ── extension-kind port routing ─────────────────────────────────────
    -- A declared out port with a `condition` predicate routes its edges without
    -- teaching the compiler which component owns the node.
    do
        local function combine(existing: string?, route: string): string
            if type(existing) == "string" and existing ~= "" then
                return "(" .. route .. ") && (" .. existing .. ")"
            end
            return route
        end
        for _, edge in ipairs(edges) do
            local src = nodes[edge.source] :: Map?
            local nk = src and str(src.kind) == "block" and blocks[str(src.ref)] or nil
            if type(nk) == "table" and type((nk :: Map).ports) == "table" then
                for _, port in ipairs((nk :: Map).ports :: { Map }) do
                    if str(port.id) == edge.source_port and is_str(port.condition) then
                        edge.condition = combine(edge.condition, str(port.condition))
                    end
                end
            end
        end
    end

    local template_parent, template_roots_by_parent, iteration_input_routes
    edges, template_parent, template_roots_by_parent, iteration_input_routes = graph_step.templates(nodes, edges, errors, I)
    graph_branch.check_exclusive(nodes, order, edges, errors, I)
    if #errors > 0 then
        return nil, errors
    end

    -- ── adjacency over the dissolved graph ───────────────────────────────
    local adj: { [string]: { string } } = {}
    local incoming: { [string]: { Edge } } = {}
    for _, e in ipairs(edges) do
        adj[e.source] = adj[e.source] or {}
        adj[e.source][#adj[e.source] + 1] = e.target
        incoming[e.target] = incoming[e.target] or {}
        incoming[e.target][#incoming[e.target] + 1] = e
    end
    -- Body-port edges are structural at the outer graph level, but they are real
    -- per-iteration inputs. Include them in convergence classification without
    -- turning them into ordinary parent-to-child runtime routes.
    for _, routes in pairs(iteration_input_routes) do
        for _, e in ipairs(routes) do
            incoming[e.target] = incoming[e.target] or {}
            incoming[e.target][#incoming[e.target] + 1] = e
        end
    end

    if has_boundary then
        local start_id = starts[1]
        if start_id and incoming[start_id] and #(incoming[start_id] :: { any }) > 0 then
            err(errors, "boundary_start_has_input", "Start boundary cannot have incoming edges", start_id)
        end
        for _, id in ipairs(finishes) do
            if adj[id] and #(adj[id] :: { any }) > 0 then
                err(errors, "boundary_finish_has_output", "Finish boundary must terminate the successful run output", id)
            end
        end
        for _, id in ipairs(error_boundaries) do
            if adj[id] and #(adj[id] :: { any }) > 0 then
                err(errors, "boundary_error_has_output", "Error boundary must terminate the failed run output", id)
            end
        end
        if #errors > 0 then return nil, errors end
    end

    -- ── reachability / dead-node detection ───────────────────────────────
    local reach: { [string]: boolean } = {}
    do
        local stack: { string } = { entry_id }
        while #stack > 0 do
            local v = stack[#stack]; stack[#stack] = nil
            if not reach[v] then
                reach[v] = true
                for _, w in ipairs(adj[v] or {}) do stack[#stack + 1] = w end
                for _, w in ipairs(template_roots_by_parent[v] or {}) do stack[#stack + 1] = w end
            end
        end
    end
    local optional_error_boundary: { [string]: boolean } = {}
    for _, id in ipairs(error_boundaries) do optional_error_boundary[id] = true end
    for _, id in ipairs(order) do
        -- Error is an optional terminal boundary: the editor may keep the pinned card
        -- visible even when this workflow has no explicit failure route. Requiring an
        -- incoming edge would make the undeletable default graph impossible to run.
        if not reach[id] and not optional_error_boundary[id] then
            err(errors, "node_unreachable", "node is not reachable from Start (dead node): " .. id, id)
        end
    end

    -- ── acyclicity: reject accidental cycles naming the back edge ─────────
    do
        local WHITE, GRAY, BLACK = 0, 1, 2
        local color: { [string]: number } = {}
        for _, id in ipairs(order) do color[id] = WHITE end
        -- Iterative DFS tracking the parent edge so a back edge can be named.
        local out_edge_of: { [string]: { Edge } } = {}
        for _, e in ipairs(edges) do
            out_edge_of[e.source] = out_edge_of[e.source] or {}
            out_edge_of[e.source][#out_edge_of[e.source] + 1] = e
        end
        local function visit(root: string)
            local frames: { { node: string, i: number } } = { { node = root, i = 1 } }
            color[root] = GRAY
            while #frames > 0 do
                local f = frames[#frames]
                local outs = out_edge_of[f.node] or {}
                if f.i > #outs then
                    color[f.node] = BLACK
                    frames[#frames] = nil
                else
                    local e = outs[f.i]
                    f.i = f.i + 1
                    if color[e.target] == GRAY then
                        err(errors, "graph_cycle", "the graph has an accidental cycle through edge " .. e.source .. " -> " .. e.target .. "; use an explicit cycle node for loops", e.source, e.id)
                    elseif color[e.target] == WHITE then
                        color[e.target] = GRAY
                        frames[#frames + 1] = { node = e.target, i = 1 }
                    end
                end
            end
        end
        if color[entry_id] == WHITE then visit(entry_id) end
    end

    if #errors > 0 then
        return nil, errors
    end

    local assembled, end_errors = graph_end.assemble(nodes, order, edges, incoming, finishes, entry_id,
        template_parent, iteration_input_routes, doc, synthesized_start, errors, blocks, I)
    return assembled, end_errors
end
return M
