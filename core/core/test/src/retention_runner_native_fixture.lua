local M = {stage = "", source = nil, missing = false, value = nil,
    sweeps = 0, owners = 0, sends = 0, deadlines = 0}
function M.reset(stage: string, source: any, missing: boolean?, value: any)
    M.stage, M.source, M.missing, M.value = stage, source, missing == true, value
    M.sweeps, M.owners, M.sends, M.deadlines = 0, 0, 0, 0
end
function M.sweep(db: any): (any, error?)
    M.sweeps = M.sweeps + 1
    if M.stage == "sweep" then
        if M.source then return nil, M.source end
        if M.missing then return M.value, nil end
    end
    return {events = 0, write_receipts = 0, needs_continue = M.stage == "send"}, nil
end
function M.owner_run(change: table?): (any, error?)
    M.owners = M.owners + 1
    if M.stage == "owner" then
        if M.source then return nil, M.source end
        if M.missing then return M.value, nil end
    end
    return {deleted = 0, needs_continue = false, failures = {}, blocked = {}}, nil
end
function M.send(pid: string, topic: string, change: any): (any, error?)
    M.sends = M.sends + 1
    M.sent_topic, M.sent_change = topic, change
    if M.stage == "send" then return nil, M.source end
    return true, nil
end
function M.deadline(db: any): (integer?, error?)
    M.deadlines = M.deadlines + 1
    if M.stage == "deadline" then return nil, M.source end
    return 12345, nil
end
return M
