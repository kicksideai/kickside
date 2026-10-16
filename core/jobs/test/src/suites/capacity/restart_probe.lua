-- A real test process stopped before or after its jobs write commits.
local sql = require("sql")
local process = require("process")
local lifecycle = require("lifecycle")
local completion = require("completion")

local function run(args: table): table
    local db, db_err = sql.get("app:db")
    if db_err or not db then return { error = tostring(db_err) } end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return { error = tostring(type_err) } end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return { error = tostring(begin_err) } end
    local result, err
    if args.operation == "job" then
        result, err = lifecycle.enqueue_job(tx, tostring(dbtype), {
            owner_locator = { kind = "test", id = args.owner },
            job_identity = { namespace = "restart", scope = args.owner, key = args.key },
            job_type = "test.restart", parked = true,
        })
    elseif args.operation == "run" then
        result, err = completion.complete_tx(tx, args.job_id, args.lease,
            { record = { status = "completed" } })
    else
        tx:rollback(); db:release(); return { error = "unknown operation" }
    end
    if err then
        tx:rollback()
        db:release()
        return { kind = err:kind(), details = err:details() }
    end
    if args.phase ~= "uncommitted" then
        local _, commit_err = tx:commit()
        if commit_err then db:release(); return { error = tostring(commit_err) } end
    end
    if args.phase ~= "uncommitted" then db:release() end
    if args.phase == "attempt" then return { accepted = result ~= nil } end
    local sent, send_err = process.send(args.parent_pid, "restart_ready",
        { nonce = args.nonce, pid = tostring(process.pid()), phase = args.phase })
    if not sent or send_err then return { error = tostring(send_err or "ready send failed") } end
    process.inbox():receive()
    return { error = "hold unexpectedly resumed" }
end

return { run = run }
