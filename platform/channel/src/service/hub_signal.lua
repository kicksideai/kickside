-- Messages to the conversation session hub. Delivery runs in the
-- hub_signal_deliver function under the channel identity, so a bridge running
-- as its route's principal and an ingress writer running as a connection's
-- principal need no process messaging authority. Each message carries its
-- origin, the caller's process: the hub answers it there. The hub authenticates
-- a bridge by the token it issued at spawn, never by the transport sender.

local process = require("process")
local funcs = require("funcs")
local consts = require("channel_consts")

local M = {}

local DELIVER = "kickside.channel.service:hub_signal_deliver"
local KINDS: { [string]: boolean } = {
    turn = true, clear = true, publish = true, health = true, startup_failed = true, append_failed = true, appended = true,
}

-- send(message) -> (sent, err) delivers one hub message from the calling process.
function M.send(message: { [string]: any }): (boolean, string?)
    local sent, call_err = funcs.call(DELIVER, tostring(process.pid()), message)
    if call_err then return false, tostring(call_err) end
    if sent ~= true then return false, "hub unavailable" end
    return true, nil
end

function M.deliver(origin: string, message: any): (boolean, error?)
    if type(message) ~= "table" or not KINDS[(message :: any).kind] then
        return false, (errors.new({ message = "unknown conversation hub message: "
            .. tostring(type(message) == "table" and (message :: any).kind or nil), kind = errors.INVALID }) :: error)
    end
    if type(origin) ~= "string" or origin == "" then
        return false, (errors.new({ message = "conversation hub message requires its origin", kind = errors.INVALID }) :: error)
    end
    local envelope: { [string]: any } = {}
    for key, value in pairs(message :: { [string]: any }) do envelope[key] = value end
    envelope.origin = origin
    local sent, send_err = process.send(consts.HUB_NAME, consts.HUB_TOPIC, envelope)
    if send_err then return false, send_err end
    return sent == true, nil
end

return M
