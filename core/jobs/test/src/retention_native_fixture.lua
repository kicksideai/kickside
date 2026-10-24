local M: any = {}
function M.reset(mode, stage, source, dialect)
    M.mode, M.stage, M.source, M.dialect = mode, stage, source, dialect
    M.missing, M.value, M.primary = false, nil, nil
    M.rollbacks, M.commits, M.writes, M.begins = 0, 0, 0, 0
    M.active = mode
    M.thread_owned, M.fence_calls, M.fenced_ids, M.writes_at_fence = false, 0, nil, nil
end
function M.result(stage, value)
    if stage == M.stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    if stage == "delete" and M.primary then return nil, M.primary end
    return value, nil
end
function M.reclaim_completed(...) return 0, nil end
function M.database(): any
    local db: any = {}
    function db:type() return M.result("dialect", M.dialect) end
    function db:begin()
        M.begins = M.begins + 1
        if M.mode == "receipts" or M.mode == "fences" then
            M.active = M.begins == 1 and "receipts" or "fences"
        end
        if M.active == M.mode then return M.result("begin", self) end
        return self, nil
    end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end
    function db:commit()
        M.commits = M.commits + 1
        if M.active == M.mode then return M.result("commit", true) end
        return true, nil
    end
    function db:query(statement, params)
        if statement:find("INSERT INTO kickside_job_thread_cleanup", 1, true) == 1 then
            M.fence_calls, M.fenced_ids, M.writes_at_fence = M.fence_calls + 1, params, M.writes
            local rows = {}
            for _, id in ipairs(params) do rows[#rows + 1] = {thread_id = id, started = true, next_page_seq = 0} end
            return M.result("owner_fences", rows)
        end
        if M.mode == "receipts" or M.mode == "fences" then
            if M.active == M.mode and statement:find("SELECT", 1, true) and M.begins > 0 then
                return M.result("candidates", {{thread_id = "thread", page_seq = 1}})
            end
            return {}, nil
        end
        if statement:find("FOR UPDATE", 1, true) then return M.result("prelock", {}) end
        return M.result("candidates", {{id = "job", job_id = "job", owner_kind = M.thread_owned and "thread" or "test", owner_id = "thread"}})
    end
    function db:execute(statement, params)
        M.writes = M.writes + 1
        if M.mode == "receipts" or M.mode == "fences" then
            if M.active == M.mode and M.begins > 0 then return M.result("delete", {rows_affected = 1}) end
            return {rows_affected = 0}, nil
        end
        return M.result("delete", {rows_affected = 1})
    end
    return db
end
return M
