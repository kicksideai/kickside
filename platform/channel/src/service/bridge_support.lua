local logger = require("logger"):named("kickside.channel.bridge")
local time = require("time")
local channel = require("channel")
local security = require("security")
local contract = require("contract")
local llm = require("llm")
local prompt = require("prompt")
local component = require("component")
local reply_sender = require("reply_sender")
local reply_policy = require("reply_policy")
local session_consts = require("session_consts")
local session_service = require("session_service")
local consts = require("channel_consts")
local thread_bridge = require("channel_thread_bridge")
local attachment_ingest = require("attachment_ingest")
local trace_context = require("trace_context")

local AGENT_RESOLVER = "wippy.agent:resolver"
local SESSION_ACTIVATED = "kickside.channel.responder.events:session.activated"
local SESSION_COMPLETED = "kickside.channel.responder.events:session.completed"
local LAZY_ASSESS_SYSTEM = [[You decide whether a channel responder should answer an accumulated batch of channel messages.
Return exactly RESPOND or SKIP.
Choose SKIP for greetings, acknowledgements, unrelated chatter, or messages outside the responder policy.
Choose RESPOND only when the responder should generate a public reply.]]
local MIN_RUNTIME_IDLE_SECONDS = 60
local MAX_RUNTIME_IDLE_SECONDS = 24 * 60 * 60

type Map = { [string]: any }
local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- The public bridge boundary applies the declared idle-policy default and
-- bounds timer values to the supported interval.
local function runtime_idle_ms(start: any): number
    local policy = type(start) == "table" and type((start :: any).session_policy) == "table"
        and (start :: any).session_policy or {}
    local seconds = tonumber((policy :: any).runtime_idle_seconds)
        or tonumber(consts.DEFAULT_RUNTIME_IDLE_SECONDS)
        or (10 * 60)
    seconds = math.max(MIN_RUNTIME_IDLE_SECONDS, math.min(MAX_RUNTIME_IDLE_SECONDS, seconds))
    return math.floor(seconds) * 1000
end

local function display_name(inbound: any): string
    local name = trim(inbound.external_display_name)
    if name ~= "" then return name end
    name = trim(inbound.external_username)
    if name ~= "" then return name end
    return trim(inbound.external_user_id)
end

-- The actor the run-as frame owns: a DM subject's id, or the channel installer.
-- Sourced from the bridge's own actor so the session and uploads are owned by
-- that identity, never threaded over the wire.
local function actor_id(actor: any): string
    return trim(actor:id())
end

