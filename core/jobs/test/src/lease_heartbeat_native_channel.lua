local native = require("process")
local fixture = require("fixture")
return {select = function(cases)
    fixture.selections = fixture.selections + 1
    if fixture.stage == "release" or fixture.route == "cancel" or (fixture.stage ~= "extend" and fixture.selections > 1) then
        return {channel = cases[1], value = {kind = native.event.CANCEL}}
    end
    return {channel = cases[2]}
end}
