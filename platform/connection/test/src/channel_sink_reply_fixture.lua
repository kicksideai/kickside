-- kickside.connection:reply_sender stand-in for the channel sink WRITE boundary:
-- send_reply authorizes like the real sender (an operation without a reply
-- proof needs the caller's connection WRITE grant, refused with the
-- component's typed error before any send), then records the call and returns
-- a fixed result, so the sink runs without the connection provider resolution.
local component = require("component")

local M = {}

local calls = {}

function M.reset()
    calls = {}
end

function M.calls()
    return calls
end

function M.send_reply(worker_config, content)
    if worker_config.reply_proof == nil then
        local _, access_err = component.validate_access(worker_config.component_id, component.ACCESS.WRITE)
        if access_err then return nil, access_err end
    end
    calls[#calls + 1] = { worker_config = worker_config, content = content }
    return { sent = true, message_ref = "stub-message" }, nil
end

return M
