local http = require("http")
local fixture = require("fixture")
return {STATUS = http.STATUS, CONTENT = http.CONTENT, request = function() return fixture.runtime.request() end,
    response = function() return fixture.runtime.response() end}
