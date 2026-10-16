local sql = require("sql")
local time = require("time")
local M = {}

function M.status(): any return {success = true, status = "connected"} end
function M.resources(): any return {success = true, resources = {}} end
function M.pull(args: any): (any?, error?)
    local config = args.config
    local now = time.now():unix_nano() // 1000000
    local db, db_err = sql.get("app:db")
    if db_err then return nil, db_err end
    local rows, read_err = db:query("SELECT COUNT(*) AS n FROM smoke_capacity_calls WHERE consumer=$1", {config.consumer})
    if read_err then db:release(); return nil, read_err end
    local _, write_err = db:execute("INSERT INTO smoke_capacity_calls (connection_id,consumer,called_at_ms) VALUES ($1,$2,$3)",
        {config.connection_id,config.consumer,now})
    db:release()
    if write_err then return nil, write_err end
    if config.limited and tonumber(rows[1].n) == 0 then
        return nil, errors.new({kind = errors.RATE_LIMITED, retryable = true, message = "Shared connection capacity",
            details = {code = "provider_capacity", scope = "capacity", retry_at_ms = now + 45000}})
    end
    if args.cursor == "done" then return {success = true, items = {}, next_cursor = "done", has_more = false} end
    return {success = true, items = {{item_key = config.consumer, dedup_key = config.consumer, op = "upsert",
        payload = {title = config.consumer, content = "Connection capacity resumes"}}}, next_cursor = "done", has_more = false}
end
return M
