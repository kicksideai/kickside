-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local process = require("process")
local harness = require("harness")
local function failure()
    return errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "policy settings unavailable",
        details = {code = "policy_read_test"}})
end
local function sqlite_workers(count)
    return {["worker.count_sqlite"] = count, ["worker.awaited_slots"] = 1}
end
return {run = test.run_cases(function()
    test.describe("Owner policy from Settings", function()
        test.it("subscribes to Settings changes before the first policy read", function()
            local ctx = harness.run({
                function(c)
                    test.eq(c.subscriptions, 1)
                    test.eq(c.reads, 1)
                    test.eq(c.spawned, 2)
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            })
            test.is_nil(ctx.error)
        end)
        test.it("applies a Settings change without a policy timer", function()
            local ctx = harness.run({
                function(c)
                    test.eq(c.timers, 0, "an idle owner arms no policy timer")
                    c.overrides = sqlite_workers(2)
                    return harness.settings_change(c, 2)
                end,
                function(c)
                    test.eq(c.reads, 2)
                    test.eq(c.spawned, 3, "the pool grows to the new size")
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            })
            test.is_nil(ctx.error)
        end)
        test.it("does not reread Settings on ordinary owner events", function()
            local ctx = harness.run({
                function(c) return {channel = c.wake, value = {}} end,
                function(c) return {channel = c.wake, value = {}} end,
                function(c)
                    test.eq(c.reads, 1)
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            })
            test.is_nil(ctx.error)
        end)
        test.it("keeps the last good policy on a failed read and retries on the owner deadline", function()
            local steps = {}
            steps[1] = function(c)
                c.read_error = failure()
                return harness.settings_change(c, 2)
            end
            for _ = 1, 5 do
                steps[#steps + 1] = function(c)
                    test.eq(c.reads, 2, "busy events respect the failed-read retry deadline")
                    test.eq(c.spawned, 2)
                    test.eq(#c.canceled, 0)
                    return harness.settings_change(c, 3)
                end
            end
            steps[#steps + 1] = function(c)
                c.read_error = nil
                c.overrides = sqlite_workers(2)
                c.now_ns = 31000000000
                return {channel = c.timer}
            end
            steps[#steps + 1] = function(c)
                test.eq(c.spawned, 3)
                return {channel = c.events, value = {kind = process.event.CANCEL}}
            end
            local ctx = harness.run(steps)
            test.is_nil(ctx.error)
        end)
        test.it("retries a failed startup read without an external event", function()
            local ctx = harness.run({
                function(c)
                    test.eq(c.spawned, 0)
                    test.not_nil(c.timer, "a failed startup read must arm an owner retry")
                    c.now_ns = 1000000000
                    return {channel = c.timer}
                end,
                function(c)
                    test.eq(c.spawned, 0)
                    test.not_nil(c.timer, "a repeated failure must keep a retry armed")
                    c.read_error = nil
                    c.now_ns = 2000000000
                    return {channel = c.timer}
                end,
                function(c)
                    test.eq(c.spawned, 2)
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            }, function(c) c.read_error = failure() end)
            test.is_nil(ctx.error)
        end)
        test.it("keeps the last good policy when a change does not resolve, then recovers", function()
            local ctx = harness.run({
                function(c)
                    c.overrides = {["lease.timeout"] = "5s", ["lease.heartbeat"] = "10s"}
                    return harness.settings_change(c, 2)
                end,
                function(c)
                    test.eq(#c.canceled, 0)
                    test.eq(c.spawned, 0, "the adopted slots keep running")
                    c.overrides = sqlite_workers(2)
                    c.now_ns = 1000000000
                    return harness.settings_change(c, 3)
                end,
                function(c)
                    test.eq(c.spawned, 1, "the recovered policy grows the adopted pool")
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            }, nil, harness.handover())
            test.is_nil(ctx.error)
            test.is_true(ctx.closed)
        end)
        test.it("hands its policy to upgraded code and keeps running executions", function()
            local ctx = harness.run({
                function(c) return {channel = c.events, value = {kind = process.event.OUTDATED}} end,
            }, function(c) c.overrides = sqlite_workers(1) end, harness.handover())
            test.is_nil(ctx.error)
            test.eq(ctx.handover.policy.worker_count_sqlite, 1)
            test.is_nil(ctx.handover.policy.fields)
            test.eq(ctx.reads, 1)
            test.eq(ctx.handover.slots[2].assignment.job.id, "running")
            test.neq(ctx.canceled[1], "old-busy")
        end)
        test.it("does not apply a policy before dialect detection and resizing succeed", function()
            local ctx = harness.run({
                function(c)
                    test.eq(c.spawned, 0)
                    c.dialect_error = nil
                    c.now_ns = 1000000000
                    return {channel = c.timer}
                end,
                function(c)
                    test.eq(c.spawned, 2)
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            }, function(c) c.dialect_error = failure() end)
            test.is_nil(ctx.error)
        end)
        test.it("refuses to start when the Settings subscription fails", function()
            local ctx = harness.run({}, function(c) c.subscribe_error = failure() end)
            test.not_nil(ctx.error)
            test.eq(ctx.spawned, 0)
        end)
    end)
end)}
