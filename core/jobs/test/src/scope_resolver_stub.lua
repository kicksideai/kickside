local security = require("security")

local M = {}

function M.resolve(args: any): any
    local subject_id = type(args) == "table" and tostring((args :: any).subject_id or "") or ""
    if subject_id == "" then
        local actor = security.actor()
        subject_id = actor and tostring(actor:id()) or ""
    end
    if subject_id == "" then
        return { subject_id = "", error = "subject_id is required" }
    end
    local status = "active"
    if subject_id == "disabled-job-user" then
        status = "disabled"
    elseif subject_id == "deleted-job-user" then
        status = "deleted"
    end
    return {
        subject_id = subject_id,
        groups = { "core_test" },
        scope_name = "wippy.security:process",
        meta = { user_id = subject_id, status = status },
    }
end

return M
