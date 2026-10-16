local time = require("time")
local fixture = require("fixture")
return {parse = fixture.parse_time, now = time.now, MILLISECOND = time.MILLISECOND}
