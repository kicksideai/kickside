local M: any = {}
function M.reset(route, phase, source)
    M.route, M.phase, M.source = route, phase, source
    M.rollbacks, M.commits, M.updates = 0, 0, 0
    M.rollback_error, M.missing, M.value = nil, false, nil
    M.calls, M.called_entry = 0, nil
end
function M.result(phase, value)
    if M.phase == phase then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.policy(...) return M.result("policy", {max_row_bytes = 1000, wake_fanout_batch = 2}) end
function M.now(...) return "2026-10-10 00:00:00" end
function M.check_update(...) local _, err = M.result("size", true); return err end
function M.decode_payload(...) return M.result("payload", {wake_key = "key"}) end
function M.identity_parts(...) return M.result("identity", "identity") end
function M.enqueue_job(...) return M.result("enqueue", "continuation") end
function M.complete_tx(...) local _, err = M.result("complete", true); return err end
function M.rows_affected(result) return result and tonumber(result.rows_affected) or 0 end
function M.call(entry, ...)
    M.calls, M.called_entry = M.calls + 1, entry
    return M.result("nudge", 1)
end
function M.builder(...): any
    local q: any = {}
    function q:from(...) return self end
    function q:limit(...) return self end
    function q:set(...) return self end
    function q:suffix(...) return self end
    function q:where(...) return self end
    function q:run_with(...) return self end
    function q:query()
        return M.result(M.route == "continue" and "fanout" or "read", M.route == "continue" and {{demand_generation = 1, ack_generation = 0}} or {{scheduled_at = nil}})
    end
    function q:exec() M.updates = M.updates + 1; return M.result("update", {rows_affected = 1}) end
    return q
end
function M.transaction(): any
    local tx: any = {}
    function tx:db_type() return M.result("dialect", "sqlite") end
    function tx:query(statement, ...)
        local phase, value
        if statement:find("INSERT INTO kickside_wake_fanout", 1, true) then phase, value = "demand", {{demand_generation = 1}}
        elseif statement:find("WITH input AS", 1, true) then phase, value = "discovery", {{id = "job", acknowledged = false}}
        elseif statement:find("SELECT id FROM", 1, true) then phase, value = "candidates", {{id = "job"}}
        elseif statement:find("WHERE id IN", 1, true) then phase, value = "prelock", {{id = "job", status = "pending"}}
        else phase, value = "addressed", {{id = "job", status = "running"}} end
        return M.result(phase, value)
    end
    function tx:execute(statement, ...)
        return M.result(statement:find("dispatch_requested_at", 1, true) and "dispatch" or "ack", {rows_affected = 1})
    end
    function tx:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    function tx:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_error end
    return tx
end
function M.database(): any
    return {begin = function() return M.result("begin", M.transaction()) end}
end
return M
