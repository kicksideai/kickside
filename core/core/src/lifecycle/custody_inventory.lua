local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local component = require("component_inventory")
local consts = require("lifecycle_consts")
local core_db = require("core_db")
local persisted_json = require("persisted_json")
local identity = require("execution_identity")
local M = {}

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, message = message})
end

local function whole(n: any): boolean
    return type(n) == "number" and n >= 0 and n <= 9007199254740991 and n % 1 == 0
end

local function position(raw: any, view: string, impl_id: string?): (table?, error?)
    if raw == nil or raw == "" then return nil, nil end
    if type(raw) ~= "string" or #raw > 4096 then return nil, invalid("invalid inventory cursor") end
    local token, err = json.decode(raw)
    if err or type(token) ~= "table" or token.view ~= view or token.impl_id ~= impl_id then
        return nil, invalid("inventory cursor belongs to a different selection")
    end
    if view == "components" then
        if type(token.after) ~= "string" or not uuid.validate(token.after) then return nil, invalid("invalid component cursor") end
    elseif view == "dispositions" then
        if not whole(token.after) then return nil, invalid("invalid disposition cursor") end
    elseif type(token.id) ~= "string" or not uuid.validate(token.id) or not whole(token.generation)
        or not whole(token.last_seq) or not whole(token.pruned) or not whole(token.head) or not whole(token.after)
        or token.after < math.max(token.last_seq, token.pruned) or token.after >= token.head then
        return nil, invalid("invalid report cursor")
    end
    return token, nil
end

-- Project the report body only for the two addressed event types. Only the
-- sequence, type and evidence status cross the operator boundary.
local function report_reason(row: table): string?
    local body, err = persisted_json.decode_table(row.report_body, "lifecycle report")
    if err or not body or type(body.subject_id) ~= "string" or body.subject_id == "" then return "invalid_report" end
    if row.type == consts.EVENT.PRINCIPAL_DELETED then
        if body.principal_kind == nil then return "missing_principal_kind" end
        local principal = identity.check_principal({kind = body.principal_kind, id = body.subject_id}, "report principal")
        if not principal then return "invalid_report" end
    else
        if body.incarnation == nil then return "missing_component_incarnation" end
        if type(body.incarnation) ~= "string" or not uuid.validate(body.incarnation)
            or not uuid.validate(body.subject_id) then return "invalid_report" end
    end
    return nil
end

