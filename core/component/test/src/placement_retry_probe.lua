local placement = require("placement")
local fixture = require("fixture")
local envelope = require("envelope")
return {run = function(stage: string)
    fixture.reset(stage)
    local result = placement.handle({component_id = "11111111-1111-4111-8111-111111111111", parent_id = false})
    if result.success == false then return nil, envelope.error_of(result, "placement", "placement refuses") end
    return result, nil
end}
