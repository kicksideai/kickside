local sql = require("sql")
local time = require("time")
local clock = require("native_clock")
local M: any = {NULL = {}, RFC3339 = time.RFC3339}
function M.reset(stage: string, source: any, dialect: string)
    M.stage, M.source, M.dialect, M.executes, M.parses = stage, source, dialect, 0, 0
    M.missing, M.proof = false, nil
end
function M.outcome(stage: string, value: any): (any, error?)
    if M.stage == stage then
        if M.missing then return M.proof, nil end
        return nil, M.source
    end
    return value, nil
end
function M.policy(): (any, error?) return M.outcome("policy", {max_row_bytes = 100000}) end
function M.parse(layout: string, raw: string): (any, error?)
    M.parses = M.parses + 1
    if M.stage == "parse" then return M.outcome("parse", nil) end
    return time.parse(layout, raw)
end
function M.now(_dialect: any): string return "2026-10-10 00:00:00.000000" end
function M.format(value: any, dialect: any): string return clock.format(value, dialect) end
function M.check(...: any): error? if M.stage == "history_size" then return M.source end return nil end
function M.check_update(...: any): error? if M.stage == "job_size" then return M.source end return nil end
function M.clear(...: any): error? if M.stage == "marker" then return M.source end return nil end
function M.transaction(): any
    return {
        db_type = function(_self: any): (any, error?) return M.outcome("dialect", M.dialect) end,
        query = function(_self: any, statement: string, _args: any): (any, error?)
            if statement:find("SELECT lease_token,status", 1, true) then
                return M.outcome("settled_run", {{lease_token = "token", status = "completed"}})
            elseif statement:find("SELECT status,lease_token,execution_seq", 1, true) then
                return M.outcome("settled_job", {{status = "done", execution_seq = 1}})
            end
            return M.outcome("lookup", {{id = "job", owner_kind = "component", owner_id = "owner",
                job_type = "worker", attempts = 1, execution_seq = 1, status = "running", lease_token = "token",
                slot = false, wake_control_pending = false, wake_enabled = false, queue_tier = "live"}})
        end,
        execute = function(_self: any, _statement: any, _args: any): (any, error?)
            M.executes = M.executes + 1
            local stage = M.dialect == sql.type.POSTGRES and "transition" or (M.executes == 1 and "update" or "history")
            return M.outcome(stage, {rows_affected = 1})
        end,
    }
end
return M
