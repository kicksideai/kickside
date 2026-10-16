local sql = require("sql")
local consts = require("mcp_consts")

local M = {}
M.MAX_ACTIVE = 100

local function failure(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause),
        kind = errors.INTERNAL, retryable = true }) :: error)
end

local function refuse(tx: any, cause: error): (boolean?, error?)
    local _, rollback_err = tx:rollback()
    if rollback_err then
        return nil, failure("admission rollback failed", tostring(cause) .. "; " .. tostring(rollback_err))
    end
    return nil, cause
end

-- Predicates and table names come from trusted owners. Serializable admission
-- composes lifetime and rolling-window bounds in the same insertion transaction.
function M.insert_limited(db: any, table_name: string, row: any, limits: { any }): (boolean?, error?)
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then return nil, failure("admission transaction failed", begin_err) end
    for _, limit in ipairs(limits) do
        local rows, count_err = tx:query(limit.query, limit.args)
        if count_err then return refuse(tx, failure("admission quota query failed", count_err)) end
        local count = type(rows) == "table" and rows[1] and tonumber(rows[1].n)
        if not count then return refuse(tx, failure("admission quota returned no count", "missing result")) end
        if count >= limit.maximum then
            return refuse(tx, (errors.new({ message = limit.message, kind = limit.kind,
                retryable = limit.retryable }) :: error))
        end
    end
    local _, insert_err = sql.builder.insert(table_name):set_map(row):run_with(tx):exec()
    if insert_err then return refuse(tx, failure("admission insert failed", insert_err)) end
    local _, commit_err = tx:commit()
    if commit_err then return refuse(tx, failure("admission commit failed", commit_err)) end
    return true, nil
end

function M.insert(db: any, actor_id: string, now: integer, row: any): (boolean?, error?)
    return M.insert_limited(db, consts.TABLES.CREDENTIALS, row, { {
        query = [[SELECT COUNT(*) AS n FROM kickside_mcp_credentials
            WHERE actor_id=$1 AND status='active'
              AND (expires_at IS NULL OR expires_at <= 0 OR expires_at >= $2)]],
        args = { actor_id, now }, maximum = M.MAX_ACTIVE,
        message = "active credential limit reached (100 per owner)",
        kind = errors.CONFLICT, retryable = false,
    } })
end

return M
