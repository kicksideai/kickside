local task_target = require("task_target")
local M = {}

function M.install(input: any): (any?, any)
    if type(input) ~= "table" then
        return nil, errors.new({kind = errors.INVALID, message = "input is required", retryable = false})
    end
    local target, target_err = task_target.validate(input.target)
    if target_err or not target then return nil, target_err end
    local title = type(input.title) == "string" and input.title:match("%S") and input.title or "Manual task"
    local enabled = input.enabled ~= false
    return {source = {source_kind = "manual"}, enabled = enabled,
        state = {title = title, target = input.target, enabled = enabled},
        public_state = {when = "On request", enabled = enabled},
        metadata = {title = title, icon = "tabler:player-play", description = "On request"}}, nil
end

return M
