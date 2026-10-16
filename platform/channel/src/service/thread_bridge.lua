local contract = require("contract")
local security = require("security")
local hash = require("hash")
local consts = require("channel_consts")

-- The one canonical threads seam: the kickside.core:threads contract, never its
-- private *_method function-ids. Matches inject.lua's reads and schema_state.lua.
local THREADS_CONTRACT = "kickside.core:threads"
local RESPONDER_IMPL = "kickside.channel.responder:channel_responder"

-- Actor-scoped bridge into the kickside.core threads contract: upsert
-- the audit thread and append inbound / reply events under the caller's frame.
-- Generic over thread_class + event types (passed by opts) so a DM and a channel
-- share one audit seam. The thread is the canonical conversation log; the engine
-- only writes through it.
local function construct(publisher: any?): any
local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- call_threads(method, args, actor?, scope?): invoke one kickside.core:threads
-- contract method under an actor + scope. When an explicit actor/scope is supplied
-- (the ingress witness reconstructs the installer identity, which it never holds
-- ambiently), the write runs as that identity; otherwise it runs as the caller's
-- ambient frame (the bridge). Either way the write flows through the contract
-- binding (the swappable seam), never a private *_method id.
local function call_threads(method: string, args: any, actor: any?, scope: any?): (any?, string?)
    if publisher and (method == "append_event" or method == "emit") then
        local result, err = publisher(method, args)
        if err then return nil, tostring(err) end
        return result, nil
    end
    actor = actor ~= nil and actor or security.actor()
    if not actor or trim(actor:id()) == "" then return nil, "authenticated actor is required" end
    scope = scope ~= nil and scope or security.scope()
    if not scope then return nil, "security scope is required" end
    local def, gerr = contract.get(THREADS_CONTRACT)
    if gerr or not def then return nil, "threads contract unavailable: " .. tostring(gerr) end
    local inst, oerr = (def :: any):with_actor(actor):with_scope(scope):open()
    if oerr or not inst then return nil, "threads open failed: " .. tostring(oerr) end
    local result, call_err = (inst :: any)[method]((inst :: any), args)
    if call_err then return nil, tostring(call_err) end
    return result, nil
end

local function display_name(inbound: any): string
    local name = trim(inbound.external_display_name)
    if name ~= "" then return name end
    name = trim(inbound.external_username)
    if name ~= "" then return name end
    return trim(inbound.external_user_id)
end

