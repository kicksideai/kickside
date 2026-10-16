-- The drive slot worker (kickside.automation:round, A21): one round per
-- attempt through the production round runner.
local round_runner = require("round_runner")

local M = {}

function M.run(input: any): (any?, error?)
    local runner, runner_err = round_runner.production()
    if runner_err or not runner then return nil, runner_err end
    return (runner :: any).run(input)
end

return M
