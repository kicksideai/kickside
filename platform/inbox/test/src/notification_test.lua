-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local notifier = require("notifier")

return { run = test.run_cases(function()
    test.describe("Inbox addressed notification windows", function()
        test.it("bounds a group event to one page and one batch and continues through Jobs", function()
            local pages, batches, queued = {}, {}, {}
            local contracts = { get = function(id)
                return { open = function()
                    if id == "kickside.contract:group_members" then
                        return { members = function(_, request)
                            pages[#pages + 1] = request
                            test.eq(request.limit, 128)
                            local ids = {}
                            local start = request.cursor and 129 or 1
                            local finish = request.cursor and 130 or 128
                            for i = start, finish do ids[#ids + 1] = "member-" .. tostring(i) end
                            return { user_ids = ids, next_cursor = not request.cursor and "member-128" or nil }
                        end }
                    end
                    test.eq(id, "kickside.contract:realtime_batch")
                    return { notify = function(_, request)
                        test.eq(request.topic, "inbox.changed")
                        test.is_nil(request.data)
                        batches[#batches + 1] = request.user_ids
                        return { success = true, notified = #request.user_ids }
                    end }
                end }
            end }
            local jobs = { enqueue = function(request)
                queued[#queued + 1] = request
                return { id = "continuation" }
            end }
            local worker = notifier.new(contracts, jobs)
            local result, err = worker.run({ recipient = { kind = "group", id = "team" }, thread_id = "private-thread", to_seq = 42 })
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(#pages, 1)
            test.eq(#batches, 1)
            test.eq(#batches[1], 128)
            test.eq(#queued, 1)
            test.eq(queued[1].job_type, "kickside.inbox.persist:notify_addressed_job")
            test.eq(queued[1].max_attempts, 1)
            test.eq(queued[1].immutable_payload.cursor, "member-128")
            test.eq(queued[1].immutable_payload.recipient.id, "team")
            test.is_nil(queued[1].immutable_payload.content)
            local continued, continue_err = worker.run_job({ payload = queued[1].immutable_payload })
            test.is_nil(continue_err)
            test.is_true(continued.success)
            test.eq(#pages, 2)
            test.eq(pages[2].cursor, "member-128")
            test.eq(#batches[2], 2)
            test.eq(#queued, 1, "the final window must not enqueue another job")
        end)
        test.it("does not dispatch an empty group or queue an empty continuation", function()
            local worker = notifier.new({ get = function()
                return { open = function() return { members = function() return { user_ids = {} } end } end }
            end }, { enqueue = function() error("unexpected continuation") end })
            local result, err = worker.run({ recipient = { kind = "group", id = "empty" } })
            test.is_nil(err)
            test.is_true(result.success)
        end)
        test.it("continues the group after a failed batch without retrying the failed audience", function()
            local calls, queued = 0, 0
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "relay unavailable" })
            local worker = notifier.new({ get = function(id)
                return { open = function()
                    if id == "kickside.contract:group_members" then
                        return { members = function() return { user_ids = { "member" }, next_cursor = "member" } end }
                    end
                    return { notify = function() calls = calls + 1; return nil, failure end }
                end }
            end }, { enqueue = function() queued = queued + 1; return { id = "next" } end })
            local result, err = worker.run({ recipient = { kind = "group", id = "team" }, thread_id = "thread", to_seq = 2 })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(calls, 1)
            test.eq(queued, 1)
        end)
    end)
end) }
