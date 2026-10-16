-- Runs one leased job through worker_dispatch inside the frame the caller
-- binds, standing in for the jobs worker process frame.
local sql = require("sql")
local worker_dispatch = require("worker_dispatch")

local function run(job: any): any
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("probe db: " .. tostring(db_err)) end
    local dbtype = tostring(db:type())
    local output, err = worker_dispatch.execute_job(db, dbtype, job)
    db:release()
    if err then
        return { ok = false, kind = (err :: any):kind(), message = tostring(err) }
    end
    return { ok = true, output = output }
end

return { run = run }
