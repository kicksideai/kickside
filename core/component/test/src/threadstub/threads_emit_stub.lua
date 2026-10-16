local sql = require("sql")

-- Harness-local kickside.core:threads emit. The real threads slice is not loaded in the
-- component test harness, so this records each append into the thread_emit_log table:
-- one row per emit carrying the target component_id, event type, and external id. A test
-- reads the log to prove emit_singleton_event folded singleton-id resolution + contract
-- open + append into a single call against the right component thread.
local M = {}

local DB = "app:db"
local LOG = "thread_emit_log"

local function ensure(db: any): ()
    local seq_column = db:type() == sql.type.POSTGRES
        and "seq BIGSERIAL PRIMARY KEY"
        or "seq INTEGER PRIMARY KEY AUTOINCREMENT"
    db:execute("CREATE TABLE IF NOT EXISTS " .. LOG ..
        " (" .. seq_column .. ", component_id TEXT, type TEXT, external_id TEXT)")
end

function M.emit(args: any): (any?, any)
    args = type(args) == "table" and args or {}
    local component_id = type(args.component_id) == "string" and args.component_id or ""
    local etype = type(args.type) == "string" and args.type or ""
    local external = type(args.external) == "table" and args.external or {}
    local external_id = type((external :: any).external_id) == "string" and (external :: any).external_id or ""

    local db, db_err = sql.get(DB)
    if db_err or not db then return nil, "db unavailable: " .. tostring(db_err) end
    ensure(db)
    db:execute("INSERT INTO " .. LOG .. " (component_id, type, external_id) VALUES ($1, $2, $3)",
        { component_id, etype, external_id })
    db:release()

    return { inserted = 1, event_id = component_id .. ":" .. external_id }, nil
end

return M
