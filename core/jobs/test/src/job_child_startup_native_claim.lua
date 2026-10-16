local fixture = require("fixture")
local adapter: any = {mark_started = function(...): (any, error?)
    if fixture.start_false then return fixture.result("start", false) end
    return fixture.result("start", true)
end}
return adapter
