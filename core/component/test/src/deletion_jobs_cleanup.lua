local sql = require("sql")
local ctx = require("ctx")
local security = require("security")
local funcs = require("funcs")
local process = require("process")
local time = require("time")
local channel = require("channel")
local M = {}
function M.handle(request: any): any
    local id, mode = ctx.get("component_id"), ctx.get("mode")
    local events = process.events()
    local db = assert(sql.get("app:db"))
    local _, delete_err = db:execute("DELETE FROM deletion_job_owned WHERE component_id=$1", {id})
    if delete_err then db:release(); error(delete_err) end
    local _, schema_err = db:execute([[CREATE TABLE IF NOT EXISTS deletion_job_cleanup
        (component_id TEXT PRIMARY KEY,calls INTEGER NOT NULL,actor TEXT,option_marker TEXT,remaining INTEGER NOT NULL,worker_pid TEXT)]])
    if schema_err then db:release(); error(schema_err) end
    local _, write_err = db:execute([[INSERT INTO deletion_job_cleanup(component_id,calls,actor,option_marker,remaining)
        VALUES ($1,1,$2,$3,0) ON CONFLICT (component_id) DO UPDATE SET calls=deletion_job_cleanup.calls+1]],
        {id, security.actor():id(), (request.options and request.options.marker) or sql.as.null()})
    if write_err then db:release(); error(write_err) end
    local _, pid_err = db:execute("UPDATE deletion_job_cleanup SET worker_pid=$1 WHERE component_id=$2", {tostring(process.pid()), id})
    if pid_err then db:release(); error(pid_err) end
    local rows, read_err = db:query("SELECT calls FROM deletion_job_cleanup WHERE component_id=$1", {id})
    db:release()
    if read_err then error(read_err) end
    if mode == "crash" and tonumber(rows[1].calls) == 1 then
        local deadline = time.after("30s")
        local selected = channel.select({events:case_receive(), deadline:case_receive()})
        if selected.channel ~= events or selected.value.kind ~= process.event.CANCEL then
            error("the test does not stop its cleanup worker")
        end
        error(errors.new({message = "cleanup worker exits after partial success", kind = errors.INTERNAL, retryable = true}))
    end
    if mode == "retention" and tonumber(rows[1].calls) == 1 then
        local result, err = funcs.call("kickside.component:retention", {change = {owner_locator = {id = id}}})
        if err then error(err) end
        if not result.success or result.deleted ~= 0 then error("retention enters active cleanup") end
    end
    return {success = true}
end
return M
