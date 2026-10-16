-- Workflow state model: validate command batches, fold events, and produce
-- inverse data without owning persistence or transaction boundaries.

local uuid = require("uuid")
local json = require("json")
local mapping = require("mapping")
local policy = require("policy")
local types = require("types")

local M = {}
type Map = { [string]: any }
local copy_tree = mapping.copy_tree

M.COMMAND = types.COMMAND
M.EVENT = types.EVENT

local E = types.EVENT

-- ─── helpers ─────────────────────────────────────────────────────────────

local function is_str(v: any): boolean
    return type(v) == "string" and v ~= ""
end

-- The double-underscore prefix is reserved for engine rows (e.g. the viewport row
-- __viewport__); user-authored node/edge/note ids must not collide with it.
local function is_reserved_id(v: any): boolean
    return type(v) == "string" and v:sub(1, 2) == "__"
end

local function copy_map(v: any): any
    local out: any = {}
    if type(v) ~= "table" then return out end
    for k, item in pairs(v :: { [string]: any }) do out[k] = item end
    return out
end

local function copy_list(v: any): { any }
    local out: { any } = {}
    if type(v) ~= "table" then return out end
    for _, item in ipairs(v :: { any }) do out[#out + 1] = item end
    return out
end

-- Labels are deliberately simple definition metadata: a flat, ordered set of
-- nonblank strings. They carry no hierarchy or access meaning.
local function normalize_labels(value: any): ({ string }?, string?)
    if type(value) ~= "table" then return nil, "labels array required" end
    for key, _ in pairs(value :: { [any]: any }) do
        if type(key) ~= "number" or key < 1 or math.floor(key) ~= key then
            return nil, "labels must be an array"
        end
    end
    local labels: { string } = {}
    local seen: { [string]: boolean } = {}
    for i, raw in ipairs(value :: { any }) do
        if type(raw) ~= "string" then return nil, "label at [" .. tostring(i) .. "] must be a string" end
        local label = raw:gsub("^%s+", ""):gsub("%s+$", "")
        if label == "" then return nil, "label at [" .. tostring(i) .. "] must not be blank" end
        if not seen[label] then
            seen[label] = true
            labels[#labels + 1] = label
        end
    end
    return labels, nil
end

local function remove_from(order: any, value: string): any
    local out: { any } = {}
    if type(order) ~= "table" then return out end
    for _, v in ipairs(order :: { any }) do
        if tostring(v) ~= value then out[#out + 1] = v end
    end
    return out
end

local function append_unique(order: any, value: string): any
    local out: { any } = type(order) == "table" and (order :: { any }) or {}
    for _, v in ipairs(out) do
        if tostring(v) == value then return out end
    end
    out[#out + 1] = value
    return out
end

local function encoded_size(v: any): number
    local out = json.encode(type(v) == "table" and v or {})
    return type(out) == "string" and #out or 0
end

function M.empty_state(): any
    return {
        nodes = {}, edges = {}, notes = {},
        node_order = {}, edge_order = {}, note_order = {},
        layout = {}, viewport = nil, direction = types.DEFAULT_LAYOUT_DIRECTION, params = {}, labels = {},
    }
end

local function seed(state: any): any
    if type(state) ~= "table" then return M.empty_state() end
    local empty = M.empty_state()
    for k, v in pairs(empty) do
        if state[k] == nil then state[k] = v end
    end
    return state
end

-- ─── in-memory fold ──────────────────────────────────────────────────────

local function node_from(p: any, prior: any): any
    local n = type(prior) == "table" and copy_map(prior) or {}
    n.id = p.id
    if p.kind ~= nil then n.kind = p.kind end
    if p.ref ~= nil then n.ref = p.ref end
    if p.title ~= nil then n.title = p.title end
    if p.config ~= nil then n.config = copy_map(p.config) end
    if p.status ~= nil then n.status = p.status end
    if n.config == nil then n.config = {} end
    if n.status == nil then n.status = "active" end
    return n
end

-- Canvas handles are presentation geometry, not Workflow ports. Normalize them while
-- folding so every writer and reader observes the same semantic document.
local function semantic_port(value: any, node: any, direction: string): any
    local port = type(value) == "string" and value or nil
    if port == "out-bottom" or port == "out-right" then
        return direction == "source" and type(node) == "table" and tostring((node :: any).kind or "") == "start" and "out" or nil
    end
    if port == "in-top" or port == "in-left" then
        local kind = type(node) == "table" and tostring((node :: any).kind or "") or ""
        return direction == "target" and (kind == "finish" or kind == "error") and "in" or nil
    end
    return port
end

local function edge_from(p: any, prior: any, nodes: any): any
    local e = type(prior) == "table" and copy_map(prior) or {}
    e.id = p.id
    if p.source_id ~= nil then e.source_id = p.source_id end
    if p.target_id ~= nil then e.target_id = p.target_id end
    if p.source_port ~= nil then e.source_port = semantic_port(p.source_port, nodes[e.source_id], "source") end
    if p.target_port ~= nil then e.target_port = semantic_port(p.target_port, nodes[e.target_id], "target") end
    if p.transform ~= nil then e.transform = select(1, mapping.normalize(p.transform)) or {} end
    if e.transform == nil then e.transform = {} end
    return e
end

local function note_from(p: any, prior: any): any
    local n = type(prior) == "table" and copy_map(prior) or {}
    n.id = p.id
    if p.body ~= nil then n.body = p.body end
    if p.color ~= nil then n.color = p.color end
    if p.kind ~= nil then n.kind = p.kind end
    if n.body == nil then n.body = "" end
    if n.kind == nil then n.kind = "note" end
    return n
end

local function remove_incident_edges(state: any, node_id: string)
    local removed: { string } = {}
    for id, edge in pairs(state.edges :: { [string]: any }) do
        if type(edge) == "table" and (tostring(edge.source_id or "") == node_id or tostring(edge.target_id or "") == node_id) then
            removed[#removed + 1] = tostring(id)
        end
    end
    for _, id in ipairs(removed) do
        state.edges[id] = nil
        state.edge_order = remove_from(state.edge_order, id)
    end
end

function M.apply_event(state: any, etype: string, p: any)
    state = seed(state)
    p = type(p) == "table" and p or {}

    if etype == E.NODE_ADDED then
        state.nodes[p.id] = node_from(p, state.nodes[p.id])
        state.node_order = append_unique(state.node_order, tostring(p.id))
    elseif etype == E.NODE_UPDATED then
        if state.nodes[p.id] then state.nodes[p.id] = node_from(p, state.nodes[p.id]) end
    elseif etype == E.NODE_REMOVED then
        local id = tostring(p.id or "")
        state.nodes[id] = nil
        state.node_order = remove_from(state.node_order, id)
        state.layout[id] = nil
        remove_incident_edges(state, id)
    elseif etype == E.EDGE_ADDED then
        state.edges[p.id] = edge_from(p, state.edges[p.id], state.nodes)
        state.edge_order = append_unique(state.edge_order, tostring(p.id))
    elseif etype == E.EDGE_UPDATED then
        if state.edges[p.id] then state.edges[p.id] = edge_from(p, state.edges[p.id], state.nodes) end
    elseif etype == E.EDGE_REMOVED then
        local id = tostring(p.id or "")
        state.edges[id] = nil
        state.edge_order = remove_from(state.edge_order, id)
    elseif etype == E.NOTE_ADDED then
        state.notes[p.id] = note_from(p, state.notes[p.id])
        state.note_order = append_unique(state.note_order, tostring(p.id))
    elseif etype == E.NOTE_UPDATED then
        if state.notes[p.id] then state.notes[p.id] = note_from(p, state.notes[p.id]) end
    elseif etype == E.NOTE_REMOVED then
        local id = tostring(p.id or "")
        state.notes[id] = nil
        state.note_order = remove_from(state.note_order, id)
    elseif etype == E.LAYOUT_POSITION_SET then
        -- set-position patches the layout row: absent width/height keep their saved
        -- values, so a plain move never resizes a note or frame.
        local layout_id = tostring(p.node_id or "")
        local prior: any = state.layout[layout_id]
        local prior_w = type(prior) == "table" and tonumber((prior :: any).width) or nil
        local prior_h = type(prior) == "table" and tonumber((prior :: any).height) or nil
        state.layout[layout_id] = {
            x = tonumber(p.x) or 0, y = tonumber(p.y) or 0,
            width = tonumber(p.width) or prior_w, height = tonumber(p.height) or prior_h,
            meta = copy_map(p.meta),
        }
    elseif etype == E.LAYOUT_POSITION_CLEARED then
        state.layout[tostring(p.node_id or "")] = nil
    elseif etype == E.LAYOUT_VIEWPORT_SET then
        state.viewport = { x = tonumber(p.x) or 0, y = tonumber(p.y) or 0, zoom = tonumber(p.zoom) or 1, root_id = p.root_id }
    elseif etype == E.LAYOUT_DIRECTION_SET then
        state.direction = p.direction
    elseif etype == E.PARAM_SET then
        local key = tostring(p.key or "")
        if key ~= "" then
            if p.value == nil then state.params[key] = nil else state.params[key] = p.value end
        end
    elseif etype == E.LABELS_SET then
        state.labels = copy_list(p.labels)
    elseif etype == E.VERSION_RESTORED then
        state.version_lineage = copy_tree(p)
    end
end

-- ─── validation ──────────────────────────────────────────────────────────

local function node_exists(state: any, id: any): boolean
    return is_str(id) and state.nodes[id] ~= nil
end

local function edge_exists(state: any, id: any): boolean
    return is_str(id) and state.edges[id] ~= nil
end

local function note_exists(state: any, id: any): boolean
    return is_str(id) and state.notes[id] ~= nil
end

local function allowed_node_kinds(): any
    return copy_map(types.NODE_KINDS)
end

local function known_node_kind(allowed: any, kind: any): boolean
    return type(kind) == "string" and type(allowed) == "table" and allowed[kind] == true
end

function M.validate_command(state: any, etype: string, p: any, allowed_kinds: any?): string?
    state = seed(state)
    p = type(p) == "table" and p or {}
    local kinds = type(allowed_kinds) == "table" and allowed_kinds or allowed_node_kinds()

    if etype == E.NODE_ADDED then
        if not is_str(p.id) then return "node id required" end
        if is_reserved_id(p.id) then return "reserved node id refused: " .. tostring(p.id) end
        if not is_str(p.kind) then return "node kind required" end
        if not known_node_kind(kinds, p.kind) then return "unknown node kind: " .. tostring(p.kind) end
        if p.node_type ~= nil or p.lowerer ~= nil or p.execution ~= nil then return "Flow nodes cannot override native execution" end
        if p.kind == "block" then
            if type(p.ref) ~= "string" or not p.ref:match("^[^%s:]+:[^%s:]+$") then return "Block node requires an exact block_id" end
            if p.ref_label ~= nil or p.icon ~= nil or p.input_schema ~= nil or p.output_schema ~= nil or p.config_schema ~= nil then
                return "Block nodes persist only block_id and instance config"
            end
        end
        if node_exists(state, p.id) then return "node already exists: " .. tostring(p.id) end
    elseif etype == E.NODE_UPDATED then
        if not is_str(p.id) then return "node id required" end
        if not node_exists(state, p.id) then return "node not found: " .. tostring(p.id) end
        if p.kind ~= nil and not known_node_kind(kinds, p.kind) then return "unknown node kind: " .. tostring(p.kind) end
        if p.node_type ~= nil or p.lowerer ~= nil or p.execution ~= nil then return "Flow nodes cannot override native execution" end
        local prior = state.nodes[p.id]
        local effective_kind = p.kind ~= nil and p.kind or (type(prior) == "table" and prior.kind or nil)
        if effective_kind == "block" then
            local effective_ref = p.ref ~= nil and p.ref or (type(prior) == "table" and prior.ref or nil)
            if type(effective_ref) ~= "string" or not effective_ref:match("^[^%s:]+:[^%s:]+$") then return "Block node requires an exact block_id" end
            if p.ref_label ~= nil or p.icon ~= nil or p.input_schema ~= nil or p.output_schema ~= nil or p.config_schema ~= nil then
                return "Block nodes persist only block_id and instance config"
            end
        end
    elseif etype == E.NODE_REMOVED then
        if not node_exists(state, p.id) then return "node not found: " .. tostring(p.id) end
        local node = state.nodes[tostring(p.id or "")]
        local kind = type(node) == "table" and tostring((node :: any).kind or "") or ""
        if state._published_interface == true and types.BOUNDARY_NODE_KINDS[kind] then
            return types.BOUNDARY_REMOVE_REFUSED .. " node_id=" .. tostring(p.id) .. " kind=" .. kind
        end
    elseif etype == E.EDGE_ADDED then
        if not is_str(p.id) then return "edge id required" end
        if is_reserved_id(p.id) then return "reserved edge id refused: " .. tostring(p.id) end
        if not is_str(p.source_id) then return "edge source node required" end
        if not is_str(p.target_id) then return "edge target node required" end
        if tostring(p.source_id) == tostring(p.target_id) then return "edge self-loop refused: " .. tostring(p.source_id) end
        if edge_exists(state, p.id) then return "edge already exists: " .. tostring(p.id) end
        if not node_exists(state, p.source_id) then return "edge source node not found: " .. tostring(p.source_id) end
        if not node_exists(state, p.target_id) then return "edge target node not found: " .. tostring(p.target_id) end
        if p.transform ~= nil then
            local _, transform_err = mapping.normalize(p.transform)
            if transform_err then return "edge transform invalid: " .. tostring(transform_err) end
        end
    elseif etype == E.EDGE_UPDATED then
        if not is_str(p.id) then return "edge id required" end
        if not edge_exists(state, p.id) then return "edge not found: " .. tostring(p.id) end
        local prior = state.edges[p.id]
        local source = p.source_id ~= nil and p.source_id or prior.source_id
        local target = p.target_id ~= nil and p.target_id or prior.target_id
        if tostring(source) == tostring(target) then return "edge self-loop refused: " .. tostring(source) end
        if p.source_id ~= nil and not node_exists(state, p.source_id) then return "edge source node not found: " .. tostring(p.source_id) end
        if p.target_id ~= nil and not node_exists(state, p.target_id) then return "edge target node not found: " .. tostring(p.target_id) end
        if p.transform ~= nil then
            local _, transform_err = mapping.normalize(p.transform)
            if transform_err then return "edge transform invalid: " .. tostring(transform_err) end
        end
    elseif etype == E.EDGE_REMOVED then
        if not edge_exists(state, p.id) then return "edge not found: " .. tostring(p.id) end
    elseif etype == E.NOTE_ADDED then
        if not is_str(p.id) then return "note id required" end
        if is_reserved_id(p.id) then return "reserved note id refused: " .. tostring(p.id) end
        if p.kind ~= nil and p.kind ~= "note" and p.kind ~= "frame" then return "unknown note kind: " .. tostring(p.kind) end
        if note_exists(state, p.id) then return "note already exists: " .. tostring(p.id) end
    elseif etype == E.NOTE_UPDATED then
        if not is_str(p.id) then return "note id required" end
        if not note_exists(state, p.id) then return "note not found: " .. tostring(p.id) end
        if p.kind ~= nil and p.kind ~= "note" and p.kind ~= "frame" then return "unknown note kind: " .. tostring(p.kind) end
    elseif etype == E.NOTE_REMOVED then
        if not note_exists(state, p.id) then return "note not found: " .. tostring(p.id) end
    elseif etype == E.LAYOUT_POSITION_SET then
        -- Layout positions place both step nodes and sticky notes on the canvas.
        if not node_exists(state, p.node_id) and not note_exists(state, p.node_id) then
            return "layout target not found: " .. tostring(p.node_id)
        end
    elseif etype == E.LAYOUT_POSITION_CLEARED then
        if not is_str(p.node_id) then return "layout node id required" end
        if is_reserved_id(p.node_id) then return "reserved layout id refused: " .. tostring(p.node_id) end
    elseif etype == E.LAYOUT_VIEWPORT_SET then
        return nil
    elseif etype == E.LAYOUT_DIRECTION_SET then
        if type(p.direction) ~= "string" or not types.LAYOUT_DIRECTIONS[p.direction] then return "layout direction must be TB or LR" end
    elseif etype == E.PARAM_SET then
        if not is_str(p.key) then return "param key required" end
    elseif etype == E.LABELS_SET then
        local labels, err = normalize_labels(p.labels)
        if err then return err end
        p.labels = labels
    elseif etype == E.VERSION_RESTORED then
        if not is_str(p.source_flow_id) then return "restore source Flow id required" end
        if tonumber(p.source_version) == nil or tonumber(p.source_version) < 1 then return "restore source version required" end
        if state.version_lineage ~= nil then return "restore lineage already recorded" end
    else
        return "unknown event type: " .. tostring(etype)
    end
    return nil
end

-- A remove whose target is already gone (removed earlier in the batch, or never
-- present) is deduped: it emits no event rather than failing the batch.
local function is_dedupable_remove(etype: string, state: any, p: any): boolean
    if etype == E.NODE_REMOVED then return not node_exists(state, p.id) end
    if etype == E.EDGE_REMOVED then return not edge_exists(state, p.id) end
    if etype == E.NOTE_REMOVED then return not note_exists(state, p.id) end
    -- Clearing a position with no layout row is a no-op: emit no event (nothing to
    -- undo), independent of whether the node itself still exists.
    if etype == E.LAYOUT_POSITION_CLEARED then return not is_reserved_id(p.node_id) and state.layout[tostring(p.node_id or "")] == nil end
    return false
end

local ADD_COMMANDS = {
    [types.COMMAND.NODE_ADD] = true,
    [types.COMMAND.EDGE_ADD] = true,
    [types.COMMAND.NOTE_ADD] = true,
}

local function canonicalize_edge_body(state: any, body: any)
    local prior = type(state.edges) == "table" and state.edges[body.id] or nil
    local source_id = body.source_id ~= nil and body.source_id or (type(prior) == "table" and prior.source_id or nil)
    local target_id = body.target_id ~= nil and body.target_id or (type(prior) == "table" and prior.target_id or nil)
    if body.source_port ~= nil then body.source_port = semantic_port(body.source_port, state.nodes[source_id], "source") end
    if body.target_port ~= nil then body.target_port = semantic_port(body.target_port, state.nodes[target_id], "target") end
end

-- Name the authored field and vocabulary in refusals, so callers can repair the
-- same atomic batch. The original validation reason remains in the message.
local function correction_hint(reason: string): string
    if reason == "node kind required" then return "body.kind is required; put node fields directly in body" end
    if reason:find("unknown node kind:", 1, true) then
        local kinds: { string } = {}
        for kind, _ in pairs(types.NODE_KINDS) do kinds[#kinds + 1] = kind end
        table.sort(kinds)
        return "body.kind must be one of " .. table.concat(kinds, ", ") .. "; executable steps use block with body.ref from WorkflowsRead catalog"
    end
    if reason == "Block node requires an exact block_id" then
        return "body.ref must be an exact namespace:name Block ref from WorkflowsRead catalog"
    end
    if reason == "edge source node required" then return "body.source_id is required (not source)" end
    if reason == "edge target node required" then return "body.target_id is required (not target)" end
    if reason:find("edge source node not found:", 1, true) then return "body.source_id must identify an existing node or one added earlier in this batch" end
    if reason:find("edge target node not found:", 1, true) then return "body.target_id must identify an existing node or one added earlier in this batch" end
    if reason == "param key required" then return "body.key is required" end
    if reason == "labels array required" then return "body.labels must be an array of nonblank strings" end
    return "Use {type, body} rows matching the WorkflowsRead catalog; no commands in this batch were applied"
end

-- Runs the batch pipeline over a working copy of the state: maps commands to
-- events, generates ids for adds that omit one, dedups removes, validates each
-- event against the accumulating state, and folds it so later items see it. Any
-- validation error aborts the whole batch.
local function pipeline(items: any, state: any, from_commands: boolean, opts: any?): (any?, string?)
    local working = seed(copy_tree(state))
    local kinds = allowed_node_kinds()
    local out: { any } = {}
    local command_cap = type(opts) == "table" and tonumber((opts :: any).command_bytes) or nil
    if not command_cap then
        local resolved, policy_err = policy.policy()
        if policy_err or not resolved then return nil, tostring(policy_err or "workflow policy unavailable") end
        command_cap = (resolved :: any).command_bytes
    end
    if type(items) ~= "table" then return nil, "commands must be an array of {type, body} objects" end
    local count = 0
    for key, _ in pairs(items :: { [any]: any }) do
        if type(key) ~= "number" or key < 1 or key ~= math.floor(key) then
            return nil, "commands must be an array of {type, body} objects"
        end
        count = count + 1
    end
    if count ~= #(items :: { any }) then return nil, "commands must be a contiguous array" end
    for i, item in ipairs(items :: { any }) do
        local path = "commands[" .. tostring(i) .. "]"
        if type(item) ~= "table" then return nil, "invalid command at [" .. tostring(i) .. "]: " .. path .. " must be a {type, body} object" end
        local raw_type = tostring((item :: any).type or "")
        local etype: string
        if from_commands then
            etype = types.COMMAND_TO_EVENT[raw_type] :: string
            if not etype then
                return nil, "unknown command at [" .. tostring(i) .. "]: " .. path .. ".type=" .. raw_type
                    .. "; copy an exact command type from WorkflowsRead catalog (for example node.add, edge.add, layout.set-position)"
            end
        else
            etype = raw_type
        end
        local raw_body = (item :: Map).body
        if type(raw_body) ~= "table" then
            return nil, "invalid workflow command at [" .. tostring(i) .. "] (" .. raw_type .. "): "
                .. path .. ".body must be an object; put the command fields directly in body"
        end
        for key, _ in pairs(raw_body :: { [any]: any }) do
            if type(key) ~= "string" then
                return nil, "invalid workflow command at [" .. tostring(i) .. "] (" .. raw_type .. "): " .. path .. ".body must be an object"
            end
        end
        local body = copy_tree(raw_body)

        if from_commands and ADD_COMMANDS[raw_type] and not is_str(body.id) then
            body.id = uuid.v4()
        end
        if etype == E.EDGE_ADDED or etype == E.EDGE_UPDATED then canonicalize_edge_body(working, body) end

        -- Per-command body cap resolves from the single workflow owner policy.
        if encoded_size(body) > (command_cap :: number) then
            return nil, "command_too_large at [" .. tostring(i) .. "]: body exceeds the " .. tostring(command_cap) .. "-byte cap"
        end

        if is_dedupable_remove(etype, working, body) then
            -- deduped: contributes no event
        else
            local err = M.validate_command(working, etype, body, kinds)
            if err then
                return nil, "invalid workflow command at [" .. tostring(i) .. "] (" .. path .. ", " .. raw_type .. "): "
                    .. err .. "; " .. correction_hint(err)
            end
            M.apply_event(working, etype, body)
            out[#out + 1] = { type = etype, body = body }
        end
    end
    return out, nil
end

-- validate_and_fold(state, commands) -> (folded_state, err). Test/authoring helper:
-- folds a command batch onto a copy of state, honoring the full batch pipeline.
function M.validate_and_fold(state: any, commands: any, opts: any?): (any?, string?)
    local events, err = pipeline(commands, state, true, opts)
    if err then return nil, err end
    local folded = seed(copy_tree(state))
    for _, e in ipairs(events :: { any }) do M.apply_event(folded, tostring(e.type or ""), e.body) end
    return folded, nil
end

M.seed = seed
M.is_str = is_str
M.copy_map = copy_map
M.copy_list = copy_list
M.edge_from = edge_from
M.pipeline = pipeline
M.encoded_size = encoded_size

return M
