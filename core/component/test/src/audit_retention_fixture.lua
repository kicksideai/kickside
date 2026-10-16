local M: any = {}
function M.reset(stage, source)
    M.stage, M.source = stage, source
    M.opens, M.releases, M.events, M.acks, M.begins, M.deletes, M.commits, M.rollbacks = 0, 0, 0, 0, 0, 0, 0, 0
    M.rollback_source, M.release_source, M.empty = nil, nil, false
end
function M.result(stage, result)
    if stage == M.stage then return nil, M.source end
    return result, nil
end
function M.db_id() return "fixture-db" end
function M.policy() return M.result("policy", {history_days = 365}) end
function M.publish_audit(row)
    M.events = M.events + 1; M.event = row
    return M.result("publish", true)
end
function M.get()
    M.opens = M.opens + 1
    local number = M.opens
    local db: any = {}
    function db:query()
        if number == 1 then return M.result("publication_scan", M.empty and {} or {{component_id = "component", impl_id = "implementation", identity_generation = 1, record_json = "{}"}}) end
        return M.result("owner_scan", M.empty and {} or {{component_id = "component"}})
    end
    function db:execute() M.acks = M.acks + 1; return M.result("ack", {rows_affected = 1}) end
    function db:begin()
        M.begins = M.begins + 1
        local writes = 0
        local tx: any = {}
        function tx:execute()
            writes = writes + 1
            if writes == 1 then return M.result("lock", {rows_affected = 1}) end
            M.deletes = M.deletes + 1
            return M.result("delete", {rows_affected = 1})
        end
        function tx:query() return M.result("prune_read", {{identity_generation = 1}}) end
        function tx:commit() M.commits = M.commits + 1; return M.result("commit", true) end
        function tx:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_source end
        return M.result("begin", tx)
    end
    function db:release()
        M.releases = M.releases + 1
        local stage = number == 1 and "publication_release" or number == 2 and "ack_release" or "retention_release"
        if stage == M.stage then return nil, M.source end
        return true, number == 3 and M.release_source or nil
    end
    local stage = number == 1 and "publication_open" or number == 2 and "ack_open" or "retention_open"
    return M.result(stage, db)
end
return M
