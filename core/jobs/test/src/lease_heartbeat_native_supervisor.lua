local time = require("time")
local fixture = require("fixture")
return {notify = fixture.notify, parse_deadline = function(value)
    fixture.parses = fixture.parses + 1
    return fixture.result(fixture.parses == 1 and "deadline" or "committed_deadline", time.now():add(30 * time.SECOND))
end}
