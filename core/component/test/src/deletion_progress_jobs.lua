local M: any = {calls = 0, rows = {}}
function M.get_jobs(ids: {string}): (any?, error?)
    M.calls = M.calls + 1
    M.ids = ids
    return M.rows, M.err
end
return M
