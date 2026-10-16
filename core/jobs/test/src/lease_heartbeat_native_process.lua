local native = require("process")
return {event = native.event, events = function() return {case_receive = function(self) return self end} end}
