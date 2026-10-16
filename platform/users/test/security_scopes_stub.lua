-- Assignable scope catalog and native failure fixture for the Users harness.
local sql = require("sql")
local json = require("json")

local function configured_response(): (any?, error?)
    local db, db_err = sql.get("app:db")
    if db_err then return nil, db_err end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS users_catalog_failure (id INTEGER PRIMARY KEY, payload TEXT NOT NULL)")
    if create_err then db:release(); return nil, create_err end
    local rows, read_err = db:query("SELECT payload FROM users_catalog_failure WHERE id=1")
    db:release()
    if read_err then return nil, read_err end
    if #rows == 0 then return nil, nil end
    local fields, decode_err = json.decode(rows[1].payload)
    if decode_err then return nil, decode_err end
    return fields, nil
end

local function list(args: any): (any?, error?)
    local configured, read_err = configured_response()
    if read_err then return nil, read_err end
    if configured then
        if configured.error then return nil, errors.new(configured.error) end
        return configured.result, nil
    end
    args = type(args) == "table" and args or {}
    local scopes: { any } = {
        { id = "app.security:user", label = "User", internal = false, enabled = true },
        { id = "kickside.security.scopes:editors", label = "Editors", internal = false, enabled = true },
    }
    if args.include_internal == true then
        scopes[#scopes + 1] = { id = "app.security:ingress", label = "Ingress", internal = true, enabled = true }
    end
    return { scopes = scopes }
end

return { list = list }
