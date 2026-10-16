local M: any = {}
function M.reset(operation, stage, source, dialect)
    M.operation, M.stage, M.source, M.dialect = operation, stage, source, dialect
    M.rollback_source, M.abort = nil, nil
    M.opens, M.releases, M.rollbacks, M.commits, M.notifies = 0, 0, 0, 0, 0
end
function M.result(stage, value)
    if stage == M.stage then return nil, M.source end
    return value, nil
end
function M.row()
    return {sink_id = "sink", idempotency_key = "key", identity_key = "identity", payload_hash = "hash",
        status = "pending", created_at = "2026-10-10T00:00:00Z", dest_refs_json = "{}", outcome_json = "{}"}
end
function M.transaction(): any
    return {db_type = function() return M.result("dialect", M.dialect) end,
        query = function()
            local rows = M.operation == "reserve" and {} or {M.row()}
            if M.abort == "absent" then rows = {}
            elseif M.abort == "mismatch" then rows[1].payload_hash = "different"
            elseif M.abort == "committed" then rows[1].status = "committed" end
            return M.result("locked_read", rows)
        end,
        execute = function() return M.result("insert", {rows_affected = 1}) end,
        rollback = function() M.rollbacks = M.rollbacks + 1; return true, M.rollback_source end,
        commit = function() M.commits = M.commits + 1; return M.result("commit", true) end}
end
function M.database(): any
    return {query = function() return M.result("read", {M.row()}) end,
        begin = function() return M.result("begin", M.transaction()) end,
        release = function() M.releases = M.releases + 1 end}
end
function M.get()
    M.opens = M.opens + 1
    return M.result("open" .. tostring(M.opens), M.database())
end
function M.builder(operation)
    local query = {}
    function query:set(...) return self end
    function query:where(...) return self end
    function query:run_with(...) return self end
    function query:exec()
        local stage = operation == "delete" and "delete" or "update"
        return M.result(stage, {rows_affected = M.abort == "deletion_proof" and 0 or 1})
    end
    return query
end
function M.check_row(...) return select(2, M.result("row_size", true)) end
function M.notify(...) M.notifies = M.notifies + 1; return true, nil end
return M
