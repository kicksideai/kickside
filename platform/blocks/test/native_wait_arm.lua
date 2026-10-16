local security = require("security")
local sql = require("sql")

local M = {}

function M.arm(args: any): (any?, string?)
    local a = type(args) == "table" and args or {}
    local actor = security.actor()
    local actor_id = actor and actor:id() or ""
    if actor_id ~= "system:native-wait-owner" then
        return nil, "wait arm did not run under the frozen Dataflow actor"
    end
    local idempotency_key = tostring(a.idempotency_key or "")
    if idempotency_key == "" then return nil, "wait arm idempotency key is required" end
    if type(a.input) ~= "table" or a.input.marker ~= "parked-before-restart" then
        return nil, "wait arm did not receive the node input"
    end
    local run_context = type(a.run_context) == "table" and a.run_context or {}
    local flow_ref = type(run_context.flow_ref) == "table" and run_context.flow_ref or {}
    if flow_ref.kind ~= "flow" or flow_ref.id ~= "native-wait-flow" or flow_ref.version ~= 1
        or run_context.run_id ~= "native-wait-run"
        or type(run_context.extension) ~= "table" or run_context.extension.owner ~= "proof" then
        return nil, "wait arm did not receive the opaque run context"
    end
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, tostring(db_err or "proof database unavailable") end
    local _, write_err = db:execute([[
        INSERT INTO native_wait_arm_calls (idempotency_key, actor_id, signal_id)
        VALUES (?, ?, ?)
        ON CONFLICT(idempotency_key) DO NOTHING
    ]], { idempotency_key, actor_id, tostring(a.signal_id or "") })
    db:release()
    if write_err then return nil, tostring(write_err) end
    return { armed = true }, nil
end

return M
