local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local time = require("time")
local resume = require("resume")

local M = {}

local function query(statement: string, params: any?): any
    local db, db_err = sql.get("app:db")
    if db_err or not db then error(tostring(db_err or "proof database unavailable")) end
    local rows, err = db:query(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
    return rows
end

local function proof_scope(): any
    local policy, policy_err = security.policy("app:proof_policy")
    if policy_err or not policy then error(tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error(tostring(scope_err)) end
    return scope
end

local function wait_schema()
    for _ = 1, 200 do
        if query("SELECT 1 FROM dataflows LIMIT 1") ~= nil then return end
        time.sleep("100ms")
    end
    error("Dataflow migrations did not complete")
end

local function reset_arm_calls()
    local db, db_err = sql.get("app:db")
    if db_err or not db then error(tostring(db_err or "proof database unavailable")) end
    local _, create_err = db:execute([[
        CREATE TABLE IF NOT EXISTS native_wait_arm_calls (
            idempotency_key TEXT PRIMARY KEY,
            actor_id TEXT NOT NULL,
            signal_id TEXT NOT NULL
        )
    ]])
    if not create_err then _, create_err = db:execute("DELETE FROM native_wait_arm_calls") end
    db:release()
    if create_err then error(tostring(create_err)) end
end

function M.phase_one()
    wait_schema()
    reset_arm_calls()
    local actor, actor_err = security.new_actor("system:native-wait-owner", { system = true })
    if actor_err or not actor then error(tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(proof_scope()):call("app:native_wait_start", {})
    if err or type(result) ~= "table" then error(tostring(err or "native wait start failed")) end
    local dataflow_id = tostring(result.dataflow_id or "")
    for _ = 1, 300 do
        local rows = query([[SELECT COUNT(*) AS count FROM dataflow_data
            WHERE dataflow_id = ? AND type = 'node.yield']], { dataflow_id })
        if type(rows) == "table" and tonumber(rows[1] and rows[1].count) == 1 then
            while true do time.sleep("1s") end
        end
        time.sleep("100ms")
    end
    error("native wait did not commit its park")
end

function M.phase_two()
    wait_schema()
    local rows = query("SELECT dataflow_id FROM dataflows WHERE type = 'native-wait-proof' LIMIT 1")
    local dataflow_id = tostring(type(rows) == "table" and rows[1] and rows[1].dataflow_id or "")
    if dataflow_id == "" then error("parked Dataflow is missing after restart") end
    local result, err = resume.resume({
        dataflow_id = dataflow_id,
        signal_id = "native-wait-restart",
        payload = { resumed = true, marker = "resumed-after-restart" },
    })
    if err or type(result) ~= "table" then error(tostring(err or "resume failed")) end
    for _ = 1, 300 do
        local status = query("SELECT status FROM dataflows WHERE dataflow_id = ?", { dataflow_id })
        if type(status) == "table" and status[1] and status[1].status == "completed" then return end
        time.sleep("100ms")
    end
    error("native wait did not complete after restart")
end

return M
