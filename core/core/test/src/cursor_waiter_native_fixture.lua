local M: any = {stage = "", source = nil}
function M.reset(stage: string, source: error?): ()
    M.stage, M.source = stage, source
    M.lookups, M.sends, M.calls, M.listens, M.unlistens = 0, 0, 0, 0, 0
    M.pid = "broker"
end
return M
