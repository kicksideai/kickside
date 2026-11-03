local M: any = {}
function M.reset(route, source) M.route, M.source, M.calls, M.releases = route, source, 0, 0 end
function M.executor(): any
    local db: any = {}
    function db:release() M.releases = M.releases + 1 end
    function db:query()
        M.calls = M.calls + 1
        if M.route == "healthy" then return {}, nil end
        if M.route ~= "grant_insert" and M.route ~= "email_upsert" and M.route ~= "email_delete" then return nil, M.source end
        return {{access_id = "grant", subject_id = "user@example.test", component_id = "component", source_component_id = "component", access_mask = 1, inherited = 0, created_at = "2026-10-10T00:00:00Z"}}, nil
    end
    function db:execute(operation)
        M.calls = M.calls + 1
        if M.route == "email_delete" and operation:sub(1,6) == "INSERT" then return {rows_affected = 1}, nil end
        return nil, M.source
    end
    return db
end
function M.get()
    if M.route == "database" then return nil, M.source end
    return M.executor(), nil
end
return M
