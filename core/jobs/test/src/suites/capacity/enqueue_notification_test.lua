local test = require("test")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local jobs = require("jobs")

local function define_tests()
    test.describe("enqueue notifications", function()
        for _, mode in ipairs({ "due", "parked", "demand" }) do
            test.it("notifies only committed new work or requested demand: " .. mode, function()
                local params = {
                    namespace = "test", scope = "enqueue-notification", key = uuid.v7(),
                    owner_locator = { kind = "test", id = "enqueue-notification" },
                    job_type = "app:test_count_worker", immutable_payload = {},
                    slot = mode ~= "due", parked = mode ~= "due", demand = mode == "demand",
                }
                local mailbox, listen_err = process.listen("kickside.core.jobs:wake", { message = true })
                test.is_nil(listen_err)
                if not mailbox then error("wake mailbox is absent") end
                local _, register_err = process.registry.register("kickside.core.jobs.worker_pool", nil, process.registry.CONSISTENT)
                test.is_nil(register_err)
                local first, first_err = jobs.enqueue(params)
                local first_notice = channel.select({ mailbox:case_receive(), default = true })
                local duplicate, duplicate_err = jobs.enqueue(params)
                local duplicate_notice = channel.select({ mailbox:case_receive(), default = true })
                local _, unregister_err = process.registry.unregister("kickside.core.jobs.worker_pool", process.registry.CONSISTENT)
                process.unlisten(mailbox)
                test.is_nil(unregister_err)
                test.is_nil(first_err)
                test.is_nil(duplicate_err)
                test.not_nil(first)
                test.not_nil(duplicate)
                test.eq(first.id, duplicate.id)
                test.is_true(duplicate.existing)
                test.eq(first_notice.channel == mailbox, mode ~= "parked")
                test.eq(duplicate_notice.channel == mailbox, mode == "demand")
            end)
        end
    end)
end

return { run = test.run_cases(define_tests) }
