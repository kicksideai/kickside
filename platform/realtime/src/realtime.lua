-- Centralized realtime push. Two reach patterns over wippy/relay:
--   broadcast — fan out a topic to EVERY connected client (the relay central hub
--               forwards any non-control topic to all user hubs).
--   notify    — push a topic to ONE user's connected clients (their user hub).
-- A no-op when no hub is live (no open clients); UIs reconcile on next load. A
-- refused delivery is returned. Authorization runs against the caller's actor;
-- the hub send runs under the realtime transport policy declared on these
-- functions, so callers need no process messaging authority.

local process = require("process")
local security = require("security")
local error_envelope = require("error_envelope")

-- The relay central hub registers under this process-registry name; sending it a
-- custom topic fans the message out to every user hub it tracks.
local CENTRAL_HUB = "wippy.central"
local USER_HUB_PREFIX = "user."

local M = {}
local can_notify = require("notify_policy").can_notify

-- deliver hands one topic to a registered hub; an absent hub is not an error.
local function deliver(hub_name: string, topic: string, data: any): error?
    local hub, lookup_err = process.registry.lookup(hub_name)
    if lookup_err then
        if lookup_err:kind() == errors.NOT_FOUND then return nil end
        return errors.new({ message = "realtime hub lookup failed: " .. tostring(lookup_err), kind = errors.UNAVAILABLE,
            retryable = true, details = { code = "realtime_hub_lookup_failed", cause = error_envelope.encode(lookup_err) } })
    end
    if not hub then return nil end
    local _, send_err = process.send(hub, topic, data)
    if send_err then
        return errors.new({ message = "realtime delivery failed: " .. tostring(send_err), kind = errors.UNAVAILABLE,
            retryable = true, details = { code = "realtime_delivery_failed", cause = error_envelope.encode(send_err) } })
    end
    return nil
end

local function can_broadcast(topic: string): boolean
    return security.can("realtime.broadcast", "kickside.realtime:" .. topic) == true
        or security.can("realtime.broadcast", "kickside.realtime:broadcast") == true
end

-- broadcast({ topic, data }) -> { success }. Reaches all connected clients.
function M.broadcast(args: any): (any, error?)
    args = args or {}
    if type(args.topic) ~= "string" or args.topic == "" then
        return { success = false, error = "topic is required" }
    end
    if not can_broadcast(args.topic :: string) then
        return { success = false, error = "access denied" }
    end
    local deliver_err = deliver(CENTRAL_HUB, args.topic :: string, args.data or {})
    if deliver_err then return nil, deliver_err end
    return { success = true }
end

-- notify({ user_id, topic, data }) -> { success }. Reaches one user's clients.
function M.notify(args: any): (any, error?)
    args = args or {}
    if type(args.user_id) ~= "string" or args.user_id == "" then
        return { success = false, error = "user_id is required" }
    end
    if type(args.topic) ~= "string" or args.topic == "" then
        return { success = false, error = "topic is required" }
    end
    if not can_notify(args.user_id :: string) then
        return { success = false, error = "access denied" }
    end
    local deliver_err = deliver(USER_HUB_PREFIX .. (args.user_id :: string), args.topic :: string, args.data or {})
    if deliver_err then return nil, deliver_err end
    return { success = true }
end

return M
