local update = require("update")
local fixture = require("fixture")
local envelope = require("envelope")
return {run = function(stage: string)
    fixture.reset(stage)
    local result = update.handle({component_id = "11111111-1111-4111-8111-111111111111", commands = {{type = fixture.COMMAND_TYPES.SET_META, payload = {label = "kept"}}}})
    if result.success == false then return nil, envelope.error_of(result, "update", "update refuses") end
    return result, nil
end}
