local funcs = require("funcs")
local function handler(args)
    local result, failure = funcs.call("kickside.discord.inbound:receive_channel_message", {
        component_id = args.connection_id,
        event = args.event,
    })
    if failure then return nil, failure end
    return result
end
return { handler = handler }
