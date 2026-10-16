local process = require("process")
local fixture = require("fixture")
return {pid = process.pid, events = function(): any return fixture.process_events end,
    event = {CANCEL = "cancel", OUTDATED = "outdated"}, listen = fixture.listen, unlisten = fixture.unlisten,
    registry = {register = fixture.register, unregister = fixture.unregister, CONSISTENT = process.registry.CONSISTENT}}
