local native = require("json")
local fixture = require("fixture")
return {encode = function(value)
    local _, err = fixture.result("encode", true)
    if err then return nil, err end
    return native.encode(value)
end}
