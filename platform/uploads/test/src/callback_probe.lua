local sql = require("sql")

local M = {}

local function text(value: any): string
    if type(value) ~= "string" then return "" end
    return value
end

function M.handle(params: any): any
    params = type(params) == "table" and params or {}
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, "db unavailable: " .. tostring(db_err) end
    db:execute([[CREATE TABLE IF NOT EXISTS upload_callback_probe (
        upload_id TEXT NOT NULL,
        status TEXT NOT NULL,
        trace_id TEXT
    )]])
    local trace = type(params.trace_context) == "table" and params.trace_context or {}
    local _, err = db:execute(
        "INSERT INTO upload_callback_probe(upload_id, status, trace_id) VALUES ($1, $2, $3)",
        { text(params.upload_id), text(params.status), text(trace.trace_id) }
    )
    db:release()
    if err then return nil, tostring(err) end
    return { success = true }
end

return M
