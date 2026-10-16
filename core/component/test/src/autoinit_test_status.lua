-- Harness get_status for the test component-kind binding. The autoinit suite only
-- exercises declaration parsing, so this exists to make the binding a structurally
-- valid contract.binding; it is never invoked.
local function get_status(request_dto: any): any
    return { success = true, description = "test component" }
end

return { get_status = get_status }
