local time = require("time")
local M = {stage = "", source = nil, entry = nil, malformed = false, value = nil,
    versions = 0, gets = 0, parses = 0, serial = 0}
function M.reset(stage: string, source: any, entry: any, malformed: boolean, value: any)
    M.stage, M.source, M.entry, M.malformed, M.value = stage, source, entry, malformed, value
    M.versions, M.gets, M.parses = 0, 0, 0
    M.serial = M.serial + 1
end
function M.current_version(): (any, error?)
    M.versions = M.versions + 1
    if M.stage == "version" then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return {id = function() return "retention-policy-fixture-" .. M.serial end}, nil
end
function M.get(id: string): (any, error?)
    M.gets = M.gets + 1
    if M.stage == "registry" and M.source then return nil, M.source end
    return M.entry, nil
end
function M.parse_duration(value: string): (any, error?)
    M.parses = M.parses + 1
    local fail_at = M.stage == "events" and 1 or M.stage == "receipts" and 2 or 0
    if M.parses == fail_at then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return time.parse_duration(value)
end
return M
