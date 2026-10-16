local automation = require("automation")
local component = require("component")
local M = {}
function M.call(args)
    if args.operation == "identity" then
        return automation.set_execution_identity(args.id, { principal = { kind = "user", id = "recurring_other" },
            request_id = args.request_id, expected_identity_generation = 0 })
    elseif args.operation == "state" then
        return automation.read_state(args.id, component.ACCESS.WRITE)
    end
    return automation.control(args.id, { control = "pause", request_id = args.request_id })
end
return M
