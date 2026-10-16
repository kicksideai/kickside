local M = {stage = "", source = nil, claims = 0, registers = 0, subscribes = 0,
    acquisitions = 0, recoveries = 0, unregisters = 0, unlistens = 0, closes = 0, releases = 0, selects = 0, wakes = 0, responses = {}}
local function mailbox(): any
    return {case_receive = function(self: any): table return {channel = self} end}
end
M.process_events = mailbox()
function M.reset(stage: string, source: any)
    M.stage, M.source = stage, source
    M.responses, M.wakes = {}, 0
    M.claims, M.registers, M.subscribes, M.acquisitions, M.recoveries = 0, 0, 0, 0, 0
    M.unregisters, M.unlistens, M.closes, M.releases, M.selects = 0, 0, 0, 0, 0
end
function M.claim(name: string, events: any): (boolean?, boolean, error?)
    M.claims = M.claims + 1
    if M.responses.claim then return M.responses.claim.value, M.responses.claim.cancel == true, M.responses.claim.error end
    if M.stage == "claim" then return nil, false, M.source end
    if M.stage == "cancel" then return nil, true, nil end
    return true, false, nil
end
function M.register(name: string, value: any, consistency: any): (boolean?, error?)
    M.registers = M.registers + 1
    if M.responses.register then return M.responses.register.value, nil end
    if M.stage == "register" then return nil, M.source end
    return true, nil
end
function M.unregister(name: string, consistency: any): (boolean, error?)
    M.unregisters = M.unregisters + 1
    return true, nil
end
function M.listen(topic: string): any return mailbox() end
function M.unlisten(ch: any): () M.unlistens = M.unlistens + 1 end
function M.subscription(): any
    return {channel = function(self: any): any return mailbox() end,
        close = function(self: any): () M.closes = M.closes + 1 end}
end
function M.subscribe(source: string, event: string): (any, error?)
    M.subscribes = M.subscribes + 1
    if M.responses.subscribe then return M.responses.subscribe.value, nil end
    if M.stage == "subscribe" then return nil, M.source end
    return M.subscription(), nil
end
function M.get(id: string): (any, error?)
    M.acquisitions = M.acquisitions + 1
    if M.responses.acquire then return M.responses.acquire.value, nil end
    if M.stage == "acquire" then return nil, M.source end
    return {release = function(self: any): () M.releases = M.releases + 1 end}, nil
end
function M.recover(db: any, pid: string): (any, error?)
    M.recoveries = M.recoveries + 1
    if M.responses.recover then return M.responses.recover.value, nil end
    if M.stage == "recover" then return nil, M.source end
    return {}, nil
end
function M.select(cases: table): table
    M.selects = M.selects + 1
    return {channel = M.process_events,
        value = {kind = M.stage == "wake" and M.selects == 1 and "wake" or "cancel"}, ok = true}
end
function M.wake(db: any, pid: string, change: table): (any, error?)
    M.wakes = M.wakes + 1
    if M.responses.wake then return M.responses.wake.value, nil end
    return {}, nil
end
return M
