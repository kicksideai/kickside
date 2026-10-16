local lifecycle = require("lifecycle")
local M = {KIND = lifecycle.KIND, stage = "", source = nil, opens = 0, ensures = 0, appends = 0, releases = 0}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.release_source = stage, source, nil
    M.responses = {}
    M.opens, M.ensures, M.appends, M.releases = 0, 0, 0, 0
end
function M.get(id: string): (any, error?)
    M.opens = M.opens + 1
    if M.responses.get then return M.responses.get.value, nil end
    if M.stage == "get" then return nil, M.source end
    return {release = function(_self: any)
        M.releases = M.releases + 1
        return true, M.release_source
    end}, nil
end
function M.ensure(db: any, id: string, impl: string): (string?, error?)
    M.ensures = M.ensures + 1
    if M.responses.ensure then return M.responses.ensure.value, nil end
    if M.stage == "ensure" then return nil, M.source end
    return "thread", nil
end
function M.append(db: any, id: string, kind: string, key: string, data: any): (any, error?)
    M.appends = M.appends + 1
    M.owner, M.kind, M.key, M.data = id, kind, key, data
    if M.responses.append then return M.responses.append.value, nil end
    if M.stage == "append" then return nil, M.source end
    return {inserted = 1, duplicates = 0}, nil
end
return M
