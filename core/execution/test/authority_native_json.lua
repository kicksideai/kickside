local json = require("json")
local fixture = require("fixture")
return {
    encode = function(value)
        if fixture.stage == "encode" then return nil, fixture.source end
        return json.encode(value)
    end,
    validate_string = function(schema, raw)
        if fixture.stage == "validate" then return false, fixture.source end
        return json.validate_string(schema, raw)
    end,
    decode = function(raw)
        if fixture.stage == "decode" then return nil, fixture.source end
        return json.decode(raw)
    end,
}
