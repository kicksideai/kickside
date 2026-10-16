-- Validate routed edges and connect a synthesized Start to graph roots.
local M = {}
type Map = { [string]: any }
type Err = { code: string, message: string, node_id: string?, edge_id: string? }
type Edge = { id: string, source: string, target: string, source_port: string, transform: any, is_failure: boolean, discriminator: string?, condition: string?, via_branch: string?, via_branch_arm: string? }
function M.validate(raw_edges: { any }, nodes: { [string]: Map }, blocks: Map, errors: { Err }, I: any): { Edge }
local str, is_str, is_reserved_id, err = I.str, I.is_str, I.is_reserved_id, I.err
local expr_error, transform_expr = I.expr_error, I.transform_expr
    -- ── edge validation ──────────────────────────────────────────────────
    local function source_port_declared(node: Map, port: string): boolean
        if port == "" then return true end
        local kind = str(node.kind)
        if kind == "block" then
            local declared = blocks[str(node.ref)]
            for _, candidate in ipairs(type(declared) == "table" and type((declared :: Map).ports) == "table" and ((declared :: Map).ports :: { Map }) or {}) do
                if str(candidate.id) == port then return true end
            end
            return false
        end
        if kind == "flow" then return port == "result" or port == "failed" end
        if kind == "branch" then return port == "true" or port == "false" end
        if kind == "cycle" or kind == "for_each" then return port == "body" or port == "done" end
        if kind == "start" then return port == "out" end
        return false
    end

    local edges: { Edge } = {}
    for i, raw in ipairs(raw_edges) do
        local e = type(raw) == "table" and (raw :: Map) or {}
        local eid = is_str(e.id) and str(e.id) or ("edge#" .. tostring(i))
        local source = str(e.source_id)
        local target = str(e.target_id)
        if is_reserved_id(eid) then
            err(errors, "edge_id_reserved", "reserved edge id refused: " .. eid, nil, eid)
        elseif source == "" or target == "" then
            err(errors, "edge_endpoints_required", "edge is missing a source or target", nil, eid)
        elseif source == target then
            err(errors, "edge_self_loop", "edge forms a self-loop on " .. source, source, eid)
        elseif not nodes[source] then
            err(errors, "edge_source_missing", "edge source node not found: " .. source, nil, eid)
        elseif not nodes[target] then
            err(errors, "edge_target_missing", "edge target node not found: " .. target, nil, eid)
        else
            local source_kind = str((nodes[source] :: Map).kind)
            local source_port = str(e.source_port)
            local is_failure = source_port == "failed"
            if not source_port_declared(nodes[source] :: Map, source_port) then
                err(errors, "edge_port_invalid", "source port is not declared by " .. source .. ": " .. source_port, source, eid)
            else
                local raw_transform = transform_expr(e.transform)
                if raw_transform ~= "" then
                    local terr = expr_error(raw_transform)
                    if terr then err(errors, "edge_transform_invalid", "edge transform is not valid expr-lang: " .. terr, source, eid) end
                end
                edges[#edges + 1] = {
                    id = eid, source = source, target = target,
                    source_port = source_port,
                    transform = e.transform,
                    is_failure = is_failure,
                    discriminator = nil, condition = nil, via_branch = nil,
                }
            end
        end
    end
return edges
end
function M.synthesize(raw_edges: { any }, nodes: { [string]: Map }, order: { string }, edges: { Edge }, I: any): ()
local str, SYNTH_START_ID = I.str, I.SYNTH_START_ID
    do
        local incoming_raw: { [string]: boolean } = {}
        for _, raw in ipairs(raw_edges) do
            local e = type(raw) == "table" and (raw :: Map) or {}
            local target = str(e.target_id)
            if target ~= "" then incoming_raw[target] = true end
        end
        local roots: { string } = {}
        for _, id in ipairs(order) do
            if id ~= SYNTH_START_ID and nodes[id] ~= nil and not incoming_raw[id] then roots[#roots + 1] = id end
        end
        for _, root in ipairs(roots) do
            edges[#edges + 1] = {
                id = SYNTH_START_ID .. ">" .. root,
                source = SYNTH_START_ID,
                target = root,
                source_port = "out",
                transform = {},
                is_failure = false,
                discriminator = nil,
                condition = nil,
                via_branch = nil,
            }
        end
    end
end
return M
