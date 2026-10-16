-- A test-owned job handler: receiving its message proves a real loop claimed it.
local sql = require("sql")
local process = require("process")
local channel = require("channel")
local time = require("time")

local function run(input: any): (any?, error?)
    local job = input and input.job or {}
    local payload = input and input.payload or {}
    local db, open_err = sql.get("app:db")
    if open_err or not db then return nil, open_err end
    local rows, query_err = db:query("SELECT w.id,p.registry_version FROM kickside_job_worker w"
        .. " JOIN kickside_job_worker_pulse p ON p.worker_id=w.id WHERE w.current_job_id=$1",
        { job.id })
    db:release()
    if query_err then return nil, query_err end
    if not rows or #rows ~= 1 then
        return nil, errors.new({ kind = errors.INTERNAL, message = "claimed job has no owning worker" })
    end
    local ack_topic = tostring(payload.reply_topic) .. ".ack"
    local ack = process.listen(ack_topic, { message = true })
    local _, send_err = process.send(tostring(payload.reply_pid), tostring(payload.reply_topic),
        { job_id = job.id, worker_id = rows[1].id, registry_version = rows[1].registry_version,
            execution_seq = job.execution_seq, sender_pid = tostring(process.pid()), ack_topic = ack_topic })
    if send_err then process.unlisten(ack); return nil, send_err end
    local received = channel.select({ ack:case_receive(), time.after("10s"):case_receive() })
    process.unlisten(ack)
    if received.channel ~= ack then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "live job probe reply was not acknowledged", retryable = true })
    end
    local reply = received.value
    local ack_data = reply:payload():data()
    if reply:topic() ~= ack_topic or type(ack_data) ~= "table" or ack_data.job_id ~= job.id then
        return nil, errors.new({ kind = errors.INVALID, message = "live job probe acknowledgment mismatched" })
    end
    return { ok = true }, nil
end

return { run = run }
