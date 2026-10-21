-- Classify repeated body subgraphs and remove structural body edges.
local M = {}
type Map = { [string]: any }
type Err = { code: string, message: string, node_id: string?, edge_id: string? }
type Edge = { id: string, source: string, target: string, source_port: string, transform: any, is_failure: boolean, discriminator: string?, condition: string?, via_branch: string?, via_branch_arm: string? }
function M.templates(nodes: { [string]: Map }, original_edges: { Edge }, errors: { Err }, I: any): ({ Edge }, { [string]: string }, { [string]: { string } }, { [string]: { Edge } })
local edges = original_edges
local str, err = I.str, I.err
    -- ── explicit for-each bodies: child template nodes ────────────────────
    -- Edges leaving a for_each node through the `body` port define the template
    -- subgraph. The edge itself is structural: it makes the body reachable for
    -- validation but is not a runtime data_target from the parent for_each node.
    local template_parent: { [string]: string } = {}
    local template_roots_by_parent: { [string]: { string } } = {}
    do
        local original_edges = edges
        local out_edge_of: { [string]: { Edge } } = {}
        for _, e in ipairs(original_edges) do
            out_edge_of[e.source] = out_edge_of[e.source] or {}
            out_edge_of[e.source][#out_edge_of[e.source] + 1] = e
        end

        local function mark(parent: string, id: string)
            if id == parent then
                err(errors, "for_each_body_cycle", "for_each body cannot contain its parent node", parent)
                return
            end
            if template_parent[id] and template_parent[id] ~= parent then
                err(errors, "for_each_body_shared", "node belongs to more than one for_each body: " .. id, id)
                return
            end
            if template_parent[id] == parent then return end
            template_parent[id] = parent
            for _, child_edge in ipairs(out_edge_of[id] or {}) do mark(parent, child_edge.target) end
        end

        -- A body-port edge on either a for_each or a cycle roots that node's repeated
        -- template subgraph; both lower to a template-driven engine node.
        local function is_body_edge(e: Edge): boolean
            local sn = nodes[e.source]
            local k = sn and str(sn.kind) or ""
            return (k == "for_each" or k == "cycle") and e.source_port == "body"
        end

        for _, e in ipairs(original_edges) do
            if is_body_edge(e) then
                template_roots_by_parent[e.source] = template_roots_by_parent[e.source] or {}
                template_roots_by_parent[e.source][#template_roots_by_parent[e.source] + 1] = e.target
                mark(e.source, e.target)
            end
        end

        local runtime_edges: { Edge } = {}
        local iteration_input_routes: { [string]: { Edge } } = {}
        for _, e in ipairs(original_edges) do
            if is_body_edge(e) then
                iteration_input_routes[e.source] = iteration_input_routes[e.source] or {}
                iteration_input_routes[e.source][#iteration_input_routes[e.source] + 1] = e
            else
                runtime_edges[#runtime_edges + 1] = e
            end
        end
        edges = runtime_edges
        return edges, template_parent, template_roots_by_parent, iteration_input_routes
    end
end
return M
