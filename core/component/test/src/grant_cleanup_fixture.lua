local M: any = {}
function M.reset(stage, source)
    M.stage, M.source, M.rollback_source, M.release_source = stage, source, nil, nil
    M.opens, M.begins, M.scans, M.deletes, M.commits, M.rollbacks, M.releases = 0, 0, 0, 0, 0, 0, 0
    M.rows = {{access_id = "access"}}
end
local tx: any = {}
function tx:query(query, params)
    M.scans = M.scans + 1
    if M.stage == "scan" then return nil, M.source end
    return M.rows, nil
end
function tx:execute(query, params)
    M.deletes = M.deletes + 1
    if M.stage == "delete" then return nil, M.source end
    return {rows_affected = 1}, nil
end
function tx:commit()
    M.commits = M.commits + 1
    if M.stage == "commit" then return nil, M.source end
    return true, nil
end
function tx:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_source end
local db: any = {}
function db:begin()
    M.begins = M.begins + 1
    if M.stage == "begin" then return nil, M.source end
    return tx, nil
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
return M
