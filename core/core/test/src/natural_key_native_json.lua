local json = require("json")
local fixture = require("fixture")
return {decode = function(value)
    if fixture.stage == "decode" then return nil, fixture.source end
    return json.decode(value)
end}
