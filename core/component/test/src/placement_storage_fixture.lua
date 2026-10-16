local M: any = {}
function M.reset(source: error?, dialect: string)
    M.source, M.dialect, M.rows, M.calls, M.dialect_error = source, dialect, {}, 0, nil
end
function M.db_type() return M.dialect, M.dialect_error end
function M.query(...) M.calls = M.calls + 1; return M.rows, M.source end
return M
