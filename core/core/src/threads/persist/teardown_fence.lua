-- Durable first phase of thread deletion. Marking the thread stops new event
-- and pin admissions; the existing owner retry visits at most 100 consumers
-- per call and asks each surviving owner to block before events are removed.
local sql = require("sql")
local time = require("time")
local contract = require("contract")

local M = {}

local function response_error(field: string): error
    return errors.new({message = "thread teardown fence response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "thread_teardown_fence_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

local function write_error(result: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(result) ~= "table" then return response_error(field) end
    local count = tonumber(result.rows_affected)
    if count == nil or count ~= count or count < 0 or count > 1 or count % 1 ~= 0 then
        return response_error(field)
    end
    return nil
end

local function pending(message: string, needs_continue: boolean?): error
    return (errors.new({ message = message, kind = errors.CONFLICT, retryable = true,
        details = { cleanup_pending = true, needs_continue = needs_continue == true } }) :: error)
end

function M.mark(db: any, id: string): error?
    local stamp = time.now():utc():format(time.RFC3339)
    local result, err = db:execute("UPDATE kickside_thread SET deleting_at=COALESCE(deleting_at,$1) WHERE id=$2", { stamp, id })
    local mark_err = write_error(result, err, "thread delete mark failed", "mark.write")
    if mark_err then return mark_err end
    local rows, proof_err = db:query("SELECT deleting_at FROM kickside_thread WHERE id=$1", { id })
    local read_err = rows_error(rows, proof_err, "thread delete mark proof failed", "mark.rows")
    if read_err then return read_err end
    if next(rows) == nil then return nil end
    if type(rows[1]) ~= "table" or rows[1].deleting_at == nil then
        return response_error("mark.deleting_at")
    end
    return nil
end

function M.fence_page(db: any, id: string): (boolean?, error?)
    local rows, read_err = db:query("SELECT component_id,teardown_fence_cursor,teardown_fence_done"
        .. " FROM kickside_thread WHERE id=$1", { id })
    local state_err = rows_error(rows, read_err, "thread fence state read failed", "state.rows")
    if state_err then return nil, state_err end
    if next(rows) == nil then return true, nil end
    if type(rows[1]) ~= "table" then
        return nil, response_error("state")
    end
    local state = rows[1]
    if state.teardown_fence_done == true or state.teardown_fence_done == 1 then return true, nil end
    if type(state.teardown_fence_cursor) ~= "string" then
        return nil, response_error("state.cursor")
    end
    local cursor = state.teardown_fence_cursor :: string
    local pins, pin_err = db:query("SELECT consumer_key FROM kickside_retention_pin"
        .. " WHERE thread_id=$1 AND consumer_key>$2 ORDER BY consumer_key LIMIT 101", { id, cursor })
    local page_err = rows_error(pins, pin_err, "thread consumer fence page failed", "pins.rows")
    if page_err then return nil, page_err end
    local limit = math.min(#pins, 100)
    local fence: any = nil
    for i = 1, limit do
        if type(pins[i]) ~= "table" or type(pins[i].consumer_key) ~= "string" or pins[i].consumer_key == "" then
            return nil, response_error("pins.consumer_key")
        end
        local key = pins[i].consumer_key :: string
        local owner = key:match("^drive:([^:]+):.+$")
        if key ~= "self:" .. id and owner ~= id and owner ~= tostring(state.component_id) then
            if not owner then return nil, pending("retention consumer has no owner locator: " .. key) end
            if not fence then
                local definition, def_err = contract.get("kickside.core:source_delete_fence")
                if def_err then return nil, errors.wrap(def_err, "source fence contract unavailable") end
                if type(definition) ~= "table" and type(definition) ~= "userdata" then
                    return nil, response_error("fence.contract")
                end
                local opened, open_err = (definition :: any):open()
                if open_err then return nil, errors.wrap(open_err, "source fence binding unavailable") end
                if type(opened) ~= "table" and type(opened) ~= "userdata" then
                    return nil, response_error("fence.binding")
                end
                fence = opened
            end
            local outcome, fence_err = fence:fence({ source_thread_id = id, consumer_key = key })
            if fence_err then return nil, fence_err end
            if type(outcome) ~= "table" or outcome.fenced ~= true then
                return nil, response_error("fence.outcome")
            end
        end
    end
    local last = limit > 0 and tostring(pins[limit].consumer_key) or cursor
    local more = #pins > 100
    local dialect, dt_err = db:type()
    if dt_err then return nil, errors.wrap(dt_err, "thread fence dialect unavailable") end
    if type(dialect) ~= "string" or dialect == "" then return nil, response_error("database.type") end
    local done_value: any = tostring(dialect) == sql.type.SQLITE and (more and 0 or 1) or not more
    local result, stamp_err = db:execute("UPDATE kickside_thread SET teardown_fence_cursor=$1,teardown_fence_done=$2"
        .. " WHERE id=$3 AND teardown_fence_cursor=$4 AND deleting_at IS NOT NULL",
        { last, done_value, id, cursor })
    local cursor_err = write_error(result, stamp_err, "thread fence cursor stamp failed", "cursor.write")
    if cursor_err then return nil, cursor_err end
    local proof, proof_err = db:query("SELECT teardown_fence_cursor,teardown_fence_done"
        .. " FROM kickside_thread WHERE id=$1", { id })
    local advance_err = rows_error(proof, proof_err, "thread fence cursor proof failed", "cursor.rows")
    if advance_err then return nil, advance_err end
    if next(proof) == nil then return true, nil end
    if type(proof[1]) ~= "table"
        or tostring(proof[1].teardown_fence_cursor) ~= last
        or (not more and proof[1].teardown_fence_done ~= true and proof[1].teardown_fence_done ~= 1) then
        return nil, response_error("cursor.advance")
    end
    if more then return nil, pending("thread consumer fences have another bounded page", true) end
    return true, nil
end

return M
