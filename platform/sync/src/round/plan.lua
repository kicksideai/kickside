-- The sync's delivery plan (design v5 §3.2, §4.6; CONTRACTS §15), compiled
-- from the drive's applied declaration: the optional filter expression, the
-- transform strategy with the replay safety its kickside.transform strategy
-- entry declares, and the sink with its declared delivery and input shape.
--
--   compile(declaration, drive) -- the plan, or the typed failure: a declaration
--                                  failure, or an access failure when the
--                                  drive's operator or execution principal
--                                  lacks a grant on a resource the transform
--                                  declares (design v5 §6.2, CONTRACTS §14)
--   keeps(plan, item)           -- whether the filter keeps the item; an
--                                  evaluation failure is the item's own
--   transform(plan, d, item, k) -- { present, value?, skip? } once per delivery: a
--                                  replay-unsafe strategy's output is persisted
--                                  under the item's idempotency key before the
--                                  write and reused by every retry; every
--                                  call carries the authorization, the
--                                  operator and principal grants on the
--                                  transform's declared resources

local expr = require("expr")
local failure_classification = require("failure_classification")
local apply = require("transform_apply")
local strategies = require("transform_strategies")
local strategy_reference = require("strategy_reference")
local component = require("component")
local round_write = require("round_write")
local canonical_json = require("canonical_json")

local M = {}

type Map = { [string]: any }

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return ((v :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false, details = { error_kind = "declaration" } }) :: error)
end

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED, retryable = false, details = { error_kind = "access" } }) :: error)
end

local function principal_label(p: Map): string
    return tostring(p.kind) .. ":" .. tostring(p.id)
end

-- authorization(strategy, transform, drive) -> { operator_grants,
-- principal_grants } over the resources the strategy binding describes for the
-- transform config, each
-- grant the effective component mask of the drive's operator (its identity's
-- authorized_by) or execution principal. A resource either lacks is an access
-- failure; a config whose resource use cannot be enforced is a declaration
-- failure.
-- references(transform) -> the resources a declared transform uses, or the
-- declaration failure of one whose resource use cannot be enforced. Install,
-- reconfigure and every round apply the same rule.
function M.references(transform: Map): ({ Map }?, error?)
    local strategy = trim(transform.kind)
    local references, describe_err = strategies.describe(strategy, transform)
    if describe_err or not references then
        return nil, invalid("transform " .. strategy .. " declares no enforceable resources: " .. tostring(describe_err))
    end
    return references :: { Map }, nil
end

