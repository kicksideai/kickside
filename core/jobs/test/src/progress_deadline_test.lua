local test = require("test")
local child = require("child")
local fixture = require("fixture")

local function control(at, kind, sequence)
    return {at = at, signal = {kind = "control", message = {
        kind = kind, lease_token = "lease", execution_seq = sequence or 1, lease_until = "future",
    }}}
end

local function run(script, timeout, ceiling)
    fixture.reset("progress", nil)
    fixture.heartbeat_timeout, fixture.ceiling, fixture.script = timeout, ceiling, script
    return child.supervise_job_child({id = "job", lease_token = "lease", execution_seq = 1})
end

return {run = test.run_cases(function()
    test.describe("progress deadlines with an accelerated clock", function()
        test.it("runs twenty minutes of progressing work under a ten minute deadline", function()
            local script = {}
            for at = 300000, 1200000, 300000 do script[#script + 1] = control(at, "heartbeat") end
            script[#script + 1] = {at = 1200000, signal = {kind = "exit"}}
            test.is_nil(run(script, 600000, 7200000))
            test.eq(fixture.deadlines[1], 600000)
            test.eq(fixture.deadlines[5], 1800000)
            test.eq(fixture.clock_ms, 1200000)
        end)
        test.it("expires ten minutes after the last progress despite ownership renewals", function()
            local err = run({control(300000, "heartbeat"), control(600000, "lease_renewed"),
                {at = 900000, signal = {kind = "timeout"}}}, 600000, 7200000)
            test.contains(tostring(err), "fixture-heartbeat-timeout")
            test.eq(fixture.deadlines[3], 900000)
        end)
        test.it("keeps the hard ceiling while progress continues", function()
            local err = run({control(300000, "heartbeat"), control(600000, "heartbeat"),
                {at = 1000000, signal = {kind = "timeout"}}}, 600000, 1000000)
            test.contains(tostring(err), "fixture-timeout")
            test.eq(fixture.deadlines[3], 1000000)
        end)
        test.it("ignores progress from another execution sequence", function()
            local err = run({control(300000, "heartbeat", 2),
                {at = 600000, signal = {kind = "timeout"}}}, 600000, 7200000)
            test.contains(tostring(err), "fixture-heartbeat-timeout")
            test.eq(fixture.deadlines[2], 600000)
        end)
        test.it("leaves uninstrumented work on its original ceiling past ten minutes", function()
            test.is_nil(run({control(1200000, "lease_renewed"),
                {at = 1800000, signal = {kind = "exit"}}}, nil, 7200000))
            test.eq(fixture.deadlines[1], 7200000)
            test.eq(fixture.deadlines[2], 7200000)
        end)
    end)
end)}
