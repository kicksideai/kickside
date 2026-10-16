local json = require("json")
local fixture = require("fixture")
local function encode(value)
    fixture.encodes = fixture.encodes + 1
    if fixture.stage == "encode" then return nil, fixture.source end
    return json.encode(value)
end
return {encode = encode}
