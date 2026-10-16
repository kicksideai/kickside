-- kickside.connection:reply_sender stand-in: authorizes like the real sender
-- (an operation without a reply proof needs the caller's connection WRITE
-- grant, refused with the component's typed error before any send), then
-- records each send_reply call and returns a fixed result, so the sink tests
-- exercise dispatch without booting the connection module's provider resolution.
local component = require("component")

local M = {}

local calls = {}
local partial_failure = false

function M.reset()
    calls = {}
    partial_failure = false
end

function M.fail_partially()
    partial_failure = true
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
    if partial_failure then return nil, "later chunk failed", true end
    return { sent = true, message_ref = "stub-message" }, nil
end

function M.update_status(handle, content)
    calls[#calls + 1] = { worker_config = handle, content = content, update_status = true }
    handle.sent = true
    handle.editable = true
    handle.message_ref = handle.message_ref or "stub-message"
    return handle, nil, true
end

function M.finish_status(handle, content)
    calls[#calls + 1] = { worker_config = handle, content = content, finish_status = true }
    return { sent = true, message_ref = handle.message_ref or "stub-message" }, nil, true
end

function M.send_status(worker_config, phase, label)
    calls[#calls + 1] = { worker_config = worker_config, phase = phase, label = label, send_status = true }
    return true, nil
end

return M
