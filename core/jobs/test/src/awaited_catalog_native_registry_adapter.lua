local native = require("registry")
local fixture = require("fixture")
return {find = function(query)
    if fixture.source then return nil, fixture.source end
    if fixture.rows then return fixture.rows, nil end
    return native.find(query)
end}
