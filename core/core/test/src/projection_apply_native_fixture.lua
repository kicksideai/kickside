local sql = require("sql")
local M: any = {}
function M.reset(stage: string, source: any, mode: string)
    M.stage, M.source, M.mode = stage, source, mode
    M.missing, M.proof, M.rollback_source, M.release_source = false, nil, nil, nil
    M.rollbacks, M.releases, M.commits, M.executions, M.encodes = 0, 0, 0, 0, 0
    M.appends, M.deferred, M.wakes, M.completing = 0, 0, 0, nil
    M.published_after, M.wake_keys, M.cached_appends = 0, {}, 0
    M.encoded_body, M.appended_events = nil, nil
    M.thread_locked, M.cursor_before_thread = false, false
    M.current_body, M.append_sequence = {}, 1
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
    M.encoded_body = _body
    M.encodes = M.encodes + 1
    return M.outcome(M.encodes == 1 and "append_encode" or "body_encode", "{}")
end
function M.decode(_body: any): (any, error?) return M.outcome("projection_decode", M.current_body) end
function M.from_row(...: any): (any, error?) return M.outcome("identity", {component_id = "component"}) end
function M.run_as(...: any): (any, error?)
    return M.outcome("admission", {writes = {{thread_id = "other", events = {{type = "example", body_json = "{}"}}}}})
end
function M.append_system_tx(_tx: any, _dbtype: any, thread_id: any, _events: any, _completion_id: any, opts: any): (any, error?)
    M.appends = M.appends + 1
    M.appended_events = _events
    if opts and opts.defer_wake == true then M.deferred = M.deferred + 1 end
    if opts and type(opts.locked_threads) == "table" then M.cached_appends = M.cached_appends + 1 end
    local events = {}
    for _ in ipairs(_events) do events[#events + 1] = {seq = M.append_sequence} end
    return M.outcome("append", {max_seq = M.append_sequence, inserted = 1, thread_id = thread_id, events = events})
end
function M.wake_multi(_tx: any, keys: any, _dbtype: any, completing: any): (any, error?)
    M.wakes = M.wakes + 1
    M.published_after, M.wake_keys = M.appends, keys
    M.completing = completing
    return M.outcome("wake", {})
end
function M.lock_thread_rows_tx(...: any): (any, error?)
    M.thread_locked = true
    return M.outcome("lock", {thread = {event_count = 1}, other = {event_count = 0}, another = {event_count = 0}})
end
function M.lower_tx(...: any): (any, error?) return M.outcome("pin", {pin_generation = 1}) end
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
            if _statement:find("SELECT body FROM kickside_projection", 1, true) then
                return M.outcome("projection_read", {{body = "{}"}})
            end
            return M.outcome("cursor", {{generation = M.mode == "stale" and 2 or 1,
                last_seq = 0, status = "active", job_id = "job"}})
        end,
        execute = function(_self: any, _statement: any, _args: any): (any, error?)
            if M.mode == "fail" and not M.thread_locked then M.cursor_before_thread = true end
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
