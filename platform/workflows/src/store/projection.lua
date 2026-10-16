local store_state = require("store_state")

return function(M: any, I: any)
local mapping, types, schema_json = I.mapping, I.types, I.schema_json
local T, E = I.T, I.E
local DEFINITION_EDIT_EVENT_TYPES = I.DEFINITION_EDIT_EVENT_TYPES
local now, encode, decode, copy_tree, decode_optional, encode_config, encode_schema_optional, num, query =
    I.now, I.encode, I.decode, I.copy_tree, I.decode_optional, I.encode_config, I.encode_schema_optional, I.num, I.query
local exec = store_state.exec

local function node_upsert(h: any, workflow_id: string, p: any): error?
    local ts = now()
    return exec(h, [[
        INSERT INTO ]] .. T.NODES .. [[
            (workflow_id, id, kind, ref, title, config, status, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT(workflow_id, id) DO UPDATE SET
            kind = excluded.kind,
            ref = excluded.ref,
            title = excluded.title,
            config = excluded.config,
            status = excluded.status,
            updated_at = excluded.updated_at
    ]], {
        workflow_id, tostring(p.id or ""), tostring(p.kind or ""), p.ref, p.title,
        encode_config(p.config), tostring(p.status or "active"), p.created_by, ts, ts,
    })
end

local function node_update(h: any, workflow_id: string, p: any): error?
    local sets: { string } = { "updated_at = $1" }
    local params: { any } = { now() }
    local function put(col: string, value: any)
        params[#params + 1] = value
        sets[#sets + 1] = col .. " = $" .. tostring(#params)
    end
    if p.kind ~= nil then put("kind", p.kind) end
    if p.ref ~= nil then put("ref", p.ref) end
    if p.title ~= nil then put("title", p.title) end
    if p.config ~= nil then put("config", encode_config(p.config)) end
    if p.status ~= nil then put("status", p.status) end
    params[#params + 1] = tostring(p.id or "")
    params[#params + 1] = workflow_id
    return exec(h, "UPDATE " .. T.NODES .. " SET " .. table.concat(sets, ", ") ..
        " WHERE id = $" .. tostring(#params - 1) .. " AND workflow_id = $" .. tostring(#params), params)
end

local function node_remove(h: any, workflow_id: string, p: any): error?
    local id = tostring(p.id or "")
    for _, stmt in ipairs({
        "DELETE FROM " .. T.EDGES .. " WHERE workflow_id = $1 AND (source_id = $2 OR target_id = $3)",
        "DELETE FROM " .. T.LAYOUT .. " WHERE workflow_id = $1 AND node_id = $2",
        "DELETE FROM " .. T.NODES .. " WHERE workflow_id = $1 AND id = $2",
    }) do
        local params = stmt:find("source_id") and { workflow_id, id, id } or { workflow_id, id }
        local err = exec(h, stmt, params)
        if err then return err end
    end
    return nil
end

local function edge_upsert(h: any, workflow_id: string, p: any): error?
    local ts = now()
    local transform = select(1, mapping.normalize(p.transform))
    return exec(h, [[
        INSERT INTO ]] .. T.EDGES .. [[
            (workflow_id, id, source_id, target_id, source_port, target_port, transform, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT(workflow_id, id) DO UPDATE SET
            source_id = excluded.source_id,
            target_id = excluded.target_id,
            source_port = excluded.source_port,
            target_port = excluded.target_port,
            transform = excluded.transform,
            updated_at = excluded.updated_at
    ]], {
        workflow_id, tostring(p.id or ""), tostring(p.source_id or ""), tostring(p.target_id or ""),
        p.source_port, p.target_port, encode(transform), p.created_by, ts, ts,
    })
end

local function edge_update(h: any, workflow_id: string, p: any): error?
    local sets: { string } = { "updated_at = $1" }
    local params: { any } = { now() }
    local function put(col: string, value: any)
        params[#params + 1] = value
        sets[#sets + 1] = col .. " = $" .. tostring(#params)
    end
    if p.source_id ~= nil then put("source_id", p.source_id) end
    if p.target_id ~= nil then put("target_id", p.target_id) end
    if p.source_port ~= nil then put("source_port", p.source_port) end
    if p.target_port ~= nil then put("target_port", p.target_port) end
    if p.transform ~= nil then
        local transform = select(1, mapping.normalize(p.transform))
        put("transform", encode(transform))
    end
    params[#params + 1] = tostring(p.id or "")
    params[#params + 1] = workflow_id
    return exec(h, "UPDATE " .. T.EDGES .. " SET " .. table.concat(sets, ", ") ..
        " WHERE id = $" .. tostring(#params - 1) .. " AND workflow_id = $" .. tostring(#params), params)
end

local function note_upsert(h: any, workflow_id: string, p: any): error?
    local ts = now()
    return exec(h, [[
        INSERT INTO ]] .. T.NOTES .. [[
            (workflow_id, id, body, kind, color, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT(workflow_id, id) DO UPDATE SET
            body = excluded.body,
            kind = excluded.kind,
            color = excluded.color,
            updated_at = excluded.updated_at
    ]], { workflow_id, tostring(p.id or ""), tostring(p.body or ""), tostring(p.kind or "note"), p.color, p.created_by, ts, ts })
end

local function note_update(h: any, workflow_id: string, p: any): error?
    local sets: { string } = { "updated_at = $1" }
    local params: { any } = { now() }
    local function put(col: string, value: any)
        params[#params + 1] = value
        sets[#sets + 1] = col .. " = $" .. tostring(#params)
    end
    if p.body ~= nil then put("body", p.body) end
    if p.kind ~= nil then put("kind", p.kind) end
    if p.color ~= nil then put("color", p.color) end
    params[#params + 1] = tostring(p.id or "")
    params[#params + 1] = workflow_id
    return exec(h, "UPDATE " .. T.NOTES .. " SET " .. table.concat(sets, ", ") ..
        " WHERE id = $" .. tostring(#params - 1) .. " AND workflow_id = $" .. tostring(#params), params)
end

-- set-position patches the layout row: absent width/height keep their saved values
-- (COALESCE against the existing row), so a plain move never resizes a note or frame.
local function layout_set(h: any, workflow_id: string, p: any): error?
    return exec(h, [[
        INSERT INTO ]] .. T.LAYOUT .. [[ (workflow_id, node_id, x, y, width, height, meta)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT(workflow_id, node_id) DO UPDATE SET
            x = excluded.x, y = excluded.y,
            width = COALESCE(excluded.width, ]] .. T.LAYOUT .. [[.width),
            height = COALESCE(excluded.height, ]] .. T.LAYOUT .. [[.height),
            meta = excluded.meta
    ]], {
        workflow_id, tostring(p.node_id or ""), num(p.x) or 0, num(p.y) or 0,
        num(p.width), num(p.height), encode(p.meta),
    })
end

local function viewport_set(h: any, workflow_id: string, p: any): error?
    return exec(h, [[
        INSERT INTO ]] .. T.LAYOUT .. [[ (workflow_id, node_id, x, y, width, height, meta)
        VALUES ($1, $2, $3, $4, NULL, NULL, $5)
        ON CONFLICT(workflow_id, node_id) DO UPDATE SET
            x = excluded.x, y = excluded.y, meta = excluded.meta
    ]], {
        workflow_id, types.VIEWPORT_NODE_ID, num(p.x) or 0, num(p.y) or 0,
        encode({ zoom = num(p.zoom) or 1, root_id = p.root_id }),
    })
end

local function direction_set(h: any, workflow_id: string, p: any): error?
    local meta, err = I.json.encode({ direction = p.direction })
    if err then return errors.wrap(err, "encode layout direction") end
    return exec(h, [[
        INSERT INTO ]] .. T.LAYOUT .. [[ (workflow_id, node_id, x, y, meta)
        VALUES ($1, $2, 0, 0, $3)
        ON CONFLICT(workflow_id, node_id) DO UPDATE SET meta = excluded.meta
    ]], { workflow_id, types.LAYOUT_NODE_ID, meta })
end

local function order_add(order: any, id: string)
    if id == "" then return end
    for _, existing in ipairs(order) do if tostring(existing) == id then return end end
    order[#order + 1] = id
end

local function order_remove(order: any, id: string)
    local values = order :: { any }
    for i = #values, 1, -1 do if tostring(values[i]) == id then table.remove(values, i) end end
end

local function definition_state(h: any, workflow_id: string): (any?, error?)
    local rows, err = query(h, "SELECT * FROM " .. T.STATE .. " WHERE workflow_id = $1 LIMIT 1", { workflow_id })
    if err then return nil, err end
    local row: any = type(rows) == "table" and rows[1] or {}
    return {
        head_seq = tonumber(row.head_seq) or 0,
        definition_edit_seq = tonumber(row.definition_edit_seq) or 0,
        node_order = decode(row.node_order),
        edge_order = decode(row.edge_order),
        note_order = decode(row.note_order),
        params = decode(row.params),
        labels = decode(row.labels),
        version_lineage = decode(row.version_lineage),
    }, nil
end

local function is_definition_edit(event_type: string): boolean
    for _, candidate in ipairs(DEFINITION_EDIT_EVENT_TYPES) do
        if candidate == event_type then return true end
    end
    return false
end

local function save_definition_state(h: any, workflow_id: string, state: any): error?
    return exec(h, [[
        INSERT INTO ]] .. T.STATE .. [[
            (workflow_id, head_seq, definition_edit_seq, node_order, edge_order, note_order, params, labels, version_lineage)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT(workflow_id) DO UPDATE SET
            head_seq=excluded.head_seq, definition_edit_seq=excluded.definition_edit_seq,
            node_order=excluded.node_order, edge_order=excluded.edge_order, note_order=excluded.note_order,
            params=excluded.params, labels=excluded.labels, version_lineage=excluded.version_lineage
    ]], {
        workflow_id, state.head_seq, state.definition_edit_seq,
        encode(state.node_order), encode(state.edge_order), encode(state.note_order),
        encode(state.params), encode(state.labels),
        encode(state.version_lineage),
    })
end

local function project_definition_state(h: any, workflow_id: string, event: any, seq: number): error?
    local state, err = definition_state(h, workflow_id)
    if err or not state then return err or errors.new({message = "definition state unavailable", kind = errors.INTERNAL, retryable = false}) end
    local event_type = tostring((event :: any).type or "")
    local body = type((event :: any).body) == "table" and (event :: any).body or {}
    state.head_seq = seq
    if is_definition_edit(event_type) then state.definition_edit_seq = seq end
    local id = tostring((body :: any).id or (body :: any).node_id or "")
    if event_type == E.NODE_ADDED then order_add(state.node_order, id)
    elseif event_type == E.NODE_REMOVED then
        order_remove(state.node_order, id)
        local edges, edges_err = M.list_edges(h, workflow_id, {})
        if edges_err then return edges_err end
        local present: any = {}
        for _, edge in ipairs(edges or {}) do present[tostring((edge :: any).id or "")] = true end
        local edge_order = state.edge_order :: { any }
        for i = #edge_order, 1, -1 do if not present[tostring(edge_order[i])] then table.remove(edge_order, i) end end
    elseif event_type == E.EDGE_ADDED then order_add(state.edge_order, id)
    elseif event_type == E.EDGE_REMOVED then order_remove(state.edge_order, id)
    elseif event_type == E.NOTE_ADDED then order_add(state.note_order, id)
    elseif event_type == E.NOTE_REMOVED then order_remove(state.note_order, id)
    elseif event_type == E.PARAM_SET then
        local key = tostring((body :: any).key or "")
        if key ~= "" then state.params[key] = (body :: any).value end
    elseif event_type == E.LABELS_SET and type((body :: any).labels) == "table" then
        state.labels = (body :: any).labels
    elseif event_type == E.VERSION_RESTORED then
        state.version_lineage = copy_tree(body)
        state.version_lineage.restored_by = (event :: any).actor
        state.version_lineage.restored_at = now()
    end
    return save_definition_state(h, workflow_id, state)
end

-- Project entity rows and definition metadata in the writer transaction. Reads
-- consume these tables only; the event stream is retained solely as history.
function M.project_event(h: any, workflow_id: string, event: any, seq: number?): error?
    local t = tostring(type(event) == "table" and (event :: any).type or "")
    local p = type(event) == "table" and (event :: any).body or {}
    if type(p) ~= "table" then p = {} end

    local err: error? = nil
    if t == E.NODE_ADDED then err = node_upsert(h, workflow_id, p)
    elseif t == E.NODE_UPDATED then err = node_update(h, workflow_id, p)
    elseif t == E.NODE_REMOVED then err = node_remove(h, workflow_id, p)
    elseif t == E.EDGE_ADDED then err = edge_upsert(h, workflow_id, p)
    elseif t == E.EDGE_UPDATED then err = edge_update(h, workflow_id, p)
    elseif t == E.EDGE_REMOVED then err = exec(h, "DELETE FROM " .. T.EDGES .. " WHERE workflow_id = $1 AND id = $2", { workflow_id, tostring(p.id or "") })
    elseif t == E.NOTE_ADDED then err = note_upsert(h, workflow_id, p)
    elseif t == E.NOTE_UPDATED then err = note_update(h, workflow_id, p)
    elseif t == E.NOTE_REMOVED then err = exec(h, "DELETE FROM " .. T.NOTES .. " WHERE workflow_id = $1 AND id = $2", { workflow_id, tostring(p.id or "") })
    elseif t == E.LAYOUT_POSITION_SET then err = layout_set(h, workflow_id, p)
    elseif t == E.LAYOUT_POSITION_CLEARED then err = exec(h, "DELETE FROM " .. T.LAYOUT .. " WHERE workflow_id = $1 AND node_id = $2", { workflow_id, tostring(p.node_id or "") })
    elseif t == E.LAYOUT_VIEWPORT_SET then err = viewport_set(h, workflow_id, p)
    elseif t == E.LAYOUT_DIRECTION_SET then err = direction_set(h, workflow_id, p)
    elseif t ~= E.PARAM_SET and t ~= E.LABELS_SET and t ~= E.VERSION_RESTORED and t ~= E.VERSION_PUBLISHED then
        return errors.new({message = "unknown workflow event type: " .. t, kind = errors.INVALID, retryable = false})
    end
    if err then return err end
    return project_definition_state(h, workflow_id, event, tonumber(seq) or 0)
end

-- ─── reads ───────────────────────────────────────────────────────────────

function M.list_nodes(h: any, workflow_id: string, options: any): (any?, error?)
    options = type(options) == "table" and options or {}
    local wheres: { string } = { "workflow_id = $1" }
    local params: { any } = { workflow_id }
    local function put(col: string, value: any)
        params[#params + 1] = tostring(value)
        wheres[#wheres + 1] = col .. " = $" .. tostring(#params)
    end
    if options.id ~= nil then put("id", options.id) end
    if options.kind ~= nil then put("kind", options.kind) end
    if options.status ~= nil then put("status", options.status) end
    local rows, err = query(h, "SELECT * FROM " .. T.NODES .. " WHERE " .. table.concat(wheres, " AND ") ..
        " ORDER BY created_at ASC, id ASC", params)
    if err then return nil, err end
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local r: any = row
        out[#out + 1] = {
            id = tostring(r.id or ""),
            kind = r.kind,
            ref = r.ref,
            title = r.title,
            config = schema_json.normalize_config_schemas(decode(r.config)),
            status = r.status,
        }
    end
    return out, nil
end

function M.list_edges(h: any, workflow_id: string, options: any): (any?, error?)
    options = type(options) == "table" and options or {}
    local wheres: { string } = { "workflow_id = $1" }
    local params: { any } = { workflow_id }
    local function put(col: string, value: any)
        params[#params + 1] = tostring(value)
        wheres[#wheres + 1] = col .. " = $" .. tostring(#params)
    end
    if options.id ~= nil then put("id", options.id) end
    if options.source_id ~= nil then put("source_id", options.source_id) end
    if options.target_id ~= nil then put("target_id", options.target_id) end
    local rows, err = query(h, "SELECT * FROM " .. T.EDGES .. " WHERE " .. table.concat(wheres, " AND ") ..
        " ORDER BY created_at ASC, id ASC", params)
    if err then return nil, err end
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local r: any = row
        out[#out + 1] = {
            id = tostring(r.id or ""),
            source_id = r.source_id,
            target_id = r.target_id,
            source_port = r.source_port,
            target_port = r.target_port,
            transform = decode(r.transform),
        }
    end
    return out, nil
end

function M.list_notes(h: any, workflow_id: string, options: any): (any?, error?)
    options = type(options) == "table" and options or {}
    local wheres: { string } = { "workflow_id = $1" }
    local params: { any } = { workflow_id }
    if options.id ~= nil then params[#params + 1] = tostring(options.id); wheres[#wheres + 1] = "id = $" .. tostring(#params) end
    local rows, err = query(h, "SELECT * FROM " .. T.NOTES .. " WHERE " .. table.concat(wheres, " AND ") ..
        " ORDER BY created_at ASC, id ASC", params)
    if err then return nil, err end
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local r: any = row
        out[#out + 1] = { id = tostring(r.id or ""), body = r.body, color = r.color, kind = r.kind or "note" }
    end
    return out, nil
end

-- read_state(db, workflow_id) -> raw folded state used by the writer/inverse code:
-- keyed maps plus insertion-order arrays, layout positions, viewport, params, and
-- definition-owned labels from the committed read-model tables.
function M.read_state(h: any, workflow_id: string): (any?, error?)
    local state: any = {
        nodes = {}, edges = {}, notes = {},
        node_order = {}, edge_order = {}, note_order = {},
        layout = {}, viewport = nil, direction = types.DEFAULT_LAYOUT_DIRECTION, params = {}, labels = {},
    }

    local nodes, nerr = M.list_nodes(h, workflow_id, {})
    if nerr then return nil, nerr end
    for _, n in ipairs(nodes or {}) do
        state.nodes[n.id] = n
    end

    local edges, eerr = M.list_edges(h, workflow_id, {})
    if eerr then return nil, eerr end
    for _, e in ipairs(edges or {}) do
        state.edges[e.id] = e
    end

    local notes, noterr = M.list_notes(h, workflow_id, {})
    if noterr then return nil, noterr end
    for _, note in ipairs(notes or {}) do
        state.notes[note.id] = note
    end

    local layout_rows, lerr = query(h, "SELECT * FROM " .. T.LAYOUT .. " WHERE workflow_id = $1", { workflow_id })
    if lerr then return nil, lerr end
    for _, row in ipairs(layout_rows or {}) do
        local r: any = row
        local meta = decode(r.meta)
        if tostring(r.node_id or "") == types.LAYOUT_NODE_ID then
            local direction_meta, err = I.json.decode(r.meta)
            if err then return nil, errors.wrap(err, "decode layout direction") end
            if type(direction_meta) ~= "table" or type(direction_meta.direction) ~= "string" or not types.LAYOUT_DIRECTIONS[direction_meta.direction] then
                return nil, errors.new({message = "persisted layout direction must be TB or LR",
                    kind = errors.INTERNAL, retryable = false})
            end
            state.direction = direction_meta.direction
        elseif tostring(r.node_id or "") == types.VIEWPORT_NODE_ID then
            state.viewport = { x = num(r.x) or 0, y = num(r.y) or 0, zoom = tonumber(meta.zoom) or 1, root_id = meta.root_id }
        else
            state.layout[tostring(r.node_id or "")] = {
                x = num(r.x) or 0, y = num(r.y) or 0,
                width = num(r.width), height = num(r.height), meta = meta,
            }
        end
    end

    local metadata, metadata_err = definition_state(h, workflow_id)
    if metadata_err or not metadata then return nil, metadata_err or "definition state unavailable" end
    state.node_order = metadata.node_order
    state.edge_order = metadata.edge_order
    state.note_order = metadata.note_order
    state.params = metadata.params
    state.labels = metadata.labels
    state.version_lineage = next(metadata.version_lineage) and metadata.version_lineage or nil
    state.head_seq = metadata.head_seq
    state.definition_edit_seq = metadata.definition_edit_seq

    return state, nil
end

end
