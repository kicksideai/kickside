local json = require("json")
local fixture = require("fixture")
local M = {}
function M.encode(value)
    fixture.encodes = fixture.encodes + 1
    local stage = "encode_" .. tostring(fixture.encodes)
    if fixture.stage == stage then return fixture.result(stage, nil) end
    return json.encode(value)
end
function M.decode(value)
    fixture.decodes = fixture.decodes + 1
    local stage = "decode_" .. tostring(fixture.decodes)
    if fixture.stage == stage then return fixture.result(stage, nil) end
    return json.decode(value)
end
return M
