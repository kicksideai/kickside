local models_repo = require("models_repo")

local M = {}

function M.run()
    local _, err = models_repo.reload()
    if err then
        return { status = "error", message = "models cache warm failed: " .. tostring(err) }
    end
    return { status = "success", message = "models cache warmed" }
end

return M
