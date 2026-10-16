-- Declaration validation of the automation engine: install-result shape,
-- rollback chains and the declared main source. Declared
-- schemas (public state, install input) are validated by engine_schema.
-- Pure: no store or registry access.

local automation_types = require("types")
local errors = require("errors")
local drive = require("drive")

local P = {}

type Map = { [string]: any }

-- The cadence types a declared schedule may name (CONTRACTS §19 cadence).
local CADENCE_TYPES: { [string]: boolean } = { interval = true, cron = true, once = true, ticker = true }

-- The main drive's source an install declares (A22): event (a source thread's
-- events, woken through the thread's wake key), collection (a pulled port),
-- timer, or none (no acquisition, so no slot).
local SOURCE_FIELDS: { [string]: { [string]: boolean } } = {
    event = { source_kind = true, source_ref = true, source_thread_id = true, wake_key = true, event_type = true, start = true,
        round = true, delivery = true },
    collection = { source_kind = true, source_ref = true, config = true, schedule = true, round = true, delivery = true,
        reconcile = true },
    timer = { source_kind = true, source_ref = true, schedule = true, round = true, delivery = true },
    manual = { source_kind = true, round = true, delivery = true },
    none = { source_kind = true },
}

local UUID_PATTERN = "^%x%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$"

local function source_error(message: string): any
    return errors.new({ message = "automation install result `source` " .. message, kind = errors.INVALID, retryable = false })
end

local function nonempty(value: any): boolean
    return type(value) == "string" and value ~= ""
end

