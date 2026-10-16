local jobs = require("jobs")
local waiters = require("waiters")
local sql = require("sql")
local process = require("process")
local M = {}

function M.wake_job(job_id: string, options: any): (any?, error?)
    local db, open_err = sql.get("app:db")
    if open_err or not db then return nil, open_err end
    local rows, read_err = db:query([[SELECT c.id,t.event_count FROM kickside_projection_cursor c
        JOIN kickside_thread t ON t.id=c.thread_id WHERE c.job_id=$1]], { job_id })
    db:release()
    if read_err then return nil, read_err end
    if #rows ~= 1 then return nil, errors.new({ kind = errors.INTERNAL, message = "catch-up cursor missing" }) end
    local event_count = math.tointeger(rows[1].event_count)
    if event_count == nil then
        return nil, errors.new({ kind = errors.INTERNAL, message = "catch-up event count missing or invalid" })
    end
    local waiter, wait_err = waiters.begin_wait(tostring(rows[1].id), event_count, 5000)
    if wait_err then return nil, wait_err end
    local result, wake_err = jobs.wake_job(job_id, options)
    if wake_err then waiters.close_wait(waiter); return nil, wake_err end
    local pid, spawn_err = process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes")
    if spawn_err then waiters.close_wait(waiter); return nil, spawn_err end
    local sent, send_err = process.send("app:projection_catchup_test", "projection.test.worker", { pid = tostring(pid) })
    if send_err or sent ~= true then waiters.close_wait(waiter); return nil, send_err end
    local _, timed_out, progress_err = waiters.wait_until_reached(waiter)
    waiters.close_wait(waiter)
    if progress_err then return nil, progress_err end
    if timed_out then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "catch-up test worker did not commit" }) end
    return result, nil
end

return M
