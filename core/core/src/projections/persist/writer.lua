-- The projection write boundary. Registration and control share one cursor;
-- jobs owns dispatch, leases, retries and wake demand.
local sql = require("sql")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local clock = require("clock")
local register = require("register")
local job_lifecycle = require("job_lifecycle")
local job_lifecycle_cancel = require("job_lifecycle_cancel")
local jobs_wake = require("jobs_wake")
local cursor_waiters = require("cursor_waiters")
local retention_notifier = require("retention_notifier")
local retention_pin = require("retention_pin")

local M = {
    register_projection = register.register_projection,
    register_projection_tx = register.register_projection_tx,
}
-- The cancellation dependency can be replaced by colocated tests to inspect
-- aggregate lock order without changing the production call path.
M._modules = {} :: { [string]: any }
local function failure(message: string, kind: string): error
    return (errors.new({ message = message, kind = kind }) :: error)
end
local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end
local function transaction_response(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "projection transaction returns no valid " .. field .. " proof",
        details = {code = "projection_transaction_response", field = field}})
end
local function in_tx(db: sql.DB, fn: (sql.Transaction, string) -> (any?, error?)): (any?, error?)
    local raw, type_err = sql_boundary.database_type(db, "projection dialect unavailable", "database.type", transaction_response)
    if type_err then return nil, type_err end
    return sql_boundary.transaction(db, function(tx: sql.Transaction): (any?, error?)
        return fn(tx, raw :: string)
    end, "projection", transaction_response)
end
local function lock_thread(tx: sql.Transaction, dialect: string, thread_id: string): error?
    local suffix = dialect == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, err = tx:query("SELECT id FROM kickside_thread WHERE id=$1" .. suffix, { thread_id })
    if err then return (errors.wrap(err, "projection thread lock failed") :: error) end
    if not rows or not rows[1] then return failure("thread not found", errors.NOT_FOUND) end
    return nil