local function authorization(strategy: string, transform: Map, d: Map): (Map?, error?)
    local references, references_err = M.references(transform)
    if references_err or not references then return nil, references_err end
    if type(d.operator) ~= "table" or type(d.principal) ~= "table" then
        return nil, invalid("the drive names no operator and execution principal to authorize its transform")
    end
    local ids: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, ref in ipairs(references :: { Map }) do
        local id = tostring(ref.resource_id)
        if not seen[id] then seen[id] = true; ids[#ids + 1] = id end
    end
    local grants: Map = {}
    for _, holder in ipairs({ { field = "operator_grants", principal = d.operator, role = "operator" },
        { field = "principal_grants", principal = d.principal, role = "principal" } }) do
        local masks, masks_err = component.principal_masks_system(holder.principal, ids)
        if masks_err or not masks then return nil, masks_err end
        local list: { Map } = {}
        for id, mask in pairs(masks :: { [string]: integer }) do list[#list + 1] = { resource_id = id, mask = mask } end
        grants[holder.field] = list
        for _, ref in ipairs(references :: { Map }) do
            local need = ref.required_mask
            if not strategy_reference.has_mask((masks :: Map)[tostring(ref.resource_id)], need) then
                return nil, denied(holder.role .. " " .. principal_label(holder.principal :: Map) .. " lacks mask "
                    .. tostring(need) .. " on " .. tostring(ref.resource_id) .. " the transform uses")
            end
        end
    end
    return grants, nil
end

-- compile(declaration, drive) -> { sink, sink_config, strategy, transform,
-- replay_safe, authorization, filter? }.
function M.compile(declaration: any, drive: any): (Map?, error?)
    local d = type(declaration) == "table" and (declaration :: Map) or {}
    local sink_port = trim(d.sink_port)
    if sink_port == "" then return nil, invalid("the sync declares no sink_port") end
    local sink, sink_err = round_write.describe_sink(sink_port)
    if sink_err or not sink then return nil, sink_err end
    local max_slots, slots_err = round_write.destination_slots()
    if slots_err or not max_slots then return nil, slots_err end
    local transform = type(d.transform) == "table" and (d.transform :: Map) or nil
    if not transform or trim(transform.kind) == "" then return nil, invalid("the sync declares no transform kind") end
    local strategy = trim(transform.kind)
    local binding, binding_err = strategies.resolve(strategy)
    if binding_err or not binding then return nil, invalid("transform strategy " .. strategy .. ": " .. tostring(binding_err)) end
    local holders = type(drive) == "table" and (drive :: Map) or {}
    local grants, grants_err = authorization(strategy, transform, holders)
    if grants_err or not grants then return nil, grants_err end
    local trigger = type(d.trigger) == "table" and (d.trigger :: Map) or {}
    local filter = type(trigger.filter) == "table" and trim((trigger.filter :: Map).expr) or ""
    return {
        sink = sink,
        max_destination_slots = max_slots,
        sink_config = type(d.sink_config) == "table" and d.sink_config or {},
        strategy = strategy,
        transform = transform,
        replay_safe = (binding :: Map).replay_safe,
        operator = holders.operator,
        principal = holders.principal,
        authorization = grants,
        filter = filter ~= "" and filter or nil,
    }, nil
end

-- The transform request item: the source item's key, its envelope (the item's
-- identity, op, version, event type, times and content reference), and its
-- payload record as the strategy input, which the expression environment
-- names both `input` and `payload`.
local function strategy_item(item: Map): Map
    local payload = type(item.payload) == "table" and (item.payload :: Map) or {}
    return {
        item_key = item.item_key,
        envelope = { item_key = item.item_key, dedup_key = item.dedup_key, op = item.op,
            source_version = item.source_version, event_type = payload.event_type,
            occurred_at = item.occurred_at, observed_at = item.observed_at, ref = item.ref },
        input = item.payload,
        payload = item.payload,
    }
end

-- keeps(plan, item) -> whether the filter keeps the item (nil and false drop
-- it), or the item's failure when the filter cannot be evaluated.
function M.keeps(plan: Map, item: Map): (boolean, Map?)
    if plan.filter == nil then return true, nil end
    local result, eval_err = expr.eval(plan.filter :: string, apply.build_env(strategy_item(item)))
    if eval_err ~= nil then
        return false, { kind = errors.INVALID, retriable = false, message = "filter: " .. tostring(eval_err) }
    end
    return result ~= nil and result ~= false, nil
end

function M.compute(request: Map): (Map?, any)
    local plan,item=request.plan,request.item
    local grants, grants_err = authorization(plan.strategy, plan.transform, plan)
    if grants_err or not grants then return nil, grants_err end
    plan.authorization = grants
    local answer, request_err = apply.apply({ strategy = plan.strategy, config = plan.transform, item = strategy_item(item),
        authorization = plan.authorization })
    if request_err ~= nil or not answer then
        return nil, failure_classification.native({ kind = errors.INVALID, retriable = false, message = "transform: " .. tostring(request_err) })
    end
    local a = answer :: Map
    if type(a.error) == "table" then
        local e = a.error :: Map
        return nil, failure_classification.native({ kind = e.kind, code = e.code, retriable = e.retriable == true, message = "transform: " .. tostring(e.message) })
    end
    return { present = a.present == true, value = a.value, skip = a.skip }, nil
end

function M.evaluate_pure(plan: Map, item: Map): (Map?, any)
    if plan.replay_safe ~= true then return nil, invalid("pure evaluation requires a replay-safe strategy") end
    return M.compute({plan=plan,item=item})
end

-- transform(plan, drive, item, keys) -> { present, value?, skip? } or the item's failure.
function M.payload_hash(plan: Map, item: Map): (string?, any)
    if plan.replay_safe then return nil, nil end
    return canonical_json.hash({ strategy = plan.strategy, config = plan.transform,
        input = item.payload, op = item.op })
end

function M.transform(plan: Map, d: Map, item: Map, keys: Map): (Map?, any)
    local payload_hash, hash_err = M.payload_hash(plan, item)
    if hash_err then return nil, hash_err end
    return round_write.prepare({ drive = d, key = tostring(keys.idempotency_key),
        hash = payload_hash, prepared = not plan.replay_safe,
        effect = not plan.replay_safe and {target="kickside.sync:round_transform_effect",args={plan=plan,item=item}} or nil },
        function(): (any?, any)
            if plan.replay_safe then return M.evaluate_pure(plan, item) end
            return M.compute({plan=plan,item=item})
        end)
end

return M
