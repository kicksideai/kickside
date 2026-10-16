local projection = require("projection")
local function run(args: any): any
    local result, err = projection.catch_up_projection(args)
    return { result = result, error = err and tostring(err) or nil }
end
return { run = run }
