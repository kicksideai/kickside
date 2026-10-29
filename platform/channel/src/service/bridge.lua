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
local thread_bridge_module = require("channel_thread_bridge")
local publication = require("channel_publication")
local attachment_ingest = require("attachment_ingest")
local trace_context = require("trace_context")
local responder_health = require("responder_health")
local hub_signal = require("hub_signal")
local proc_supervisor = require("proc_supervisor")

local support = require("bridge_support")
local function construct(dependencies: any): any
local process = dependencies.process or process
local channel = dependencies.channel or channel
local support = dependencies.support or support
local reply_sender = dependencies.reply_sender or reply_sender
local hub = dependencies.hub or hub_signal
local M = {}
type Map = { [string]: any }
type ReplyConfig = {
    component_id: string?,
    resource_id: string?,
    reply_proof: any?,
}
type StatusHandle = {
    component_id: string?,
    resource_id: string?,
    reply_proof: any?,
    message_ref: string?,
    sent: boolean?,
    editable: boolean?,
}

local trim = support.trim
local runtime_idle_ms = support.runtime_idle_ms
local actor_id = support.actor_id
local resolve_active_traits = support.resolve_active_traits
local canonical_provider = support.canonical_provider
local ensure_session = support.ensure_session
local spawn_session_process = support.spawn_session_process
local send_session_message = support.send_session_message
local prepare_session_turn = support.prepare_session_turn
local SESSION_ACTIVATED = support.SESSION_ACTIVATED
local SESSION_COMPLETED = support.SESSION_COMPLETED
local LAZY_ASSESS_SYSTEM = support.LAZY_ASSESS_SYSTEM

