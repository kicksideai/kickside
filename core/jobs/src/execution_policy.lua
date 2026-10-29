local json = require("json")
local cfg = require("config")
local M = {}
-- NULL identifies a pre-upgrade claim: admin overrides did not exist when it
-- started. Its claim-time policy is the cached registry/host policy, never the
-- current committed admin policy. All execution paths share this fallback.
local function legacy_policy(): (table?, error?)
    local policy, err = cfg.policy()
    if err then return nil, err end
    return cfg.capture(policy), nil
end
function M.read(job: table): (table?, error?)
    local value = job.lease_policy
    if value == nil then return legacy_policy() end
    if type(value) == "string" then
        local decoded, err = json.decode(value)
        if err then return nil, errors.wrap(err, "execution policy decode failed") end
        value = decoded
    end
    if type(value) ~= "table" or type(value.lease_timeout_seconds) ~= "number"
        or type(value.lease_heartbeat_ms) ~= "number" then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "Claimed execution policy is required", details = {code = "jobs_execution_policy_required"}})
    end
    job.lease_policy = value
    return value, nil
end
function M.load_from(tx: any, job: table): (table?, error?)
    if job.lease_policy ~= nil then return M.read(job) end
    local rows, err = tx:query("SELECT lease_policy FROM kickside_job WHERE id=$1 AND execution_seq=$2",
        {job.id, tonumber(job.execution_seq)})
    if err then return nil, errors.wrap(err, "execution policy lookup failed") end
    if type(rows) ~= "table" or #rows ~= 1 then
        return nil, errors.new({kind = errors.NOT_FOUND, message = "Claimed execution is unavailable"})
    end
    job.lease_policy = rows[1].lease_policy
    return M.read(job)
end
return M
