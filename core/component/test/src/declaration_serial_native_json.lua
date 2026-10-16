local json = require("json")
local fixture = require("fixture")
return {
    encode = function(value): (any, error?)
        fixture.encodes = fixture.encodes + 1
        local stage = fixture.encodes == 1 and "receipt_encode" or "creation_encode"
        if fixture.stage == stage then return nil, fixture.source end
        return json.encode(value)
    end,
    decode = function(value): (any, error?)
        fixture.decodes = fixture.decodes + 1
        local stage = fixture.decodes == 1 and "receipt_decode" or "creation_decode"
        if fixture.stage == stage then return nil, fixture.source end
        return json.decode(value)
    end,
}
