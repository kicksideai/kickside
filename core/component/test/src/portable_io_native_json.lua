local json = require("json")
local fixture = require("fixture")
return {decode = function(raw)
    if fixture.source then return nil, fixture.source end
    return json.decode(raw)
end, encode = json.encode}
