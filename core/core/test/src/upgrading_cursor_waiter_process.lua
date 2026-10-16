local process = require("process")
local channel = require("channel")
local subject = {}
for key, value in pairs(process) do subject[key] = value end
local events = channel.new(1)
events:send({ kind = process.event.OUTDATED })
subject.events = function() return events end
subject.upgrade = function() return { upgraded = true }, nil end
return subject
