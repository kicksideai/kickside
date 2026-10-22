local fixture = require("fixture")
return {can = fixture.can, actor = function()
    return nil, fixture.stage == "actor" and fixture.source or nil
end}
