local maintenance = require("maintenance")

local function run(args: any): (any?, any?)
    if type(args) ~= "table" or (args.phase ~= "observe" and args.phase ~= "publish") then
        return nil, errors.new({ kind = errors.INVALID, message = "maintenance run phase required" })
    end
    return maintenance.row_action(args)
end

return { run = run }
