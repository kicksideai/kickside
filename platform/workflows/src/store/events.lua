local store_state = require("store_state")
local row_limit = require("row_limit")

return function(M: any, I: any)
local schema_json = I.schema_json
local T, E, DEFINITION_EDIT_EVENT_TYPES = I.T, I.E, I.DEFINITION_EDIT_EVENT_TYPES
local now, decode, query = I.now, I.decode, I.query
local json = I.json
type Map = { [string]: any }

function M.head_seq(h: any, workflow_id: string): (number?, string?)
    local rows, err = query(h, "SELECT head_seq AS head FROM " .. T.STATE .. " WHERE workflow_id = $1", { workflow_id })
    if err then return nil, err end
    local head = 0
    if type(rows) == "table" and rows[1] then head = tonumber((rows[1] :: any).head) or 0 end
    return head, nil
end

-- Definition streams also carry system markers such as version.published. Only
-- authored definition events make a published Flow dirty.
function M.last_definition_edit_seq(h: any, workflow_id: string): (number?, string?)
    local rows, err = query(h, "SELECT definition_edit_seq AS head FROM " .. T.STATE ..
        " WHERE workflow_id = $1 LIMIT 1", { workflow_id })
    if err then return nil, err end
    local head = 0
    if type(rows) == "table" and rows[1] then head = tonumber((rows[1] :: any).head) or 0 end
    return head, nil
end

function M.params_and_head(h: any, workflow_id: string): (any?, string?)
    local rows, err = query(h, "SELECT head_seq, definition_edit_seq, params, labels FROM " .. T.STATE ..
        " WHERE workflow_id = $1 LIMIT 1", { workflow_id })
    if err then return nil, err end
    local row: any = type(rows) == "table" and rows[1] or {}
    local params = decode(row.params)
    local labels = decode(row.labels)
    local nodes, nerr = M.list_nodes(h, workflow_id, {})
    if nerr then return nil, nerr end
    return {
        params = params,
        labels = labels,
        head_seq = tonumber(row.head_seq) or 0,
        definition_edit_seq = tonumber(row.definition_edit_seq) or 0,
        interface = M.interface_from_document({ nodes = nodes, params = params }),
    }, nil
end

function M.append_event(h: any, workflow_id: string, seq: number, etype: string, body: any, actor: any): any?
    local stored_body = body
    if etype == E.NODE_ADDED or etype == E.NODE_UPDATED then
        stored_body = schema_json.normalize_node_body_schemas(body)
    end
    local encoded, encode_err = json.encode(stored_body)
    if encode_err or type(encoded) ~= "string" then
        return errors.new({ message = "workflow event body is not encodable: " .. tostring(encode_err),
            kind = errors.INVALID, retryable = false })
    end
    -- The durable state row is the owner gate; the event insert stays inside
    -- the caller's tx.
    local gate, gate_err = h:execute("INSERT INTO " .. T.STATE
        .. " (workflow_id) VALUES ($1) ON CONFLICT(workflow_id) DO NOTHING", { workflow_id })
    if gate_err or not gate or tonumber(gate.rows_affected) == nil then
        return gate_err or errors.new({ message = "workflow state gate returned no insertion proof",
            kind = errors.INTERNAL, retryable = true })
    end
    local locked, lock_err = h:execute("UPDATE " .. T.STATE
        .. " SET head_seq=CASE WHEN head_seq<$1 THEN $2 ELSE head_seq END WHERE workflow_id=$3",
        { seq, seq, workflow_id })
    if lock_err or not locked or tonumber(locked.rows_affected) ~= 1 then
        return lock_err or errors.new({ message = "workflow state gate lock failed",
            kind = errors.INTERNAL, retryable = true })
    end
    local operation = etype == E.VERSION_PUBLISHED and "version_publish" or "definition_edit"
    local size_err = row_limit.check(workflow_id, encoded, operation)
    if size_err then return size_err end
    local inserted, insert_err = h:execute("INSERT INTO " .. T.EVENTS ..
        " (workflow_id, seq, type, body, actor, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        { workflow_id, seq, etype, encoded, actor, now() })
    if insert_err or not inserted or tonumber(inserted.rows_affected) ~= 1 then
        return insert_err or errors.new({ message = "workflow event insert returned no row proof",
            kind = errors.INTERNAL, retryable = true })
    end
    return nil
end

function M.list_events(workflow_id: string, from_seq: any, limit: any?): (any?, string?)
    local db, db_err = M.open_db()
    if not db then return nil, db_err end
    local capped = math.max(1, math.min(500, tonumber(limit) or 500))
    local rows, err = query(db, "SELECT seq, type, body, actor, created_at FROM " .. T.EVENTS ..
        " WHERE workflow_id = $1 AND seq > $2 ORDER BY seq ASC LIMIT $3", { workflow_id, tonumber(from_seq) or 0, capped })
    db:release()
    if err then return nil, err end
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local r: any = row
        local body, decode_err = r.body, nil
        if type(body) ~= "table" then body, decode_err = json.decode(tostring(body)) end
        if decode_err or type(body) ~= "table" then
            return nil, "workflow event body is invalid at seq " .. tostring(r.seq) .. ": " .. tostring(decode_err or "expected an object")
        end
        if r.type == E.NODE_ADDED or r.type == E.NODE_UPDATED then
            body = schema_json.normalize_node_body_schemas(body)
        end
        out[#out + 1] = {
            seq = tonumber(r.seq) or 0,
            type = r.type,
            body = body,
            actor = r.actor,
            created_at = r.created_at,
        }
    end
    return out, nil
end

end
