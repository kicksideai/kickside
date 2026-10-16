-- Round outcomes (design v5 §4.4, §5.2): how a round classifies a failure into
-- the drive phase it leaves, paces retries with capped full jitter, merges due
-- redelivery with a fresh page, and turns the round consumer's five outcome
-- lists into ledger outcomes and delivered receipts. Pure: no store, no call.

local drive = require("drive")
local failure_classification = require("failure_classification")
local ledger = require("round_ledger")

local identity = require("delivery_identity")

local M = {}

type Map = { [string]: any }

-- backoff_ms(attempts, base, cap) -> capped full jitter between base and a cap
-- that doubles per consecutive failure up to `cap` (design v5 §4.4).
function M.backoff_ms(attempts: integer, base: integer, cap: integer): integer
    local ceiling = math.min(cap, base * (2 ^ math.min(math.max(attempts, 1) - 1, 30)))
    return math.floor(base + math.random() * (ceiling - base)) :: integer
end

-- classify(err) -> the classified failure and the error_kind a typed error carries.
function M.classify(err: any): (Map, string?)
    local error_kind: string? = nil
    if type(err) == "userdata" then
        local details = (err :: any):details()
        if type(details) == "table" and type(details.error_kind) == "string" then error_kind = details.error_kind end
    elseif type(err) == "table" and type((err :: Map).error_kind) == "string" then
        error_kind = (err :: Map).error_kind
    end
    local classified = failure_classification.classify(err) :: Map
    if error_kind == nil and type(classified.details) == "table" then error_kind = classified.details.error_kind end
    return classified, error_kind
end

-- failure_phase(failure, error_kind) -> the drive phase a failure leaves and
-- whether it parks: deterministic declaration, access and identity failures
-- block the drive; everything else degrades it.
function M.failure_phase(failure: Map, error_kind: string?): (string, boolean)
    if failure_classification.capacity_floor(failure) ~= nil then return drive.PHASE.DEGRADED, false end
    if failure.retriable ~= false then return drive.PHASE.DEGRADED, false end
    if error_kind == "subject" then return drive.PHASE.BLOCKED_IDENTITY, true end
    if error_kind == "access" or failure.kind == errors.PERMISSION_DENIED then return drive.PHASE.BLOCKED_ACCESS, true end
    return drive.PHASE.BLOCKED_DECLARATION, true
end

function M.retry_at(failure: Map, attempts: integer, policy: Map): string
    local floor = failure_classification.capacity_floor(failure)
    if floor ~= nil then return drive.utc_at_ms(floor) end
    return drive.utc_after(math.max(M.backoff_ms(attempts, policy.retry_after_ms, policy.max_delay_ms),
        math.floor(tonumber(failure.retry_after_ms) or 0)))
end

-- declaration_failure(message) -> a deterministic failure of the drive's own
-- declaration or stored state.
function M.declaration_failure(message: string): Map
    return { kind = errors.INVALID, retriable = false, message = message }
end

-- merge_items(redelivery, page) -> the round's items: due redelivery first,
-- then the fresh page, each delivery identity once.
function M.merge_items(d: Map, redelivery: { Map }, page: { Map }): { Map }
    local items: { Map } = {}
    local seen: { [string]: boolean } = {}
    for _, list in ipairs({ redelivery, page }) do
        for _, raw in ipairs(list) do
            local item: Map = {}
            for k, v in pairs(raw) do item[k] = v end
            item.item_key = tostring(item.item_key or item.dedup_key or "")
            item.dedup_key = tostring(item.dedup_key or item.item_key)
            item.attempts = math.floor(tonumber(item.attempts) or 0)
            identity.bind(d, item)
            if item.item_key ~= "" and not seen[item.delivery_key] then
                seen[item.delivery_key] = true
                items[#items + 1] = item
            end
        end
    end
    return items
end

-- ledger_outcomes(items, outcomes, delivery) -> the ledger outcomes and the
-- delivered receipts of a round consumer's answer, paced by the drive's
-- delivery policy { retry_after_ms, max_delay_ms }.
function M.ledger_outcomes(items: { Map }, outcomes: Map, delivery: Map): ({ Map }, { Map })
    local by_key: { [string]: Map } = {}
    for _, item in ipairs(items) do by_key[item.delivery_key] = item end
    local recorded: { Map } = {}
    local receipts: { Map } = {}
    for _, name in ipairs({ "delivered", "skipped" }) do
        for _, o in ipairs(outcomes[name] :: { Map }) do
            recorded[#recorded + 1] = { item = by_key[o.key], state = ledger.STATE.RESOLVED }
            if type(o.receipts) == "table" or type(o.prepared_key) == "string" then
                receipts[#receipts + 1] = { item = by_key[o.key], receipts = o.receipts or {},
                    prepared_key = o.prepared_key }
            end
        end
    end
    for _, o in ipairs(outcomes.waiting :: { Map }) do
        local wait_ms = math.max(math.floor(tonumber(o.retry_after_ms) or 0), delivery.retry_after_ms)
        local next_at: string? = nil
        local floor = failure_classification.capacity_floor(o.error)
        if not o.parked then
            next_at = floor ~= nil and drive.utc_at_ms(floor) or o.next_attempt_at or drive.utc_after(wait_ms)
        end
        recorded[#recorded + 1] = { item = by_key[o.key], state = ledger.STATE.WAITING,
            next_attempt_at = next_at, error = o.error or { code = "capacity", message = "destination capacity", retriable = true } }
    end
    for _, o in ipairs(outcomes.uncertain :: { Map }) do
        recorded[#recorded + 1] = { item = by_key[o.key], state = ledger.STATE.UNCERTAIN,
            error = o.error or { code = "uncertain", message = "the effect may have been sent", retriable = false } }
    end
    for _, o in ipairs(outcomes.failed :: { Map }) do
        local item = by_key[o.key]
        if type(o.receipts) == "table" and #o.receipts > 0 then
            receipts[#receipts+1]={item=item,receipts=o.receipts}
        end
        local failure = type(o.error) == "table" and failure_classification.classify(o.error) or M.classify(o.error)
        if failure_classification.capacity_floor(failure) ~= nil then
            recorded[#recorded + 1] = { item = item, state = ledger.STATE.WAITING,
                next_attempt_at = M.retry_at(failure, item.attempts + 1, delivery), error = failure }
        elseif (failure :: Map).kind == errors.PERMISSION_DENIED then
            recorded[#recorded + 1] = {item=item,state=ledger.STATE.PARKED,error=failure,identity_parked=o.identity_parked == true}
        elseif (failure :: Map).retriable ~= false then
            recorded[#recorded + 1] = { item = item, state = ledger.STATE.RETRYING,
                next_attempt_at = M.retry_at(failure, item.attempts + 1, delivery),
                error = failure }
        else
            recorded[#recorded + 1] = { item = item, state = ledger.STATE.DEAD,
                error = failure }
            -- A consumer names the prepared output of an item that failed
            -- before any write; dead, it is settled like a delivery that
            -- wrote nothing.
            if type(o.prepared_key) == "string" then
                receipts[#receipts + 1] = { item = item, receipts = {}, prepared_key = o.prepared_key }
            end
        end
    end
    return recorded, receipts
end

return M
