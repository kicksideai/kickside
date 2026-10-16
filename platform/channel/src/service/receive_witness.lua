local logger = require("logger"):named("kickside.channel.receive")
local consts = require("channel_consts")
local execution_ref = require("execution_ref")
local thread_bridge = require("channel_thread_bridge")

local M = {}

-- Record a declined inbound on the channel audit thread under the responder's
-- live selected identity. The shared receive path supplies its canonical trim.
function M.record(inbound: any, ref: any, trim: any, publisher: any?): (boolean, any?)
    local where = {
        provider = trim((inbound :: any).provider),
        channel_id = trim((inbound :: any).channel_id),
        reply_component_id = trim((inbound :: any).reply_component_id),
    }
    local resolved, resolve_err = execution_ref.resolve(ref, "channel", { inbound = inbound })
    local actor = resolved and resolved.actor or nil
    local scope = resolved and resolved.scope or nil
    if resolve_err or not actor or not scope then
        logger:warn("channel witness identity unavailable", {
            error = tostring(resolve_err),
            provider = where.provider,
            channel_id = where.channel_id,
            reply_component_id = where.reply_component_id,
        })
        return false, resolve_err or "channel witness identity unavailable"
    end
    local writer = publisher and thread_bridge.with_publisher(publisher) or thread_bridge
    local thread_id, _, thread_err = writer.ensure_thread(inbound, {
        impl_id = "kickside.channel:channel_kind",
        thread_class = consts.THREAD_CLASS,
        title_prefix = "Channel",
        managed_by = "kickside.channel",
        receive_target = "kickside.channel:receive",
        role = "channel",
        user_ids = resolved.principal.kind == "user" and { trim(resolved.principal.id) } or {},
        owner_principal = resolved.principal,
        audience_principals = { resolved.principal },
    }, actor, scope)
    if thread_err or not thread_id then
        logger:warn("channel witness ensure thread failed", {
            error = tostring(thread_err),
            provider = where.provider,
            channel_id = where.channel_id,
            reply_component_id = where.reply_component_id,
        })
        return false, thread_err or "channel witness thread unavailable"
    end
    local _, append_err = writer.append_inbound(thread_id, inbound, {
        event_type = consts.EVENT.INBOUND,
        external_source = consts.THREAD_CLASS .. "." .. trim((inbound :: any).provider),
    }, actor, scope)
    if append_err then
        logger:warn("channel witness append failed", {
            error = tostring(append_err),
            thread_id = thread_id,
            provider = where.provider,
            channel_id = where.channel_id,
            reply_component_id = where.reply_component_id,
        })
        return false, append_err
    end
    return true, nil
end

return M
