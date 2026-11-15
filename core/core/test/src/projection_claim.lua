local claim = require("claim")
local M = {}
function M.prepare(db, job_id: string)
    assert(db:execute([[UPDATE kickside_job SET scheduled_at=created_at,
        priority=(SELECT COALESCE(MAX(priority),0)+1 FROM kickside_job) WHERE id=$1]], {job_id}))
end
function M.claim(db, job_id: string): table
    M.prepare(db, job_id)
    local job = assert(claim.claim_job(db, tostring(db:type())))
    assert(job.id == job_id, "registered projection slot is not claimed")
    return job
end
return M
