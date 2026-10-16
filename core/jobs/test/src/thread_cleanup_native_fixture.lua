local M: any = {}
function M.reset(api, mode, stage, source)
    M.api, M.mode, M.stage, M.source = api, mode, stage, source
    M.primary, M.missing, M.value = nil, false, nil
    M.rollbacks, M.commits, M.writes = 0, 0, 0
    M.candidates, M.continuations, M.mutations, M.encodes, M.decodes = 0, 0, 0, 0, 0
    M.fence = {next_page_seq = (mode == "replay" or mode == "prior") and 1 or 0}
    M.row = {thread_id = "thread", page_seq = 0, processed = 1, done = true,
        discarded_json = '{"kickside_job":1}', unresolved_json = '{}',
        acknowledged_at = mode == "already" and "acknowledged" or nil}
    M.primary_stage = api == "ack" and "receipt" or (mode == "replay" and "receipt" or "candidate_1")
end
function M.result(stage, value)
    if stage == M.stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    if stage == M.primary_stage and M.primary then return nil, M.primary end
    return value, nil
end
function M.lock(...): (any?, error?) return M.result("fence", M.fence) end
function M.database(): any
    local db: any = {}
    function db:begin() return M.result("begin", self) end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end
    function db:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    function db:query(statement, params)
        if statement:find("SELECT f.thread_id", 1, true) then return M.result("owners", {{thread_id = "thread"}}) end
        if statement:find("FROM kickside_job_thread_cleanup_receipt", 1, true) then
            return M.result(M.mode == "prior" and "previous" or "receipt", {M.row})
        end
        if statement:find("FOR UPDATE", 1, true) then
            return M.result(statement:find("FROM kickside_job_run", 1, true) and "lock_run" or "lock_job", {{id = "job"}})
        end
        if statement:find("LIMIT 1", 1, true) then
            M.continuations = M.continuations + 1
            return M.result("continuation_" .. tostring(M.continuations), {})
        end
        M.candidates = M.candidates + 1
        local owned = M.candidates > 2
        local rows = M.mode == "selected" and {{id = "job", job_id = "parent", status = "done",
            owner_kind = owned and "thread" or "external", owner_id = owned and "thread" or "external"}} or {}
        return M.result("candidate_" .. tostring(M.candidates), rows)
    end
    function db:execute(statement, params)
        M.writes = M.writes + 1
        local stage
        if statement:find("INSERT INTO", 1, true) then stage = "insert"
        elseif statement:find("UPDATE kickside_job_thread_cleanup_receipt", 1, true) then
            stage = M.mode == "prior" and "previous_ack" or "ack_update"
        elseif statement:find("SET started=", 1, true) then stage = "state"
        elseif statement:find("UPDATE kickside_job_thread_cleanup", 1, true) then stage = "completed"
        else M.mutations = M.mutations + 1; stage = "mutation_" .. tostring(M.mutations) end
        return M.result(stage, {rows_affected = 1})
    end
    return db
end
return M
