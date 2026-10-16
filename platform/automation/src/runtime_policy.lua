-- The automation runtime policy (kickside.automation:policy; CONTRACTS §18
-- configuration model): the pacing of pending command steps and of the command
-- dispatcher's sweep, the round's page, pass, deadline, admission and retry
-- limits, the reconcile cadence, item delivery retry pacing and ledger
-- retention. A host overrides a value through .wippy.yaml
-- "kickside.automation:policy:meta.<path>". A malformed or missing entry is a
-- typed error, never replaced by a code default.

local registry = require("registry")

local M = {}

M.ENTRY = "kickside.automation:policy"

type Map = { [string]: any }

type Resolved = {
    command_retry_after_ms: integer,
    command_max_delay_ms: integer,
    dispatcher_batch: integer,
    round_page_size: integer,
    round_redelivery: integer,
    round_retry_after_ms: integer,
    round_max_delay_ms: integer,
    round_max_pages: integer,
    round_max_items: integer,
    round_timeout_ms: integer,
    round_commit_reserve_ms: integer,
    round_max_unresolved: integer,
    reconcile_interval_ms: integer,
    limits_page_size: integer,
    limits_max_pages: integer,
    limits_max_items: integer,
    delivery_retry_after_ms: integer,
    delivery_max_delay_ms: integer,
    ledger_resolved_ms: integer,
    ops_ms: integer,
    prepared_ms: integer,
    receipts_ms: integer,
    prepared_bytes_per_item: integer,
    destination_slots_per_item: integer,
    max_row_bytes: integer,
}

local function invalid(message: string): error
    return (errors.new({ message = M.ENTRY .. ": " .. message, kind = errors.INVALID, retryable = false }) :: error)
end

local UNIT_MS: { [string]: integer } = { ms = 1, s = 1000, m = 60000, h = 3600000, d = 86400000 }

local function duration_ms(value: any, field: string): (integer?, error?)
    if type(value) ~= "string" then return nil, invalid(field .. " must be a duration such as 10s") end
    local amount, unit = string.match(value :: string, "^(%d+)(%a+)$")
    local scale = unit and UNIT_MS[unit] or nil
    if not amount or not scale or tonumber(amount) == 0 then return nil, invalid(field .. " must be a positive duration such as 10s") end
    return math.floor((tonumber(amount) :: number) * scale) :: integer, nil
end

local function positive(value: any, field: string, max: integer): (integer?, error?)
    if type(value) ~= "number" or value ~= math.floor(value) or value < 1 or value > max then
        return nil, invalid(field .. " must be an integer in [1, " .. tostring(max) .. "]")
    end
    return value :: integer, nil
end

local function non_negative(value: any, field: string, max: integer): (integer?, error?)
    if type(value) ~= "number" or value ~= math.floor(value) or value < 0 or value > max then
        return nil, invalid(field .. " must be an integer in [0, " .. tostring(max) .. "]")
    end
    return value :: integer, nil
end

local function section(meta: any, name: string): (any?, error?)
    local value = type(meta) == "table" and meta[name] or nil
    if type(value) ~= "table" then return nil, invalid(name .. " is required") end
    return value, nil
end

