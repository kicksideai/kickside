local M = {}

function M.no_store(res: any)
    res:set_header("Cache-Control", "no-store")
    res:set_header("Pragma", "no-cache")
end

return M
