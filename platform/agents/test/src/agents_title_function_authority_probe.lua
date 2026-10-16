local security = require("security")

local function run()
    return security.can("funcs.call", "kickside.component.binding:query_components_func")
end

return { run = run }
