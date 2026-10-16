-- A scratch database built from the real migrations, both engines. PostgreSQL
-- recreates the test database suffixed _mig (the app:migration_db override):
-- the migration ledger lives in its database's public schema. SQLite drops
-- every table of the app:migration_db file.
local sql = require("sql")
local funcs = require("funcs")
local test = require("test")

local MIGRATION_DB = "app:migration_db"

local M = {}

local function scratch(): sql.DB
    local db, err = sql.get(MIGRATION_DB)
    if err or not db then error("migration db unavailable: " .. tostring(err)) end
    return db :: sql.DB
end

local function with_shared(fn: (sql.DB) -> ())
    local shared, err = sql.get("app:db")
    if err or not shared then error("shared db unavailable: " .. tostring(err)) end
    fn(shared :: sql.DB)
    shared:release()
end

local function pg_scratch_name(shared: sql.DB): string
    local rows, err = shared:query("SELECT current_database() AS name")
    if err or not rows or not rows[1] then error("current database unknown: " .. tostring(err)) end
    return "\"" .. tostring(rows[1].name):gsub("\"", "\"\"") .. "_mig\""
end

function M.postgres(): boolean
    local kind = ""
    with_shared(function(shared)
        local dbtype, err = shared:type()
        if err then error(tostring(err)) end
        kind = tostring(dbtype)
    end)
    return kind == sql.type.POSTGRES
end

function M.reset(encoding: string?)
    if M.postgres() then
        with_shared(function(shared)
            local name = pg_scratch_name(shared)
            local _, drop_err = shared:execute("DROP DATABASE IF EXISTS " .. name .. " WITH (FORCE)")
            if drop_err then error("scratch database drop: " .. tostring(drop_err)) end
            local options = encoding and (" TEMPLATE template0 ENCODING '" .. encoding:gsub("'", "''") .. "'") or ""
            local _, create_err = shared:execute("CREATE DATABASE " .. name .. options)
            if create_err then error("scratch database create: " .. tostring(create_err)) end
        end)
        return
    end
    local db = scratch()
    local _, fk_err = db:execute("PRAGMA foreign_keys = OFF")
    if fk_err then db:release(); error(tostring(fk_err)) end
    local rows, err = db:query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    if err then db:release(); error(tostring(err)) end
    for _, row in ipairs(rows or {}) do
        local _, drop_err = db:execute("DROP TABLE IF EXISTS " .. tostring(row.name))
        if drop_err then db:release(); error(tostring(drop_err)) end
    end
    local _, restore_err = db:execute("PRAGMA foreign_keys = ON")
    if restore_err then db:release(); error(tostring(restore_err)) end
    db:release()
end

function M.drop()
    if not M.postgres() then return end
    with_shared(function(shared)
        local _, err = shared:execute("DROP DATABASE IF EXISTS " .. pg_scratch_name(shared) .. " WITH (FORCE)")
        if err then error("scratch database drop: " .. tostring(err)) end
    end)
end

function M.migrate(entry: string, direction: string?)
    local dir = direction or "up"
    local result, err = funcs.new():call(entry, { database_id = MIGRATION_DB, direction = dir, id = entry })
    if err then error("migration " .. entry .. " call failed: " .. tostring(err)) end
    test.eq(result.status, "complete", "migration " .. entry .. " " .. dir .. ": " .. tostring(result.error))
end

function M.query(statement: string, params: { any }?): { table }
    local db = scratch()
    local rows, err = db:query(statement, params or {})
    db:release()
    if err then error("scratch query failed (" .. statement .. "): " .. tostring(err)) end
    return rows :: { table }
end

function M.exec(statement: string, params: { any }?)
    local db = scratch()
    local _, err = db:execute(statement, params or {})
    db:release()
    if err then error("scratch statement failed (" .. statement .. "): " .. tostring(err)) end
end

return M
