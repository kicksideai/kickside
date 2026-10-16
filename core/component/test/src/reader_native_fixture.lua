local M: any = {}
function M.reset(route: string, stage: string, source: any)
    M.route, M.stage, M.source = route, stage, source
    M.opens, M.releases, M.queries, M.metadata, M.narrows, M.candidates = 0, 0, 0, 0, 0, 0
    M.release_source, M.empty, M.context = nil, false, nil
end
function M.get(...)
    M.opens = M.opens + 1
    if M.stage == "open" then return nil, M.source end
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "release" then return nil, M.source end
        return true, M.release_source
    end}, nil
end
function M.query()
    M.queries = M.queries + 1
    if M.stage == "query" then return nil, M.source end
    if M.route == "count" or M.route == "exists" then return {{count = M.empty and 0 or 1}}, nil end
    if M.empty then return {}, nil end
    return {{component_id = "11111111-1111-4111-8111-111111111111", impl_id = "implementation", created_at = "now", updated_at = "now", private_context = M.context, context_revision = 9}}, nil
end
function M.meta()
    M.metadata = M.metadata + 1
    if M.stage == "metadata" then return nil, M.source end
    return {{component_id = "11111111-1111-4111-8111-111111111111", key = "title", value = "kept"}}, nil
end
function M.narrow(db, query, candidates)
    M.narrows = M.narrows + 1
    if candidates then M.candidates = M.candidates + 1 end
    if M.stage == "narrow" then return nil, M.source end
    return query, nil
end
return M