local function reports(token: table?, limit: integer): (table?, error?)
    local auth_err = component.authorize()
    if auth_err then return nil, auth_err end
    -- Read the addressed slot, durable position and event window in one SQL
    -- snapshot. A continuation keeps the original upper bound across appends.
    local args: {any} = {consts.thread_id(), limit, consts.EVENT.PRINCIPAL_DELETED, consts.EVENT.COMPONENT_DELETED}
    local start = "CASE WHEN last_seq < max_pruned_seq THEN max_pruned_seq ELSE last_seq END"
    local finish = "event_count"
    if token then
        args[5], args[6] = token.after, token.head
        start, finish = "CAST($5 AS BIGINT)", "CAST($6 AS BIGINT)"
    end
    local query = [[WITH slot AS MATERIALIZED (
        SELECT t.id,t.thread_class,t.deleting_at,t.event_count,t.max_pruned_seq,k.id AS cursor_id,k.status,k.generation,k.last_seq,
            p.body -> 'meta' ->> 'worker_ref' AS worker_ref
        FROM kickside_thread t LEFT JOIN kickside_projection p ON p.thread_id=t.id AND p.kind='lifecycle.reap'
            AND p.projection_key='default'
        LEFT JOIN kickside_projection_cursor k ON k.projection_id=p.id AND k.thread_id=t.id AND k.cursor_key='default'
        WHERE t.id=$1),
        window_bounds AS MATERIALIZED (SELECT slot.*,CAST($2 AS BIGINT) AS page_limit,
            CAST($3 AS TEXT) AS principal_type,CAST($4 AS TEXT) AS component_type,]]
            .. start .. " AS page_start," .. finish .. [[ AS page_head FROM slot)
        SELECT s.*,e.seq,e.type,CASE WHEN e.type IN (s.principal_type,s.component_type) THEN e.body END AS report_body
        FROM window_bounds s LEFT JOIN kickside_event e ON e.thread_id=s.id AND e.seq>s.page_start
            AND e.seq<=s.page_start+s.page_limit AND e.seq<=s.page_head
            AND s.cursor_id IS NOT NULL
        ORDER BY e.seq]]
    local db, open_err = sql.get(core_db.id())
    if open_err then return nil, open_err end
    local rows, read_err = db:query(query, args)
    local _, release_err = db:release()
    if read_err or release_err then return nil, read_err or release_err end
    if type(rows) ~= "table" then return nil, errors.new({kind = errors.INTERNAL, message = "lifecycle inventory unavailable"}) end
    local slot = rows[1]
    if not slot then return {state = "missing_thread"}, nil end
    if slot.thread_class ~= consts.CLASS or slot.deleting_at ~= nil then return {state = "unavailable_thread"}, nil end
    if not slot.cursor_id then return {state = "missing_cursor"}, nil end
    if slot.worker_ref ~= "func://kickside.core.lifecycle:reaper" then return {state = "unexpected_worker"}, nil end
    local last, head, pruned, generation = tonumber(slot.last_seq), tonumber(slot.event_count),
        tonumber(slot.max_pruned_seq), tonumber(slot.generation)
    if not whole(last) or not whole(head) or not whole(pruned) or not whole(generation) or last > head or pruned > head then
        return {state = "invalid_position"}, nil
    end
    if token and (token.id ~= slot.cursor_id or token.generation ~= generation or token.last_seq ~= last
        or token.pruned ~= pruned or token.head > head) then return {state = "restart"}, nil end
    local horizon = token and token.head or head
    local after = token and token.after or math.max(last, pruned)
    local items: {table} = {}
    local seen = 0
    for _, row in ipairs(rows) do
        if row.seq ~= nil then
            seen = seen + 1
            if tonumber(row.seq) ~= after + seen then return {state = "source_gap"}, nil end
            if row.type == consts.EVENT.PRINCIPAL_DELETED or row.type == consts.EVENT.COMPONENT_DELETED then
                local reason = report_reason(row)
                if reason then items[#items + 1] = {seq = tonumber(row.seq), type = row.type, reason = reason} end
            end
        end
    end
    if seen ~= math.min(limit, horizon - after) then return {state = "source_gap"}, nil end
    local result: table = {state = last < pruned and "pruned_history" or "observed", cursor_status = slot.status,
        checkpoint = last, through_seq = horizon, max_pruned_seq = pruned, inspected = seen, items = items}
    if after + seen < horizon then
        result.next_position = {view = "reports", id = slot.cursor_id, generation = generation, last_seq = last,
            pruned = pruned, head = horizon, after = after + seen}
    end
    return result, nil
end

local function dispositions(token: table?, limit: integer): (table?, error?)
    local auth_err = component.authorize()
    if auth_err then return nil, auth_err end
    local db, open_err = sql.get(core_db.id())
    if open_err then return nil, open_err end
    local rows, read_err = db:query([[SELECT event_seq AS seq,event_id,subject_id,principal_kind,reason,
        witness_id,witness_incarnation,recorded_at FROM kickside_lifecycle_custody_disposition
        WHERE thread_id=$1 AND event_seq>$2 ORDER BY event_seq LIMIT $3]],
        {consts.thread_id(), token and token.after or 0, limit + 1})
    local _, release_err = db:release()
    if read_err or release_err then return nil, read_err or release_err end
    if type(rows) ~= "table" then return nil, errors.new({kind = errors.INTERNAL, message = "lifecycle dispositions unavailable"}) end
    local more = #rows > limit
    if more then table.remove(rows) end
    local page: table = {state = "observed", items = rows}
    if more then page.next_position = {view = "dispositions", after = tonumber(rows[#rows].seq)} end
    return page, nil
end

function M.read(args: table): (table?, error?)
    local view, limit = args.view, args.limit or 50
    if view ~= "components" and view ~= "reports" and view ~= "dispositions" then
        return nil, invalid("view must be components, reports or dispositions")
    end
    if not whole(limit) or limit < 1 or limit > component.MAX_PAGE then return nil, invalid("limit must be between 1 and 100") end
    if view ~= "components" and args.impl_id ~= nil then return nil, invalid("report views use the instance lifecycle queue") end
    local token, cursor_err = position(args.cursor, view, args.impl_id)
    if cursor_err then return nil, cursor_err end
    local result, read_err
    if view == "components" then
        result, read_err = component.components(args.impl_id, token and token.after, limit :: integer)
        if result and result.next_after then
            result.next_position = {view = view, impl_id = args.impl_id, after = result.next_after}
            result.next_after = nil
        end
    elseif view == "reports" then
        result, read_err = reports(token, limit :: integer)
    else
        result, read_err = dispositions(token, limit :: integer)
    end
    if read_err or not result then return nil, read_err end
    if result.next_position then
        local cursor, encode_err = json.encode(result.next_position)
        if encode_err then return nil, encode_err end
        result.cursor, result.next_position = cursor, nil
    end
    return result, nil
end

return M
