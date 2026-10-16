-- Exercises inbox event failures inside an authenticated execution frame.
local events = require("inbox_events")
local component = require("component")

local function run(input: any): any
    if input.kind == "unknown_type" then
        local id, err = events.create({ item_type = "notification", title = "Northwind unknown type" })
        return { acknowledged = id ~= nil, error = tostring(err) }
    end
    if input.kind == "claim_decode" then
        local claimed, err = events.claim_delivery("broken-claim", "upsert", "item", {}, function()
                return {
                    find = function() return { thread = { id = "thread" } }, nil end,
                    find_event_by_external = function() return { event = { body = "{broken" } }, nil end,
                }, nil
            end)
        return { acknowledged = claimed, typed = errors.is(err, errors.INTERNAL) }
    end
    local failure = errors.new({ message = "injected access denial", kind = errors.PERMISSION_DENIED, retryable = false })
    if input.kind == "lookup" then
        local created, err = events.create({ id = "lookup-probe", item_type = "notice", title = "Probe",
            content = "one", idempotency_key = "lookup-probe@1" }, {
            open_threads = function() return nil, failure end,
        })
        return { acknowledged = created ~= nil, typed = errors.is(err, errors.PERMISSION_DENIED), same = err == failure }
    end
    local original = component.emit_singleton_event
    component.emit_singleton_event = function() return nil, failure end
    local created, err = events.create({ id = "append-probe", item_type = "notice", title = "Probe", content = "one" })
    component.emit_singleton_event = original
    return { acknowledged = created ~= nil, typed = errors.is(err, errors.PERMISSION_DENIED), same = err == failure }
end

return { run = run }
