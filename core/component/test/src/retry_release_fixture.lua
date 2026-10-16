local M: any = {}
function M.reset(stage, source)
    M.stage, M.source, M.release_source = stage, source, nil
    M.opens, M.scans, M.releases, M.deletes = 0, 0, 0, 0
    M.rows = {{component_id = "component"}}
end
local db: any = {}
function db:query(query, params)
    M.scans = M.scans + 1; M.query, M.params = query, params
    if M.stage == "scan" then return nil, M.source end
    return M.rows, nil
end
function db:release()
    M.releases = M.releases + 1
    if M.release_source then return nil, M.release_source end
    if M.stage == "release" then return nil, M.source end
    return true, nil
end
function M.get(id)
    M.opens = M.opens + 1
    if M.stage == "open" then return nil, M.source end
    return db, nil
end
function M.system_delete(id, policy)
    M.deletes = M.deletes + 1; M.deleted_id, M.policy = id, policy
    if M.stage == "delete" then return false, M.source end
    return true, nil
end
return M
