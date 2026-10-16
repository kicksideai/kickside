local eligibility = require("credential_eligibility")

return {check = function(args)
    return eligibility.check(type(args) == "table" and args.identifier or nil)
end}
