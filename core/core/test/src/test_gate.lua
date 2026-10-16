-- Test-only callable wrapper over thread_access.gate_thread_access. The gate is
-- consumed inside HTTP handlers (they read http.request), so a suite cannot drive
-- the endpoints as plain funcs; this exposes the gate as a value-returning func a
-- scoped test runner invokes under an actor, so the component-contract access check
-- resolves the caller. Returns { allowed, status, error? }. Not registered outside
-- the test harness.

local sql = require("sql")
local thread_access = require("thread_access")

local M = {}

-- gate opens the threads db and runs the gate for args.thread_id at args.mask
-- (defaults to WRITE), returning the decision so a scoped test can assert it.
function M.gate(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    local mask = tonumber(args.mask) or thread_access.WRITE

    local db, db_err = sql.get("app:db")
    if db_err or not db then
        return { allowed = false, status = 500, error = "db unavailable: " .. tostring(db_err) }, nil
    end

    local allowed, status, msg = thread_access.gate_thread_access(db, tostring(args.thread_id), math.floor(mask) :: integer)
    db:release()

    return { allowed = allowed, status = status, error = msg }, nil
end

return M
