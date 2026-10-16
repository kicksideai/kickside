local fixture = require("fixture")
local process = require("process")
local M: any = {}
for key, value in pairs(process) do M[key] = value end
M.registry = {CONSISTENT = process.registry.CONSISTENT, lookup = function(name, consistency)
    fixture.lookups = fixture.lookups + 1
    fixture.name, fixture.consistency = name, consistency
    if fixture.stage == "lookup" then return nil, fixture.source end
    return fixture.pid, nil
end}
M.send = function(pid, topic, payload)
    fixture.sends = fixture.sends + 1
    fixture.target, fixture.topic, fixture.payload = pid, topic, payload
    if fixture.stage == "send" then return nil, fixture.source end
    return true, nil
end
M.listen = function(topic)
    fixture.listens = fixture.listens + 1
    if fixture.stage == "listen" then return nil, fixture.source end
    return {topic = topic}, nil
end
M.unlisten = function(_listener) fixture.unlistens = fixture.unlistens + 1 end
M.set_options = function(_options) end
M.events = function() return {} end
return M
