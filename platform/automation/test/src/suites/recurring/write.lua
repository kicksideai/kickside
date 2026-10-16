local sql = require("sql")
local json = require("json")
local security = require("security")
local process = require("process")

local function write(request)
    if request.input.fail then
        return { success = false, error = { code = "invalid_request", message = "recurring fixture failed", retriable = false, scope = "item" } }
    end
    local db, err = sql.get("app:db")
    if err then return nil, err end
    local actor = security.actor()
    local _, write_err = db:execute("INSERT INTO recurring_fixture_log (owner_id, identity_key, actor_id, body) VALUES ($1,$2,$3,$4)",
        { request.automation_ref.id, request.identity_key, actor:id(), json.encode(request.input) })
    local listeners, read_err = db:query("SELECT pid,topic FROM round_fixture_listener WHERE automation_id=$1 AND drive_key='main'", { request.automation_ref.id })
    db:release()
    if write_err or read_err then return nil, write_err or read_err end
    for _, listener in ipairs(listeners or {}) do
        process.send(listener.pid, listener.topic, { owner_id = request.automation_ref.id })
    end
    return { success = true, result = "created", dest_ref = { key = request.identity_key } }
end
return { write = write }