-- validate_source checks the declared main source { source_kind, source_ref?,
-- source_thread_id?, wake_key?, event_type?, config?, schedule?, round?,
-- delivery?, reconcile? } (round and delivery override the drive policy, §8;
-- a collection's reconcile = { pull_keys } adds its reconcile drive, A33): each kind
-- names exactly its fields; an event source names its port, source thread and
-- start (A27: all or new; its wake key, when given, is the thread's); a collection names its port,
-- its pull config and its poll schedule; a timer names its schedule.
local function validate_source(raw: any): any
    if type(raw) ~= "table" then return source_error("is required: { source_kind = event|collection|timer|manual|none, ... }") end
    local source = raw :: Map
    local allowed = SOURCE_FIELDS[tostring(source.source_kind)]
    if not allowed then return source_error("source_kind must be event, collection, timer, manual or none") end
    for field, _ in pairs(source) do
        if not allowed[field] then
            return source_error("field " .. tostring(field) .. " does not belong to a " .. tostring(source.source_kind) .. " source")
        end
    end
    if source.source_ref ~= nil and not nonempty(source.source_ref) then return source_error("source_ref must be a non-empty string") end
    if source.source_kind == "event" or source.source_kind == "collection" then
        if not nonempty(source.source_ref) then return source_error("of kind " .. tostring(source.source_kind) .. " requires source_ref") end
    end
    if source.source_kind == "collection" or source.source_kind == "timer" then
        local cadence = source.schedule
        if type(cadence) ~= "table" or not CADENCE_TYPES[tostring((cadence :: Map).type)]
            or not nonempty((cadence :: Map).expression) then
            return source_error("of kind " .. tostring(source.source_kind)
                .. " requires schedule = { type = interval|cron|once|ticker, expression }")
        end
    end
    if source.config ~= nil and type(source.config) ~= "table" then return source_error("config must be an object") end
    if source.reconcile ~= nil then
        local reconcile = source.reconcile
        if type(reconcile) ~= "table" or not nonempty((reconcile :: Map).pull_keys) then
            return source_error("reconcile must be { pull_keys } naming the source's key listing")
        end
        for field, _ in pairs(reconcile :: Map) do
            if field ~= "pull_keys" then return source_error("reconcile field " .. tostring(field) .. " is not declarable") end
        end
    end
    if source.round ~= nil and type(source.round) ~= "table" then return source_error("round must be an object of round overrides") end
    if source.delivery ~= nil and type(source.delivery) ~= "table" then return source_error("delivery must be an object of delivery overrides") end
    if source.event_type ~= nil and not nonempty(source.event_type) then return source_error("event_type must be a non-empty string") end
    if source.source_kind == "event" then
        if not nonempty(source.source_thread_id) then return source_error("of kind event requires source_thread_id") end
        if source.start ~= "all" and source.start ~= "new" then
            return source_error("of kind event requires start = all (the thread's history) or new (from its head)")
        end
        if not string.match(source.source_thread_id :: string, UUID_PATTERN) then
            return source_error("source_thread_id must be a thread UUID: " .. tostring(source.source_thread_id))
        end
        if source.wake_key ~= nil and source.wake_key ~= drive.wake_key(source.source_thread_id) then
            return source_error("wake_key must be the source thread's wake key " .. drive.wake_key(source.source_thread_id))
        end
    end
    return nil
end

-- trigger_overrides(trigger) -> round?, delivery?: a Trigger Spec v2's round
-- and delivery overrides of the drive policy (design v5 §8, A36): the poll
-- page size and pass bounds (round.page_size, round.max_pages,
-- round.max_items) and the per-item retry delay (delivery.retry_after_ms).
local function trigger_overrides(trigger: any): (Map?, Map?)
    local spec = type(trigger) == "table" and (trigger :: Map) or {}
    local poll = type(spec.poll) == "table" and (spec.poll :: Map) or {}
    local round: Map = {}
    if poll.page_size ~= nil then round.page_size = poll.page_size end
    if poll.max_pages_per_run ~= nil then round.max_pages = poll.max_pages_per_run end
    if poll.max_items_per_run ~= nil then round.max_items = poll.max_items_per_run end
    local declared = type(spec.delivery) == "table" and (spec.delivery :: Map) or {}
    local delivery: Map = {}
    if declared.retry_after_ms ~= nil then delivery.retry_after_ms = declared.retry_after_ms end
    return next(round) and round or nil, next(delivery) and delivery or nil
end

local function validate_result(result: any): any
    if type(result) ~= "table" then
        return errors.new({
            message = "automation install body must return a table",
            kind = errors.INTERNAL,
        })
    end
    if type(result.state) ~= "table" then
        return errors.new({
            message = "automation install body must return a `state` table",
            kind = errors.INTERNAL,
        })
    end
    if result.metadata ~= nil and type(result.metadata) ~= "table" then
        return errors.new({
            message = "automation install body `metadata` must be a table when set",
            kind = errors.INTERNAL,
        })
    end
    if result.public_state ~= nil and type(result.public_state) ~= "table" then
        return errors.new({
            message = "automation install body `public_state` must be a table when set",
            kind = errors.INTERNAL,
        })
    end
    -- `created` (optional) lists the public components an install produced as
    -- { kind, id } records, so callers (e.g. the knowledge UI) can act on the
    -- new resource without re-deriving it from opaque state.
    if result.created ~= nil and type(result.created) ~= "table" then
        return errors.new({
            message = "automation install body `created` must be an array when set",
            kind = errors.INTERNAL,
        })
    end
    if type(result.created) == "table" then
        local max_index: integer? = nil
        local count = 0
        for k, v in pairs(result.created :: Map) do
            if type(k) ~= "number" or k < 1 or k ~= math.floor(k) then
                return errors.new({
                    message = "automation install body `created` must be an array",
                    kind = errors.INTERNAL,
                })
            end
            if type(v) ~= "table" then
                return errors.new({
                    message = "automation install body `created` entries must be tables",
                    kind = errors.INTERNAL,
                })
            end
            count = count + 1
            if max_index == nil or k > max_index then max_index = k end
        end
        if max_index ~= nil and max_index ~= count then
            return errors.new({
                message = "automation install body `created` must not contain sparse indexes",
                kind = errors.INTERNAL,
            })
        end
    end
    if result.schedules ~= nil then
        return errors.new({ message = "scheduled methods are removed; declare a timer source", kind = errors.INVALID, retryable = false })
    end
    if result.source ~= nil then
        local source_err = validate_source(result.source)
        if source_err ~= nil then return source_err end
    end
    return nil
end

local function normalize_rollback_chain(raw: any): ({ automation_types.RollbackStep }?, automation_types.ErrorValue?)
    if raw == nil then
        return {}, nil
    end
    if type(raw) ~= "table" then
        return nil, errors.new({
            message = "automation install result `rollback` must be an array when set",
            kind = errors.INTERNAL,
        })
    end

    local out: { automation_types.RollbackStep } = {}
    local max_index: integer? = nil
    local count = 0
    for k, step in pairs(raw :: Map) do
        if type(k) ~= "number" or k < 1 or k ~= math.floor(k) then
            return nil, errors.new({
                message = "automation install result `rollback` must be an array",
                kind = errors.INTERNAL,
            })
        end
        if type(step) ~= "table" then
            return nil, errors.new({
                message = "automation install result `rollback` entries must be tables",
                kind = errors.INTERNAL,
            })
        end
        local s: any = step
        if type(s.target) ~= "string" or s.target == "" then
            return nil, errors.new({
                message = "automation install result `rollback` entries require target",
                kind = errors.INTERNAL,
            })
        end
        if s.args ~= nil and type(s.args) ~= "table" then
            return nil, errors.new({
                message = "automation install result `rollback` entry args must be a table",
                kind = errors.INTERNAL,
            })
        end
        out[k] = {
            target = s.target,
            args = type(s.args) == "table" and (s.args :: Map) or {},
        }
        count = count + 1
        if max_index == nil or k > max_index then max_index = k end
    end
    if max_index ~= nil and max_index ~= count then
        return nil, errors.new({
            message = "automation install result `rollback` must not contain sparse indexes",
            kind = errors.INTERNAL,
        })
    end
    return out, nil
end

P.normalize_rollback_chain = normalize_rollback_chain
P.trigger_overrides = trigger_overrides
P.validate_result = validate_result
P.validate_source = validate_source

return P
