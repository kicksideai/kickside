-- The kind's round consumer dispatches through round_write: the shared fence,
-- live identity recheck, destination capacity and declared delivery semantics.
local task = require("recurring_task")
local round_write = require("round_write")
local classification = require("failure_classification")

local function deliver(request)
    local target, target_err = task.target(request.config.target)
    if target_err then return nil, target_err end
    local sink, sink_err = round_write.describe_sink(target.port)
    if sink_err or not sink then return nil, sink_err end
    local slots, slots_err = round_write.destination_slots()
    if slots_err then return nil, slots_err end
    local d = request.drive
    local out = { delivered_items = {}, skipped_items = {}, waiting_items = {}, uncertain_items = {}, failed_items = {} }
    for _, item in ipairs(request.items) do
        local keys = round_write.keys(d, item)
        local result = round_write.write(sink, {
            config = target.config, sink_op = "upsert", input = target.input,
            identity_key = keys.identity_key, idempotency_key = keys.idempotency_key,
            max_destination_slots = slots, known_slots = 0,
        }, d, item)
        if result.state == "delivered" then
            out.delivered_items[#out.delivered_items + 1] = { key = item.delivery_key,
                receipts = result.receipts }
        elseif result.state == "waiting" then
            out.waiting_items[#out.waiting_items + 1] = { key = item.delivery_key, retry_after_ms = result.retry_after_ms }
        elseif result.state == "uncertain" then
            out.uncertain_items[#out.uncertain_items + 1] = { key = item.delivery_key }
        else
            local failure = classification.classify(result.error)
            if failure.kind == errors.PERMISSION_DENIED then
                return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = failure.message,
                    retryable = false, details = { error_kind = "access" } })
            end
            out.failed_items[#out.failed_items + 1] = { key = item.delivery_key, error = result.error }
        end
    end
    return out, nil
end
return { deliver = deliver }
