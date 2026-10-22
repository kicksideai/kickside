local test = require("test")
local h = require("round_harness")
local errors = require("errors")

local function define_tests()
    test.describe("source pull round fences", function()
        for _, lost in ipairs({"drive", "job"}) do
            test.it("carries the round's " .. lost .. " fence into source acquisition", function()
                local env = h.setup("pull_round_fence")
                h.new_drive({automation_id = env.automation_id, drive_key = "source", source_kind = "collection",
                    next_run_at = h.PAST, action = {source_ref = "kickside.automation.round.fixture:records",
                        config = {fail = "unavailable"}, schedule = {type = "interval", expression = "1h"}}})
                local acquired
                local result, run_err = env.run(env.automation_id, "source", function(identity, target, request, opts)
                    if target == "kickside.automation:round_acquire" then
                        if lost == "drive" then
                            h.set_drive(env.automation_id, "source", "revision = revision + 1", {})
                        else
                            h.exec("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {h.PAST, env.last_job.id})
                        end
                        local page, err = env.run_as(identity, target, request, opts)
                        test.is_nil(err, tostring(err))
                        acquired = page
                        return page, err
                    end
                    return env.run_as(identity, target, request, opts)
                end)
                test.is_nil(run_err, tostring(run_err))
                test.not_nil(result)
                test.not_nil(acquired)
                test.is_false(acquired.success)
                test.eq(acquired.error.kind, errors.CONFLICT)
                test.is_nil(h.read_drive(env.automation_id, "source").cursor)
            end)
        end
        for _, source in ipairs({"event", "timer", "manual", "collection", "reconcile"}) do
            for _, lost in ipairs({"drive", "job"}) do
                test.it("refuses " .. source .. " acquisition after losing the " .. lost .. " fence", function()
                    local env = h.setup("pull_fence")
                    local job = h.running_job()
                    h.new_drive({automation_id = env.automation_id, drive_key = "source", source_kind = source,
                        source_thread_id = env.thread_id, round_token = job.lease_token, round_until = job.lease_until})
                    local current = h.read_drive(env.automation_id, "source")
                    local fence = {round_token = current.round_token, round_until = current.round_until,
                        revision = current.revision, rewind_generation = current.rewind_generation,
                        command_generation = current.command_generation, job = job}
                    if lost == "drive" then
                        h.set_drive(env.automation_id, "source", "revision = revision + 1", {})
                    else
                        h.exec("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {h.PAST, job.id})
                    end
                    local page, err = env.caller:call("kickside.automation:round_acquire", {
                        automation_id = env.automation_id, drive_key = "source", source_kind = source,
                        source_ref = "kickside.automation.round.fixture:records", source_thread_id = env.thread_id,
                        pull_keys = "kickside.automation.round.fixture:record_keys", fence = fence,
                        config = {fail = "unavailable"}, limit = 1, idempotency_key = "pull-fence"})
                    test.is_nil(err, tostring(err))
                    test.is_false(page.success)
                    test.eq(page.error.kind, errors.CONFLICT)
                end)
            end
        end
    end)
end

return {run = test.run_cases(define_tests)}
