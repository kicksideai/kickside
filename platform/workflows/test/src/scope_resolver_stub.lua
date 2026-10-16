local security = require("security")

local M = {}

function M.resolve(args: any): any
    if type(args) == "table" and type((args :: any).principal) == "table" then
        local principal = (args :: any).principal
        local id = tostring(principal.id or "")
        if id == "" or principal.kind ~= "user" then
            return nil, "test resolver requires a user principal"
        end
        return {
            principal = { kind = "user", id = id },
            actor_id = id,
            groups = { "automation_test" },
            scope_name = "app:workflows_suite_policy",
            meta = { user_id = id, status = "active" },
        }
    end
    local subject_id = type(args) == "table" and tostring((args :: any).subject_id or "") or ""
    if subject_id == "" then
        local actor = security.actor()
        subject_id = actor and tostring(actor:id()) or ""
    end
    if subject_id == "" then return { subject_id = "", error = "subject_id is required" } end
    return {
        subject_id = subject_id,
        groups = { "automation_test" },
        scope_name = "wippy.security:process",
        meta = { user_id = subject_id, status = "active" },
    }
end

return M