end
local function cursor(tx: sql.Transaction, dialect: string, thread_id: string, params: table): (table?, error?)
    local query = [[SELECT c.id,c.projection_id,c.status,c.generation,c.job_id
        FROM kickside_projection_cursor c JOIN kickside_projection p ON p.id=c.projection_id
        WHERE c.thread_id=$1]]
    local args: { any } = { thread_id }
    if trim(params.cursor_id) ~= "" then
        query = query .. " AND c.id=$2"; args[#args + 1] = trim(params.cursor_id)
    elseif trim(params.projection_id) ~= "" then
        query = query .. " AND p.id=$2"; args[#args + 1] = trim(params.projection_id)
    else
        if trim(params.kind) == "" then return nil, failure("kind, projection_id or cursor_id required", errors.INVALID) end
        query = query .. " AND p.kind=$2 AND p.projection_key=$3 AND c.cursor_key=$4"
        args[#args + 1] = trim(params.kind)
        args[#args + 1] = trim(params.projection_key) ~= "" and trim(params.projection_key) or "default"
        args[#args + 1] = trim(params.cursor_key) ~= "" and trim(params.cursor_key) or "default"
    end
    if dialect == sql.type.POSTGRES then query = query .. " FOR UPDATE OF c" end
    local rows, err = tx:query(query, args)
    if err then return nil, (errors.wrap(err, "projection cursor lookup failed") :: error) end
    if not rows or not rows[1] then return nil, failure("projection cursor not found", errors.NOT_FOUND) end
    if rows[2] then return nil, failure("projection cursor address is ambiguous", errors.CONFLICT) end
    return rows[1], nil
end

local function release_pin(tx: sql.Transaction, thread_id: string, cursor_id: string, operation: string): error?
    local key = "projection:" .. cursor_id
    local held, read_err = retention_pin.read(tx, thread_id, key)
    if read_err then return read_err end
    if not held then return nil end
    local _, release_err = retention_pin.release_tx(tx, { thread_id = thread_id, consumer_key = key,
        expected_pin_generation = held.generation, terminal_op_id = cursor_id .. ":" .. operation })
    return release_err
end

function M.pause(db: sql.DB, thread_id: string, params: table): (table?, error?)
    local result, err = in_tx(db, function(tx: sql.Transaction, dialect: string): (table?, error?)
        local lock_err = lock_thread(tx, dialect, thread_id)
        if lock_err then return nil, lock_err end
        local c, find_err = cursor(tx, dialect, thread_id, params)
        if find_err then return nil, find_err end
        if (c :: table).status == "paused" then
            return { cursor_id = c.id, projection_id = c.projection_id, status = "paused", already_paused = true }, nil
        end
        if c.status == "invalid" then
            local pin_err = release_pin(tx, thread_id, tostring(c.id), "pause:" .. tostring(c.generation))
            if pin_err then return nil, pin_err end
        end
        local _, err = tx:execute([[UPDATE kickside_projection_cursor
            SET status='paused',generation=generation+1,updated_at=$1 WHERE id=$2]],
            { clock.now(dialect), c.id })
        if err then return nil, (errors.wrap(err, "projection pause failed") :: error) end
        return { cursor_id = c.id, projection_id = c.projection_id, status = "paused" }, nil
    end)
    if err or not result then return result, err end
    local _, notify_err = cursor_waiters.notify_cursor(tostring(result.cursor_id), nil, tostring(result.status))
    if notify_err then return nil, committed_error.new(notify_err) end
    return result, nil
end

function M.resume(db: sql.DB, thread_id: string, params: table): (table?, error?)
    local result, err = in_tx(db, function(tx: sql.Transaction, dialect: string): (table?, error?)
        local lock_err = lock_thread(tx, dialect, thread_id)
        if lock_err then return nil, lock_err end
        local c, find_err = cursor(tx, dialect, thread_id, params)
        if find_err then return nil, find_err end
        if (c :: table).status == "invalid" then
            return nil, failure("invalid projection needs a corrected declaration", errors.CONFLICT)
        end
        if c.status == "active" then
            return { cursor_id = c.id, projection_id = c.projection_id, status = "active", already_active = true }, nil
        end
        local _, update_err = tx:execute([[UPDATE kickside_projection_cursor
            SET status='active',generation=generation+1,last_error=NULL,updated_at=$1 WHERE id=$2]],
            { clock.now(dialect), c.id })
        if update_err then return nil, (errors.wrap(update_err, "projection resume failed") :: error) end
        if type(c.job_id) ~= "string" or c.job_id == "" then
            return nil, failure("projection cursor has no jobs slot", errors.INTERNAL)
        end
        local _, wake_err = jobs_wake.wake_job(tx, c.job_id, { control = true }, dialect)
        if wake_err then return nil, wake_err end
        return { cursor_id = c.id, projection_id = c.projection_id, job_id = c.job_id, status = "active" }, nil
    end)
    if err or not result then return result, err end
    local _, cursor_err = cursor_waiters.notify_cursor(tostring(result.cursor_id), nil, tostring(result.status))
    local notify_err = error_envelope.cleanup(function(): (any, error?)
        local raw_type, type_err = sql_boundary.database_type(db, "projection dialect unavailable", "database.type", transaction_response)
        if type_err then return nil, type_err end
        return jobs_wake.nudge_workers(db, raw_type)
    end, cursor_err, "projection worker notification failed")
    if notify_err then return nil, committed_error.new(notify_err) end
    return result, nil
end

function M.remove_projection(db: sql.DB, thread_id: string, params: table): (table?, error?)
    local result, remove_err = in_tx(db, function(tx: sql.Transaction, dialect: string): (table?, error?)
        local lock_err = lock_thread(tx, dialect, thread_id)
        if lock_err then return nil, lock_err end
        local query = "SELECT id,kind,projection_key FROM kickside_projection WHERE thread_id=$1"
        local args: { any } = { thread_id }
        if trim(params.projection_id) ~= "" then
            query = query .. " AND id=$2"; args[#args + 1] = trim(params.projection_id)
        else
            if trim(params.kind) == "" then return nil, failure("kind or projection_id required", errors.INVALID) end
            query = query .. " AND kind=$2 AND projection_key=$3"
            args[#args + 1] = trim(params.kind)
            args[#args + 1] = trim(params.projection_key) ~= "" and trim(params.projection_key) or "default"
        end
        local rows, query_err = tx:query(query, args)
        if query_err then return nil, (errors.wrap(query_err, "projection lookup failed") :: error) end
        local p = rows and rows[1]
        if not p then return nil, failure("projection not found", errors.NOT_FOUND) end
        local cursors, cursor_err = tx:query(
            "SELECT id,job_id FROM kickside_projection_cursor WHERE projection_id=$1 ORDER BY job_id ASC", { p.id })
        if cursor_err then return nil, (errors.wrap(cursor_err, "projection slot lookup failed") :: error) end
        local cancellation = M._modules.job_lifecycle_cancel or job_lifecycle_cancel
        local revoked: table[] = {}
        local cursor_ids: string[] = {}
        for _, c in ipairs(cursors or {}) do
            cursor_ids[#cursor_ids + 1] = tostring(c.id)
            local pin_err = release_pin(tx, thread_id, tostring(c.id), "remove")
            if pin_err then return nil, pin_err end
            if c.job_id then
                local _, cancel_err, executions = cancellation.cancel_jobs_tx(tx, dialect,
                    { id = tostring(c.job_id), reason = "projection removed" })
                if cancel_err then return nil, cancel_err end
                for _, execution in ipairs(executions or {}) do revoked[#revoked + 1] = execution end
            end
        end
        local _, cursor_delete_err = tx:execute("DELETE FROM kickside_projection_cursor WHERE projection_id=$1", { p.id })
        if cursor_delete_err then return nil, (errors.wrap(cursor_delete_err, "projection cursor deletion failed") :: error) end
        local _, delete_err = tx:execute("DELETE FROM kickside_projection WHERE id=$1", { p.id })
        if delete_err then return nil, (errors.wrap(delete_err, "projection deletion failed") :: error) end
        return { projection_id = p.id, kind = p.kind, projection_key = p.projection_key,
            removed_cursors = #(cursors or {}), revoked = revoked, cursor_ids = cursor_ids }, nil
    end)
    if remove_err or not result then return result, remove_err end
    local raw_type, type_err = sql_boundary.database_type(db, "projection dialect unavailable after removal", "database.type", transaction_response)
    if type_err then return nil, committed_error.new(type_err) end
    local revocation = M._modules.job_lifecycle or job_lifecycle
    local cursor_notify_err: error? = nil
    for _, cursor_id in ipairs(result.cursor_ids or {}) do
        cursor_notify_err = error_envelope.cleanup(function(): (any, error?)
            return cursor_waiters.notify_cursor(tostring(cursor_id), nil, "removed")
        end, cursor_notify_err, "projection cursor notification failed")
    end
    local notify_err = error_envelope.cleanup(function(): (any, error?)
        return true, revocation.notify_cancellations(db, raw_type :: string, result.revoked or {})
    end, cursor_notify_err, "projection cancellation notification failed")
    if notify_err then return nil, committed_error.new(notify_err) end
    local _, retention_notify_err = retention_notifier.notify({ kind = "projection_eligibility_changed",
        thread_id = thread_id })
    if retention_notify_err then return nil, committed_error.new(retention_notify_err) end
    result.revoked = nil
    result.cursor_ids = nil
    return result, nil
end

return M
