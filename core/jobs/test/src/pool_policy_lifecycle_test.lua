-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local process = require("process")
local harness = require("harness")
local function failure()
    return errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "policy storage unavailable",
        details = {code = "policy_read_test"}})
end
return {run = test.run_cases(function()
    test.describe("Durable owner policy lifecycle", function()
        test.it("reads committed revisions on start and handover without requests", function()
            local ctx = harness.run({
                function(c)
                    test.eq(c.applied.applied_revision, 2)
                    test.eq(c.applied.total, 3)
                    c.committed = {revision = 3, values = {["worker.count_sqlite"] = 1, ["worker.awaited_slots"] = 1}}
                    return {channel = c.events, value = {kind = process.event.OUTDATED}}
                end,
            }, function(c) c.committed = {revision = 2, values = {["worker.count_sqlite"] = 2, ["worker.awaited_slots"] = 1}} end,
                harness.handover())
            test.is_nil(ctx.error)
            test.eq(ctx.handover.policy_revision, 3)
            test.eq(ctx.handover.policy.worker_count_sqlite, 1)
            test.is_nil(ctx.handover.policy.fields)
            test.eq(ctx.reads, 2)
            test.eq(ctx.handover.slots[2].assignment.job.id, "running")
            test.neq(ctx.canceled[1], "old-busy")
        end)
        for _, kind in ipairs({"read", "validation"}) do
            test.it("records " .. kind .. " failure and recovers on an ordinary owner event", function()
                local ctx = harness.run({
                    function(c)
                        if kind == "read" then c.read_error = failure() end
                        c.committed = {revision = 2, values = kind == "read"
                            and {["worker.count_sqlite"] = 2, ["worker.awaited_slots"] = 1}
                            or {["lease.timeout"] = "5s", ["lease.heartbeat"] = "10s"}}
                        return harness.nudge(c, 2)
                    end,
                    function(c)
                        test.eq(c.applied.applied_revision, 1)
                        test.not_nil(c.applied.apply_error)
                        test.eq(#c.canceled, 0)
                        c.read_error = nil
                        c.committed = {revision = 3, values = {["worker.count_sqlite"] = 2, ["worker.awaited_slots"] = 1}}
                        return harness.nudge(c, 3)
                    end,
                    function(c)
                        test.eq(c.applied.applied_revision, 3)
                        test.eq(c.applied.total, 3)
                        test.is_nil(c.applied.apply_error)
                        return {channel = c.events, value = {kind = process.event.CANCEL}}
                    end,
                }, nil, harness.handover())
                test.is_nil(ctx.error)
                test.is_true(ctx.closed)
            end)
        end
        test.it("does not acknowledge a revision before dialect detection and resizing succeed", function()
            local ctx = harness.run({
                function(c)
                    test.eq(c.applied.applied_revision, -1)
                    test.eq(c.applied.total, 0)
                    test.not_nil(c.applied.apply_error)
                    test.eq(c.spawned, 0)
                    c.dialect_error = nil
                    return harness.nudge(c, 1)
                end,
                function(c)
                    test.eq(c.applied.applied_revision, 1)
                    test.eq(c.applied.total, 2)
                    test.is_nil(c.applied.apply_error)
                    test.eq(c.reads, 1, "a failed resize keeps the validated candidate without reloading its overrides")
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            }, function(c) c.dialect_error = failure() end)
            test.is_nil(ctx.error)
        end)
        test.it("drains revision nudges during dispatch with no request or reply handling", function()
            local ctx = harness.run({
                function(c)
                    c.committed = {revision = 2, values = {["worker.count_sqlite"] = 2, ["worker.awaited_slots"] = 1}}
                    c.queued = {revision = 2}
                    return {channel = c.idle, value = {worker_id = "new-slot-1", epoch = 0, kind = "idle", version = "policy-version"}}
                end,
                function(c)
                    test.eq(c.applied.applied_revision, 2)
                    test.eq(c.applied.total, 3)
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            })
            test.is_nil(ctx.error)
        end)
        test.it("keeps the newer SQL revision when an older in-flight notification fails", function()
            local ctx = harness.run({
                function(c)
                    c.committed = {revision = 2, values = {["worker.count_sqlite"] = 2, ["worker.awaited_slots"] = 1}}
                    return harness.nudge(c, 2)
                end,
                function(c)
                    test.eq(c.applied.applied_revision, 2)
                    test.eq(c.applied.total, 3)
                    return {channel = c.future}
                end,
                function(c)
                    test.eq(#c.notices, 2, "an older failed wakeup never suppresses a newer applied state")
                    test.eq(c.applied.applied_revision, 2)
                    test.is_nil(c.applied.apply_error, "delivery never latches an apply error")
                    return {channel = c.future}
                end,
                function(c)
                    test.eq(#c.notices, 2, "delivery does not create a retry loop")
                    test.is_nil(c.applied.apply_error)
                    test.eq(c.reads, 1, "ordinary events do not reopen committed policy")
                    return {channel = c.events, value = {kind = process.event.CANCEL}}
                end,
            }, function(c) c.publish, c.fail_publication = true, failure() end, harness.handover())
            test.is_nil(ctx.error)
        end)
    end)
end)}
