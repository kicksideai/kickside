-- A job that occupies its worker until the job its payload names (by owner) is done, the way a
-- synchronous consumer waits on a projection slot.
local sql = require("sql")
local time = require("time")

local function run(input: any): (any?, error?)
    local payload = type(input) == "table" and input.payload or {}
    local awaited_owner = tostring(payload.awaited_owner or "")
    local wait_ms = tonumber(payload.wait_ms) or 0
    local waited = 0
    while waited <= wait_ms do
        local db, db_err = sql.get("app:db")
        if db_err or not db then return nil, db_err end
        local rows, query_err = db:query("SELECT status FROM kickside_job WHERE owner_kind='test' AND owner_id=$1",
            { awaited_owner })
        db:release()
        if query_err then return nil, query_err end
        if rows and rows[1] and rows[1].status == "done" then return { ok = true }, nil end
        time.sleep("100ms")
        waited = waited + 100
    end
    return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true,
        message = "the job awaited by " .. awaited_owner .. " did not complete while its waiter held a worker" })
end

return { run = run }
