-- Trusted publication of a run's already-authorized terminal audit event.
-- maintenance.row_action verifies the claimed row token before emitting.
local maintenance = require("maintenance")

local function run(args: any): (any?, any?)
    if type(args) ~= "table" or args.phase ~= "publish_event" then
        return nil, errors.new({ kind = errors.INVALID, message = "maintenance publication phase required" })
    end
    return maintenance.row_action(args)
end

return { run = run }
