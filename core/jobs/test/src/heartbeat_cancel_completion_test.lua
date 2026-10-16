local test = require("test")
local process = require("process")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local heartbeat = require("heartbeat")
return {run = test.run_cases(function()
    test.describe("real heartbeat cancellation completion", function()
        test.it("the SDK returns true and the heartbeat wrapper completes an owned child", function()
            for _, use_wrapper in ipairs({false, true}) do
                local topic = "native.heartbeat.cancel." .. uuid.v7()
                local ready = process.listen(topic)
                local lifecycle = process.events()
                local pid, spawn_err = process.spawn_monitored("app:heartbeat_cancel_completion_probe", "app:processes",
                    {reply_pid = tostring(process.pid()), reply_topic = topic})
                test.is_nil(spawn_err)
                if type(pid) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cancellation guard requires a child pid"})) end
                local selected = channel.select({ready:case_receive(), time.after("5s"):case_receive()})
                process.unlisten(ready)
                if selected.channel ~= ready then
                    local _, stop_err = process.terminate(pid); test.is_nil(stop_err)
                    error(errors.new({kind = errors.TIMEOUT, retryable = false, message = "cancellation guard readiness does not arrive"}))
                end
                if use_wrapper then test.is_nil(heartbeat.stop(pid)) else
                    local accepted, cancel_err = process.cancel(pid, "1s"); test.is_nil(cancel_err); test.is_true(accepted)
                end
                local deadline = time.after("15s")
                while true do
                    local exit = channel.select({lifecycle:case_receive(), deadline:case_receive()})
                    if exit.channel ~= lifecycle then
                        local _, stop_err = process.terminate(pid); test.is_nil(stop_err)
                        error(errors.new({kind = errors.TIMEOUT, retryable = false, message = "cancellation guard exit does not arrive"}))
                    end
                    local event = exit.value
                    if type(event) == "table" and event.kind == process.event.EXIT and tostring(event.from) == pid then
                        test.is_nil(event.result.error); test.is_true(event.result.value.cancelled); break
                    end
                end
            end
        end)
    end)
end)}
