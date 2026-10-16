local fixture = require("fixture")
return {actor = function()
    if fixture.stage == "actor" then return nil, fixture.source end
    return {id = function()
        if fixture.stage == "id" then return nil, fixture.source end
        return "user-1", nil
    end}, nil
end}
