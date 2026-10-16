local dependencies = require("dependencies")
local M = {}

function M.ensure_user() return {"workspace"}, dependencies.state.failure end

return M
