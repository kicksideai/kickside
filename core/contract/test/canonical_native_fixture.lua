local json = require("json")
local hash = require("hash")
local M = {stage = "", source = nil, malformed = false, value = nil, encodes = 0, hashes = 0}
function M.reset(stage: string, source: any, malformed: boolean, value: any)
    M.stage, M.source, M.malformed, M.value = stage, source, malformed, value
    M.encodes, M.hashes = 0, 0
end
function M.encode(value: any): (any, error?)
    M.encodes = M.encodes + 1
    if M.stage == "encode" then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return json.encode(value)
end
function M.sha256(value: string): (any, error?)
    M.hashes = M.hashes + 1
    if M.stage == "hash" then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return hash.sha256(value)
end
return M
