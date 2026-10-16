-- Clear an ownership marker only after its job has left an active lease.
-- Call inside the transaction that changes the job so no other claimant can
-- observe a released worker beside an old running lease.
local marker = {}

function marker.clear(executor: any, job_id: string): error?
    local _, err = executor:execute([[UPDATE kickside_job_worker SET current_job_id = NULL
        WHERE current_job_id = $1 AND NOT EXISTS
            (SELECT 1 FROM kickside_job WHERE id = $1
                AND status = 'running' AND lease_token IS NOT NULL)]], { job_id })
    if err then
        return errors.wrap(err, "worker marker clear failed")
    end
    return nil
end

return marker
