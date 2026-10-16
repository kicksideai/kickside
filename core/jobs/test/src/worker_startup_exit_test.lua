local test = require("test")
local process = require("process")
local channel = require("channel")
local time = require("time")
return {run = test.run_cases(function()
    test.describe("native worker startup process exit", function()
        for _, args in ipairs({{}, {dispatcher_pid = ""}, {dispatcher_pid = false}, {dispatcher_pid = {}}}) do
            test.it("dispatcher identity/" .. tostring(args.dispatcher_pid), function()
                local lifecycle = process.events()
                local pid, spawn_err = process.spawn_monitored("kickside.core.jobs.service:loop", "app:processes", args)
                test.is_nil(spawn_err)
                if type(pid) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "startup exit guard requires a child pid"})) end
                local deadline = time.after("15s")
                while true do
                    local selected = channel.select({lifecycle:case_receive(), deadline:case_receive()})
                    if selected.channel ~= lifecycle then
                        local _, stop_err = process.terminate(pid)
                        test.is_nil(stop_err)
                        error(errors.new({kind = errors.TIMEOUT, retryable = false, message = "startup loop exit does not arrive"}))
                    end
                    local event = selected.value
                    if type(event) == "table" and event.kind == process.event.EXIT and tostring(event.from) == pid then
                        local result = event.result
                        if type(result) ~= "table" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "startup guard requires an exit result"})) end
                        local actual = result.error
                        if type(actual) ~= "userdata" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "startup guard requires a native exit error"})) end
                        test.eq(actual:kind(), errors.INVALID); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_worker_identity"); test.eq(actual:details().field, "dispatcher_pid")
                        break
                    end
                end
            end)
        end
    end)
end)}
