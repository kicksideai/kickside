-- The sync's round consumer (kickside.trigger:round_consumer.deliver; design
-- v5 §3.2, §4.6). An automation round calls it under the automation's live
-- execution identity with one page of a drive's items and the drive's applied
-- declaration. Each item is filtered, transformed, normalized to the sink's
-- declared input shape (a content sink receives the sync's document) and
-- written through round_write, once per destination slot its receipts map
-- (the page's receipts are read in one batch):
--
--   upsert -- updates each mapped slot in place, or writes a new destination
--   delete -- removes each mapped slot; an item with no destination is skipped
--
-- Every item key is answered in exactly one outcome list. A declaration the
-- plan refuses fails the whole page as a typed declaration failure, and a
-- transform resource the drive's operator or principal lacks as an access
-- failure.

local failure_classification = require("failure_classification")
local round_write = require("round_write")
local plan_lib = require("round_plan")
local document = require("sync_document")
local sink_input = require("sink_input")

local M = {}

type Map = { [string]: any }

local function failure(err: any): Map
    return failure_classification.classify(err) :: Map
end

-- write_slots writes one input to every slot and answers the combined outcome:
-- delivered with every slot's receipts, or the first slot's other outcome.
local function write_slots(plan: Map, d: Map, item: Map, slots: { Map }, sink_op: string, input: Map, port: string,
    known_slots: integer): Map
    local receipts: { Map } = {}
    for _, slot in ipairs(slots) do
        local map_slot = tostring(slot.map_slot or "")
        local keys = round_write.keys(d, item, map_slot ~= "" and map_slot or nil)
        local outcome = round_write.write(plan.sink, {
            config = plan.sink_config, sink_op = sink_op, input = input,
            identity_key = slot.identity_key or keys.identity_key, idempotency_key = keys.idempotency_key,
            map_slot = map_slot, dest_ref = slot.dest_ref, dest_version = slot.dest_version,
            max_destination_slots = plan.max_destination_slots, known_slots = known_slots,
        }, d, item)
        if outcome.state ~= "delivered" then
            outcome.receipts = receipts
            return outcome
        end
        for _, r in ipairs((outcome.receipts or {}) :: { Map }) do receipts[#receipts + 1] = r end
    end
    return { state = "delivered", receipts = receipts }
end

-- shape(plan, item, value, owner, sink_op) -> the sink input for a transform
-- value (an upsert) or for a delete. A record is the transform's output, which
-- a delete has none of: the write's dest_ref names what it removes.
local function shape(plan: Map, item: Map, value: any, owner: string, sink_op: string): (Map?, any)
    if sink_op == "delete" then
        if plan.sink.input_shape == round_write.INPUT_SHAPE.CONTENT then return document.build({}, item, owner, "delete") end
        return {}, nil
    end
    local input, shape_err = sink_input.normalize(value, plan.sink.input_shape, plan.sink_config.content)
    if shape_err or not input then return nil, shape_err end
    if plan.sink.input_shape == round_write.INPUT_SHAPE.CONTENT then return document.build(input :: Map, item, owner, "upsert") end
    return input, nil
end

-- deliver_item -> the outcome list the item belongs in and its entry.
local function deliver_item(plan: Map, d: Map, item: Map, port: string, known: { Map }): (string, Map)
    local key = item.delivery_key
    local owner = tostring(d.automation_id)
    -- The filter selects source items to write; a delete removes a
    -- destination this sync wrote, whatever the filter says of its item.
    if item.op ~= "delete" then
        local keeps, filter_failure = plan_lib.keeps(plan, item)
        if filter_failure then return "failed_items", { key = key, error = failure(filter_failure) } end
        if not keeps then return "skipped_items", { key = key, reason = "filtered" } end
    end
    if item.op ~= "upsert" and item.op ~= "delete" then
        return "failed_items", { key = key, error = failure({ kind = errors.INVALID, retriable = false,
            message = "source item op must be upsert or delete, got " .. tostring(item.op) }) }
    end
    local slots = known
    local keys = round_write.keys(d, item, nil)
    local prepared_key: string? = nil
    local input: Map
    if item.op == "delete" then
        if #slots == 0 then return "skipped_items", { key = key, reason = "no destination" } end
        local shaped, shape_err = shape(plan, item, nil, owner, "delete")
        if shape_err or not shaped then return "failed_items", { key = key, error = failure(shape_err) } end
        input = shaped :: Map
    else
        -- An upsert that fails before its write names its prepared output:
        -- nothing was written, so the round settles that output once the
        -- item is dead, and a retry reuses it.
        local unsent: Map = { key = key }
        if not plan.replay_safe then unsent.prepared_key = keys.idempotency_key end
        local transformed, transform_err = plan_lib.transform(plan, d, item, keys)
        if transform_err ~= nil or not transformed then
            unsent.error = failure(transform_err)
            return "failed_items", unsent
        end
        local t = transformed :: Map
        if t.skip ~= nil then
            return "skipped_items", { key = key, reason = t.skip, prepared_key = unsent.prepared_key }
        end
        -- A present false is a value; only an absent result is nil.
        local value: any = nil
        if t.present then value = t.value end
        local shaped, shape_err = shape(plan, item, value, owner, "upsert")
        if shape_err or not shaped then
            unsent.error = failure(shape_err)
            return "failed_items", unsent
        end
        input = shaped :: Map
        if not plan.replay_safe then prepared_key = keys.idempotency_key end
        if #slots == 0 then slots = { { map_slot = "" } } end
    end
    local outcome = write_slots(plan, d, item, slots, item.op, input, port, #known)
    if outcome.state == "delivered" then
        return "delivered_items", { key = key, receipts = outcome.receipts, prepared_key = prepared_key }
    elseif outcome.state == "waiting" then
        return "waiting_items", { key = key, retry_after_ms = outcome.retry_after_ms, error = outcome.error }
    elseif outcome.state == "uncertain" then
        return "uncertain_items", { key = key }
    end
    return "failed_items", { key = key, error = outcome.error, receipts = outcome.receipts }
end

-- deliver({ drive, items, config }) -> the five outcome lists.
function M.deliver(request: any): (Map?, any)
    local r = type(request) == "table" and (request :: Map) or {}
    local d = type(r.drive) == "table" and (r.drive :: Map) or {}
    local plan, plan_err = plan_lib.compile(r.config, d)
    if plan_err or not plan then return nil, plan_err end
    local port = tostring(d.source_port or d.source_ref or "")
    local items = (r.items or {}) :: { Map }
    local keys: { string } = {}
    for _, item in ipairs(items) do keys[#keys + 1] = tostring(item.item_key) end
    local receipts, receipts_err = round_write.receipts(tostring(d.automation_id), port, keys)
    if receipts_err or not receipts then return nil, receipts_err end
    for record, slots in pairs(d.prepared_receipts or {}) do (receipts :: Map)[record] = slots end
    local out: Map = { delivered_items = {}, skipped_items = {}, waiting_items = {}, uncertain_items = {}, failed_items = {} }
    local interrupted: Map? = nil
    for _, item in ipairs(items) do
        local list, entry
        if interrupted then
            list, entry = "failed_items", {key=item.delivery_key,error=interrupted}
        else
            list, entry = deliver_item(plan :: Map, d, item, port, (receipts :: Map)[tostring(item.item_key)] or {})
        end
        if list == "failed_items" then
            local refused = failure(entry.error)
            if refused.kind == errors.PERMISSION_DENIED then
                if #out.delivered_items == 0 and #out.uncertain_items == 0 and #(entry.receipts or {}) == 0 then
                    return nil, errors.new({kind=errors.PERMISSION_DENIED,retryable=false,
                        message=refused.message,details=refused.details or {error_kind="access"}})
                end
                interrupted = refused
            end
        end
        table.insert(out[list] :: { Map }, entry)
    end
    return out, nil
end

return M
