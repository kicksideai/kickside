local M: any = {}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.captures, M.resolutions, M.filters = stage, source, 0, 0, 0
end
return M
