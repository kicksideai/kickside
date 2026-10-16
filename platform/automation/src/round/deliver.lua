-- Round delivery (design v5 §3.2, §4.2): the one page a round acquired goes to
-- its automation under the automation's live execution identity (these
-- functions run through execution_identity.run_as):
--
--   deliver -- a main drive delivers to the kind's kickside.trigger:round_consumer;
--              every input delivery_key must be answered in exactly one outcome
--              list (delivered, skipped, waiting, uncertain, failed);
--
-- Returns { success = true, outcomes } or { success = false, error =
-- classified failure }, so the envelope crosses the run_as boundary intact.
-- outcomes = { delivered = [{ key, receipts?, prepared_key? }], skipped = [...], waiting =
-- [{ key, retry_after_ms? }], uncertain = [...], failed = [{ key, error }] }.

local component = require("component")
local failure_classification = require("failure_classification")

local drive = require("drive")

local M = {}

type Map = { [string]: any }

local ROUND_CONSUMER = "kickside.trigger:round_consumer"
local LISTS = {
    { field = "delivered_items", name = "delivered" },
    { field = "skipped_items", name = "skipped" },
    { field = "waiting_items", name = "waiting" },
    { field = "uncertain_items", name = "uncertain" },
    { field = "failed_items", name = "failed" },
}

local function refuse(failure: any): Map
    return { success = false, error = failure }
end

local function contract_violation(message: string): Map
    return refuse(failure_classification.classify({ kind = errors.INVALID, message = "round consumer: " .. message, retriable = false }))
end

-- partition(items, answer) -> outcomes when every input key is answered in
-- exactly one list and nothing else is answered.
local function partition(items: { Map }, answer: Map): (Map?, Map?)
    local expected: { [string]: boolean } = {}
    for _, item in ipairs(items) do expected[tostring(item.delivery_key)] = true end
    local answered: { [string]: boolean } = {}
    local outcomes: Map = {}
    for _, list in ipairs(LISTS) do
        local entries = answer[list.field]
        if entries ~= nil and type(entries) ~= "table" then return nil, contract_violation(list.field .. " must be an array") end
        local out: { Map } = {}
        for _, entry in ipairs((entries or {}) :: { any }) do
            local key = type(entry) == "table" and (entry :: Map).key or nil
            if type(key) ~= "string" or not expected[key] then
                return nil, contract_violation(list.field .. " answers a key that was not delivered: " .. tostring(key)
                    .. "; outcomes answer each item's delivery_key")
            end
            if answered[key] then return nil, contract_violation("item " .. key .. " is answered more than once") end
            answered[key] = true
            out[#out + 1] = entry :: Map
        end
        outcomes[list.name] = out
    end
    for key, _ in pairs(expected) do
        if not answered[key] then return nil, contract_violation("item " .. key .. " is not answered") end
    end
    return outcomes, nil
end

-- deliver({ drive, items, config }) -> the outcome envelope.
function M.deliver(request: any): (Map?, any)
    local r = type(request) == "table" and (request :: Map) or {}
    local d = type(r.drive) == "table" and (r.drive :: Map) or {}
    local items = type(r.items) == "table" and (r.items :: { Map }) or {}
    local instance, open_err = component.open(tostring(d.automation_id or ""), component.ACCESS.WRITE, ROUND_CONSUMER)
    if open_err or not instance then
        return refuse(failure_classification.classify(open_err or "round consumer is unavailable", "round consumer open: ")), nil
    end
    local combined: Map = { delivered = {}, skipped = {}, waiting = {}, uncertain = {}, failed = {} }
    local fronts = type(r.fronts) == "table" and r.fronts or {}
    local blocked: Map = {}
    local remaining = items
    local interrupted: Map? = nil
    d.prepared_receipts = {}
    while #remaining > 0 do
        local wave: { Map } = {}
        local next_wave: { Map } = {}
        local seen: Map = {}
        local item_of: Map = {}
        for _, item in ipairs(remaining) do
            if interrupted then
                combined.failed[#combined.failed+1] = {key=item.delivery_key,error=interrupted}
            else
            local record = tostring(item.item_key)
            local front = blocked[record] or fronts[record]
            if front and front.identity_key == item.delivery_key and front.state == "uncertain" then
                combined.uncertain[#combined.uncertain + 1] = { key = item.delivery_key }
            elseif front and (front.identity_key ~= item.delivery_key or front.state == "uncertain"
                    or (front.next_attempt_at ~= nil and drive.after(front.next_attempt_at, r.now))) then
                combined.waiting[#combined.waiting + 1] = { key = item.delivery_key,
                    next_attempt_at = front.next_attempt_at, parked = front.state == "uncertain" }
            elseif seen[record] then
                next_wave[#next_wave + 1] = item
            else
                seen[record] = true
                wave[#wave + 1] = item
                item_of[item.delivery_key] = item
            end
            end
        end
        if #wave > 0 then
            local answer, call_err = (instance :: any):deliver({ drive = d, items = wave, config = r.config or {} })
            if call_err ~= nil then return refuse(failure_classification.classify(call_err, "round consumer: ")), nil end
            if type(answer) ~= "table" then return contract_violation("deliver returned no outcome"), nil end
            local outcomes, violation = partition(wave, answer :: Map)
            if violation then return violation, nil end
            for _, list in ipairs({ "delivered", "skipped", "waiting", "uncertain", "failed" }) do
                for _, entry in ipairs((outcomes :: Map)[list] :: { Map }) do
                    combined[list][#combined[list] + 1] = entry
                    if list == "failed" then
                        local failure = failure_classification.classify(entry.error)
                        if failure.kind == errors.PERMISSION_DENIED then interrupted = failure end
                    end
                    local record = item_of[entry.key].item_key
                    if list == "delivered" or list == "skipped" then
                        fronts[record] = nil
                        if type(entry.receipts) == "table" then d.prepared_receipts[record] = entry.receipts end
                    else
                        blocked[record] = { identity_key = entry.key, state = list == "uncertain" and "uncertain" or "retrying" }
                    end
                end
            end
        end
        remaining = next_wave
    end
    return { success = true, outcomes = combined, interrupted = interrupted }, nil
end

return M
