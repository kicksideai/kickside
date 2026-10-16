local M = {}

local function unwired(_payload: any?): any
    return {
        success = false,
        error = "component lifecycle implementation is not wired",
    }
end

M.created = unwired
M.updated = unwired
M.deleted = unwired
M.committed = unwired
M.publish_audit = unwired

return M
