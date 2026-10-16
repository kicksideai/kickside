-- The canonical profile persist layer: the only module that reads/mutates
-- per-user value rows. Each mutation validates against the declaration and
-- upserts into kickside_profile. Unlike kickside.settings there is no global
-- in-memory cache: profile values are per-user and unbounded across users, so
-- reads query the DB scoped to a single (user_id, namespace) instead of warming
-- the whole table at boot.

local sql = require("sql")
local json = require("json")
local time = require("time")
local defs = require("profile_defs")
local profile_types = require("profile_types")

local M = {}

-- Run a declaration's optional validate_func before a change is persisted. The
-- func id is declarative (validate_func on the definition); it receives the
-- key/value/old_value/definition and returns either (ok, err) or a
-- { valid, error } table. funcs.call returns (result, err) — a non-nil err is a
-- dispatch failure (missing/erroring func), which rejects the write.
local function run_validate(def: profile_types.Definition, value: profile_types.ProfileValue, old_value: profile_types.ProfileValue): (boolean, string?)
    local fn = def.validate_func
    if type(fn) ~= "string" or fn == "" then return true end
    local funcs = require("funcs")
    local res, cerr = funcs.call(fn :: string, {
        key = def.key, value = value, old_value = old_value, definition = def })
    if cerr then return false, "validation failed: " .. tostring(cerr) end
    if type(res) == "table" then
        local r = res :: { valid: any, error: any }
        if r.valid == false then
            return false, (type(r.error) == "string") and (r.error :: string) or "invalid value"
        end
        return true
    end
    if res == false then return false, "invalid value" end
    return true
end

local function decode_row(r: { [string]: any }): profile_types.ValueRecord
    local row_value_type: string? = (type(r.value_type) == "string") and (r.value_type :: string) or nil
    return {
        value = json.decode(tostring(r.value)),
        value_type = row_value_type,
        updated_at = r.updated_at,
    }
end

-- A failed value read, typed and retryable: storage trouble, never a default.
local function read_failure(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = errors.INTERNAL, retryable = true }) :: error)
end

-- read_value returns one user's stored record for (namespace, key), nil when no
-- override row exists (the caller then uses the declared default), or a typed
-- error when the read itself fails.
function M.read_value(user_id: string, ns: any, key: any): (profile_types.ValueRecord?, error?)
    local db, err = sql.get(profile_types.db_id())
    if err or not db then return nil, read_failure("profile db unavailable", err) end
    local dbh = db :: sql.DB
    local rows, qerr = dbh:query(
        "SELECT value, value_type, updated_at FROM kickside_profile WHERE user_id = $1 AND namespace = $2 AND key = $3",
        { user_id, ns, key })
    dbh:release()
    if qerr then return nil, read_failure("profile query failed", qerr) end
    local row = rows and rows[1]
    if not row then return nil, nil end
    return decode_row(row :: { [string]: any }), nil
end

-- read_namespace returns the override map (key -> record) for one user's
-- namespace, or a typed error when the read fails. Used by get_namespace and list.
function M.read_namespace(user_id: string, ns: any): (profile_types.ValueMap?, error?)
    local db, err = sql.get(profile_types.db_id())
    if err or not db then return nil, read_failure("profile db unavailable", err) end
    local dbh = db :: sql.DB
    local rows, qerr = dbh:query(
        "SELECT key, value, value_type, updated_at FROM kickside_profile WHERE user_id = $1 AND namespace = $2",
        { user_id, ns })
    dbh:release()
    if qerr then return nil, read_failure("profile query failed", qerr) end
    local map: profile_types.ValueMap = {}
    for _, row in ipairs(rows or {}) do
        local r = row :: { [string]: any }
        if type(r.key) == "string" then
            map[r.key :: string] = decode_row(r)
        end
    end
    return map, nil
end

-- set validates the value against the declaration and upserts the user's row.
function M.set(user_id: any, ns: any, key: any, value: any): (boolean, string?)
    if type(user_id) ~= "string" or user_id == "" then return false, "authenticated actor is required" end
    local def = defs.find(ns, key)
    if not def then return false, "undeclared profile field" end
    if not def.editable then return false, "profile field is not editable" end
    local typed, cerr = defs.coerce(def, value)
    if cerr then return false, cerr end

    local prev, read_err = M.read_value(user_id :: string, ns, key)
    if read_err then return false, tostring(read_err) end
    local old_value = prev and prev.value or def.default
    local vok, verr = run_validate(def, typed, old_value)
    if not vok then return false, verr end

    local db, err = sql.get(profile_types.db_id())
    if err or not db then return false, "profile db unavailable" end
    local dbh = db :: sql.DB
    local now = time.now():utc():format_rfc3339()
    local _, xerr = dbh:execute([[
        INSERT INTO kickside_profile (user_id, namespace, key, value, value_type, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, namespace, key) DO UPDATE SET
            value = excluded.value, value_type = excluded.value_type,
            updated_at = excluded.updated_at
    ]], { user_id, ns, key, json.encode(typed), def.value_type, now })
    dbh:release()
    if xerr then return false, "profile write failed: " .. tostring(xerr) end
    return true
end

-- clear removes a user's value row (revert to the declared default).
function M.clear(user_id: any, ns: any, key: any): (boolean, string?)
    if type(user_id) ~= "string" or user_id == "" then return false, "authenticated actor is required" end
    local def = defs.find(ns, key)
    if not def then return false, "undeclared profile field" end
    if not def.editable then return false, "profile field is not editable" end
    local db, err = sql.get(profile_types.db_id())
    if err or not db then return false, "profile db unavailable" end
    local dbh = db :: sql.DB
    local _, xerr = dbh:execute(
        "DELETE FROM kickside_profile WHERE user_id = $1 AND namespace = $2 AND key = $3", { user_id, ns, key })
    dbh:release()
    if xerr then return false, tostring(xerr) end
    return true
end

function M.delete_for_user(user_id: any): (boolean, string?)
    if type(user_id) ~= "string" or user_id == "" then return false, "user_id is required" end
    local db, err = sql.get(profile_types.db_id())
    if err or not db then return false, "profile db unavailable" end
    local dbh = db :: sql.DB
    local _, xerr = dbh:execute("DELETE FROM kickside_profile WHERE user_id = $1", { user_id })
    dbh:release()
    if xerr then return false, tostring(xerr) end
    return true
end

function M.cleanup_principal(args: any): any
    local user_id = type(args) == "table" and tostring((args :: any).user_id or (args :: any).principal_id or "") or ""
    local ok, err = M.delete_for_user(user_id)
    if not ok then return { success = false, error = err } end
    return { success = true }
end

return M
