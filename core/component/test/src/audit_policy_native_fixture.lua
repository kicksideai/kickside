local M = {}
function M.configure(source, entry)
    M.source, M.entry, M.calls = source, entry, 0
end
function M.get(id): (any, error?)
    M.calls = M.calls + 1
    return M.entry, M.source
end
return M
