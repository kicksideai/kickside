local json = require("json")
local fixture = require("fixture")
return {
    encode = function(value): (any, error?)
        fixture.encodes = fixture.encodes + 1
        if fixture.stage == "encode" then return nil, fixture.source end
        return json.encode(value)
    end,
    decode = function(value): (any, error?)
        fixture.decodes = fixture.decodes + 1
        if fixture.stage == "decode" then return nil, fixture.source end
        return json.decode(value)
    end,
}
