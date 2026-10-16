local json = require("json")
local fixture = require("fixture")
return {encode = function(value)
    if fixture.stage == "encode" then return nil, fixture.source end
    if fixture.missing_encoding then return nil, nil end
    return json.encode(value)
end}
