local M: any = {}
function M.reset(route: string, source: error?, primary: error?)
    M.route, M.source, M.primary, M.releases, M.queries, M.checks = route, source, primary, 0, 0, 0
    M.context = '{"_execution_identity":{"principal":{"kind":"user","id":"user-1"}}}'
end
function M.get(...)
    return {release = function(): (any, error?)
        M.releases = M.releases + 1; return true, M.source
    end, query = function(...)
        M.queries = M.queries + 1
        if M.primary then return nil, M.primary end
        return {{private_context = M.context,
            identity_generation = 2, identity_hash = "identity-hash", declaration_hash = "declaration-hash",
            declaration_command_generation = 3}}, nil
    end}, nil
end
function M.check(...)
    M.checks = M.checks + 1
    if M.primary then return false, M.primary end
    return true, nil
end
return M