-- resolve(meta) -> the validated policy values.
function M.resolve(meta: any): (Resolved?, error?)
    local command, command_err = section(meta, "command")
    if command_err then return nil, command_err end
    local dispatcher, dispatcher_err = section(meta, "dispatcher")
    if dispatcher_err then return nil, dispatcher_err end
    local retry_after_ms, e1 = positive(command.retry_after_ms, "command.retry_after_ms", 86400000)
    if e1 then return nil, e1 end
    local max_delay_ms, e2 = positive(command.max_delay_ms, "command.max_delay_ms", 86400000)
    if e2 then return nil, e2 end
    if (max_delay_ms :: integer) < (retry_after_ms :: integer) then
        return nil, invalid("command.max_delay_ms must not be shorter than command.retry_after_ms")
    end
    local batch, e4 = positive(dispatcher.batch, "dispatcher.batch", 1000)
    if e4 then return nil, e4 end
    local round, round_err = section(meta, "round")
    if round_err then return nil, round_err end
    local delivery, delivery_err = section(meta, "delivery")
    if delivery_err then return nil, delivery_err end
    local retention, retention_err = section(meta, "retention")
    if retention_err then return nil, retention_err end
    local page_size, e5 = positive(round.page_size, "round.page_size", 1000)
    if e5 then return nil, e5 end
    local redelivery, e6 = positive(round.redelivery_per_round, "round.redelivery_per_round", 1000)
    if e6 then return nil, e6 end
    local round_retry, e7 = positive(round.retry_after_ms, "round.retry_after_ms", 86400000)
    if e7 then return nil, e7 end
    local round_max, e8 = positive(round.max_delay_ms, "round.max_delay_ms", 86400000)
    if e8 then return nil, e8 end
    local delivery_retry, e9 = positive(delivery.retry_after_ms, "delivery.retry_after_ms", 86400000)
    if e9 then return nil, e9 end
    local delivery_max, e10 = positive(delivery.max_delay_ms, "delivery.max_delay_ms", 86400000)
    if e10 then return nil, e10 end
    if (round_max :: integer) < (round_retry :: integer) or (delivery_max :: integer) < (delivery_retry :: integer) then
        return nil, invalid("a max_delay_ms must not be shorter than its retry_after_ms")
    end
    local resolved_ms, e11 = duration_ms(retention.ledger_resolved, "retention.ledger_resolved")
    if e11 then return nil, e11 end
    local ops_ms, ops_err = duration_ms(retention.ops, "retention.ops")
    if ops_err then return nil, ops_err end
    local prepared_ms, prepared_err = duration_ms(retention.prepared, "retention.prepared")
    if prepared_err then return nil, prepared_err end
    local receipts_ms, receipts_err = duration_ms(retention.receipts, "retention.receipts")
    if receipts_err then return nil, receipts_err end
    local max_pages, e12 = positive(round.max_pages, "round.max_pages", 1000)
    if e12 then return nil, e12 end
    local max_items, e13 = non_negative(round.max_items, "round.max_items", 1000000)
    if e13 then return nil, e13 end
    local timeout_ms, e14 = duration_ms(round.timeout, "round.timeout")
    if e14 then return nil, e14 end
    local commit_reserve_ms, e_reserve = duration_ms(round.commit_reserve, "round.commit_reserve")
    if e_reserve then return nil, e_reserve end
    if (commit_reserve_ms :: integer) >= (timeout_ms :: integer) then
        return nil, invalid("round.commit_reserve must be shorter than round.timeout")
    end
    local max_unresolved, e15 = positive(round.max_unresolved, "round.max_unresolved", 1000000)
    if e15 then return nil, e15 end
    local cadence, cadence_err = section(meta, "cadence")
    if cadence_err then return nil, cadence_err end
    local reconcile_ms, e19 = duration_ms(cadence.reconcile, "cadence.reconcile")
    if e19 then return nil, e19 end
    local limits, limits_err = section(meta, "limits")
    if limits_err then return nil, limits_err end
    local limit_page, e16 = positive(limits.page_size, "limits.page_size", 1000000)
    if e16 then return nil, e16 end
    local limit_pages, e17 = positive(limits.max_pages, "limits.max_pages", 1000000)
    if e17 then return nil, e17 end
    local limit_items, e18 = positive(limits.max_items, "limits.max_items", 100000000)
    if e18 then return nil, e18 end
    local prepared_item, e24 = positive(limits.prepared_bytes_per_item, "limits.prepared_bytes_per_item", 2147483647)
    if e24 then return nil, e24 end
    local slots, e25 = positive(limits.destination_slots_per_item, "limits.destination_slots_per_item", 1000000)
    if e25 then return nil, e25 end
    local max_row, e26 = positive(limits.max_row_bytes, "limits.max_row_bytes", 2147483647)
    if e26 then return nil, e26 end
    if (page_size :: integer) > (limit_page :: integer) or (max_pages :: integer) > (limit_pages :: integer)
        or (max_items :: integer) > (limit_items :: integer) then
        return nil, invalid("the round defaults must lie within limits")
    end
    return {
        command_retry_after_ms = retry_after_ms :: integer,
        command_max_delay_ms = max_delay_ms :: integer,
        dispatcher_batch = batch :: integer,
        round_page_size = page_size :: integer,
        round_redelivery = redelivery :: integer,
        round_retry_after_ms = round_retry :: integer,
        round_max_delay_ms = round_max :: integer,
        round_max_pages = max_pages :: integer,
        round_max_items = max_items :: integer,
        round_timeout_ms = timeout_ms :: integer,
        round_commit_reserve_ms = commit_reserve_ms :: integer,
        round_max_unresolved = max_unresolved :: integer,
        reconcile_interval_ms = reconcile_ms :: integer,
        limits_page_size = limit_page :: integer,
        limits_max_pages = limit_pages :: integer,
        limits_max_items = limit_items :: integer,
        delivery_retry_after_ms = delivery_retry :: integer,
        delivery_max_delay_ms = delivery_max :: integer,
        ledger_resolved_ms = resolved_ms :: integer,
        ops_ms = ops_ms :: integer,
        prepared_ms = prepared_ms :: integer,
        receipts_ms = receipts_ms :: integer,
        prepared_bytes_per_item = prepared_item :: integer,
        destination_slots_per_item = slots :: integer,
        max_row_bytes = max_row :: integer,
    }, nil
