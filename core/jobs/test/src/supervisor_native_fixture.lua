local M = {stage = "", source = nil, pid = nil, sent = true, lookups = 0, sends = 0}
function M.reset(stage: string, source: any, pid: any, sent: any)
    M.stage, M.source, M.pid, M.sent = stage, source, pid, sent
    M.lookups, M.sends = 0, 0
end
function M.lookup(name: string, consistency: any): (any, error?)
    M.lookups = M.lookups + 1
    if M.stage == "lookup" then return nil, M.source end
    return M.pid, nil
end
function M.send(pid: string, topic: string, data: any): (any, error?)
    M.sends = M.sends + 1
    if M.stage == "send" then return nil, M.source end
    return M.sent, nil
end
return M
