local sql = require("sql")
local M: any = {}
function M.reset(stage: string, source: any, mode: string)
    M.stage, M.source, M.mode = stage, source, mode
    M.missing, M.proof, M.rollback_source, M.release_source = false, nil, nil, nil
    M.rollbacks, M.releases, M.commits, M.executions, M.encodes = 0, 0, 0, 0, 0
end
function M.outcome(stage: string, value: any): (any, error?)
    if M.stage == stage then
        if M.missing then return M.proof, nil end
        return nil, M.source
    end
    return value, nil
end
function M.get(_id: any): (any, error?)
    if M.mode == "host" then return M.outcome("registry", {meta = {host_id = "app:host"}}) end
    return M.outcome("get", M.database())
end
function M.now(_dialect: any): string return "2026-10-10 00:00:00.000000" end
function M.encode(_body: any): (any, error?)
    M.encodes = M.encodes + 1
    return M.outcome(M.encodes == 1 and "append_encode" or "body_encode", "{}")
end
function M.from_row(...: any): (any, error?) return M.outcome("identity", {component_id = "component"}) end
function M.run_as(...: any): (any, error?)
    return M.outcome("admission", {writes = {{thread_id = "other", events = {{type = "example", body_json = "{}"}}}}})
end
function M.lock_thread_rows_tx(...: any): (any, error?) return M.outcome("lock", {thread = {event_count = 1}}) end
function M.append_system_tx(...: any): (any, error?) return M.outcome("append", {max_seq = 1}) end
function M.complete_tx(...: any): (any, error?) return M.outcome("complete", {completed = true}) end
function M.notify_cursor(...: any): (any, error?) return M.outcome("notify", false) end
function M.notify(...: any): (any, error?) return M.outcome("retention", false) end
function M.database(): any
    return {
        type = function(_self: any): (any, error?) return M.outcome("type", sql.type.SQLITE) end,
        begin = function(_self: any): (any, error?) return M.outcome("begin", M.transaction()) end,
        release = function(_self: any): (any, error?)
            M.releases = M.releases + 1
            if M.release_source then return nil, M.release_source end
            return M.outcome("release", true)
        end,
    }
end
function M.transaction(): any
    return {
        query = function(_self: any, _statement: any, _args: any): (any, error?)
            return M.outcome("cursor", {{generation = M.mode == "stale" and 2 or 1,
                last_seq = 0, status = "active", job_id = "job"}})
        end,
        execute = function(_self: any, _statement: any, _args: any): (any, error?)
            M.executions = M.executions + 1
            local stage = M.mode == "fail" and (M.executions == 1 and "fence" or "invalidate")
                or (M.executions == 1 and "update" or "cursor_update")
            return M.outcome(stage, {rows_affected = 1})
        end,
        rollback = function(_self: any): (any, error?)
            M.rollbacks = M.rollbacks + 1
            return true, M.rollback_source
        end,
        commit = function(_self: any): (any, error?)
            M.commits = M.commits + 1
            return M.outcome("commit", true)
        end,
    }
end
return M
