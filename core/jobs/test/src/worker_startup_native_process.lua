local fixture = require("fixture")
local native = require("process")
local adapter: any = {registry = {CONSISTENT = native.registry.CONSISTENT, register = function(...): (any, error?) return fixture.result("registration", true) end}, event = native.event, pid = function(): string return "worker" end, events = fixture.events,
    listen = fixture.listen, unlisten = fixture.unlisten, send = fixture.send, set_options = function(...): (any, error?) return fixture.result("options", true) end}
return adapter
