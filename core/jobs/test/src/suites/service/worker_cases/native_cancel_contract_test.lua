local test = require("test")
local process = require("process")
local time = require("time")
local channel = require("channel")

return { run = test.run_cases(function()
    test.describe("native process cancellation contract", function()
        test.it("reports a vanished monitored child as NOT_FOUND so pool drain can consume its exit", function()
            local events = process.events()
            local pid, spawn_err = process.spawn_monitored("app:job_sleep_proc", "app:processes", {})
            test.is_nil(spawn_err)
            local deadline = time.after("15s")
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, events, "the test-owned child does not exit")
                if selected.value.kind == process.event.EXIT and tostring(selected.value.from) == tostring(pid) then break end
            end
            local _, cancel_err = process.cancel(tostring(pid), "pool drain")
            test.not_nil(cancel_err)
            test.eq(cancel_err:kind(), errors.NOT_FOUND)
        end)
    end)
end) }
