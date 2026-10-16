local json = require("json")
local fixture = require("fixture")
return {encode = function(value)
    if fixture.source then return nil, fixture.source end
    if fixture.missing then return nil, nil end
    return json.encode(value)
end, decode = json.decode}
