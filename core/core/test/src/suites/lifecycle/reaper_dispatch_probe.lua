local projection_worker = require("projection_worker")

local M = {}

function M.run(args: any): table
    local output, err = projection_worker.run(args.binding, args.input)
    return { output = output, error = err and tostring(err) or nil }
end

return M
