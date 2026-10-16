local process = require("process")
local channel = require("channel")

local function run(input: any): ()
    local uploads = assert(process.listen(input.upload_topic))
    local flush = assert(process.listen("upload.probe.flush"))
    local registered, register_err = process.registry.register("user." .. input.user_id)
    assert(registered, tostring(register_err))
    local receipts = {}
    local _, ready_err = process.send(input.parent, input.reply_topic, { ready = true })
    if ready_err then error(tostring(ready_err)) end
    while true do
        local selected = channel.select({ uploads:case_receive(), flush:case_receive() })
        if selected.channel == uploads then
            receipts[#receipts + 1] = { topic = input.upload_topic, data = selected.value }
        else
            while true do
                local pending = channel.select({ uploads:case_receive(), default = true })
                if pending.default then break end
                receipts[#receipts + 1] = { topic = input.upload_topic, data = pending.value }
            end
            local _, reply_err = process.send(input.parent, input.reply_topic, { receipts = receipts })
            if reply_err then error(tostring(reply_err)) end
        end
    end
end
return { run = run }
