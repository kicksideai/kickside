local sql = require("sql")
local security = require("security")

-- Harness realtime binding: records each broadcast with the authorization
-- decision the runtime binding applies and refuses it the same way.
local M = {}

function M.broadcast(args: any): any
    local topic = tostring(type(args) == "table" and args.topic or "")
    local authorized = security.can("realtime.broadcast", "kickside.realtime:" .. topic) == true
        or security.can("realtime.broadcast", "kickside.realtime:broadcast") == true
    local db, db_err = sql.get("app:db")
    if db_err or not db then return { success = false, error = tostring(db_err) } end
    local _, table_err = db:execute("CREATE TABLE IF NOT EXISTS ui_nav_broadcasts (topic TEXT NOT NULL, authorized TEXT NOT NULL)")
    if table_err then db:release(); return { success = false, error = tostring(table_err) } end
    local _, insert_err = db:execute("INSERT INTO ui_nav_broadcasts (topic, authorized) VALUES ($1, $2)",
        { topic, authorized and "yes" or "no" })
    db:release()
    if insert_err then return { success = false, error = tostring(insert_err) } end
    if not authorized then return { success = false, error = "access denied" } end
    return { success = true }
end

function M.notify(): any
    return { success = false, error = "nav configuration never targets one user" }
end

return M
