local time = require("time")
local M = {stage = "", source = nil, entry = nil, parsed = nil, malformed = false, gets = 0, parses = 0}
function M.reset(stage: string, source: any, entry: any, malformed: boolean, parsed: any)
    M.stage, M.source, M.entry, M.malformed, M.parsed = stage, source, entry, malformed, parsed
    M.gets, M.parses = 0, 0
end
function M.get(id: string): (any, error?)
    M.gets = M.gets + 1
    if M.stage == "registry" and M.source then return nil, M.source end
    return M.entry, nil
end
function M.parse_duration(value: string): (any, error?)
    M.parses = M.parses + 1
    if M.stage == "duration" then
        if M.source then return nil, M.source end
        if M.malformed then return M.parsed, nil end
    end
    return time.parse_duration(value)
end
return M
