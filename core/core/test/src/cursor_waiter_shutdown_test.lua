local test = require("test")
local process = require("process")
local time = require("time")
local channel = require("channel")

local function exit_event(pid, events)
    local timer = time.after("3s")
    while true do
        local selected = channel.select({ events:case_receive(), timer:case_receive() })
        if selected.channel == timer then
            process.terminate(pid)
            error("cursor waiter broker did not exit")
        end
        local event = selected.value
        if event.kind == process.event.EXIT and event.from == pid then return event end
    end
end

local function define_tests()
    test.describe("Cursor waiter broker shutdown", function()
        test.it("exits without error on normal cancellation", function()
            local events = process.events()
            local pid, err = process.spawn_monitored("app:isolated_cursor_waiter", "app:processes")
            test.is_nil(err)
            test.not_nil(pid)
            local _, cancel_err = process.cancel(pid)
            test.is_nil(cancel_err)
            local event = exit_event(pid, events)
            test.is_nil(event.result.error)
        end)

        test.it("keeps a broker contender alive and cancels it without error", function()
            local events = process.events()
            local pid, err = process.spawn_monitored("kickside.core.threads:cursor_waiter", "app:processes")
            test.is_nil(err)
            test.not_nil(pid)
            local observation = time.after("20ms")
            local selected = channel.select({ events:case_receive(), observation:case_receive() })
            test.eq(selected.channel, observation, "the remote-owner contender stays alive")
            local _, cancel_err = process.cancel(pid)
            test.is_nil(cancel_err)
            local event = exit_event(pid, events)
            test.is_nil(event.result.error)
        end)

        for _, target in ipairs({ "app:upgrading_cursor_waiter", "app:upgrading_cursor_waiter_contender" }) do
            test.it("upgrades the outdated broker process " .. target, function()
                local events = process.events()
                local pid, err = process.spawn_monitored(target, "app:processes")
                test.is_nil(err)
                test.not_nil(pid)
                local event = exit_event(pid, events)
                test.is_nil(event.result.error)
                test.not_nil(event.result.value)
                test.eq(event.result.value.upgraded, true)
            end)
        end
        test.it("keeps registration failures reported", function()
            local events = process.events()
            local pid, err = process.spawn_monitored("app:denied_cursor_waiter", "app:processes")
            test.is_nil(err)
            local event = exit_event(pid, events)
            test.not_nil(event.result.error)
            test.contains(tostring(event.result.error), "registration failed")
        end)
    end)
end
return { run = test.run_cases(define_tests) }
