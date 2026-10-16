-- Harness declaration owner: a command id starting with "owned-" is the owner's
-- pending set_execution_identity command for the operator and principal the request names.
local function verify_identity_command(args: any): (any, any)
    local a = type(args) == "table" and args or {}
    local command_id = tostring(a.command_id or "")
    if command_id:sub(1, 6) ~= "owned-" then
        return { valid = false, reason = "no pending set_execution_identity command " .. command_id }, nil
    end
    return { valid = true, automation_id = a.automation_id }, nil
end

return { verify_identity_command = verify_identity_command }
