-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local jobs = require("jobs")

local function new(contract_api: any, jobs_api: any): any
    local M = {}
    local TOPIC = "inbox.changed"
    local function open(id: string): (any?, any?)
        local definition, err = contract_api.get(id)
        if err then return nil, err end
        return definition:open()
    end

    function M.run(input: any): (any?, any?)
        local recipient = input.recipient
        if recipient.kind == "user" then
            local realtime, err = open("kickside.contract:realtime")
            if err then return nil, err end
            return realtime:notify({ user_id = recipient.id, topic = TOPIC })
        end
        local directory, directory_err = open("kickside.contract:group_members")
        if directory_err then return nil, directory_err end
        local page, page_err = directory:members({ group_id = recipient.id, limit = 128, cursor = input.cursor })
        if page_err then return nil, page_err end
        local result, notify_err = { success = true, notified = 0 }, nil
        if #page.user_ids > 0 then
            local realtime, open_err = open("kickside.contract:realtime_batch")
            if open_err then return nil, open_err end
            result, notify_err = realtime:notify({ user_ids = page.user_ids, topic = TOPIC })
        end
        if page.next_cursor then
            local _, enqueue_err = jobs_api.enqueue({ namespace = "kickside.inbox", scope = input.thread_id,
                key = tostring(input.to_seq) .. ":" .. page.next_cursor,
                owner_locator = { kind = "thread", id = input.thread_id }, thread_id = input.thread_id,
                job_type = "kickside.inbox.persist:notify_addressed_job", max_attempts = 1,
                immutable_payload = { recipient = recipient, thread_id = input.thread_id,
                    to_seq = input.to_seq, cursor = page.next_cursor } })
            if enqueue_err then return nil, enqueue_err end
        end
        return result, notify_err
    end

    function M.run_job(input: any): (any?, any?)
        return M.run(input.payload)
    end
    return M
end

local M = new(contract, jobs)
M.new = new
return M
