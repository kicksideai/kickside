local jobs = require("jobs")

local M = {}

-- Enrich only rows the owning list has already authorized.
function M.enrich(rows: {any}): (boolean?, error?)
    local ids, seen = {}, {}
    for _, row in ipairs(rows) do
        local id = row.deletion_job_id
        if id ~= nil and not seen[id] then
            ids[#ids + 1], seen[id] = id, true
        end
    end
    if #ids == 0 then return true, nil end
    local batch, err = jobs.get_jobs(ids)
    if err then return nil, err end
    for _, row in ipairs(rows) do
        local job = row.deletion_job_id and batch[row.deletion_job_id]
        row.deletion_job = job and {status = job.status, attempts = tonumber(job.attempts), last_error = job.last_error} or nil
    end
    return true, nil
end

return M
