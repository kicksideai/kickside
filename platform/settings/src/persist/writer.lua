-- The canonical settings writer: the ONLY module that mutates an override. Every
-- edit (the contract's set/unset, the admin PUT endpoint) flows through here, so
-- there is a single write path. Each mutation validates against the declaration,
-- persists to kickside_settings, and updates the store.memory cache write-through.
-- It also owns the bulk DB read used to warm the cache (boot + cold-cache reload),
-- since it is the layer that holds DB access.

local sql = require("sql")
local json = require("json")
local time = require("time")
local defs = require("settings_defs")
local cache = require("settings_cache")
local secrets = require("settings_secrets")
local settings_types = require("settings_types")

local M = {}

local function combine(ns: any, key: any): string
    return tostring(ns) .. "\0" .. tostring(key)
end

-- A secret value_type is stored AES-encrypted in the value column; everything
-- else is stored as plain JSON.
local function is_secret(value_type: any): boolean
    return settings_types.SECRET_TYPES[value_type] == true
end

-- Run a declaration's optional validate_func before a change is persisted. The
-- func id is declarative (meta.validate_func on the definition); it receives the
-- key/value/old_value/definition and returns either (ok, err) or a
-- { valid, error } table. funcs.call returns (result, err) — a non-nil err is a
-- dispatch failure (missing/erroring func), which rejects the write. A reachable
-- func that reports invalid rejects with its message. Returns (true) when there
-- is no validate_func or the value is accepted, else (false, message).
local function run_validate(def: settings_types.Definition, value: settings_types.SettingValue, old_value: settings_types.SettingValue): (boolean, string?)
    local fn = def.validate_func
    if type(fn) ~= "string" or fn == "" then return true end
    local funcs = require("funcs")
    local res, cerr = funcs.call(fn :: string, {
        key = def.key, value = value, old_value = old_value, definition = def })
    if cerr then return false, "validation failed: " .. tostring(cerr) end
    -- Accept either a (ok, err) shape (res is the ok boolean) or a result table
    -- carrying { valid, error }.
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

-- reload reads every override row from the DB into the cache and returns the
-- resulting map. The bootloader calls this once at boot; reads call it on a cold
-- cache. Reads never hit the DB once the cache is warm.
function M.reload(): (settings_types.OverrideMap?, any?)
    local db, err = sql.get(settings_types.db_id())
    if err then return nil, err end
    if not db then return nil, "settings db unavailable" end
    local dbh = db :: sql.DB
    local rows, qerr = dbh:query(
        "SELECT namespace, key, value, value_type, updated_by, updated_at FROM kickside_settings", {})
    dbh:release()
    if qerr then return nil, qerr end

    local map: settings_types.OverrideMap = {}
    for _, row in ipairs(rows or {}) do
        local r = row :: { [string]: any }
        local stored = tostring(r.value)
        local load_err: any = nil
        -- Secrets are encrypted at rest: decrypt to plaintext JSON before decode.
        if is_secret(r.value_type) then
            local plain, derr = secrets.decrypt(stored)
            load_err = derr
            if not derr then stored = plain :: string end
        end
        local value: any = nil
        if not load_err then
            local decoded, derr = json.decode(stored)
            value = decoded
            load_err = derr
        end
        local row_value_type: string? = (type(r.value_type) == "string") and (r.value_type :: string) or nil
        local row_updated_by: string? = (type(r.updated_by) == "string") and (r.updated_by :: string) or nil
        local rec: settings_types.OverrideRecord = {
            value = value, value_type = row_value_type,
            error = load_err and tostring(load_err) or nil,
            updated_by = row_updated_by, updated_at = r.updated_at,
        }
        map[combine(r.namespace, r.key)] = rec
    end
    cache.replace(map)
    return map
end

-- set validates the value against the declaration, upserts the override row, and
-- updates the cache. Returns (false, error) on an unknown/non-editable key or a
-- type mismatch.
function M.set(ns: any, key: any, value: any, actor_id: any): (boolean, any?)
    if type(actor_id) ~= "string" or actor_id == "" then return false, "authenticated actor is required" end
    local def = defs.find(ns, key)
    if not def then return false, "undeclared setting" end
    if not def.editable then return false, "setting is not editable" end
    local typed, cerr = defs.coerce(def, value)
    if cerr then return false, cerr end

    local map = cache.read()
    if not map then
        local reloaded, rerr = M.reload()
        if not reloaded then return false, rerr end
        map = reloaded
    end

    -- Declarative on-change validation: the previous override value (nil = still
    -- the declared default) is passed so a validate_func can compare transitions.
    local prev_rec = map[combine(ns, key)]
    if prev_rec and prev_rec.error then return false, prev_rec.error end
    local old_value = def.default
    if prev_rec ~= nil then old_value = (prev_rec :: any).value end
    local vok, verr = run_validate(def, typed, old_value)
    if not vok then return false, verr end

    -- Serialize for storage; secrets are encrypted at rest.
    local stored = json.encode(typed)
    if is_secret(def.value_type) then
        local enc, eerr = secrets.encrypt(stored)
        if not enc then return false, eerr end
        stored = enc :: string
    end

    local db, err = sql.get(settings_types.db_id())
    if err or not db then return false, "settings db unavailable" end
    local dbh = db :: sql.DB
    local now = time.now():utc():format_rfc3339()
    local _, xerr = dbh:execute([[
        INSERT INTO kickside_settings (namespace, key, value, value_type, updated_by, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (namespace, key) DO UPDATE SET
            value = excluded.value, value_type = excluded.value_type,
            updated_by = excluded.updated_by, updated_at = excluded.updated_at
    ]], { ns, key, stored, def.value_type, actor_id, now })
    dbh:release()
    if xerr then return false, "settings write failed: " .. tostring(xerr) end

    map[combine(ns, key)] = {
        value = typed, value_type = def.value_type,
        updated_by = actor_id, updated_at = now,
    }
    cache.replace(map)
    return true
end

-- clear removes an override (revert to the declared default) from DB + cache.
function M.clear(ns: any, key: any, actor_id: any): (boolean, any?)
    if type(actor_id) ~= "string" or actor_id == "" then return false, "authenticated actor is required" end
    local map = cache.read()
    if not map then
        local reloaded, rerr = M.reload()
        if not reloaded then return false, rerr end
        map = reloaded
    end
    local db, err = sql.get(settings_types.db_id())
    if err or not db then return false, "settings db unavailable" end
    local dbh = db :: sql.DB
    local _, xerr = dbh:execute(
        "DELETE FROM kickside_settings WHERE namespace = $1 AND key = $2", { ns, key })
    dbh:release()
    if xerr then return false, tostring(xerr) end

    map[combine(ns, key)] = nil
    cache.replace(map)
    return true
end

return M
