local native = require("process")
local fixture = require("fixture")
return {event = native.event,
    spawn_linked_monitored = function(...) return fixture.result("spawn", "heartbeat-process") end,
    events = function() return {case_receive = function(self) return self end} end,
    cancel = function(...) return fixture.result("cancel", true) end,
}
