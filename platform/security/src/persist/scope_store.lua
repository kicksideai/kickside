-- DB persistence for admin-authored custom scopes (kickside_security_scopes).
-- This is the source of truth the projection service projects into security.scope
-- registry entries. The store never writes the registry itself.

local registry = require("registry")
local trigger_reconcile = require("trigger_reconcile")

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
    local rows, read_err = db:query("SELECT slug, label, description, policies, target, internal, enabled, created_at, updated_at FROM kickside_security_scopes WHERE slug=$1", {slug})
    if read_err then return nil, (errors.wrap(read_err, "scope mutation read failed") :: error) end
    if not rows or not rows[1] then return "", nil end
    local raw = rows[1].policies
    local policies, decode_err = persisted_json.decode_table(raw, "kickside_security_scopes.policies")
    if decode_err then return nil, decode_err end
    local _, authorization_err = composition.authorize_mutation(policies, gate, true)
    if authorization_err then return nil, authorization_err end
    local row, row_err = decode_row(rows[1])
    if row_err then return nil, row_err end
    return raw, nil, row
end

local function mutation_conflict()
    return (errors.new({kind = errors.CONFLICT, retryable = true,
        message = "scope policies change before authorized mutation", details = {code = "scope_mutation_conflict"}}) :: error)
end

local function same_policies(before, after)
    local previous, current = {}, {}
    for _, id in ipairs(before) do previous[id] = true end
    for _, id in ipairs(after) do current[id] = true end
    for id in pairs(previous) do if not current[id] then return false end end
    for id in pairs(current) do if not previous[id] then return false end end
    return true
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
    local previous, previous_err, previous_row = previous_policies(dbh, slug, "kickside.security.api:save_scope.endpoint")
    if previous_err then dbh:release(); return nil, previous_err end
    local encoded, encode_err = json.encode(policies)
    if encode_err then dbh:release(); return nil, (errors.wrap(encode_err, "scope policy encoding failed") :: error) end
    local now = time.now():utc():format_rfc3339()
    local old_target = previous_row and previous_row.target or ""
    if not previous_row or not same_policies(previous_row.policies, policies) or old_target ~= tostring(args.target or "")
        or previous_row.enabled ~= (args.enabled ~= false) then
        local old_group = old_target ~= "" and old_target or consts.CUSTOM_SCOPE_NS .. ":" .. slug
        local target = tostring(args.target or "")
        local group = target ~= "" and target or consts.CUSTOM_SCOPE_NS .. ":" .. slug
        local groups = {old_group}
        if group ~= old_group then groups[#groups + 1] = group end
        local fenced, fence_err = trigger_reconcile.trigger({fence_groups = groups})
        if not fenced then dbh:release(); return nil, fence_err end
    end
    local written, xerr = dbh:execute([[
        INSERT INTO kickside_security_scopes (slug, label, description, policies, target, internal, enabled, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (slug) DO UPDATE SET
            label = excluded.label, description = excluded.description,
            policies = excluded.policies, target = excluded.target,
            internal = excluded.internal,
            enabled = excluded.enabled, updated_at = excluded.updated_at
        WHERE kickside_security_scopes.policies = $10
            AND kickside_security_scopes.target = $11
            AND kickside_security_scopes.enabled = $12
    ]], {
        slug, tostring(args.label or ""), tostring(args.description or ""),
        encoded, tostring(args.target or ""),
        args.internal == true, args.enabled ~= false, now, now, previous,
        previous_row and previous_row.target or "", previous_row and previous_row.enabled or false,
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
    local previous, previous_err, previous_row = previous_policies(dbh, slug, "kickside.security.api:delete_scope.endpoint")
    if previous_err then dbh:release(); return false, previous_err end
    if previous == "" then dbh:release(); return true, nil end
    local target = previous_row and previous_row.target or ""
    local fenced, fence_err = trigger_reconcile.trigger({fence_groups = {target ~= "" and target or consts.CUSTOM_SCOPE_NS .. ":" .. slug}})
    if not fenced then dbh:release(); return false, fence_err end
    local written, xerr = dbh:execute("DELETE FROM kickside_security_scopes WHERE slug = $1 AND policies=$2 AND target=$3 AND enabled=$4", {slug, previous, previous_row.target, previous_row.enabled})
    dbh:release()
    if xerr then return false, (errors.wrap(xerr, "security scope persistence failed") :: error) end
    if not written or written.rows_affected == 0 then return false, mutation_conflict() end
    return true
end

-- Resolves memberships into native groups and live DB-selected source IDs.
-- The catalog supplies declaration IDs, never copied policy bodies.
function M.resolve_groups(groups)
    if type(groups) ~= "table" then
        return nil, errors.new({kind = errors.INVALID, retryable = false, message = "groups must be an array"})
    end
    for _, group in ipairs(groups) do
        if type(group) ~= "string" or group == "" then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "group must be a non-empty id"})
        end
    end
    local native, policies, slugs, visited = {}, {}, {}, {}
    local function visit(group)
        if visited[group] then return nil end
        visited[group] = true
        local entry, read_err = registry.get(group)
        if read_err and not errors.is(read_err, errors.NOT_FOUND) then return read_err end
        if entry and entry.kind == consts.SCOPE_KIND then
            local data = entry.data or {}
            if data.groups == nil then native[group] = true end
            for _, id in ipairs(data.groups or {}) do native[id] = true end
            for _, source in ipairs(data.scope_sources or {}) do
                slugs[source.slug] = slugs[source.slug] or {}
                slugs[source.slug][source.group_id] = true
            end
            for _, id in ipairs(data.direct_policies or {}) do policies[id] = true end
        else
            native[group] = true
        end
        return nil
    end
    for _, group in ipairs(groups) do
        local err = visit(group)
        if err then return nil, err end
    end
    local selected_slugs, marks = {}, {}
    for slug in pairs(slugs) do
        selected_slugs[#selected_slugs + 1] = slug
        marks[#marks + 1] = "$" .. tostring(#marks + 1)
    end
    if #selected_slugs > 0 then
        local db, db_err = open()
        if not db then return nil, db_err end
        local rows, read_err = db:query("SELECT slug, target, policies, enabled FROM kickside_security_scopes WHERE slug IN (" .. table.concat(marks, ",") .. ")", selected_slugs)
        db:release()
        if read_err then return nil, read_err end
        for _, row in ipairs(rows or {}) do
            local group = row.target ~= "" and row.target or consts.CUSTOM_SCOPE_NS .. ":" .. row.slug
            if to_bool(row.enabled) and slugs[row.slug][group] == true then
                local ids, decode_err = persisted_json.decode_table(row.policies, "kickside_security_scopes.policies")
                if decode_err then return nil, decode_err end
                for _, id in ipairs(ids) do policies[id] = true end
            end
        end
    end
    local native_ids, policy_ids = {}, {}
    for id in pairs(native) do native_ids[#native_ids + 1] = id end
    for id in pairs(policies) do policy_ids[#policy_ids + 1] = id end
    table.sort(native_ids)
    table.sort(policy_ids)
    local expanded, expand_err = composition.expand_available(policy_ids)
    if expand_err then return nil, expand_err end
    return {groups = native_ids, policy_ids = expanded}, nil
end

return M
