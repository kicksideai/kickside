local process = require("process")
local sql = require("sql")

local function park_slot(job_id: string, concurrency_key: string): error?
    local db, open_err = sql.get("app:db")
    if open_err or not db then return open_err or (errors.new({ message = "probe database unavailable", kind = errors.UNAVAILABLE }) :: error) end
    local _, update_err = db:execute("UPDATE kickside_job SET scheduled_at=NULL, wake_demand_at=NULL, wake_control_pending=FALSE"
        .. " WHERE id=$1 AND status='pending' AND concurrency_key=$2", { job_id, concurrency_key })
    if update_err then db:release(); return update_err end
    local rows, read_err = db:query("SELECT status, scheduled_at FROM kickside_job WHERE id=$1", { job_id })
    db:release()
    if read_err then return read_err end
    local row = rows and rows[1]
    if not row or row.status ~= "pending" or row.scheduled_at ~= nil then
        return (errors.new({ message = "probe could not park its drive slot", kind = errors.CONFLICT }) :: error)
    end
    return nil
end

local function run(input: any): (any?, error?)
    local payload = input and input.payload or {}
    local park_err: error? = nil
    if type(payload.park_job_id) == "string" then
        park_err = park_slot(payload.park_job_id, tostring(payload.concurrency_key))
    end
    local _, err = process.send(tostring(payload.reply_pid), tostring(payload.reply_topic),
        { job_id = input.job.id, execution_seq = input.job.execution_seq,
            parked_job_id = payload.park_job_id, error = park_err and tostring(park_err) or nil })
    if err then return nil, err end
    if park_err then return nil, park_err end
    return { ok = true }, nil
end

return { run = run }
