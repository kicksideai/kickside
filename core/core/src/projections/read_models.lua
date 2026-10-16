-- Read-only boundary for committed materialized views. It exposes projection
-- bodies only: no event log, cursor, lag, catch-up, replay, or worker controls.

local sql = require("sql")
local json = require("json")

local core_db = require("core_db")
local component = require("component")
local core_types = require("core_types")

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function failure(message: string, kind: any): error
    return (errors.new({ message = message, kind = kind }) :: error)
end

function M.get(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local owner_id = trim((args :: any).owner_id)
    local kind = trim((args :: any).kind)
    local projection_key = trim((args :: any).projection_key)
    if owner_id == "" then return nil, failure("owner_id is required", errors.INVALID) end
    if kind == "" then return nil, failure("kind is required", errors.INVALID) end
    if projection_key == "" then projection_key = "default" end

    local allowed, access_err = component.has_access(owner_id, core_types.ACCESS.READ)
    if access_err then return nil, access_err end
    if not allowed then return nil, failure("read access denied", errors.PERMISSION_DENIED) end

    local db, db_err = sql.get(core_db.id())
    if db_err then return nil, (errors.wrap(db_err, "read-model database unavailable") :: error) end
    if not db then return nil, failure("read-model database unavailable", errors.UNAVAILABLE) end
    local rows, query_err = db:query([[
        SELECT body
          FROM kickside_projection
         WHERE thread_id = $1 AND kind = $2 AND projection_key = $3
         LIMIT 1
    ]], { owner_id, kind, projection_key })
    db:release()
    if query_err then return nil, (errors.wrap(query_err, "failed to read materialized view") :: error) end
    if type(rows) ~= "table" or not rows[1] then return { body = {} }, nil end

    local body = (rows[1] :: any).body
    if type(body) == "string" then
        local decoded, decode_err = json.decode(body)
        if decode_err then return nil, (errors.wrap(decode_err, "invalid materialized view body") :: error) end
        body = decoded
    end
    return { body = type(body) == "table" and body or {} }, nil
end

return M
