-- DB persistence for admin-authored custom scopes (kickside_security_scopes).
-- This is the source of truth the projection service projects into security.scope
-- registry entries. The store never writes the registry itself.

local sql = require("sql")
local json = require("json")
local time = require("time")
local consts = require("security_consts")
local composition = require("policy_composition")
local persisted_json = require("persisted_json")
local committed_error = require("committed_error")

local M = {}

local function to_bool(v: any): boolean
    return v == true or v == 1 or v == "1" or v == "t" or v == "true"
end

local function decode_row(r: { [string]: any }): (any?, error?)
    local policies, decode_err = persisted_json.decode_table(r.policies, "kickside_security_scopes.policies")
    if decode_err then return nil, decode_err end
    return {
        slug = tostring(r.slug),
        label = tostring(r.label or ""),
        description = tostring(r.description or ""),
        policies = policies,
        -- target = the built-in scope id this row extends (overlay), or "" for a
        -- net-new custom scope.
        target = (type(r.target) == "string") and r.target or "",
        internal = to_bool(r.internal),
        enabled = to_bool(r.enabled),
        created_at = r.created_at,
        updated_at = r.updated_at,
    }
end

local function open(): (sql.DB?, error?)
    local id, config_err = consts.db_id()
    if config_err then return nil, config_err end
    local db, err = sql.get(id)
    if err then return nil, err end
    if not db then return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "security scopes db unavailable"}) :: error) end
    return db :: sql.DB
end

-- list returns all custom scope rows (newest first).
function M.list(): (any, error?)
    local db, err = open()
    if not db then return nil, err end
    local dbh = db :: sql.DB
    local rows, qerr = dbh:query(
        "SELECT slug, label, description, policies, target, internal, enabled, created_at, updated_at FROM kickside_security_scopes ORDER BY slug", {})
    dbh:release()
    if qerr then return nil, qerr end
    local out = {}
    for _, row in ipairs(rows or {}) do
        local decoded, decode_err = decode_row(row :: { [string]: any })
        if decode_err then return nil, decode_err end
        out[#out + 1] = decoded
    end
    return out
end

-- list_enabled returns only enabled rows (what the projection service projects).
function M.list_enabled(): (any, error?)
    local all, err = M.list()
    if err then return nil, err end
    local out = {}
    for _, row in ipairs(all) do
        if (row :: any).enabled then out[#out + 1] = row end
    end
    return out
end

function M.get(slug: any): (any?, error?)
    if type(slug) ~= "string" or slug == "" then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "slug is required"}) :: error) end
    local db, err = open()
    if not db then return nil, err end
    local dbh = db :: sql.DB
    local rows, qerr = dbh:query(
        "SELECT slug, label, description, policies, target, internal, enabled, created_at, updated_at FROM kickside_security_scopes WHERE slug = $1", { slug })
    dbh:release()
    if qerr then return nil, (errors.wrap(qerr, "scope query failed") :: error) end
    local row = rows and rows[1]
    if not row then return nil end
    return decode_row(row :: { [string]: any })
end

local function previous_policies(db, slug, gate)
    local rows, read_err = db:query("SELECT policies FROM kickside_security_scopes WHERE slug=$1", {slug})
    if read_err then return nil, (errors.wrap(read_err, "scope mutation read failed") :: error) end
    if not rows or not rows[1] then return "", nil end
    local raw = rows[1].policies
    local policies, decode_err = persisted_json.decode_table(raw, "kickside_security_scopes.policies")
    if decode_err then return nil, decode_err end
    local _, authorization_err = composition.authorize_mutation(policies, gate, true)
    if authorization_err then return nil, authorization_err end
    return raw, nil
end

local function mutation_conflict()
    return (errors.new({kind = errors.CONFLICT, retryable = true,
        message = "scope policies change before authorized mutation", details = {code = "scope_mutation_conflict"}}) :: error)
end

-- upsert creates or updates a custom scope. policies must be a string array.
function M.upsert(args: any, _actor_id: any): (any?, error?, boolean?)
    args = args or {}
    local slug = args.slug
    if type(slug) ~= "string" or slug == "" then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "slug is required"}) :: error) end
    if not slug:match("^[%w][%w_.-]*$") then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "slug must be alphanumeric (with _.-)"}) :: error) end
    local policies = args.policies
    if type(policies) ~= "table" then policies = {} end

    local _, composition_err = composition.authorize_mutation(policies, "kickside.security.api:save_scope.endpoint")
    if composition_err then return nil, composition_err end

    local db, err = open()
    if not db then return nil, err end
    local dbh = db :: sql.DB
    local previous, previous_err = previous_policies(dbh, slug, "kickside.security.api:save_scope.endpoint")
    if previous_err then dbh:release(); return nil, previous_err end
    local encoded, encode_err = json.encode(policies)
    if encode_err then dbh:release(); return nil, (errors.wrap(encode_err, "scope policy encoding failed") :: error) end
    local now = time.now():utc():format_rfc3339()
    local written, xerr = dbh:execute([[
        INSERT INTO kickside_security_scopes (slug, label, description, policies, target, internal, enabled, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (slug) DO UPDATE SET
            label = excluded.label, description = excluded.description,
            policies = excluded.policies, target = excluded.target,
            internal = excluded.internal,
            enabled = excluded.enabled, updated_at = excluded.updated_at
        WHERE kickside_security_scopes.policies = $10
    ]], {
        slug, tostring(args.label or ""), tostring(args.description or ""),
        encoded, tostring(args.target or ""),
        args.internal == true, args.enabled ~= false, now, now, previous,
    })
    dbh:release()
    if xerr then return nil, (errors.wrap(xerr, "scope write failed") :: error) end
    if not written or written.rows_affected == 0 then return nil, mutation_conflict() end
    local stored, read_err = M.get(slug)
    if read_err then return nil, committed_error.new(read_err), true end
    if not stored then
        return nil, (errors.new({kind = errors.CONFLICT, retryable = false,
            message = "scope changes before write acknowledgement", details = {code = "scope_write_conflict"}}) :: error), true
    end
    return stored, nil, true
end

function M.delete(slug: any): (boolean, error?)
    if type(slug) ~= "string" or slug == "" then return false, (errors.new({kind = errors.INVALID, retryable = false, message = "slug is required"}) :: error) end
    local db, err = open()
    if not db then return false, err end
    local dbh = db :: sql.DB
    local previous, previous_err = previous_policies(dbh, slug, "kickside.security.api:delete_scope.endpoint")
    if previous_err then dbh:release(); return false, previous_err end
    if previous == "" then dbh:release(); return true, nil end
    local written, xerr = dbh:execute("DELETE FROM kickside_security_scopes WHERE slug = $1 AND policies=$2", {slug, previous})
    dbh:release()
    if xerr then return false, (errors.wrap(xerr, "security scope persistence failed") :: error) end
    if not written or written.rows_affected == 0 then return false, mutation_conflict() end
    return true
end

return M
