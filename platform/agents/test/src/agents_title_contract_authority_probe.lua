local security = require("security")

local function run()
    return security.can("contract.call", "query")
end

return { run = run }
