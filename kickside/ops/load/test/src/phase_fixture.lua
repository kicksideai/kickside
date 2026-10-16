type Map = { [string]: any }
local M = {}
function M.reset(): ()
    M.calls = {}; M.disabled = false; M.disables = 0; M.reads = 0; M.status_reads = 0; M.read_error = nil
end
function M.query(_statement: string, _params: any?): { Map }
    return {{automation_id = "a", drive_key = "main", job_id = "job-a"},
            {automation_id = "b", drive_key = "other", job_id = "job-b"}}
end
function M.status(id: string, _options: any): (Map?, any)
    M.status_reads = M.status_reads + 1
    M.calls[#M.calls + 1] = "status:" .. id
    return {drives = {{drive_key = id == "a" and "main" or "other", wake_pending = M.status_reads < 3}}}, nil
end
function M.get_job(id: string): (Map?, any)
    if M.read_error then return nil, M.read_error end
    M.reads = M.reads + 1
    M.calls[#M.calls + 1] = "job:" .. id
    return {status = M.reads < 3 and "running" or "pending", wake_control_pending = M.reads < 5,
        wake_enabled = not M.disabled, scheduled_at = M.reads < 7 and "due" or nil}, nil
end
function M.exec(_statement: string, _params: any?): ()
    if M.status_reads < 3 or M.reads < 7 then error("disable precedes control acknowledgement") end
    M.disables = M.disables + 1
    M.disabled = true
    M.calls[#M.calls + 1] = "disable"
end
function M.fail(message: string): never error(message) end
return M
