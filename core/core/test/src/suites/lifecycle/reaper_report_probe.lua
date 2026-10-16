local report = require("report")

local M = {}

function M.run(args: any): any
    local subject_id = type(args) == "table" and args.subject_id or nil
    local reported, err = report.principal_deleted(subject_id)
    return { reported = reported == true, error = err }
end

return M
