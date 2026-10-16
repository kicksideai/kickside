local M: any = {}
function M.reset(stage, source)
    M.stage, M.source = stage, source
    M.pending_calls, M.reap_calls, M.audit_calls = 0, 0, 0
end
function M.pending(limit, owner)
    M.pending_calls = M.pending_calls + 1; M.limit, M.owner = limit, owner
    if M.stage == "pending" then return nil, M.source end
    return 2, nil, true, {{code = "pending_blocker"}}
end
function M.reap()
    M.reap_calls = M.reap_calls + 1
    if M.stage == "reap" then return nil, M.source end
    return 3, nil, true, {{code = "reap_blocker"}}
end
function M.audit()
    M.audit_calls = M.audit_calls + 1
    if M.stage == "audit" then return nil, M.source end
    return {published = 7, pruned = 11}, nil
end
return M
