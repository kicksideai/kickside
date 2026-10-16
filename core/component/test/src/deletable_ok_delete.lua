-- Harness deletable that reports a successful cleanup and records the call, so the
-- declared-deletable happy path (opens cleanly, cleanup succeeds) is a real, observable
-- teardown in the component test harness.

local sql = require("sql")

local CTL = "deletable_ok_ctl"

local function handle(_request: any): any
    local db, err = sql.get("app:db")
    if err or not db then
        return { success = false, error = tostring(err or "database unavailable") }
    end

    local id_column = db:type() == sql.type.POSTGRES
        and "BIGSERIAL PRIMARY KEY"
        or "INTEGER PRIMARY KEY AUTOINCREMENT"
    local _, create_err = db:execute(
        "CREATE TABLE IF NOT EXISTS " .. CTL .. " (id " .. id_column .. ", at INTEGER)"
    )
    if create_err then
        db:release()
        return { success = false, error = tostring(create_err) }
    end

    local _, insert_err = db:execute("INSERT INTO " .. CTL .. " (at) VALUES (1)")
    db:release()
    if insert_err then
        return { success = false, error = tostring(insert_err) }
    end
    return { success = true }
end

return { handle = handle }
