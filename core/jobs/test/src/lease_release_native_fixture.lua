local M = {stage = "", source = nil, pid = "listener", lookups = 0, sends = 0, calls = 0}
function M.reset(stage: string, source: error?): ()
    M.stage, M.source, M.pid = stage, source, "listener"
    M.lookups, M.sends, M.calls = 0, 0, 0
end
function M.lookup(name: string, consistency: any): (any, error?)
    M.lookups = M.lookups + 1
    M.name, M.consistency = name, consistency
    if M.stage == "lookup" then return nil, M.source end
    return M.pid, nil
end
function M.send(pid: string, topic: string, payload: table): (any, error?)
    M.sends = M.sends + 1
    M.recipient, M.topic, M.payload = pid, topic, payload
    if M.stage == "send" then return nil, M.source end
    return true, nil
end
function M.call(target: string, id: string, execution_seq: number?, owner: table?): (any, error?)
    M.calls = M.calls + 1
    M.target, M.id, M.sequence, M.owner = target, id, execution_seq, owner
    if M.stage == "call" then return nil, M.source end
    return true, nil
end
return M
