-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local contract = require("contract")
local jobs = require("jobs")
local funcs = require("funcs")
local json = require("json")
local addressed = require("addressed")

local function new(contract_api: any, jobs_api: any, funcs_api: any?, storage_api: any?): any
    local executor = funcs_api or funcs
    local storage = storage_api or addressed
    local M = {}
    local TOPIC = "inbox.changed"
    local function open(id: string): (any?, any?)
        local definition, err = contract_api.get(id)
        if err then return nil, err end
        return definition:open()
    end

    function M.run(input: any): (any?, any?)
        if not security.can("funcs.call", "kickside.inbox.persist:notify_addressed") then
            return nil, errors.new({ message = "Inbox notification call denied", kind = errors.PERMISSION_DENIED })
        end
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
                immutable_payload = { item_id = input.item_id, thread_id = input.thread_id,
                    to_seq = input.to_seq, cursor = page.next_cursor } })
            if enqueue_err then return nil, enqueue_err end
        end
        return result, notify_err
    end

    function M.run_job(input: any): (any?, any?)
        if not security.can("funcs.call", "kickside.inbox.persist:notify_addressed_job") then
            return nil, errors.new({ message = "Inbox notification call denied", kind = errors.PERMISSION_DENIED })
        end
        local reference = type(input) == "table" and input.payload or nil
        if type(reference) ~= "table" or type(reference.thread_id) ~= "string" or reference.thread_id == ""
            or type(reference.item_id) ~= "string" or reference.item_id == ""
            or type(reference.to_seq) ~= "number" or reference.to_seq <= 0 then
            return { success = true, notified = 0 }, nil
        end
        local threads, open_err = storage.store("kickside.core:threads")
        if open_err then return nil, open_err end
        local page, read_err = threads:list_events({ thread_id = reference.thread_id,
            from_seq = reference.to_seq, to_seq = reference.to_seq, limit = 1 })
        if read_err then
            if errors.is(read_err, errors.NOT_FOUND) or errors.is(read_err, errors.PERMISSION_DENIED) then
                return { success = true, notified = 0 }, nil
            end
            return nil, read_err
        end
        local event = page and page.events and page.events[1]
        if not event or tonumber(event.seq) ~= reference.to_seq then
            return { success = true, notified = 0 }, nil
        end
        local body = event.body
        if type(body) == "string" then
            local decode_err
            body, decode_err = json.decode(body)
            if decode_err then return nil, decode_err end
        end
        if type(body) ~= "table" or body.id ~= reference.item_id or not body.recipient
            or storage.component_id(body.recipient) ~= reference.thread_id then
            return { success = true, notified = 0 }, nil
        end
        return executor.call("kickside.inbox.persist:notify_addressed", { recipient = body.recipient,
            thread_id = reference.thread_id, item_id = reference.item_id, to_seq = reference.to_seq,
            cursor = reference.cursor })
    end
    return M
end

local M = new(contract, jobs)
M.new = new
return M
