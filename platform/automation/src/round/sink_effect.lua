local automations = require("automations_lib")

local M = {}
type Map = { [string]: any }

-- sink(request) -> the sink write's packet. It runs in the execution frame of
-- the round delivery that calls it; a call error may follow the send.
function M.sink(request: Map): (Map?, any)
    local writer,open_err,open_envelope=automations.open_sink_writer(request.binding,request.config,request.drive.deadline)
    if not writer then return {message=open_err,envelope=open_envelope},nil end
    local result,message,envelope=writer:write(request.body)
    return {result=result,message=message,envelope=envelope},nil
end

return M
