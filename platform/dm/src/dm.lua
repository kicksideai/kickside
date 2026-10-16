local link_service = require("link_service")
local reply_sender = require("reply_sender")
local production_channel_receive = require("channel_receive")
local channel_refusal = require("channel_refusal")
local persist = require("channel_persist")
local channel_consts = require("channel_consts")
local types = require("channel_types")
local execution_identity = require("execution_identity")
local security = require("security")
local consts = require("dm_consts")

-- kickside.dm:receive -- the provider-neutral inbound DM surface. A bot delivers a
-- normalized message here as the system gateway process; the connection is shared
-- transport and owns no DM identity. This surface owns DM policy: it resolves WHO
-- the external sender is via the kickside.identity link service, handles the DM-only
-- commands, and admits a linked-user identity in protected channel session state.
-- The shared kickside.channel
-- inbound-routing surface (channel_receive) consumes:
--   * "link <code>" -> bind this external account to the code's KickSide user.
--   * "/clear"      -> rotate the session id and drop the live bridge.
--   * unlinked      -> reply with link instructions (no agent runs).
--   * linked turn   -> resolve the linked user live, start the link's pinned
--                      agent (else greeter), and hand the spec to
--                      channel_receive.route_turn. The runtime owns the thread,
--                      session, uploads, and reply; this surface touches none.
-- Session mapping, trace, Route assembly, and the hub send live once in
-- channel_receive; DM routes by its protected session admission, never through the responder route
-- index. Link/clear/unlinked notices get sealed reply admission before the
-- connection-owned bot transport reads a token; agent replies come from the runtime.
local function construct(dependencies: any): any
local channel_receive = dependencies.channel_receive or production_channel_receive
local trusted_ingress = dependencies.trusted_ingress or function(resource: string): boolean
    local actor = security.actor()
    if actor and execution_identity.is_maintenance_key(actor:id()) then return true end
    return security.can("channel.receive.inject", resource) == true
end
local M = {}

-- Control notices are admitted inbound turns too. Their transport principal can
-- send only one reply to the authenticated inbound message's conversation.
local function send(inbound: any, text: string): (any?, any?)
    local component_id = channel_receive.trim(inbound.reply_component_id)
    local resource_id = channel_receive.trim(inbound.reply_resource_id)
    local config: any = { component_id = component_id, resource_id = resource_id }
    if channel_receive.trim(inbound.provider) ~= "" then
        local proof, accept_err = channel_receive.accept_notice(inbound,
            { kind = "transport", id = inbound.provider .. ".gateway" })
        if accept_err or not proof then return nil, "notice admission failed: " .. tostring(accept_err) end
        config.reply_proof = proof
    end
    return reply_sender.send_reply(config, text)
end

local function parse_link_code(text: string): string?
    return text:match("^%s*[Ll][Ii][Nn][Kk]%s+(%S+)%s*$")
end

local function is_clear(text: string): boolean
    return channel_receive.trim(text):match("^[/!]?[Cc][Ll][Ee][Aa][Rr]$") ~= nil
end

local function display_name(inbound: any): string
    local name = channel_receive.trim(inbound.external_display_name)
    if name ~= "" then return name end
    name = channel_receive.trim(inbound.external_username)
    if name ~= "" then return name end
    return channel_receive.trim(inbound.external_user_id)
end

local function system_prompt(provider: string): string
    return "You are responding via " .. provider .. " DM. Keep responses concise and direct. No emojis."
end

local LINK_PROMPT = "This account isn't linked yet. In the app, open your avatar menu -> Linked accounts -> Generate link code, then send me: link <code>"

