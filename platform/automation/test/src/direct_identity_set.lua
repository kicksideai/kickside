-- Test-only seam: a direct component SET_EXECUTION_IDENTITY under the calling
-- user, bypassing the automation's command stream.
local component = require("component")

local function run(args: any): (any, any)
    local a = type(args) == "table" and args or {}
    local result, err = component.set_execution_identity(a.component_id, a.principal, a.request_id, a.expected_identity_generation)
    if err then
        return { success = false, kind = (err :: any):kind(), error = tostring(err) }, nil
    end
    return { success = true, result = result }, nil
end

return { run = run }
