-- A real test process that can be terminated on either side of a write commit.
local sql = require("sql")
local process = require("process")
local append = require("append")
local pin = require("pin")
local receipts = require("write_receipt")

local function run(args: table): table
    local db, db_err = sql.get("app:db")
    if db_err or not db then return { error = tostring(db_err) } end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return { error = tostring(begin_err) } end
    local result, err
    if args.operation == "event" then
        result, err = append.append_events_tx(tx, args.scope,
            { { type = "test:restart", body_json = "{}" } })
    elseif args.operation == "pin" then
        result, err = pin.lower_tx(tx, { thread_id = args.scope,
            consumer_key = args.key, command_id = "cmd-" .. args.key,
            command_generation = 1, target_cursor = 0 })
    elseif args.operation == "receipt" then
        result, err = receipts.reserve(tx, { sink_id = "sink:" .. args.scope,
            idempotency_key = args.key, identity_key = "record",
            payload_hash = "hash", created_at = "2000-01-01T00:00:00Z" })
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
