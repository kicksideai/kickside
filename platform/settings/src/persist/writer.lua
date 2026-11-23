-- The canonical settings writer: the ONLY module that mutates an override. Every
-- edit (the contract's set/unset, the admin PUT endpoint) flows through here, so
-- there is a single write path. Each mutation validates against the declaration,
-- persists to kickside_settings with a revision bump in one transaction, updates
-- this node's store.memory cache, and publishes the revision so every other node
-- reloads. It also owns the bulk DB read used to warm the cache (boot, cold-cache
-- reload, and change propagation), since it is the layer that holds DB access.

local sql = require("sql")
local json = require("json")
local time = require("time")
local defs = require("settings_defs")
local cache = require("settings_cache")
local secrets = require("settings_secrets")
local settings_types = require("settings_types")
local changes = require("settings_changes")
local logger = require("logger")

local log = logger:named("kickside.settings.writer")

local M = {}

local function combine(ns: any, key: any): string
    return tostring(ns) .. "\0" .. tostring(key)
end

-- A secret value_type is stored AES-encrypted in the value column; everything
-- else is stored as plain JSON.
local function is_secret(value_type: any): boolean
    return settings_types.SECRET_TYPES[value_type] == true
end

local function equal_value(left: any, right: any): boolean
    if type(left) ~= "table" or type(right) ~= "table" then return left == right end
    for key, value in pairs(left) do
        if not equal_value(value, right[key]) then return false end
    end
    for key in pairs(right) do
        if left[key] == nil then return false end
    end
    return true
end

-- Check the declared enum and optional validate_func before persisting. The
-- func id is declarative (meta.validate_func on the definition); it receives the
-- key/value/old_value/definition and returns either (ok, err) or a
-- { valid, error } table. funcs.call returns (result, err) — a non-nil err is a
-- dispatch failure (missing/erroring func), which rejects the write. A reachable
-- func that reports invalid rejects with its message. Returns (true) when
-- the value is accepted, else (false, message).
local function run_validate(def: settings_types.Definition, value: settings_types.SettingValue, old_value: settings_types.SettingValue): (boolean, string?)
    if not defs.structured_schema(def) and type(def.schema) == "table" and type(def.schema.enum) == "table" then
        local matched = false
        for _, allowed in ipairs(def.schema.enum) do
            if equal_value(value, allowed) then matched = true; break end
        end
        if not matched then return false, "value is not in the declared enum" end
    end
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

local function read_revision(dbh: any): (number?, any?)
    local rows, qerr = dbh:query("SELECT revision FROM kickside_settings_revision WHERE id = 1", {})
    if qerr then return nil, qerr end
    local row = rows and rows[1]
    if not row or row.revision == nil then return nil, "settings revision row is missing" end
    return tonumber(row.revision), nil
end

-- stored_revision returns the committed override revision.
function M.stored_revision(): (number?, any?)
    local db, err = sql.get(settings_types.db_id())
    if err then return nil, err end
    if not db then return nil, "settings db unavailable" end
    local dbh = db :: sql.DB
    local revision, rerr = read_revision(dbh)
    dbh:release()
    return revision, rerr
end

-- reload reads every override row from the DB into the cache and returns the
-- resulting map. The bootloader calls it at boot, reads call it on a cold cache,
-- and the change keeper calls it when another node commits a newer revision.
-- The revision is read before the rows, so the cache never claims a revision
-- newer than the rows it holds.
local function load_overrides(): (settings_types.OverrideMap?, number?, any?)
    local db, err = sql.get(settings_types.db_id())
    if err then return nil, nil, err end
    if not db then return nil, nil, "settings db unavailable" end
    local dbh = db :: sql.DB
    local revision, rerr = read_revision(dbh)
    if rerr then
        dbh:release()
        return nil, nil, rerr
    end
    local rows, qerr = dbh:query(
        "SELECT namespace, key, value, value_type, updated_by, updated_at, revision FROM kickside_settings", {})
    dbh:release()
    if qerr then return nil, nil, qerr end

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
            -- A nested null can determine whether an override matches its
            -- current declaration, including after a schema change.
            local decode = r.value_type == "json" and json.decode_with_nulls or json.decode
            value, load_err = decode(stored)
        end
        local row_value_type: string? = (type(r.value_type) == "string") and (r.value_type :: string) or nil
        local row_updated_by: string? = (type(r.updated_by) == "string") and (r.updated_by :: string) or nil
        local rec: settings_types.OverrideRecord = {
            value = value, value_type = row_value_type,
            error = load_err and tostring(load_err) or nil,
            updated_by = row_updated_by, updated_at = r.updated_at,
            revision = tonumber(r.revision) or 0,
        }
        map[combine(r.namespace, r.key)] = rec
    end
    return map, revision, nil
end

function M.reload(): (settings_types.OverrideMap?, any?)
    local map, revision, err = load_overrides()
    if not map then return nil, err end
    local replaced, cerr = cache.replace(map, revision :: number)
    if not replaced then return nil, cerr end
    return map
end

-- warm serves a cold read. It fills only an empty cache, so a slow read never
-- replaces a newer snapshot, and returns the snapshot the cache then holds.
function M.warm(): (settings_types.OverrideMap?, any?)
    local map, revision, err = load_overrides()
    if not map then return nil, err end
    local filled, cerr = cache.fill(map, revision :: number)
    if not filled then return nil, cerr end
    return cache.read() or map
end

-- A write that names the revision it expects of its key. The key's revision is the
-- committed settings revision of its last write; a key without an override is at
-- revision 0.
type Expectation = { namespace: string, key: string, revision: number }

-- Outcome of a write: the revision of the key afterwards, or, when the expectation
-- failed, the revision it stands at.
type Outcome = { revision: number, conflict: boolean? }

local function key_revision(dbh: any, ns: any, key: any): (number?, any?)
    local rows, qerr = dbh:query("SELECT revision FROM kickside_settings WHERE namespace = $1 AND key = $2", { ns, key })
    if qerr then return nil, qerr end
    local row = rows and rows[1]
    if not row then return 0, nil end
    return tonumber(row.revision) or 0, nil
end

-- commit runs one override mutation and the revision bump in a transaction and
-- returns the new revision. The bump comes first: it takes the revision row, so
-- writers are serialized and the expectation is checked against the state the
-- mutation then changes. A failed expectation rolls the transaction back and
-- answers the key's current revision. mutation builds the statement and its
-- parameters from the new revision.
local function commit(mutation: (number) -> (string, { any }), expect: Expectation?): (number?, any?, number?)
    local db, err = sql.get(settings_types.db_id())
    if err or not db then return nil, "settings db unavailable" end
    local dbh = db :: sql.DB
    local tx, terr = dbh:begin()
    if terr or not tx then
        dbh:release()
        return nil, "settings write failed: " .. tostring(terr)
    end
    local _, xerr = tx:execute("UPDATE kickside_settings_revision SET revision = revision + 1 WHERE id = 1", {})
    local revision: number? = nil
    if not xerr then revision, xerr = read_revision(tx) end
    if not xerr and expect then
        local current, kerr = key_revision(tx, expect.namespace, expect.key)
        if kerr then
            xerr = kerr
        elseif current ~= expect.revision then
            tx:rollback()
            dbh:release()
            return nil, nil, current
        end
    end
    if not xerr then
        local statement, params = mutation(revision :: number)
        _, xerr = tx:execute(statement, params)
    end
    if xerr then
        tx:rollback()
        dbh:release()
        return nil, "settings write failed: " .. tostring(xerr)
    end
    local _, cerr = tx:commit()
    dbh:release()
    if cerr then return nil, "settings write failed: " .. tostring(cerr) end
    return revision, nil
end

-- apply updates this node's cache after a commit at revision. The local change
-- applies in place only when no other write committed in between; otherwise the
-- cache reloads every row. Every node then learns the revision.
local function apply(map: settings_types.OverrideMap, cached_revision: number?, revision: number): (boolean, any?)
    local updated, cerr = false, nil
    if cached_revision == revision - 1 then
        updated, cerr = cache.replace(map, revision)
    else
        local reloaded, rerr = M.reload()
        updated, cerr = reloaded ~= nil, rerr
    end
    local _, perr = changes.publish(revision)
    if perr then
        -- The change is committed; nodes that miss this revision reload on the next
        -- change or when cluster membership changes.
        log:error("settings change publication failed", { revision = revision, error = tostring(perr) })
    end
    if not updated then return false, cerr end
    return true
end

-- expectation builds the precondition of a write that names the revision it read,
-- or nil for an unconditional write.
local function expectation(ns: any, key: any, expected: any): (Expectation?, any?)
    if expected == nil then return nil, nil end
    if type(expected) ~= "number" or expected < 0 or expected % 1 ~= 0 then
        return nil, "expected_revision must be a non-negative integer"
    end
    return { namespace = ns, key = key, revision = expected }, nil
end

local function conflict(revision: number): (boolean, string, Outcome)
    return false, "settings revision conflict", { conflict = true, revision = revision }
end

-- set validates the value against the declaration, upserts the override row, and
-- updates the cache. Returns (false, error) on an unknown/non-editable key or a
-- type mismatch. With expected_revision the write applies only while the override
-- stands at that revision (0 = none): otherwise it returns (false, error,
-- { conflict = true, revision = current }) and changes nothing. A write answers
-- the revision of the override it stored.
function M.set(ns: any, key: any, value: any, actor_id: any, expected_revision: any?): (boolean, any?, Outcome?)
    if type(actor_id) ~= "string" or actor_id == "" then return false, "authenticated actor is required" end
    local def = defs.find(ns, key)
    if not def then return false, "undeclared setting" end
    if not def.editable then return false, "setting is not editable" end
    local expect, eerr0 = expectation(ns, key, expected_revision)
    if eerr0 then return false, eerr0 end
    local typed, cerr = defs.coerce(def, value)
    if cerr then return false, cerr end

    local map = cache.read()
    if not map then
        local reloaded, rerr = M.reload()
        if not reloaded then return false, rerr end
        map = reloaded
    end
    local setting_id = combine(ns, key)
    local prev_rec = map[setting_id]
    if expect and def.validate_func and (prev_rec and prev_rec.revision or 0) ~= expect.revision then
        -- The caller may have read on a node whose cache is ahead of ours.
        -- Validate the transition from the revision the caller actually read.
        local reloaded, rerr = M.reload()
        if not reloaded then return false, rerr end
        map = reloaded
        prev_rec = map[setting_id]
        local current = prev_rec and prev_rec.revision or 0
        if current ~= expect.revision then return conflict(current) end
    end
    local cached_revision = cache.revision()

    -- Pass the previous effective value so a validate_func can compare transitions.
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

    local now = time.now():utc():format_rfc3339()
    local revision, xerr, current = commit(function(new_revision: number): (string, { any })
        return [[
            INSERT INTO kickside_settings (namespace, key, value, value_type, updated_by, updated_at, revision)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (namespace, key) DO UPDATE SET
                value = excluded.value, value_type = excluded.value_type,
                updated_by = excluded.updated_by, updated_at = excluded.updated_at,
                revision = excluded.revision
        ]], { ns, key, stored, def.value_type, actor_id, now, new_revision }
    end, expect)
    if current ~= nil then return conflict(current) end
    if xerr or not revision then return false, xerr end

    map[setting_id] = {
        value = typed, value_type = def.value_type,
        updated_by = actor_id, updated_at = now, revision = revision,
    }
    local applied, aerr = apply(map, cached_revision, revision)
    return applied, aerr, { revision = revision }
end

-- clear removes an override (revert to the declared default) from DB + cache. With
-- expected_revision it follows the rule of set.
function M.clear(ns: any, key: any, actor_id: any, expected_revision: any?): (boolean, any?, Outcome?)
    if type(actor_id) ~= "string" or actor_id == "" then return false, "authenticated actor is required" end
    local expect, eerr = expectation(ns, key, expected_revision)
    if eerr then return false, eerr end
    local map = cache.read()
    if not map then
        local reloaded, rerr = M.reload()
        if not reloaded then return false, rerr end
        map = reloaded
    end
    local cached_revision = cache.revision()
    local revision, xerr, current = commit(function(): (string, { any })
        return "DELETE FROM kickside_settings WHERE namespace = $1 AND key = $2", { ns, key }
    end, expect)
    if current ~= nil then return conflict(current) end
    if xerr or not revision then return false, xerr end

    map[combine(ns, key)] = nil
    local applied, aerr = apply(map, cached_revision, revision)
    return applied, aerr, { revision = 0 }
end

return M