-- The session applies config.active_traits as the agent's FULL trait set (a replace,
-- not an append). To add the responder's extra traits ON TOP of the agent's own,
-- resolve the agent's own traits and concatenate, deduped by id. Returns nil when
-- there are no extras, so the agent keeps its own traits untouched.
local function resolve_active_traits(start: any, actor: any, scope: any): ({ any }?, Map?, any?)
    local extra = type((start :: any).traits) == "table" and (start :: any).traits or {}
    local trait_contexts = type((start :: any).trait_contexts) == "table" and (start :: any).trait_contexts or {}

    local own: { any } = {}
    local def, def_err = contract.get(AGENT_RESOLVER)
    if def_err or not def then return nil, nil, def_err or "agent resolver is unavailable" end
    local bound, actor_err = (def :: any):with_actor(actor)
    if actor_err or not bound then return nil, nil, actor_err or "agent resolver actor is unavailable" end
    local scoped, scope_err = bound:with_scope(scope)
    if scope_err or not scoped then return nil, nil, scope_err or "agent resolver scope is unavailable" end
    local inst, open_err = scoped:open()
    if open_err or not inst then return nil, nil, open_err or "agent resolver cannot open" end
    local spec, resolve_err = inst:resolve({ agent_id = trim((start :: any).agent_id) })
    if resolve_err or type(spec) ~= "table" then return nil, nil, resolve_err or "agent resolver returns no specification" end
    if type(spec.traits) == "table" then own = spec.traits :: { any } end
    local agent_options: Map = type(spec.agent_options) == "table" and spec.agent_options or {}
    if #(extra :: { any }) == 0 then return nil, agent_options end

    local seen: { [string]: boolean } = {}
    local out: { any } = {}
    for _, t in ipairs(own) do
        local id = type(t) == "table" and trim((t :: any).id) or trim(t)
        if id ~= "" and not seen[id] then seen[id] = true; out[#out + 1] = t end
    end
    for _, raw in ipairs(extra :: { any }) do
        local id = trim(raw)
        if id ~= "" and not seen[id] then
            seen[id] = true
            local tctx = (trait_contexts :: Map)[id]
            out[#out + 1] = type(tctx) == "table" and { id = id, context = tctx } or { id = id }
        end
    end
    return out, agent_options
end

-- Build the session config the session process reads on every turn. agent_id
-- lives in config, so redirects can switch the agent in place. active_traits
-- (when set) is the full trait set the session applies on top of the agent.
local function session_config(thread_id: string, start: any, active_traits: { any }?, agent_options: Map?): Map
    local base = session_consts.get_config()
    local config: Map = {
        token_checkpoint_threshold = base.token_checkpoint_threshold,
        max_message_limit = base.max_message_limit,
        checkpoint_function_id = base.checkpoint_function_id,
        title_function_id = base.title_function_id,
        delegation_func_id = base.delegation_func_id,
        enable_agent_cache = base.enable_agent_cache,
        delegation_description_suffix = base.delegation_description_suffix,
        agent_id = trim((start :: any).agent_id),
        thread_id = thread_id,
    }
    if type(active_traits) == "table" and #(active_traits :: { any }) > 0 then
        config.active_traits = active_traits
    end
    local checkpoint = type(agent_options) == "table" and (agent_options :: Map).checkpoint or nil
    if type(checkpoint) == "table" and (checkpoint :: Map).token_threshold ~= nil then
        config.token_checkpoint_threshold = (checkpoint :: Map).token_threshold
    end
    return config
end

local function canonical_provider(value: any): string
    -- Provider identifiers are a registry vocabulary. Keep the durable session
    -- metadata canonical and deliberately do not retain a connection/component
    -- id, credential, channel id, or inbound-supplied display value.
    local provider = trim(value):lower()
    if #provider > 64 or not provider:match("^[a-z0-9][a-z0-9._-]*$") then return "" end
    return provider
end

local function ensure_session(session_id: string, thread_id: string, start: any, user_id: string, session_provider: string, active_traits: { any }?, agent_options: Map?): (boolean?, string?)
    local session_kind = trim((start :: any).session_kind) ~= "" and trim((start :: any).session_kind) or "CHAT"
    local meta: Map = {}
    local provider = canonical_provider(session_provider)
    if provider ~= "" then meta.provider = provider end
    local result, ensure_err = session_service.ensure({
        session_id = session_id,
        user_id = user_id,
        kind = session_kind,
        -- ensure applies metadata only while creating a session. Existing rows
        -- retain their original source rather than being rewritten by a later
        -- turn or a provider configuration change.
        meta = meta,
        config = session_config(thread_id, start, active_traits, agent_options),
        primary_context_data = {},
    })
    if ensure_err then
        return nil, tostring(ensure_err)
    end
    if not result then
        return nil, "session service returned no result"
    end
    return result.created == true, nil
end

-- Spawn the session process under the bridge's own frame (the run-as identity the
-- hub spawned this bridge with). The session derives its identity from this frame
-- and runs the agent as that subject/installer.
local function spawn_session_process(actor: any, scope: any, session_id: string, thread_id: string, user_id: string, create_new: boolean): (any?, any?)
    local process_host, host_err = consts.process_host()
    if host_err or not process_host then
        return nil, "process_host: " .. tostring(host_err)
    end
    local builder, context_err = process.with_context({ session_id = session_id, user_id = user_id })
    if context_err or not builder then return nil, context_err or "session context is unavailable" end
    local bound, actor_err = builder:with_actor(actor)
    if actor_err or not bound then return nil, actor_err or "session actor is unavailable" end
    local scoped, scope_err = bound:with_scope(scope)
    if scope_err or not scoped then return nil, scope_err or "session scope is unavailable" end
    local pid, err = scoped:spawn_linked_monitored(session_consts.PROCESS.SESSION_ID :: string, process_host, {
        session_id = session_id, thread_id = thread_id, user_id = user_id,
        parent_pid = process.pid(), create = create_new,
    })
    if err then return nil, tostring(err) end
    return pid, nil
end

-- Forward a turn to the session. Provider attachments are retained for trace,
-- while materialized upload IDs are what the session stores and tools read.
local function send_session_message(session_pid: string, text: string, attachments: { any }?, file_uuids: { string }?, author: Map): (boolean, any?)
    local data: Map = { text = text }
    if type(attachments) == "table" and #(attachments :: { any }) > 0 then
        data.attachments = attachments
    end
    if type(file_uuids) == "table" and #(file_uuids :: { string }) > 0 then
        data.file_uuids = file_uuids
    end
    return process.send(session_pid, session_consts.TOPICS.MESSAGE :: string, { data = data, author = author })
end

local function copy_table(value: any): Map
    local out: Map = {}
    if type(value) ~= "table" then return out end
    for k, v in pairs(value :: Map) do out[k] = v end
    return out
end

local function ingest_attachments(inbound: any, actor_id: string, thread_id: string): ({ string }, { any })
    local file_uuids: { string } = {}
    local attachments: { any } = {}
    local raw_attachments = type((inbound :: any).attachments) == "table" and (inbound :: any).attachments or {}

    for _, raw in ipairs(raw_attachments :: { any }) do
        local attachment = copy_table(raw)
        attachment.actor_id = actor_id
        attachment.source = trim((inbound :: any).provider)
        attachment.component_id = trim((inbound :: any).reply_component_id)
        attachment.thread_id = thread_id
        attachment.external_message_id = trim((inbound :: any).external_message_id)

        local upload, upload_err = attachment_ingest.ingest(attachment)
        if upload and type(upload.uuid) == "string" and upload.uuid ~= "" then
            attachment.upload_id = upload.uuid
            file_uuids[#file_uuids + 1] = upload.uuid
        else
            attachment.ingest_error = tostring(upload_err or "unknown error")
            logger:warn("attachment ingest failed", {
                key = trim((inbound :: any).channel_id),
                filename = trim(attachment.filename),
                error = attachment.ingest_error,
            })
        end

        attachments[#attachments + 1] = attachment
    end

    return file_uuids, attachments
end

local function appended_event(result: any): any?
    if type(result) ~= "table" then return nil end
    if type((result :: Map).event) == "table" then return (result :: Map).event end
    if type((result :: Map).id) == "string" then return result end
    return nil
end

local function prepare_session_turn(params: any): any
    params = type(params) == "table" and params or {}
    local inbound = type((params :: Map).inbound) == "table" and (params :: Map).inbound or nil
    if type(inbound) ~= "table" then return nil end

    local user_id = trim((params :: Map).user_id)
    local thread_id = trim((params :: Map).thread_id)
    local key = trim((params :: Map).key)
    local thread_class = trim((params :: Map).thread_class) ~= "" and trim((params :: Map).thread_class) or consts.THREAD_CLASS
    local inbound_event = trim((params :: Map).inbound_event) ~= "" and trim((params :: Map).inbound_event) or consts.EVENT.INBOUND
    local file_uuids, attachments = ingest_attachments(inbound, user_id, thread_id)
    local thread_inbound = copy_table(inbound)
    thread_inbound.attachments = attachments
    if #file_uuids > 0 then thread_inbound.file_uuids = file_uuids end

    local writer = params.thread_bridge or thread_bridge
    local appended, append_err = writer.append_inbound(thread_id, thread_inbound, {
        event_type = inbound_event,
        external_source = thread_class .. "." .. trim((inbound :: any).provider),
        trace_context = (thread_inbound :: Map).trace_context,
    })
    if append_err then
        local err = "append inbound failed for " .. key .. ": " .. tostring(append_err)
        logger:error("append inbound failed", { key = key, error = tostring(append_err) })
        return nil, err
    end
    if type(appended) == "table" and (appended :: Map).duplicate == true then
        return nil, nil, "inbound_duplicate"
    end
    local source_event = appended_event(appended)
    local turn_trace = source_event and trace_context.common({ source_event }) or nil
    local text = type((inbound :: any).text) == "string" and (inbound :: any).text or ""
    local author = display_name(inbound)
    local body = author ~= "" and text ~= "" and (author .. ": " .. text) or text
    if body == "" and #attachments == 0 and #file_uuids == 0 then return nil, nil, "inbound_empty" end
    return {
        body = body,
        attachments = attachments,
        file_uuids = file_uuids,
        trace_context = turn_trace,
        id = source_event and (source_event :: Map).id or nil,
    }
end


return {
    trim = trim,
    runtime_idle_ms = runtime_idle_ms,
    actor_id = actor_id,
    resolve_active_traits = resolve_active_traits,
    canonical_provider = canonical_provider,
    ensure_session = ensure_session,
    spawn_session_process = spawn_session_process,
    send_session_message = send_session_message,
    prepare_session_turn = prepare_session_turn,
    SESSION_ACTIVATED = SESSION_ACTIVATED,
    SESSION_COMPLETED = SESSION_COMPLETED,
    LAZY_ASSESS_SYSTEM = LAZY_ASSESS_SYSTEM,
}
