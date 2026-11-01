-- Retention owner probe. Each owner id reads its mode from a probe row; an owner
-- with no row is idle. Modes: "fail" answers success=false, "raise" raises,
-- "count" deletes one row's worth; every armed call increments calls.

local sql = require("sql")
local time = require("time")

local TABLE = "kickside_test_retention_owner_probe"

local function run_owner(owner: string, input: any?): any
    local db, db_err = sql.get("app:db")
    if db_err or not db then return { success = false, error = tostring(db_err or "database unavailable") } end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS " .. TABLE
        .. " (owner TEXT PRIMARY KEY, mode TEXT NOT NULL, calls INTEGER NOT NULL)")
    if create_err then
        db:release()
        return { success = false, error = tostring(create_err) }
    end
    local rows, query_err = db:query("SELECT mode FROM " .. TABLE .. " WHERE owner=$1", { owner })
    if query_err or type(rows) ~= "table" then
        db:release()
        return { success = false, error = tostring(query_err or "missing probe result") }
    end
    local row = (rows :: { table })[1]
    if not row then
        db:release()
        return { success = true, deleted = 0 }
    end
    local _, update_err = db:execute("UPDATE " .. TABLE .. " SET calls=calls+1 WHERE owner=$1", { owner })
    local declared_deadline = tostring(row.mode):match("^deadline:(%d+)$")
    local deadline = declared_deadline and tonumber(declared_deadline)
    if not update_err and deadline and time.now():unix_nano() / 1000000 >= deadline then
        local _, expired_err = db:execute("UPDATE " .. TABLE .. " SET mode='expired' WHERE owner=$1", { owner })
        db:release()
        if expired_err then return { success = false, error = expired_err } end
        return { success = true, deleted = 1 }
    end
    db:release()
    if update_err then return { success = false, error = tostring(update_err) } end
    if deadline then return { success = true, deleted = 0, deadline_ms = deadline } end
    if row.mode == "expired" then return { success = true, deleted = 0 } end
    if row.mode == "fail" then
        return { success = false, error = errors.new({ message = "probe owner " .. owner .. " refused",
            kind = errors.INTERNAL }) }
    end
    if row.mode == "raise" then error("probe owner " .. owner .. " raised") end
    if row.mode == "blocked" then
        return { success = true, deleted = 0, blocked = { { component_id = "blocked-component",
            error = errors.new({ message = "owner awaits eligibility", kind = errors.CONFLICT,
                retryable = true, details = { cleanup_pending = true, wait_for = "eligibility" } }) } } }
    end
    if row.mode == "malformed_blocked" then return { success = true, deleted = 0, blocked = "invalid" } end
    if row.mode == "continue" then
        local change = type(input) == "table" and input.change or nil
        return { success = true, deleted = 1, needs_continue = type(change) == "table"
            and change.kind == "owner_continuation_test" and type(change.owner_locator) == "table"
            and change.owner_locator.id == "released-owner" }
    end
    return { success = true, deleted = 1 }
end

local function first(input: any?): any
    return run_owner("first", input)
end

local function second(input: any?): any
    return run_owner("second", input)
end

return { first = first, second = second }
