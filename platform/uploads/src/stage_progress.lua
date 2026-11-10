local jobs = require("jobs")

-- report(cancel_ref) reports progress of the upload processing job that a
-- pipeline stage runs under, renewing the job's execution ceiling. cancel_ref is
-- the { job_id, lease_token, execution_seq } reference the pipeline passes to
-- every stage; without one there is no job to report to. Returns the failure of
-- an undeliverable report.
local function report(cancel_ref: any): error?
    if type(cancel_ref) ~= "table" or type(cancel_ref.job_id) ~= "string" or cancel_ref.job_id == "" then
        return nil
    end
    local _, err = jobs.report_progress(cancel_ref.job_id, {
        token = cancel_ref.lease_token, execution_seq = tonumber(cancel_ref.execution_seq),
    })
    return err
end

return { report = report }
