local test_state = require("test_state")

local M = {}

function M.send_reply(_target: any, message: string): (boolean, string?)
    test_state.set_reply(message)
    return true, nil
end

return M
