local metadata = require("metadata")
local fixture = require("fixture")
local envelope = require("envelope")
return {run = function(stage: string)
    fixture.reset(stage)
    local result = metadata.set_meta({component_id = "11111111-1111-4111-8111-111111111111", fields = {label = "kept"}})
    if result.success == false then return nil, envelope.error_of(result, "metadata", "metadata refuses") end
    return result, nil
end}
