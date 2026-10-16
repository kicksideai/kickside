local sql = require("sql")
local json = require("json")
local canonical_json = require("canonical_json")
local consts = require("security_consts")
local persisted_json = require("persisted_json")

local M = {}

function M.name_for(groups)
    if type(groups) ~= "table" or #groups == 0 then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group set requires groups"}) :: error) end
    local sorted, seen = {}, {}
    for _, group in ipairs(groups) do
        if type(group) ~= "string" or group == "" then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group must be a non-empty id"}) :: error) end
        if not seen[group] then sorted[#sorted + 1] = group; seen[group] = true end
    end
    table.sort(sorted)
    local digest, hash_err = canonical_json.hash(sorted)
    if hash_err then return nil, (errors.wrap(hash_err, "group set persistence failed") :: error) end
    return consts.CUSTOM_SCOPE_NS .. ":set_" .. digest, sorted
end

function M.save(groups)
    local name, sorted_or_err = M.name_for(groups)
    if not name then return nil, sorted_or_err end
    local sorted = sorted_or_err
    local encoded, encode_err = json.encode(sorted)
    if encode_err then return nil, (errors.wrap(encode_err, "group set persistence failed") :: error) end
    local id, config_err = consts.db_id()
    if config_err then return nil, config_err end
    local db, db_err = sql.get(id)
    if db_err then return nil, (errors.wrap(db_err, "group set persistence failed") :: error) end
    local _, write_err = db:execute([[INSERT INTO kickside_security_group_sets (scope_name, groups_json)
        VALUES ($1, $2) ON CONFLICT (scope_name) DO NOTHING]], {name, encoded})
    db:release()
    if write_err then return nil, (errors.wrap(write_err, "group set persistence failed") :: error) end
    return name, nil
end

-- current reports whether a named group set was projected from exactly the
-- registry revision the caller has already checked. A NULL revision is an
-- existing-install row awaiting its first checked materialization.
function M.current(name, revision)
    if type(name) ~= "string" or name == "" then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group set name is required"}) :: error) end
    if type(revision) ~= "string" or revision == "" then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group set revision is required"}) :: error) end
    local id, config_err = consts.db_id()
    if config_err then return nil, config_err end
    local db, db_err = sql.get(id)
    if db_err then return nil, (errors.wrap(db_err, "group set persistence failed") :: error) end
    local rows, read_err = db:query(
        "SELECT materialized_revision FROM kickside_security_group_sets WHERE scope_name=$1", {name})
    db:release()
    if read_err then return nil, (errors.wrap(read_err, "group set persistence failed") :: error) end
    local row = rows and rows[1]
    return row ~= nil and tostring(row.materialized_revision or "") == revision, nil
end

-- mark_materialized records the registry revision only after that revision's
-- projection and any reduction fence complete. It never rewrites groups.
function M.mark_materialized(names, revision)
    if type(names) ~= "table" then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group set names are required"}) :: error) end
    if type(revision) ~= "string" or revision == "" then return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group set revision is required"}) :: error) end
    local id, config_err = consts.db_id()
    if config_err then return nil, config_err end
    local db, db_err = sql.get(id)
    if db_err then return nil, (errors.wrap(db_err, "group set persistence failed") :: error) end
    for _, name in ipairs(names) do
        local _, write_err = db:execute(
            "UPDATE kickside_security_group_sets SET materialized_revision=$1 WHERE scope_name=$2", {revision, name})
        if write_err then db:release(); return nil, (errors.wrap(write_err, "group set persistence failed") :: error) end
    end
    db:release()
    return true, nil
end

function M.list()
    local id, config_err = consts.db_id()
    if config_err then return nil, config_err end
    local db, db_err = sql.get(id)
    if db_err then return nil, (errors.wrap(db_err, "group set persistence failed") :: error) end
    local rows, read_err = db:query("SELECT scope_name, groups_json FROM kickside_security_group_sets ORDER BY scope_name", {})
    db:release()
    if read_err then return nil, (errors.wrap(read_err, "group set persistence failed") :: error) end
    local out = {}
    for _, row in ipairs(rows) do
        local groups, decode_err = persisted_json.decode_table(row.groups_json, "kickside_security_group_sets.groups_json")
        if decode_err then return nil, decode_err end
        out[#out + 1] = {scope_name = row.scope_name, groups = groups}
    end
    return out, nil
end

return M
