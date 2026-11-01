-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local time = require("time")
local consts = require("security_consts")
local trigger_reconcile = require("trigger_reconcile")

return {run = test.run_cases(function()
    test.describe("Users integration dependencies", function()
        test.it("awaits the supervised scope projector before exercising synchronous writes", function()
            -- A started process.service may still be registering its process name.
            -- The 00_ suite runs before Users cases, including focused harness runs.
            local deadline = time.now():add(5 * time.SECOND)
            while not process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC) and time.now():before(deadline) do
                time.sleep("10ms")
            end
            test.not_nil((process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC)), "scope projector registered")
            local ready, ready_err = trigger_reconcile.trigger()
            test.is_nil(ready_err, tostring(ready_err))
            test.not_nil(ready, "scope projector acknowledges readiness")
        end)
    end)
end)}
