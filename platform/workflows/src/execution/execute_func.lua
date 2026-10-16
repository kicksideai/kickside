-- Function entry for cross-module workflow execution. The returned value is the
-- native Dataflow run handle.

local execution = require("execution")

local M = {}

function M.run(args: any): (any?, error?)
    local a = type(args) == "table" and args or {}
    return execution.run(a.flow_ref, a.input, a.opts)
end

return M
