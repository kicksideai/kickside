local json = require("json")
local M = {stage = "", source = nil, gets = 0, reads = 0, releases = 0, decodes = 0}
function M.reset(stage: string, source: any)
    M.stage, M.source = stage, source
    M.gets, M.reads, M.releases, M.decodes = 0, 0, 0, 0
end
local db = {}
function db:release() M.releases = M.releases + 1 end
function M.get(id: string): (any, error?)
    M.gets = M.gets + 1
    if M.stage == "get" or M.stage == "missing_get" then return nil, M.source end
    return db, nil
end
function M.list_events(handle: any, thread_id: string, options: table): (any, error?)
    M.reads = M.reads + 1
    if M.stage == "read" then return nil, M.source end
    return {events = {{id = "event", seq = 1, type = "note", role = "system",
        body = M.stage == "real_decode" and "{" or '{"n":7}', created_at = "2026-10-09T00:00:00Z"}}}, nil
end
function M.decode(value: string): (any, error?)
    M.decodes = M.decodes + 1
    if M.stage == "decode" then return nil, M.source end
    local result, err = json.decode(value)
    M.source = err
    return result, err
end
return M
