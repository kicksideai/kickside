local fixture = require("fixture")
return {call = function(target, topic, payload)
    fixture.calls = fixture.calls + 1
    fixture.target, fixture.topic, fixture.payload = target, topic, payload
    if fixture.stage == "call" then return nil, fixture.source end
    return false, nil
end}