-- ensure_thread(inbound, opts, actor?, scope?) -> (thread_id?, result?, err?). opts = {
-- thread_class, title_prefix, managed_by, receive_target, role, user_ids }. An
-- explicit actor/scope authors the upsert as that identity (ingress witness);
-- omitted, it runs as the ambient frame (bridge).
function M.ensure_thread(inbound: any, opts: any, actor: any?, scope: any?): (string?, any?, string?)
    inbound = type(inbound) == "table" and inbound or {}
    opts = type(opts) == "table" and opts or {}
    local thread_class = trim(opts.thread_class) ~= "" and trim(opts.thread_class) or consts.THREAD_CLASS
    local provider = trim(inbound.provider)
    local reply_component_id = trim(inbound.reply_component_id)
    local channel_id = trim(inbound.channel_id)
    if provider == "" then return nil, nil, "provider is required" end
    if reply_component_id == "" then return nil, nil, "reply_component_id is required" end
    if channel_id == "" then return nil, nil, "channel_id is required" end

    local external_ref = consts.external_ref(provider, reply_component_id, channel_id)
    local label = display_name(inbound)
    if label == "" then label = channel_id end
    local title_prefix = trim(opts.title_prefix) ~= "" and trim(opts.title_prefix) or "Channel"
    local user_ids: { string } = {}
    if type(opts.user_ids) == "table" then
        for _, u in ipairs(opts.user_ids :: { any }) do
            if type(u) == "string" and u ~= "" then user_ids[#user_ids + 1] = u end
        end
    end
    local audience_principals: { any } = {}
    if opts.audience_principals ~= nil then
        if type(opts.audience_principals) ~= "table" then
            return nil, nil, "audience_principals must be an array"
        end
        for _, principal in ipairs(opts.audience_principals :: { any }) do
            if type(principal) ~= "table" or (principal.kind ~= "user" and principal.kind ~= "group"
                and principal.kind ~= "service") or trim(principal.id) == "" then
                return nil, nil, "invalid audience principal"
            end
            audience_principals[#audience_principals + 1] = { kind = principal.kind, id = principal.id }
        end
    else
        for _, user_id in ipairs(user_ids) do
            audience_principals[#audience_principals + 1] = { kind = "user", id = user_id }
        end
    end
    local owner_principal = opts.owner_principal
    if owner_principal ~= nil and (type(owner_principal) ~= "table"
        or (owner_principal.kind ~= "user" and owner_principal.kind ~= "group"
            and owner_principal.kind ~= "service") or trim(owner_principal.id) == "") then
        return nil, nil, "invalid owner_principal"
    end

    local result, err = call_threads("upsert", {
        impl_id = opts.impl_id,
        thread_class = thread_class,
        external_ref = external_ref,
        title = title_prefix .. ": " .. label,
        attrs = {
            managed_by = trim(opts.managed_by) ~= "" and trim(opts.managed_by) or "kickside.channel",
            receive_target = trim(opts.receive_target) ~= "" and trim(opts.receive_target) or "kickside.channel:receive",
            role = trim(opts.role) ~= "" and trim(opts.role) or "channel",
            user_ids = user_ids,
            audience_principals = audience_principals,
            owner_principal = owner_principal,
            provider = provider,
            reply_component_id = reply_component_id,
            reply_resource_id = trim(inbound.reply_resource_id),
            external_ref = external_ref,
            channel_id = channel_id,
            external_user_id = trim(inbound.external_user_id),
            external_username = trim(inbound.external_username),
            external_display_name = trim(inbound.external_display_name),
        },
    }, actor, scope)
    if err then return nil, nil, err end
    local thread_id = result and result.thread_id
    if type(thread_id) ~= "string" or thread_id == "" then
        return nil, nil, "threads upsert returned no thread_id"
    end
    return thread_id, result, nil
end

-- append_inbound(thread_id, inbound, opts, actor?, scope?) -> (result?, err?). opts = {
-- event_type, external_source, trace_context }. external_source defaults from the
-- provider. An explicit actor/scope authors the append as that identity (ingress
-- witness); omitted, it runs as the ambient frame (bridge). The append is idempotent
-- on the external message id, so a witness at ingress and the bridge's own append of
-- the same message never double-write.
function M.append_inbound(thread_id: string, inbound: any, opts: any, actor: any?, scope: any?): (any?, string?)
    inbound = type(inbound) == "table" and inbound or {}
    opts = type(opts) == "table" and opts or {}
    thread_id = trim(thread_id)
    if thread_id == "" then return nil, "thread_id is required" end

    local provider = trim(inbound.provider)
    local text = type(inbound.text) == "string" and inbound.text or ""
    local body: { [string]: any } = {
        text = text,
        provider = provider,
        reply_component_id = trim(inbound.reply_component_id),
        reply_resource_id = trim(inbound.reply_resource_id),
        channel_id = trim(inbound.channel_id),
        external_user_id = trim(inbound.external_user_id),
        external_username = trim(inbound.external_username),
        external_display_name = trim(inbound.external_display_name),
        external_message_id = trim(inbound.external_message_id),
        attachments = type(inbound.attachments) == "table" and inbound.attachments or {},
    }
    if type(inbound.file_uuids) == "table" then
        body.file_uuids = inbound.file_uuids
    end

    local event: { [string]: any } = {
        type = trim(opts.event_type) ~= "" and trim(opts.event_type) or consts.EVENT.INBOUND,
        role = "user",
        body = body,
        content = {
            content_type = "text/plain",
            content_mode = "inline",
            content_bytes = #text,
        },
        trace_context = type(opts.trace_context) == "table" and opts.trace_context
            or (type((inbound :: any).trace_context) == "table" and (inbound :: any).trace_context or nil),
    }
    -- Every witnessed inbound carries a durable external dedup identity, so the
    -- threads dedup index witnesses a redelivered (retried) message exactly once.
    -- A provider message id is that identity directly; when the provider omits one,
    -- derive a deterministic key from the message's transport-stable facts. The key
    -- must be identical across retries, so attachments/file_uuids are excluded (they
    -- are re-materialized per delivery with fresh upload ids); two distinct messages
    -- with the same sender + content collapse to one witness -- the accepted trade
    -- for a provider that supplies no id. external_version is a non-null sentinel:
    -- the dedup index includes it, and a NULL there reads as distinct on SQLite and
    -- Postgres pre-15, which would let a same-key retry insert twice.
    local source = trim(opts.external_source)
    if source == "" then source = consts.event_external_source(provider) end
    local external_message_id = trim(inbound.external_message_id)
    local external_id = external_message_id
    if external_id == "" then
        local facts = table.concat({
            provider,
            trim(inbound.reply_component_id),
            trim(inbound.channel_id),
            trim(inbound.external_user_id),
            tostring(#(body.attachments :: { any })),
            text,
        }, "\0")
        local digest, digest_err = hash.sha256(facts)
        external_id = "content:" .. ((not digest_err and type(digest) == "string") and digest or facts)
    end
    event.external = {
        external_source = source,
        external_id = external_id,
        external_version = "v1",
    }

    return call_threads("append_event", { thread_id = thread_id, event = event }, actor, scope)
end

-- append_reply_event(thread_id, event_type, body, trace_context?) -> (result?, err?).
function M.append_reply_event(thread_id: string, event_type: string, body: any, trace_context: any?): (any?, string?)
    thread_id = trim(thread_id)
    if thread_id == "" then return nil, "thread_id is required" end
    event_type = trim(event_type)
    if event_type == "" then return nil, "event_type is required" end
    local payload: { [string]: any } = {}
    if type(body) == "table" then
        for k, v in pairs(body :: { [string]: any }) do payload[k] = v end
    end
    local text = type(payload.text) == "string" and payload.text or ""
    return call_threads("append_event", {
        thread_id = thread_id,
        event = {
            type = event_type,
            role = "assistant",
            body = payload,
            content = {
                content_type = "text/markdown",
                content_mode = "inline",
                content_bytes = #text,
            },
            trace_context = type(trace_context) == "table" and trace_context or nil,
        },
    })
end

-- emit_responder_event(component_id, event_type, body) writes a responder runtime
-- event to the responder component thread through the same threads contract seam.
function M.emit_responder_event(component_id: string, event_type: string, body: any): (any?, string?)
    component_id = trim(component_id)
    if component_id == "" then return nil, "component_id is required" end
    event_type = trim(event_type)
    if event_type == "" then return nil, "event_type is required" end
    return call_threads("emit", {
        component_id = component_id,
        type = event_type,
        body = type(body) == "table" and body or {},
        impl_id = RESPONDER_IMPL,
        thread_class = consts.RESPONDER_THREAD_CLASS,
    })
end

M.with_publisher = construct
return M
end
return construct(nil)
