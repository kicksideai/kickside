-- kickside.data:writable sink that posts content to a channel (Discord, Slack, …)
-- through the connection's reply provider. The destination is a generalized
-- {connection_id, channel_id} chosen with wc-channel-picker; reply_sender opens the
-- connection's reply provider and chunks the message to the provider's limit.

local canonical_json = require("canonical_json")
local reply_sender = require("reply_sender")
local writable_sink = require("writable_sink")

local trim, fail = writable_sink.trim, writable_sink.fail

local function write(req: any): any
    req = type(req) == "table" and req or {}
    local origin, origin_failure = writable_sink.origin(req)
    if origin_failure then return origin_failure end

    local sink_op = trim(req.sink_op)
    if sink_op == "" then sink_op = "upsert" end
    if sink_op ~= "upsert" then return fail("unsupported sink operation: " .. sink_op) end

    local config = type(req.config) == "table" and req.config or {}
    local connection_id = tostring(config.connection_id or "")
    local channel_id = tostring(config.channel_id or "")
    if connection_id == "" then return fail("destination connection_id is required") end
    if channel_id == "" then return fail("destination channel_id is required") end

    local input = type(req.input) == "table" and req.input or {}
    local content = input.content
    if content == nil or content == "" then return fail("write input.content is required") end

    -- A keyed write hands the provider one delivery key for every attempt of
    -- this (origin, sink_op, idempotency_key), so a provider with native send
    -- idempotency (Discord's enforced nonce) answers a retried send with the
    -- message an earlier attempt created.
    local delivery_key: string? = nil
    local idempotency_key = trim(req.idempotency_key)
    if idempotency_key ~= "" then
        local encoded, key_err = canonical_json.encode({ origin = origin, sink_op = sink_op,
            idempotency_key = idempotency_key })
        if key_err then return fail(tostring(key_err)) end
        delivery_key = encoded
    end

    -- An ordinary outbound write: reply_sender authorizes it under the current
    -- execution principal's connection WRITE grant before the provider opens.
    local sent, serr, partial = reply_sender.send_reply({ component_id = connection_id, resource_id = channel_id,
        outbound = true, idempotency_key = delivery_key }, tostring(content))
    if serr and errors.is(serr, errors.PERMISSION_DENIED) then
        return fail("connection WRITE denied: " .. tostring(serr), "permission_denied", false, "connection")
    end
    if serr and (errors.is(serr, errors.UNAVAILABLE) or errors.is(serr, errors.INTERNAL)) and partial ~= true then
        return fail("connection WRITE unavailable: " .. tostring(serr), "provider_unavailable", true, "provider")
    end
    if serr then
        return fail(tostring(serr), "provider_error", partial ~= true, "provider",
            partial == true and { partial_delivery = true } or nil)
    end

    local ref = { connection_id = connection_id, channel_id = channel_id }
    if type(sent) == "table" and type(sent.message_ref) == "string" then ref.message_ref = sent.message_ref end
    local slot = trim(req.map_slot)
    if slot == "" then slot = "default" end
    return { success = true, result = "created", dest_ref = ref,
        dest_refs = { [slot] = { dest_ref = ref } } }
end


return { write = write }
