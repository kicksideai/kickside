local fixture = require("fixture")
local boot = require("boot")
return {main = function(args: table): any
    fixture.reset(args.stage, errors.new(args.source))
    return boot.main(nil)
end}
