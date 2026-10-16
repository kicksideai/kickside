local M: any = {}
function M.reset(stage, source, primary)
    M.stage, M.source, M.primary, M.sets, M.spawns, M.fences, M.retries = stage, source, primary, 0, 0, 0, 0
end
function M.get_options(...) return {trap_links = false} end
function M.set_options(options)
    M.sets = M.sets + 1
    if (M.stage == "trap" and M.sets == 1) or (M.stage == "restore" and M.sets == 2) then return nil, M.source end
    return true, nil
end
return M
