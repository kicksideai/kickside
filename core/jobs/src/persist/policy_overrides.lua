-- Overrides and their revision commit together; the singleton pool owns runtime policy.
local sql = require("sql")
local json = require("json")
local boundary = require("sql_boundary")
local M = {}
local function malformed(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "Jobs policy response is invalid",
        details = {code = "jobs_policy_response", field = field}})
end

function M.read_from(db: any): (table?, error?)
    -- One statement supplies a consistent revision and all overridden keys.
    local rows, err = db:query([[SELECT r.revision,o.key,o.value FROM kickside_job_policy_revision r
        LEFT JOIN kickside_job_policy_override o ON 1=1 WHERE r.id=1 ORDER BY o.key]], {})
    if err then return nil, errors.wrap(err, "Jobs policy read failed") end
    if type(rows) ~= "table" or not rows[1] then return nil, malformed("revision") end
    local revision = tonumber(rows[1].revision)
    if not revision or revision < 0 or revision % 1 ~= 0 then return nil, malformed("revision") end
    local values = {}
    for _, row in ipairs(rows) do
        if row.key ~= nil then
            local value, decode_err = json.decode(tostring(row.value))
            if decode_err then return nil, errors.wrap(decode_err, "Jobs policy override decode failed") end
            if value == nil then return nil, malformed("override.value") end
            values[tostring(row.key)] = value
        end
    end
    return {revision = revision, values = values}, nil
end

function M.read(db_id: string): (table?, error?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local value, read_err = M.read_from(db)
    return value, boundary.release(db, read_err, "Jobs policy read release failed")
end

-- Lifecycle/status checks discover a missed nudge without decoding overrides
-- again when the committed revision is already applied.
function M.revision(db_id: string): (number?, error?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local rows, read_err = db:query("SELECT revision FROM kickside_job_policy_revision WHERE id=1", {})
    if read_err then return nil, boundary.release(db, read_err, "Jobs revision read release failed") end
    local revision = type(rows) == "table" and rows[1] and tonumber(rows[1].revision)
    if not revision or revision < 0 or revision % 1 ~= 0 then
        return nil, boundary.release(db, malformed("revision"), "Jobs revision read release failed")
    end
    return revision, boundary.release(db, nil, "Jobs revision read release failed")
end

-- The revision-row update locks writers before validation on either dialect.
-- A concurrent refusal remains a native conflict; this path never retries.
function M.write(db_id: string, values: table, unset: table, validate: (table) -> (any?, error?)): (any?, error?)
    if next(values) == nil and next(unset) == nil then
        return nil, errors.new({kind = errors.INVALID, retryable = false,
            message = "At least one policy value or reset is required", details = {code = "jobs_policy_empty_write"}})
    end
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local result, write_err = boundary.transaction(db, function(tx): (any?, error?)
        local _, lock_err = tx:execute("UPDATE kickside_job_policy_revision SET revision=revision+1 WHERE id=1", {})
        if lock_err then return nil, lock_err end
        local current, read_err = M.read_from(tx)
        if read_err then return nil, read_err end
        for _, key in ipairs(unset) do current.values[key] = nil end
        for key, value in pairs(values) do current.values[key] = value end
        local effective, validation_err = validate(current.values)
        if validation_err then return nil, validation_err end
        for _, key in ipairs(unset) do
            local _, delete_err = tx:execute("DELETE FROM kickside_job_policy_override WHERE key=$1", {key})
            if delete_err then return nil, delete_err end
        end
        for key, value in pairs(values) do
            local encoded, encode_err = json.encode(value)
            if encode_err then return nil, encode_err end
            local _, put_err = tx:execute([[INSERT INTO kickside_job_policy_override (key,value) VALUES ($1,$2)
                ON CONFLICT (key) DO UPDATE SET value=excluded.value]], {key, encoded})
            if put_err then return nil, put_err end
        end
        effective.revision = current.revision
        return effective, nil
    end, "Jobs policy write", malformed)
    return result, boundary.release(db, write_err, "Jobs policy write release failed")
end
return M
