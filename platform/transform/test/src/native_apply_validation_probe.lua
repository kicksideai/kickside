local apply = require("apply")
local function run(request)
    return apply.apply(request)
end
return {run = run}
