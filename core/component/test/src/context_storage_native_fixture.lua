local M: any = {}
function M.reset(stage: string, source: any)
    M.stage, M.source = stage, source
    M.reads, M.writes, M.encodes, M.decodes, M.locks = 0, 0, 0, 0, 0
    M.raw, M.rows, M.records, M.count = "{}", nil, nil, 1
end
function M.lock_component_tx(...)
    M.locks = M.locks + 1
    if M.stage == "lock" then return M.source end
    return nil
end
return M