end

local ROUND_OVERRIDES: { [string]: string } = { page_size = "limits_page_size", max_pages = "limits_max_pages", max_items = "limits_max_items" }
local DELIVERY_OVERRIDES: { [string]: boolean } = { retry_after_ms = true, max_delay_ms = true }

-- drive_policy(declared) -> the drive policy a declaration applies (design v5
-- §8): the registered round and delivery policy with the declaration's
-- overrides { round = { page_size?, max_pages?, max_items? }, delivery = {
-- retry_after_ms?, max_delay_ms? } } laid over it, validated against limits.
-- Resolved once at declaration and stored in drive.applied.policy.
function M.drive_policy(declared: any): (Map?, error?)
    local base, base_err = M.policy()
    if base_err or not base then return nil, base_err end
    local b = base :: Resolved
    local resolved = {
        round = {
            page_size = b.round_page_size, max_pages = b.round_max_pages, max_items = b.round_max_items,
            timeout_ms = b.round_timeout_ms, redelivery_per_round = b.round_redelivery, max_unresolved = b.round_max_unresolved,
            retry_after_ms = b.round_retry_after_ms, max_delay_ms = b.round_max_delay_ms,
        },
        delivery = { retry_after_ms = b.delivery_retry_after_ms, max_delay_ms = b.delivery_max_delay_ms },
        reconcile = { interval_ms = b.reconcile_interval_ms },
    }
    local d = type(declared) == "table" and declared or {}
    for field, value in pairs(type(d.round) == "table" and d.round or {}) do
        local limit_field = ROUND_OVERRIDES[tostring(field)]
        if not limit_field then return nil, invalid("round." .. tostring(field) .. " is not a declarable round setting") end
        local limit = (b :: any)[limit_field] :: integer
        local checked, err = (field == "max_items" and non_negative or positive)(value, "round." .. tostring(field), limit)
        if err then return nil, invalid("round." .. tostring(field) .. " must lie within limits (at most " .. tostring(limit) .. ")") end
        (resolved.round :: any)[field] = checked
    end
    for field, value in pairs(type(d.delivery) == "table" and d.delivery or {}) do
        if not DELIVERY_OVERRIDES[tostring(field)] then return nil, invalid("delivery." .. tostring(field) .. " is not a declarable delivery setting") end
        local checked, err = positive(value, "delivery." .. tostring(field), 86400000)
        if err then return nil, err end
        (resolved.delivery :: any)[field] = checked
    end
    if resolved.delivery.max_delay_ms < resolved.delivery.retry_after_ms then
        return nil, invalid("delivery.max_delay_ms must not be shorter than delivery.retry_after_ms")
    end
    return resolved, nil
end

-- policy() -> the registered policy, validated.
function M.policy(): (Resolved?, error?)
    local entry, get_err = registry.get(M.ENTRY)
    if get_err or not entry then
        return nil, (errors.new({ message = M.ENTRY .. " is not registered: " .. tostring(get_err), kind = errors.INTERNAL }) :: error)
    end
    return M.resolve((entry :: any).meta)
end

return M
