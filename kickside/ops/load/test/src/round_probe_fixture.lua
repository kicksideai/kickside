type Map = { [string]: any }
local M: Map = {}
function M.reset(): ()
    M.wakes = 0; M.reads = 0; M.completions = 0; M.inserts = 0
    M.sequence = 0; M.pending_reads = 0; M.read_error = nil; M.wake_error = nil
end
function M.query(_statement: string, params: {any}?): { Map }
    if params then return {{round_seq = M.completions, execution_seq = M.sequence}} end
    return {{automation_id = "a", drive_key = "main", job_id = "job-a"},
            {automation_id = "b", drive_key = "main", job_id = "job-b"}}
end
function M.scalar(_statement: string, _params: any?, _field: string): integer return 0 end
function M.exec(statement: string, _params: any?): ()
    if statement:find("INSERT", 1, true) then
        if M.completions ~= 20 then error("records samples before completion") end
        M.inserts = M.inserts + 1
    end
end
function M.state_get(_key: string): string return "1" end
function M.state_set(_key: string, _value: any): () end
function M.percentile(samples: {number}, _fraction: number): number return samples[#samples] end
function M.fmt(value: number): string return tostring(value) end
function M.metric(_name: string, _target: string, _value: string, _status: string, _detail: string): () end
function M.wake_job(_id: string): (Map?, any)
    if M.wake_error then return nil, M.wake_error end
    M.wakes = M.wakes + 1
    M.pending_reads = 2
    return {woken = true}, nil
end
function M.get_job(_id: string): (Map?, any)
    if M.read_error then return nil, M.read_error end
    M.reads = M.reads + 1
    if M.pending_reads == 2 then
        M.pending_reads = 1
        return {status = "pending", scheduled_at = "due", execution_seq = M.sequence}, nil
    elseif M.pending_reads == 1 then
        M.pending_reads = 0
        M.sequence = (M.sequence :: number) + 1
        return {status = "running", scheduled_at = "due", execution_seq = M.sequence}, nil
    elseif M.completions < M.wakes then
        M.completions = M.completions + 1
    end
    return {status = "pending", execution_seq = M.sequence}, nil
end
function M.fail(message: string): never error(message) end
return M
