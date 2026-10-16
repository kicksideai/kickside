local fixture = require("fixture")
return {claim_singleton = function(_name, _events, _dependencies)
    return false, false, fixture.source, nil
end}
