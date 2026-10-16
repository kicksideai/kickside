local eligibility = require("credential_eligibility")
local M = {}
function M.check(identifier: string): (boolean?, error?)
    local eligible, err = eligibility.check("kickside.mcp:credential_config", identifier)
    return eligible, err
end
return M
