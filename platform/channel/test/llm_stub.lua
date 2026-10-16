local test_state = require("test_state")
local M = {}
function M.generate()
    if test_state.state.assessment_error then return nil, test_state.state.assessment_error end
    return { result = test_state.state.assessment_result or "RESPOND" }, nil
end
return M
