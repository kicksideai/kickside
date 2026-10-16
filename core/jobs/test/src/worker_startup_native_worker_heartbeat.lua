local fixture = require("fixture")
return {mark = fixture.mark, stop = fixture.stop,
    start = function(...): (any, error?) return fixture.result("heartbeat.id", "heartbeat") end}
