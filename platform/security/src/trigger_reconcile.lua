-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local channel = require("channel")
local time = require("time")
local funcs = require("funcs")
local consts = require("security_consts")

local REQUEST = "kickside.security.service:reconcile_request"

local REPLY_TIMEOUT = "15s"

-- trigger(extra) -> (stats, err). extra (e.g. {slug=...} or {source="boot"})
-- is merged into the reconcile request payload.
local function trigger(extra: { [string]: any }?): (any?, error?)
    local reply_topic = "kickside.security.scope_projection.reply:" .. tostring(process.pid())
    local reply_ch = process.listen(reply_topic)

    local payload: { [string]: any } = {}
    for key, value in pairs(extra or {}) do payload[key] = value end
    payload.reply_pid = tostring(process.pid())
    payload.reply_topic = reply_topic

    local ok, send_err = funcs.call(REQUEST, payload)
    if send_err or not ok then
        process.unlisten(reply_ch)
        local message = "scope projection service not registered under " .. consts.SCOPE_PROJECTION_TOPIC
        if send_err then return nil, send_err end
        return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true, message = message}) :: error)
    end

    local tick, timer_err = time.after(REPLY_TIMEOUT)
    if timer_err or not tick then
        process.unlisten(reply_ch)
        if timer_err then return nil, timer_err end
        return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
            message = "scope projection reply timer unavailable"}) :: error)
    end
    local result = channel.select({
        reply_ch:case_receive(),
        tick:case_receive(),
    })
    process.unlisten(reply_ch)

    if result.channel == tick then
        return nil, (errors.new({kind = errors.TIMEOUT, retryable = true,
            message = "scope projection reconcile timed out waiting for " .. consts.SCOPE_PROJECTION_TOPIC}) :: error)
    end

    local reply = result.value
    if type(reply) ~= "table" or reply.success ~= true then
        if type(reply) == "table" and type(reply.error_native) == "table" then
            return nil, (errors.new(reply.error_native) :: error)
        end
        local reply_err = (type(reply) == "table" and reply.error) or tostring(reply)
        return nil, (errors.new({message = "scope projection reconcile failed: " .. tostring(reply_err)}) :: error)
    end

    return reply, nil
end

-- deliver(payload) hands one reconcile request to the registered projector. It
-- runs as the reconcile_request function under the security identity, so
-- requesting principals need no process messaging authority; the projector
-- answers the reply destination the request names.
local function deliver(payload: { [string]: any }): (boolean, error?)
    local sent, send_err = process.send(consts.SCOPE_PROJECTION_TOPIC, consts.RECONCILE_TOPIC, payload)
    if send_err then return false, send_err end
    return sent == true, nil
end

return { trigger = trigger, deliver = deliver }
