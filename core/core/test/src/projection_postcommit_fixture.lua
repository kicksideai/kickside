local sql = require("sql")
local M: any = {}
function M.reset(operation: string, stage: string, source: error?, dialect: string)
    M.operation, M.stage, M.dialect, M.effect_id = operation, stage, dialect, nil
    M.failures = {}; if source then M.failures[stage] = source end
    M.commits, M.types, M.cursors, M.nudges, M.cancellations, M.retention = 0, 0, 0, 0, 0, 0
    M.proof_stage, M.proof = nil, nil
end
local function outcome(stage: string, value: any): (any, error?)
    if M.proof_stage == stage then return M.proof, nil end
    if M.failures[stage] then return nil, M.failures[stage] end
    return value, nil
end
local function effect()
    if not M.effect_id then return end
    local db, err = sql.get("app:db")
    if err then error(err) end
    if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "postcommit guard database absent"})) end
    local _, write_err = db:execute("UPDATE kickside_thread SET component_id=component_id || 'x' WHERE id=$1", {M.effect_id})
    local _, close_err = db:release()
    if write_err then error(write_err) end
    if close_err then error(close_err) end
end
function M.database(): any
    local tx = {
        query = function(_self: any, statement: string, _args: any): (any, error?)
            if statement:find("FROM kickside_thread", 1, true) then return {{id = "thread"}}, nil end
            if statement:find("SELECT c.id", 1, true) then return {{id = "cursor", projection_id = "projection", job_id = "job",
                status = M.operation == "resume" and "paused" or "active", generation = 1}}, nil end
            if statement:find("SELECT id,kind", 1, true) then return {{id = "projection", kind = "kind", projection_key = "default"}}, nil end
            return {{id = "cursor-a"}, {id = "cursor-b"}}, nil
        end,
        execute = function(): (any, error?) return {rows_affected = 1}, nil end,
        commit = function(): (any, error?) M.commits = M.commits + 1; effect(); return true, nil end,
        rollback = function(): (any, error?) return true, nil end,
    }
    return {type = function(): (any, error?)
        M.types = M.types + 1
        if M.types > 1 then return outcome("posttype", M.dialect) end
        return M.dialect, nil
    end, begin = function(): (any, error?) return tx, nil end}
end
function M.notify_cursor(...: any): (any, error?)
    M.cursors = M.cursors + 1
    return outcome(M.cursors == 1 and "cursor" or "cursor2", false)
end
function M.wake_job(...: any): (any, error?) return true, nil end
function M.nudge_workers(...: any): (any, error?) M.nudges = M.nudges + 1; return outcome("nudge", 0) end
function M.notify_cancellations(...: any): error? M.cancellations = M.cancellations + 1; return M.failures.cancellations end
function M.cancel_jobs_tx(...: any): (any, error?, table[]) return true, nil, {} end
function M.notify(...: any): (any, error?) M.retention = M.retention + 1; return outcome("retention", false) end
function M.read(...: any): (any, error?) return nil, nil end
return M
