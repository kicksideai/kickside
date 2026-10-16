local real = require("real")
local fixture = require("fixture")
return {validate_expect = real.validate_expect, validate_subject = real.validate_subject, check = real.check, version = fixture.version}
