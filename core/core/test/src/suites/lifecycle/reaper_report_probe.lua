local report = require("report")

local M = {}

function M.run(args: any): any
    local subject_id = type(args) == "table" and args.subject_id or nil
    local reported, err
    if type(args) == "table" and (args.component == true or args.incarnation ~= nil) then
        reported, err = report.component_deleted(subject_id, args.incarnation)
    else
        reported, err = report.principal_deleted(subject_id)
    end
    return { reported = reported == true, error = err }
end

return M
