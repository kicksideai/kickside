local sql = require("sql")
local M: any = {}
function M.reset(stage: string, primary: error?, secondary: error?, dialect: string)
    M.stage, M.primary, M.secondary, M.dialect, M.effect_id = stage, primary, secondary, dialect, nil
    M.calls, M.commits, M.rollbacks, M.notifications = 0, 0, 0, 0
    M.proof_stage, M.proof = nil, nil
end
local function outcome(stage: string, value: any): (any, error?)
    if M.proof_stage == stage then return M.proof, nil end
    if M.stage == stage then return nil, M.primary end
    return value, nil
end
local function effect()
    if not M.effect_id then return end
    local db, err = sql.get("app:db")
    if err then error(err) end
    if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "transaction guard database absent"})) end
    local _, write_err = db:execute("UPDATE kickside_thread SET component_id=component_id || 'x' WHERE id=$1", {M.effect_id})
    local _, close_err = db:release()
    if write_err then error(write_err) end
    if close_err then error(close_err) end
end
function M.database(): any
    local tx = {
        query = function(_self: any, statement: string, _args: any): (any, error?)
            if statement:find("FROM kickside_thread", 1, true) then return {{id = "thread"}}, nil end
            if statement:find("SELECT c.id", 1, true) then return {{id = "cursor", projection_id = "projection", status = "active", generation = 1}}, nil end
            if statement:find("SELECT id,kind", 1, true) then return {{id = "projection", kind = "kind", projection_key = "default"}}, nil end
            return {}, nil
        end,
        execute = function(_self: any, _statement: any, _args: any): (any, error?)
            M.calls = M.calls + 1
            return outcome("operation", {rows_affected = 1})
        end,
        commit = function(_self: any): (any, error?)
            M.commits = M.commits + 1; effect()
            return outcome("commit", true)
        end,
        rollback = function(_self: any): (any, error?)
            M.rollbacks = M.rollbacks + 1
            if M.secondary then return false, M.secondary end
            return outcome("rollback", true)
        end,
    }
    return {type = function(_self: any): (any, error?) return outcome("dialect", M.dialect) end,
        begin = function(_self: any): (any, error?) return outcome("begin", tx) end}
end
function M.notify_cursor(...: any): (any, error?) M.notifications = M.notifications + 1; return 0, nil end
return M
