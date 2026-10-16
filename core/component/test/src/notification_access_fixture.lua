local M: any = {}
function M.reset(source: error?)
    M.source, M.normalizations, M.grants, M.missing = source, 0, 0, false
end
function M.reaching_grants(...)
    M.grants = M.grants + 1; return {}, nil
end
return M
