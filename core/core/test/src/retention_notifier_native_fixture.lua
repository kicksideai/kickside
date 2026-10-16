local process = require("process")
local M = {stage = "", source = nil, pid = nil, lookups = 0, sends = 0, real = false}
function M.reset(stage: string, source: any, pid: any, real: boolean?)
    M.stage, M.source, M.pid, M.real = stage, source, pid, real == true
    M.lookups, M.sends = 0, 0
end
function M.lookup(name: string, consistency: any): (any, error?)
    M.lookups = M.lookups + 1
    if M.real and M.stage == "lookup" then
        local pid, err = process.registry.lookup("native-errors-unregistered-" .. process.pid(), consistency)
        M.source = err
        return pid, err
    end
    if M.stage == "lookup" then return nil, M.source end
    return M.pid, nil
end
function M.send(pid: string, topic: string, data: any): (any, error?)
    M.sends = M.sends + 1
    M.sent_pid, M.sent_topic, M.sent_data = pid, topic, data
    if M.real then
        local sent, err = process.send(pid, topic, data)
        M.source = err
        return sent, err
    end
    if M.stage == "send" then return nil, M.source end
    return true, nil
end
return M
