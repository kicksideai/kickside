local sql = require("sql")
type Map = { [string]: any }
local M = { EVENT_TYPE = "kickside.load:event" }
function M.fail(message: string): never
    error(message)
end
function M.open_db(): sql.DB
    local db, err = sql.get("app:db")
    if err or not db then error(tostring(err)) end
    return db
end
function M.execute(statement: string, params: { any }?): any
    local db = M.open_db()
    local result, err = db:execute(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
    return result
end
function M.query(statement: string, params: { any }?): { Map }
    local db = M.open_db()
    local rows, err = db:query(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
    return rows :: { Map }
end
function M.state_get(key: string): string
    local rows = M.query("SELECT value FROM kickside_lod_state WHERE key=$1", { key })
    return rows[1] and tostring(rows[1].value) or ""
end
function M.state_set(key: string, value: string): ()
    M.execute("INSERT INTO kickside_lod_state(key,value) VALUES($1,$2)"
        .. " ON CONFLICT(key) DO UPDATE SET value=excluded.value", {key, value})
end
function M.setup(): ()
    M.execute("CREATE TABLE IF NOT EXISTS kickside_lod_state(key TEXT PRIMARY KEY,value TEXT NOT NULL)")
    M.execute("CREATE TABLE IF NOT EXISTS kickside_lod_provider_receipt(automation_id TEXT NOT NULL,"
        .. "item_key TEXT NOT NULL,observed_at TEXT NOT NULL,PRIMARY KEY(automation_id,item_key))")
    M.execute("CREATE TABLE IF NOT EXISTS kickside_lod_page_observation(automation_id TEXT NOT NULL,"
        .. "drive_key TEXT NOT NULL,item_count INTEGER NOT NULL,observed_at TEXT NOT NULL)")
    for _, name in ipairs({"kickside_lod_state", "kickside_lod_provider_receipt", "kickside_lod_page_observation"}) do
        M.execute("DELETE FROM " .. name)
    end
    M.state_set("reference_id", "load-reference")
end
return M