local function main(args: any)
    args = type(args) == "table" and args or {}
    local state = args.state
    local route: Map = (type(args.route) == "table" and args.route or {}) :: Map
    local publication_ref = state and state.publication_ref or route._turn_ref
    local thread_bridge = dependencies.thread_bridge or thread_bridge_module.with_publisher(function(method, body)
        return publication.request(route.key, publication_ref, method, body, route.bridge_token)
    end)
    local key = trim(route.key)
    if key == "" then error("route.key is required") end
    local session_id = trim(route.session_id)
    if session_id == "" then error("route.session_id is required") end

    local thread = type(route.thread) == "table" and route.thread or {}
    local start = type(route.start) == "table" and route.start or {}
    local reply = type(route.reply) == "table" and route.reply or {}
    local first_inbound = type(route.inbound) == "table" and route.inbound or {}
    local session_provider = canonical_provider(route.session_provider)

    local thread_class = trim((thread :: any).class) ~= "" and trim((thread :: any).class) or consts.THREAD_CLASS
    local inbound_event = trim((thread :: any).inbound_event) ~= "" and trim((thread :: any).inbound_event) or consts.EVENT.INBOUND
    local reply_sent_event = trim((reply :: any).sent_event) ~= "" and trim((reply :: any).sent_event) or consts.EVENT.REPLY_SENT
    local reply_failed_event = trim((reply :: any).failed_event) ~= "" and trim((reply :: any).failed_event) or consts.EVENT.REPLY_FAILED
    local responder_component_id = trim((start :: any).component_id)
    local function health(reason: string, message: any, state: string?)
        if responder_component_id == "" then return end
        local sent, send_err = hub.send({
            kind = "health", key = key, reason = reason, message = tostring(message or ""), state = state or "error",
            bridge_token = route.bridge_token,
        })
        if not sent then error("responder health notification failed: " .. tostring(send_err)) end
    end
    local reply_config: ReplyConfig = state and state.reply_config or {
        component_id = trim((reply :: any).component_id),
        resource_id = trim((reply :: any).resource_id),
        reply_proof = route.reply_proof,
    }
    local function new_status_handle(): StatusHandle
        return {
            component_id = reply_config.component_id,
            resource_id = reply_config.resource_id,
            reply_proof = reply_config.reply_proof,
        }
    end
    local tool_status_handle: StatusHandle = state and state.tool_status_handle or new_status_handle()
    local ttl_ms = runtime_idle_ms(start)

    local registry_name = consts.BRIDGE_REGISTRY_PREFIX .. key
    process.set_options({ trap_links = true, upgradable = true })
    local registered, _, register_err = proc_supervisor.claim_or_owner(registry_name, { process = process })

    -- The hub handed this bridge the first inbound turn and marked it seen (witnessed)
    -- on spawn. A startup abort leaves that turn unrecorded, so signal the hub to
    -- release its dedup entry for redelivery before exiting: an infrastructure
    -- failure during startup must surface as an error and stay retriable, never a
    -- silent return that drops the turn.
    local function release_first_turn()
        local _, release_err = hub.send({
            kind = "startup_failed",
            key = key,
            message_id = trim((first_inbound :: any).external_message_id),
            turn_ref = route._turn_ref,
            bridge_token = route.bridge_token,
        })
        if release_err then
            logger:error("bridge startup turn release undelivered", { key = key, error = release_err })
        end
        process.registry.unregister(registry_name, process.registry.CONSISTENT)
    end

    local function release_failed_turn(inbound: any, turn_ref: any?)
        local _, release_err = hub.send({
            kind = "append_failed",
            key = key,
            message_id = trim(type(inbound) == "table" and (inbound :: any).external_message_id or nil),
            turn_ref = turn_ref,
            bridge_token = route.bridge_token,
        })
        if release_err then
            logger:error("bridge failed turn release undelivered", { key = key, error = release_err })
        end
        process.registry.unregister(registry_name, process.registry.CONSISTENT)
    end

    if not registered then
        health("bridge_registration_failed", register_err)
        logger:error("bridge could not register its route name", { key = key, error = tostring(register_err) })
        if not state then release_first_turn() end
        error(register_err or errors.new({ kind = errors.CONFLICT, retryable = true,
            message = "bridge route belongs to another process", details = { code = "channel_bridge_route_owned" } }))
    end

    -- The bridge's own frame is the run-as identity the hub spawned it with. It
    -- backs the thread ops and the session spawn.
    local self_actor = security.actor()
    local self_scope = security.scope()
    if not self_actor or not self_scope then
        health("execution_identity_unavailable", "bridge has no run-as identity")
        logger:error("bridge has no run-as identity", { key = key })
        release_first_turn()
        error("bridge has no run-as identity for " .. key)
    end
    local user_id = actor_id(self_actor)
    if user_id == "" then
        health("execution_identity_invalid", "bridge identity has no actor")
        logger:error("bridge run-as identity has no actor", { key = key })
        release_first_turn()
        error("bridge run-as identity has no actor for " .. key)
    end
    local source_author: Map
    local thread_role = trim((thread :: any).role)
    if thread_role == "channel" then
        source_author = { kind = "system", id = user_id }
    elseif thread_role == "dm" then
        source_author = { kind = "user", id = user_id }
    else
        health("thread_role_invalid", "bridge thread role is invalid")
        logger:error("bridge thread role is invalid", { key = key, role = thread_role })
        release_first_turn()
        error("bridge thread role is invalid for " .. key)
    end

    -- Ensure the audit thread for this conversation (under the run-as frame).
    local thread_id = state and state.thread_id or nil
    local terr = nil
    if not state then
        local ensured_id, _, ensure_err = thread_bridge.ensure_thread(first_inbound, {
            impl_id = thread.impl_id,
            thread_class = thread_class,
            title_prefix = trim((thread :: any).title_prefix),
            managed_by = trim((thread :: any).managed_by),
            receive_target = trim((thread :: any).receive_target),
            role = trim((thread :: any).role),
            user_ids = type((thread :: any).user_ids) == "table" and (thread :: any).user_ids or {},
            owner_principal = (thread :: any).owner_principal,
            audience_principals = (thread :: any).audience_principals,
        })
        thread_id, terr = ensured_id, ensure_err
    end
    if terr or not thread_id then
        health("inbound_thread_failed", terr)
        logger:error("ensure thread failed", { key = key, error = tostring(terr) })
        release_first_turn()
        error("ensure thread failed for " .. key .. ": " .. tostring(terr))
    end

    local active_traits = state and state.active_traits or nil
    local agent_options = state and state.agent_options or nil
    local traits_err = nil
    if not state then active_traits, agent_options, traits_err = resolve_active_traits(start, self_actor, self_scope) end
    if traits_err then
        health("agent_traits_failed", traits_err)
        release_first_turn()
        error(tostring(traits_err))
    end
    local session_pid: string? = state and state.session_pid or nil
    local session_created: boolean? = state and state.session_created or nil
    local first_session_turn = state == nil or state.first_session_turn == true
    local session_lifecycle_active = state ~= nil and state.session_lifecycle_active == true
    logger:info("bridge started", { key = key, thread_id = thread_id, session_id = session_id, user_id = user_id })

    local response_buffer = state and state.response_buffer or ""
    local current_reply_trace = state and state.current_reply_trace or nil
    local function now_ms(): integer return time.now():unix_nano() // 1000000 end
    local function timer_at(due: number): any
        return time.after(tostring(math.max(0, due - now_ms())) .. "ms")
    end
    local idle_due = state and state.idle_due or (now_ms() + ttl_ms)
    local idle_timer = timer_at(idle_due)
    local turn_due = state and state.turn_due or nil
    local turn_timer = turn_due and timer_at(turn_due) or nil
    local function reset_idle(): ()
        idle_due = now_ms() + ttl_ms
        idle_timer = timer_at(idle_due)
    end
    local inbox = process.inbox()
    local events_ch = process.events()
    local lazy_mode = reply_policy.lazy_enabled(start)
    local wait_ms = reply_policy.lazy_wait_ms(start)

    local function now_rfc3339(): string
        return time.now():utc():format(time.RFC3339)
    end

    local function emit_session_event(etype: string, reason: string?): (boolean, string?)
        if responder_component_id == "" then return true, nil end
        local body: Map = {
            session_id = session_id,
            thread_id = thread_id,
            route_key = key,
            at = now_rfc3339(),
        }
        if reason ~= nil and reason ~= "" then body.reason = reason end
        local last_err: string? = nil
        for attempt = 1, 3 do
            local _, emit_err = thread_bridge.emit_responder_event(responder_component_id, etype, body)
            if not emit_err then return true, nil end
            last_err = tostring(emit_err)
            if attempt < 3 then time.sleep("100ms") end
        end
        logger:error("responder session event emit failed", {
            key = key,
            component_id = responder_component_id,
            event_type = etype,
            error = last_err,
        })
        return false, last_err or "responder session event emit failed"
    end

    local function mark_session_activated(): (boolean, string?)
        if session_lifecycle_active then return true, nil end
        local ok, err = emit_session_event(SESSION_ACTIVATED, nil)
        if not ok then return false, err end
        session_lifecycle_active = true
        return true, nil
    end

    local function mark_session_completed(reason: string): (boolean, string?)
        if not session_lifecycle_active then return true, nil end
        local ok, err = emit_session_event(SESSION_COMPLETED, reason)
        if not ok then return false, err end
        session_lifecycle_active = false
        return true, nil
    end

    local function complete_session(reason: string)
        local completed, complete_err = mark_session_completed(reason)
        if not completed then health("responder_event_failed", complete_err) end
    end

    local function assess_lazy_turn(body: string): boolean
        if not reply_policy.should_assess(start, session_pid ~= nil) then return true end
        local p = prompt.new()
        p:add_system(LAZY_ASSESS_SYSTEM)
        p:add_user("Responder policy:\n" .. (reply_policy.config(start).prompt or "") .. "\n\nMessages:\n" .. body)
        local resp, err = llm.generate(p, reply_policy.assessor_options(start))
        if err or type(resp) ~= "table" then
            health("response_assessment_failed", err or "assessor returns no result", "warning")
            return true
        end
        local verdict = trim((resp :: Map).result):upper()
        local respond = verdict:find("RESPOND", 1, true) ~= nil
        if not respond then health("response_policy_skip", "Response policy declines this message", "idle") end
        return respond
    end

    local agent_failed = state ~= nil and state.agent_failed == true
    local function append_reply(event_type: string, body: any, trace: any)
        local _, append_err = thread_bridge.append_reply_event(thread_id, event_type, body, trace)
        if append_err then health("reply_audit_failed", append_err) end
    end
    local function flush_response()
        local reply_trace = current_reply_trace
        current_reply_trace = nil
        if response_buffer == "" then return end
        local content = response_buffer
        response_buffer = ""
        if not reply_policy.should_send_reply(start, content) then
            health("agent_empty_reply", "Agent completes without reply content", "idle")
            return
        end
        local result = nil
        local err = nil
        local updated = false
        if tool_status_handle.sent == true then
            result, err, updated = reply_sender.finish_status(tool_status_handle, content)
            tool_status_handle = new_status_handle()
        else
            result, err = reply_sender.send_reply(reply_config, content)
        end
        if err then
            health(responder_health.reason(err, "reply_send_failed"), err)
            logger:error("reply failed", { key = key, error = err })
            append_reply(reply_failed_event, {
                text = content,
                status = "send_failed",
                error = tostring(err),
                component_id = reply_config.component_id,
                resource_id = reply_config.resource_id,
            }, reply_trace)
            return
        end
        health("reply_sent", "Reply reaches the channel", "ready")
        append_reply(reply_sent_event, {
            text = content,
            status = updated and "updated_status" or "sent",
            message_ref = type(result) == "table" and (result :: Map).message_ref or nil,
            component_id = reply_config.component_id,
            resource_id = reply_config.resource_id,
        }, reply_trace)
    end

    local function send_tool_status(payload: any)
        if reply_config.reply_proof ~= nil then return end
        local t = type(payload) == "table" and trim((payload :: Map).type) or ""
        local text = reply_policy.tool_status_text(t, type(payload) == "table" and (payload :: Map).function_name or nil)
        if text == nil or text == "" then return end
        local reply_trace = current_reply_trace
        local handle, err, changed = reply_sender.update_status(tool_status_handle, text)
        tool_status_handle = handle
        if changed ~= true and not err then return end
        if err then
            health(responder_health.reason(err, "reply_status_failed"), err)
            logger:error("tool status reply failed", { key = key, error = err })
            append_reply(reply_failed_event, {
                text = text,
                status = "tool_status_send_failed",
                error = tostring(err),
                component_id = reply_config.component_id,
                resource_id = reply_config.resource_id,
            }, reply_trace)
            return
        end
        health("reply_sent", "Reply reaches the channel", "ready")
        append_reply(reply_sent_event, {
            text = text,
            status = "tool_status",
            message_ref = tool_status_handle.message_ref,
            component_id = reply_config.component_id,
            resource_id = reply_config.resource_id,
        }, reply_trace)
    end

    -- Turn batching. The session runs one agent step per USER message it receives,
    -- so a fast typer's burst would be one query + one reply each. Immediate mode
    -- keeps the existing behavior: first message goes through now, messages that
    -- arrive while the agent is running release as one follow-up. Lazy mode waits
    -- for a quiet window before each agent turn, so multiple channel messages become
    -- one session message before the agent decides whether to answer.
    local session_busy = state ~= nil and state.session_busy == true
    local pending: { any } = state and state.pending or {}

    local function schedule_lazy_flush()
        turn_due = now_ms() + wait_ms
        turn_timer = timer_at(turn_due)
    end

    -- prepare_turn: materialize provider attachment refs into upload IDs and append
    -- the audited inbound (every message is logged), returning the session-ready
    -- parts -- or nil for an empty turn.
    local function prepare_turn(inbound: any): any
        return prepare_session_turn({
            thread_bridge = thread_bridge,
            inbound = inbound,
            user_id = user_id,
            thread_id = thread_id,
            thread_class = thread_class,
            inbound_event = inbound_event,
            key = key,
        })
    end

    local system_prompt = type((start :: any).system_prompt) == "string" and (start :: any).system_prompt or ""
    local start_context = trim((start :: any).context)
    if start_context ~= "" then
        system_prompt = system_prompt ~= "" and (system_prompt .. "\n\nContext:\n" .. start_context) or ("Context:\n" .. start_context)
    end

    local function ensure_session_runtime(): (string?, string?)
        if session_pid ~= nil then return session_pid, nil end
        local created, create_err = ensure_session(session_id, thread_id, start, user_id, session_provider, active_traits, agent_options)
        if created == nil then return nil, "ensure session: " .. tostring(create_err) end
        local session_pid_raw, spawn_err = spawn_session_process(self_actor, self_scope, session_id, thread_id, user_id, created == true)
        if spawn_err or not session_pid_raw then return nil, "spawn session: " .. tostring(spawn_err) end
        session_created = created == true
        session_pid = session_pid_raw :: string
        logger:info("session attached", { key = key, thread_id = thread_id, session_id = session_id, created = session_created == true })
        local active_ok, active_err = mark_session_activated()
        if not active_ok then
            process.cancel(session_pid_raw :: string, "5s")
            session_pid = nil
            return nil, "mark session active: " .. tostring(active_err)
        end
        return session_pid, nil
    end

    local function send_turn(body: string, attachments: { any }, file_uuids: { string }, turn_trace: any?, reply_proof: any?)
        local pid, session_err = ensure_session_runtime()
        if not pid then
            health("agent_start_failed", session_err)
            logger:error("session attach failed", { key = key, error = session_err })
            process.registry.unregister(registry_name, process.registry.CONSISTENT)
            return
        end
        if first_session_turn then
            first_session_turn = false
            if session_created == true and system_prompt ~= "" then
                body = "Channel responder instructions:\n" .. system_prompt .. "\n\nIncoming channel message:\n" .. body
            end
        end
        session_busy = true
        agent_failed = false
        current_reply_trace = turn_trace
        reply_config.reply_proof = reply_proof
        local sent, send_err = send_session_message(pid, body, attachments, file_uuids, source_author)
        if not sent then
            health("agent_dispatch_failed", send_err)
            error(tostring(send_err))
        end
    end

    -- Release everything that piled up during the agent's run as a single turn.
    local function flush_pending()
        if #pending == 0 then session_busy = false; return end
        local batch = pending
        pending = {}
        local bodies: { string } = {}
        local atts: { any } = {}
        local uuids: { string } = {}
        for _, p in ipairs(batch) do
            if p.body ~= "" then bodies[#bodies + 1] = p.body end
            for _, a in ipairs(p.attachments :: { any }) do atts[#atts + 1] = a end
            for _, u in ipairs(p.file_uuids :: { string }) do uuids[#uuids + 1] = u end
        end
        local body = table.concat(bodies, "\n")
        local assess_now = reply_policy.should_assess(start, session_pid ~= nil)
        if assess_now and not assess_lazy_turn(body) then
            session_busy = false
            return
        end
        send_turn(body, atts, uuids, trace_context.common(batch), (batch[#batch] :: any).reply_proof)
    end

    local function handle_turn(inbound: any, turn_ref: any?, reply_proof: any?)
        publication_ref = turn_ref
        local p, prep_err, decline_reason = prepare_turn(inbound)
        if prep_err then
            health("inbound_append_failed", prep_err)
            release_failed_turn(inbound, turn_ref)
            error(tostring(prep_err))
        end
        if type(turn_ref) == "table" and turn_ref.owner_id == "channel.turn" then
            local _, appended_err = hub.send({
                kind = "appended",
                turn_ref = turn_ref,
                key = key,
                message_id = trim(type(inbound) == "table" and inbound.external_message_id or nil),
                bridge_token = route.bridge_token,
            })
            if appended_err then
                logger:error("appended turn acknowledgement undelivered; the hub retries the turn", { key = key, error = appended_err })
            end
        end
        if not p then
            health(decline_reason or "inbound_empty", "Inbound turn requires no agent run", "idle")
            return
        end
        p.reply_proof = reply_proof
        if reply_policy.should_assess(start, session_pid ~= nil) then
            pending[#pending + 1] = p
            if not session_busy then schedule_lazy_flush() end
        elseif session_busy then
            pending[#pending + 1] = p
        else
            send_turn(p.body :: string, p.attachments :: { any }, p.file_uuids :: { string }, p.trace_context, p.reply_proof)
        end
    end

    if not state then handle_turn(first_inbound, route._turn_ref, route.reply_proof) end

    while true do
        local cases = {
            inbox:case_receive(),
            events_ch:case_receive(),
            idle_timer:case_receive(),
        }
        if turn_timer ~= nil then cases[#cases + 1] = (turn_timer :: any):case_receive() end
        local result = channel.select(cases)

        if result.channel == idle_timer then
            logger:info("session idle timeout", { key = key, session_id = session_id })
            flush_response()
            complete_session("idle_timeout")
            if session_pid ~= nil then process.cancel(session_pid :: string, "5s") end
            break
        elseif turn_timer ~= nil and result.channel == turn_timer then
            turn_timer = nil
            turn_due = nil
            if not session_busy then flush_pending() end
        elseif result.channel == events_ch then
            local event = result.value
            if event.kind == process.event.OUTDATED then
                return process.upgrade(nil, { route = route, state = {
                    publication_ref = publication_ref, thread_id = thread_id,
                    active_traits = active_traits, agent_options = agent_options,
                    session_pid = session_pid, session_created = session_created,
                    first_session_turn = first_session_turn, session_lifecycle_active = session_lifecycle_active,
                    response_buffer = response_buffer, current_reply_trace = current_reply_trace,
                    reply_config = reply_config, tool_status_handle = tool_status_handle,
                    agent_failed = agent_failed, session_busy = session_busy, pending = pending,
                    idle_due = idle_due, turn_due = turn_due,
                } })
            end
            if event.kind == process.event.CANCEL then
                flush_response()
                complete_session("cancelled")
                if session_pid ~= nil then process.cancel(session_pid :: string, "5s") end
                break
            end
            if (event.kind == process.event.EXIT or event.kind == process.event.LINK_DOWN) and event.from == session_pid then
                if session_busy then health("agent_process_exited", "Agent process exits before completing its turn") end
                logger:warn("session process exited", { key = key, kind = event.kind })
                flush_response()
                complete_session("session_exit")
                break
            end
        elseif result.channel == inbox then
            local msg = result.value
            local topic = msg:topic()
            local payload = msg:payload():data()

            if topic == "messages" then
                reset_idle()
                handle_turn(type(payload.inbound) == "table" and payload.inbound or nil,
                    payload.turn_ref, payload.reply_proof)
            else
                local prefix = session_consts.TOPIC_PREFIXES.SESSION .. session_id
                if string.sub(topic, 1, #prefix) == prefix then
                    local t = payload.type
                    if t == session_consts.UPSTREAM_TYPES.CONTENT then
                        local content = type(payload.content) == "string" and payload.content or ""
                        if content ~= "" then response_buffer = response_buffer .. content end
                    elseif t == session_consts.UPSTREAM_TYPES.UPDATE then
                        -- IDLE = the agent's turn (its whole op queue) drained: send
                        -- the reply, then release anything that arrived mid-run as one
                        -- combined follow-up turn.
                        if payload.status == session_consts.STATUS.IDLE then
                            if response_buffer == "" and not agent_failed then
                                health("agent_empty_reply", "Agent completes without reply content", "idle")
                            end
                            flush_response()
                            reset_idle()
                            if reply_policy.should_assess(start, session_pid ~= nil) then
                                session_busy = false
                                if #pending > 0 then schedule_lazy_flush() end
                            else
                                flush_pending()
                            end
                        end
                    elseif t == session_consts.UPSTREAM_TYPES.ERROR then
                        agent_failed = true
                        response_buffer = ""
                        health("agent_run_failed", tostring(payload.code or "agent_error") .. ": " .. tostring(payload.message or "agent run fails"))
                        logger:error("session error", { key = key, code = payload.code, message = payload.message })
                    elseif t == session_consts.UPSTREAM_TYPES.FUNCTION_CALL
                        or t == session_consts.UPSTREAM_TYPES.FUNCTION_ERROR then
                        send_tool_status(payload)
                    end
                end
            end
        end
    end

    complete_session("bridge_stopped")
    process.registry.unregister(registry_name, process.registry.CONSISTENT)
    logger:info("bridge stopped", { key = key, session_id = session_id })
end

M.main = main
M.new = construct
return M
end
return construct({})
