local sql = require("sql")

-- Harness-local kickside.core:threads purge. The real threads slice is not loaded in
-- the component test harness, so teardown's primary-thread reap would be a silent no-op.
-- This stub makes purge observable and toggleable: a component registered in the
-- thread_purge_ctl control table fails (fail=1) or succeeds (fail=0) and every call
-- bumps its counter, so a test can prove a failed purge surfaces and a retry re-attempts.
-- A component with no control row is a successful no-op, so unrelated harness deletes are
-- unaffected.
local M = {}

local DB = "app:db"
local CTL = "thread_purge_ctl"

local function ensure(db: any): ()
    db:execute("CREATE TABLE IF NOT EXISTS " .. CTL ..
        " (component_id TEXT PRIMARY KEY, fail INTEGER NOT NULL DEFAULT 0, calls INTEGER NOT NULL DEFAULT 0)")
end

function M.purge(args: any): (any?, any)
    args = type(args) == "table" and args or {}
    local component_id = type(args.component_id) == "string" and args.component_id or ""

    local db, db_err = sql.get(DB)
    if db_err or not db then return nil, "db unavailable: " .. tostring(db_err) end
    ensure(db)

    local rows, q_err = db:query("SELECT fail FROM " .. CTL .. " WHERE component_id = $1", { component_id })
    if q_err then
        db:release()
        return nil, tostring(q_err)
    end
    if not rows or not rows[1] then
        db:release()
        return { purged = true, thread_id = component_id }, nil
    end

    db:execute("UPDATE " .. CTL .. " SET calls = calls + 1 WHERE component_id = $1", { component_id })
    local fail = tonumber(rows[1].fail) or 0
    db:release()

    if fail == 1 then
        return nil, "thread purge failed (harness control)"
    end
    if fail == 3 or fail == 4 then
        return nil, errors.new({ message = "bounded thread cleanup", kind = errors.CONFLICT, retryable = true,
            details = { cleanup_pending = true, needs_continue = fail == 3,
                wait_for = fail == 4 and "consumer_release" or nil, discarded = { projections = 100 } } })
    end
    if fail == 2 then
        return { purged = false, thread_id = component_id }, nil
    end
    return { purged = true, thread_id = component_id }, nil
end

return M
