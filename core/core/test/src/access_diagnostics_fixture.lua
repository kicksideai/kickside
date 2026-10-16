local access = require("access")
local M = {}
M.id = "018fa746-bd62-7000-a000-000000000001"
function M.reset(stage: string, source: error?, cleanup: error?)
    M.stage, M.source, M.cleanup = stage, source, cleanup
    M.reads, M.permissions, M.releases, M.writes = 0, 0, 0, 0
    M.gate = access.new({reader = {get_component_id = function()
        M.reads = M.reads + 1
        if M.stage == "read" then return nil, M.source end
        if M.stage == "missing_component" then return nil, nil end
        return "component", nil
    end}, component = {has_access = function()
        M.permissions = M.permissions + 1
        if M.stage == "access" then return nil, M.source end
        if M.stage == "denied" then return false, nil end
        return true, nil
    end}})
end
function M.database(): any
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "missing_release" then return nil, nil end
        if M.stage == "false_release" then return false, nil end
        return M.cleanup == nil, M.cleanup
    end}
end
function M.get(...): (any, error?) return M.database(), nil end
function M.work(...): (any, error?)
    M.writes = M.writes + 1
    return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "access guard reaches unexpected work"})
end
return M
