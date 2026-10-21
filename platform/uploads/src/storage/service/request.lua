local process = require("process")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local M = {}

function M.deliver(): (any?, any?)
    local pid = process.registry.lookup("kickside.uploads.storage:controller")
    if not pid then return nil, errors.new({ message = "Storage controller is not ready", kind = errors.UNAVAILABLE, retryable = true }) end
    local topic = "storage.reply." .. uuid.v4()
    local replies = process.listen(topic, { message = true })
    local _, send_err = process.send(pid, "storage.reconcile", { reply_pid = tostring(process.pid()), reply_topic = topic })
    if send_err then process.unlisten(replies); return nil, send_err end
    local timeout, timeout_err = time.after("15s")
    if timeout_err then process.unlisten(replies); return nil, timeout_err end
    local selected = channel.select({ replies:case_receive(), timeout:case_receive() })
    process.unlisten(replies)
    if selected.channel ~= replies then return nil, errors.new({ message = "Storage configuration acknowledgment timed out", kind = errors.TIMEOUT, retryable = true }) end
    return selected.value:payload():data(), nil
end

return M
