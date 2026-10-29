-- Inverse event construction for workflow undo and redo.
local types = require("types")
local mapping = require("mapping")
local workflow_state = require("workflow_state")
local seed = workflow_state.seed
local copy_tree = mapping.copy_tree
local copy_map = workflow_state.copy_map
local copy_list = workflow_state.copy_list
local M = {}
local E = types.EVENT

-- ─── inverse events (undo/redo) ──────────────────────────────────────────

local function ev(etype: string, body: any): any
    return { type = etype, body = body or {} }
end

local function full_node_body(n: any): any
    return {
        id = n.id, kind = n.kind, ref = n.ref, title = n.title,
        config = copy_map(n.config),
        retry_policy = n.retry_policy ~= nil and copy_tree(n.retry_policy) or false,
        start_to_close_timeout = n.start_to_close_timeout ~= nil and n.start_to_close_timeout or false,
        schedule_to_close_timeout = n.schedule_to_close_timeout ~= nil and n.schedule_to_close_timeout or false,
        status = n.status,
    }
end

local function full_edge_body(e: any): any
    return {
        id = e.id, source_id = e.source_id, target_id = e.target_id,
        source_port = e.source_port, target_port = e.target_port,
        transform = copy_map(e.transform),
    }
end

local function full_note_body(n: any): any
    return { id = n.id, body = n.body, color = n.color, kind = n.kind }
end

local function recreate_removed_node(pre: any, node_id: string, out: { any })
    local node = pre.nodes[node_id]
    if type(node) ~= "table" then return end
    out[#out + 1] = ev(E.NODE_ADDED, full_node_body(node))
    local layout = pre.layout[node_id]
    if type(layout) == "table" then
        local body = copy_map(layout)
        body.node_id = node_id
        out[#out + 1] = ev(E.LAYOUT_POSITION_SET, body)
    end
    for _, edge in pairs(pre.edges :: { [string]: any }) do
        if type(edge) == "table" and (tostring(edge.source_id or "") == node_id or tostring(edge.target_id or "") == node_id) then
            out[#out + 1] = ev(E.EDGE_ADDED, full_edge_body(edge))
        end
    end
end

-- build_inverse(pre_state, events) -> inverse events that, applied to the
-- post-batch state, restore pre_state. Recreated entities re-emit full bodies read
-- out of pre_state, which is how generated ids are preserved on undo/redo.
function M.build_inverse(pre_state: any, events: any): { any }
    local pre = seed(copy_tree(pre_state))
    local inverse: { any } = {}
    local list = type(events) == "table" and events or {}
    for i = #list, 1, -1 do
        local item = list[i]
        local etype = tostring((item :: any).type or "")
        local p = type((item :: any).body) == "table" and (item :: any).body or {}

        if etype == E.NODE_ADDED then
            inverse[#inverse + 1] = ev(E.NODE_REMOVED, { id = p.id })
        elseif etype == E.NODE_UPDATED then
            local prior = pre.nodes[tostring(p.id or "")]
            if type(prior) == "table" then inverse[#inverse + 1] = ev(E.NODE_UPDATED, full_node_body(prior)) end
        elseif etype == E.NODE_REMOVED then
            recreate_removed_node(pre, tostring(p.id or ""), inverse)
        elseif etype == E.EDGE_ADDED then
            inverse[#inverse + 1] = ev(E.EDGE_REMOVED, { id = p.id })
        elseif etype == E.EDGE_UPDATED then
            local prior = pre.edges[tostring(p.id or "")]
            if type(prior) == "table" then inverse[#inverse + 1] = ev(E.EDGE_UPDATED, full_edge_body(prior)) end
        elseif etype == E.EDGE_REMOVED then
            local prior = pre.edges[tostring(p.id or "")]
            if type(prior) == "table" then inverse[#inverse + 1] = ev(E.EDGE_ADDED, full_edge_body(prior)) end
        elseif etype == E.NOTE_ADDED then
            inverse[#inverse + 1] = ev(E.NOTE_REMOVED, { id = p.id })
        elseif etype == E.NOTE_UPDATED then
            local prior = pre.notes[tostring(p.id or "")]
            if type(prior) == "table" then inverse[#inverse + 1] = ev(E.NOTE_UPDATED, full_note_body(prior)) end
        elseif etype == E.NOTE_REMOVED then
            local prior = pre.notes[tostring(p.id or "")]
            if type(prior) == "table" then inverse[#inverse + 1] = ev(E.NOTE_ADDED, full_note_body(prior)) end
        elseif etype == E.LAYOUT_POSITION_SET then
            local prior = pre.layout[tostring(p.node_id or "")]
            if type(prior) == "table" then
                local body = copy_map(prior); body.node_id = p.node_id
                -- set-position patches absent dimensions, so restoring a row that had
                -- none must clear it first; the full-body set then rebuilds it exactly.
                if ((prior :: any).width == nil and p.width ~= nil) or ((prior :: any).height == nil and p.height ~= nil) then
                    inverse[#inverse + 1] = ev(E.LAYOUT_POSITION_CLEARED, { node_id = p.node_id })
                end
                inverse[#inverse + 1] = ev(E.LAYOUT_POSITION_SET, body)
            else
                inverse[#inverse + 1] = ev(E.LAYOUT_POSITION_CLEARED, { node_id = p.node_id })
            end
        elseif etype == E.LAYOUT_POSITION_CLEARED then
            local prior = pre.layout[tostring(p.node_id or "")]
            if type(prior) == "table" then
                local body = copy_map(prior); body.node_id = p.node_id
                inverse[#inverse + 1] = ev(E.LAYOUT_POSITION_SET, body)
            end
        elseif etype == E.LAYOUT_VIEWPORT_SET then
            if type(pre.viewport) == "table" then inverse[#inverse + 1] = ev(E.LAYOUT_VIEWPORT_SET, copy_map(pre.viewport)) end
        elseif etype == E.LAYOUT_DIRECTION_SET then
            inverse[#inverse + 1] = ev(E.LAYOUT_DIRECTION_SET, { direction = pre.direction or types.DEFAULT_LAYOUT_DIRECTION })
        elseif etype == E.PARAM_SET then
            local key = tostring(p.key or "")
            local prior = pre.params[key]
            if prior == nil then
                inverse[#inverse + 1] = ev(E.PARAM_SET, { key = key })
            else
                inverse[#inverse + 1] = ev(E.PARAM_SET, { key = key, value = prior })
            end
        elseif etype == E.LABELS_SET then
            inverse[#inverse + 1] = ev(E.LABELS_SET, { labels = copy_list(pre.labels) })
        end
    end
    return inverse
end

return M
