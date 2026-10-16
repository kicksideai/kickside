-- Job classes a job type declares on its worker entry (meta.job_class).
local registry = require("registry")
local job_types = require("job_types")

local M = {}

-- awaited_types() -> the sorted job types other jobs wait on: the worker
-- entries declaring meta.job_class awaited.
function M.awaited_types(): ({ string }?, error?)
    local entries, err = registry.find({ [job_types.JOB_CLASS_META] = job_types.JOB_CLASS.AWAITED })
    if err then
        return nil, errors.wrap(err, "awaited job types unavailable")
    end
    local ids: { string } = {}
    for _, entry in ipairs(entries or {}) do ids[#ids + 1] = tostring((entry :: any).id) end
    table.sort(ids)
    return ids, nil
end

return M
