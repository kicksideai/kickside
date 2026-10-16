-- One workflow owner cleanup call removes at most PAGE rows. The component's
-- committed delete mark is the durable continuation across calls/restarts.
local sql = require("sql")

return function(M: any, I: any)
local T = I.T
local PAGE = 100

local function failure(message: string, kind: string, cause: any?): error
    return (errors.new({ message = message .. (cause and ": " .. tostring(cause) or ""),
        kind = kind, retryable = kind ~= errors.INVALID }) :: error)
end

local SPECS = {
    { table = T.RUNS, key = "run_id" },
    { table = T.VERSIONS, key = "version" },
    { table = T.LAYOUT, key = "node_id" },
    { table = T.NOTES, key = "id" },
    { table = T.EDGES, key = "id" },
    { table = T.NODES, key = "id" },
    { table = T.HISTORY, key = "workflow_id" },
    { table = T.STATE, key = "workflow_id" },
    { table = T.EVENTS, key = "seq" },
}

local function selector(spec: any, limit: boolean): string
    if spec.selector then
        if limit then return spec.selector end
        return spec.selector:gsub(" LIMIT %$2$", " LIMIT 1")
    end
    return "SELECT " .. spec.key .. " FROM " .. spec.table .. " WHERE workflow_id=$1 ORDER BY "
        .. spec.key .. " LIMIT " .. (limit and "$2" or "1")
end

local function page(tx: any, spec: any, id: string, limit: integer): (integer?, error?)
    local result, err = tx:execute("WITH doomed AS (" .. selector(spec, true) .. ") DELETE FROM "
        .. spec.table .. " WHERE " .. spec.key .. " IN (SELECT " .. spec.key .. " FROM doomed)"
        .. " AND workflow_id=$1", { id, limit })
    if err then return nil, failure("workflow owner page failed for " .. spec.table, errors.INTERNAL, err) end
    local count = result and tonumber(result.rows_affected)
    if count == nil or count > limit then
        return nil, failure("workflow owner page returned no bounded deletion proof for " .. spec.table,
            errors.INTERNAL, count)
    end
    return count :: integer, nil
end

function M.purge(workflow_id: string): (boolean, error?)
    local db, db_err = M.open_db()
    if not db then return false, failure("workflow database unavailable", errors.UNAVAILABLE, db_err) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return false, failure("workflow purge begin failed", errors.UNAVAILABLE, begin_err) end
    local active, active_err = tx:query("SELECT run_id FROM " .. T.RUNS ..
        " WHERE workflow_id=$1 AND (status IN ('pending','running') OR terminal_event_pending) LIMIT 1",
        { workflow_id })
    if active_err or type(active) ~= "table" then
        tx:rollback(); db:release()
        return false, failure("workflow active-run read failed", errors.INTERNAL, active_err or "missing result")
    end
    if active[1] then
        tx:rollback(); db:release()
        return false, failure("workflow has active run or unpublished terminal event",
            errors.CONFLICT, active[1].run_id)
    end
    local history_lock_err = M.lock_history(tx, workflow_id)
    if history_lock_err then
        tx:rollback(); db:release()
        return false, failure("workflow owner history gate lock failed", errors.INTERNAL, history_lock_err)
    end
    local state_lock, state_lock_err = tx:execute("UPDATE " .. T.STATE
        .. " SET head_seq=head_seq WHERE workflow_id=$1", { workflow_id })
    if state_lock_err or not state_lock or tonumber(state_lock.rows_affected) == nil then
        tx:rollback(); db:release()
        return false, failure("workflow owner state gate lock failed", errors.INTERNAL,
            state_lock_err or "missing affected-row count")
    end
    local removed = 0
    for _, spec in ipairs(SPECS) do
        if removed >= PAGE then break end
        local count, page_err = page(tx, spec, workflow_id, PAGE - removed)
        if page_err then tx:rollback(); db:release(); return false, page_err end
        removed = removed + (count :: integer)
    end
    local more = false
    for _, spec in ipairs(SPECS) do
        local rows, read_err = tx:query(selector(spec, false), { workflow_id })
        if read_err or type(rows) ~= "table" then
            tx:rollback(); db:release()
            return false, failure("workflow owner continuation read failed", errors.INTERNAL, read_err or "missing result")
        end
        if rows[1] then more = true; break end
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return false, failure("workflow purge commit failed", errors.UNAVAILABLE, commit_err) end
    if more then
        return false, (errors.new({ message = "workflow owner cleanup has another bounded page",
            kind = errors.CONFLICT, retryable = true, details = { cleanup_pending = true, needs_continue = true, removed = removed } }) :: error)
    end
    return true, nil
end

end