function M.receive(args: any): any
    if not trusted_ingress("kickside.dm:receive") then
        return { accepted = false, status = "error", error = "trusted DM ingress is required" }
    end
    local inbound, nerr = channel_receive.normalize(args, { require_external_user = true })
    if nerr or not inbound then
        return { accepted = false, status = "error", error = nerr or "invalid inbound" }
    end
    local provider: string = channel_receive.trim(inbound.provider)
    local external_id: string = channel_receive.trim(inbound.external_user_id)

    -- 1. Link command.
    local code = parse_link_code(channel_receive.trim(inbound.text))
    if code then
        local user_id, lerr = link_service.verify_and_link(code, provider, external_id, display_name(inbound))
        if lerr or not user_id then
            local _, fe = send(inbound, "Link failed: " .. tostring(lerr or "invalid code"))
            local failure = lerr or fe
            return { accepted = true, status = "link_failed", error = failure and tostring(failure) or nil }
        end
        local _, se = send(inbound, "Account linked. Your messages here now run as your KickSide account.")
        return { accepted = true, status = "linked", user_id = user_id, error = se }
    end

    -- 2. Resolve the external sender to a KickSide user, plus the link's pinned
    -- starting agent (empty -> greeter fallback).
    local link, link_err = link_service.resolve_link(provider, external_id)
    if link_err then return {accepted = false, status = "error", error = tostring(link_err)} end
    local user_id: string = link and channel_receive.trim(link.user_id) or ""
    if user_id == "" then
        local _, se = send(inbound, LINK_PROMPT)
        return { accepted = true, status = "unlinked", error = se }
    end
    local start_agent_id: string = link and channel_receive.trim(link.default_agent_id) or ""
    if start_agent_id == "" then start_agent_id = consts.GREETER_AGENT_ID end

    -- The route key is the natural key for this DM conversation; the hub keys its
    -- live bridge by it, and /clear addresses the bridge with it.
    local route_key: string = channel_consts.external_ref(provider, channel_receive.trim(inbound.reply_component_id), channel_receive.trim(inbound.channel_id))

    -- The protected admission every session of this linked conversation carries.
    local selected = {
        version = execution_identity.VERSION,
        principal = { kind = execution_identity.KIND.USER, id = user_id },
        authorized_by = { kind = execution_identity.KIND.USER, id = user_id },
        link_id = link.link_id,
        captured_at = execution_identity.utc_now(),
    }

    -- 3. /clear -- rotate the session id and drop the live bridge; next turn fresh.
    -- The clear signal is not a turn, so it sends to the hub directly. Session
    -- persist lives on the shared engine (channel) db + table -- DM keeps no db of
    -- its own; it is the subject-identity surface over the same runtime.
    if is_clear(inbound.text) then
        local db_id, derr = channel_consts.db_id()
        if derr or not db_id then
            return { accepted = false, status = "error", user_id = user_id, error = tostring(derr) }
        end
        local admission, admission_err = channel_receive.session_admission(selected)
        if admission_err or not admission then
            return { accepted = false, status = "error", user_id = user_id, error = admission_err }
        end
        local rotated, cerr = persist.clear(db_id, channel_consts.SESSION_MAP_TABLE, provider,
            external_id, admission)
        if cerr or not rotated then
            local refused = channel_refusal.status(cerr, nil)
            if refused then
                refused.user_id = user_id
                return refused
            end
            return { accepted = false, status = "error", user_id = user_id,
                error = cerr or "session rotation returned no session" }
        end
        channel_receive.send_hub({ kind = "clear", key = route_key })
        local _, se = send(inbound, "Chat cleared.")
        return { accepted = true, status = "cleared", user_id = user_id, session_id = rotated, error = se }
    end

    -- 4. A turn: route the protected admission through the shared orchestrator,
    -- which owns the session, trace, Route, and hub send.
    local spec: types.RouteSpec = {
        route_key = route_key,
        session_provider = provider,
        session_subject = external_id,
        admission = selected,
        thread = {
            impl_id = "kickside.dm:dm_kind",
            class = consts.THREAD_CLASS,
            title_prefix = "DM",
            managed_by = "kickside.dm",
            receive_target = "kickside.dm:receive",
            role = "dm",
            user_ids = { user_id },
            owner_principal = { kind = "user", id = user_id },
            audience_principals = { { kind = "user", id = user_id } },
            inbound_event = consts.EVENT.INBOUND,
        },
        start = {
            agent_id = start_agent_id,
            session_kind = "DM",
            system_prompt = system_prompt(provider),
        },
        reply_sent_event = consts.EVENT.REPLY_SENT,
        reply_failed_event = consts.EVENT.REPLY_FAILED,
        trace_domain = "dm",
        trace_parts = { "user", external_id },
    }
    local result: any = channel_receive.route_turn(inbound, spec)
    result.user_id = user_id
    return result
end

M.new = construct
return M
end

return construct({})
