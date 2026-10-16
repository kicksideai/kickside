local proc_supervisor = require("proc_supervisor")
local logger = require("logger"):named("kickside.channel.hub")
local channel = require("channel")
local consts = require("channel_consts")
local dedup = require("channel_dedup")
local execution_ref = require("execution_ref")
local policy = require("channel_hub_policy")
local json = require("json")
local uuid = require("uuid")
local persist = require("channel_persist")
local turn_supervisor_module = require("channel_turn_supervisor")
local publication = require("channel_publication")

local responder_health = require("responder_health")

local function construct(dependencies: any): any
    local process = dependencies.process or process
    local channel = dependencies.channel or channel
    local execution_ref = dependencies.execution_ref or execution_ref
    local consts = dependencies.consts or consts
    local responder_health = dependencies.responder_health or responder_health
    local turn_supervisor_module = dependencies.turn_supervisor or turn_supervisor_module
    -- The cluster-wide session hub: one process maintains WHERE each conversation's
    -- session lives -- a bridge process per route.key -- and routes inbound turns to
    -- it. A surface (DM or channel) forwards a Route here; the hub resolves the
    -- Route's protected execution reference and spawns the bridge UNDER it, so the bridge owns the
    -- session and runs it as that identity. The bridge keeps the session alive between
    -- turns; a "clear" cancels it so the next turn starts fresh. The hub is policy- and
    -- provider-agnostic: it reads only route.key, route.session_id, route.start.agent_id,
    -- and route.execution_ref; everything else it hands to the bridge untouched.
    local M = {}

    local BRIDGE_PROC = "kickside.channel.service:bridge"

    type Map = { [string]: any }

    local function trim(value: any): string
        if type(value) ~= "string" then return "" end
        return (value:gsub("^%s*(.-)%s*$", "%1"))
    end

    -- Spawn the bridge under the Route's live resolved identity. The bridge's ambient frame
    -- becomes that identity: it ensures the thread, appends the inbound, runs the
    -- session, and pulls attachments as that user. Fail-closed: a failed resolve never
    -- spawns a system-framed bridge.
    local function frame_fingerprint(route: any, resolved: any): (string?, string?)
        local ref = route.execution_ref
        local encoded, encode_err = json.encode({ owner_id = ref.owner_id,
            record_id = ref.record_id, generation = ref.generation,
            principal = resolved.principal, scope_name = resolved.scope_name,
            meta = resolved.meta })
        if encode_err or not encoded then return nil, "could not fingerprint execution frame" end
        return encoded, nil
    end

    local function spawn_bridge(route: any): (any?, string?, string?, string?)
        local role = type((route :: any).thread) == "table" and (route :: any).thread.role or ""
        local resolved, rerr = execution_ref.resolve((route :: any).execution_ref, role, route)
        if rerr or not resolved then
            return nil, "execution_ref: " .. tostring(rerr)
        end
        local actor, scope = resolved.actor, resolved.scope
        local fingerprint, fingerprint_err = frame_fingerprint(route, resolved)
        if fingerprint_err or not fingerprint then return nil, fingerprint_err end
        local process_host, host_err = consts.process_host()
        if host_err or not process_host then
            return nil, "process_host: " .. tostring(host_err)
        end
        local builder, context_err = process.with_context({ session_id = (route :: any).session_id })
        if context_err or not builder then return nil, "process context unavailable: " .. tostring(context_err) end
        local actor_bound, actor_err = builder:with_actor(actor)
        if actor_err or not actor_bound then return nil, "process actor binding denied: " .. tostring(actor_err) end
        local scope_bound, scope_err = actor_bound:with_scope(scope)
        if scope_err or not scope_bound then return nil, "process scope binding denied: " .. tostring(scope_err) end
        -- The bridge authenticates its hub messages with a token only the hub and
        -- that bridge hold; the route record itself stays unchanged.
        local token = uuid.v4()
        local bridge_route: Map = {}
        for field, value in pairs(route :: Map) do bridge_route[field] = value end
        bridge_route.bridge_token = token
        local pid, err = scope_bound:spawn_linked_monitored(BRIDGE_PROC, process_host, { route = bridge_route })
        if err then return nil, tostring(err) end
        return pid, nil, fingerprint, token
    end

    local function report_route(route: any, reason: string, message: any): (boolean, any?)
        local start = type(route) == "table" and type(route.start) == "table" and route.start or {}
        local id = trim(start.component_id)
        if id == "" then return true, nil end
        return responder_health.report(id, reason, message, "error")
    end

    local function main(_args: any)
        _args = type(_args) == "table" and _args or {}
        logger:info("conversation session hub starting")
        process.set_options({ trap_links = true, upgradable = true })
        local events_ch = process.events()
        local registered, cancelled, register_err, stop_kind = proc_supervisor.claim_singleton(consts.HUB_NAME, events_ch, { process = process, channel = channel })
        if cancelled or register_err or not registered then
            if stop_kind and stop_kind == process.event.OUTDATED then return process.upgrade(nil, _args) end
            if cancelled then return nil, nil end
            logger:error("conversation session hub registry registration failed", { error = register_err })
            return nil, register_err or errors.new({ kind = errors.UNAVAILABLE, message = "channel hub name registration failed" })
        end

        local bridges: { [string]: Map } = _args.bridges or {}
        local seen = dedup.new(1000, _args.seen)
        local msg_ch = process.inbox()
        local handle_data: (any, any?) -> ()
        local turn_supervisor = turn_supervisor_module.new(
            function(ref: any): () handle_data({ kind = "turn", turn_ref = ref }) end,
            function(key: string, message_id: string): () seen.forget(key .. ":" .. message_id) end, _args.supervisor)


        local function track_turn(bridge: any, ref: any): ()
            local id = turn_supervisor.track(ref)
            if not id then return end
            bridge.outstanding_turns = bridge.outstanding_turns or {}
            bridge.outstanding_turns[id] = ref
        end

        -- spawn_for starts a bridge for a route and records it under its key. Shared by the
        -- first turn and the post-drain handoff.
        local function spawn_for(key: string, route: any): boolean
            local pid, spawn_err, fingerprint, token = spawn_bridge(route)
            if spawn_err or not pid then
                local _, health_err = report_route(route, "bridge_start_failed", spawn_err)
                logger:error("bridge spawn failed", { key = key, error = spawn_err, health_error = health_err })
                turn_supervisor.schedule_retry(route._turn_ref)
                return false
            end
            local start = type((route :: any).start) == "table" and (route :: any).start or {}
            bridges[key] = {
                pid = pid,
                component_id = trim(start.component_id),
                session_id = trim((route :: any).session_id),
                agent_id = trim((start :: any).agent_id),
                fingerprint = fingerprint,
                token = token,
                outstanding_turns = {},
            }
            track_turn(bridges[key], route._turn_ref)
            return true
        end

        local function drop_by_pid(pid: any)
            for key, b in pairs(bridges) do
                if b.pid == pid then
                    local pending = b.pending
                    local pending_more = b.pending_more or {}
                    for _, ref in pairs(b.outstanding_turns or {}) do
                        turn_supervisor.schedule_retry(ref)
                    end
                    if type(pending) == "table" then turn_supervisor.schedule_retry(pending._turn_ref) end
                    for _, queued in ipairs(pending_more) do turn_supervisor.schedule_retry(queued._turn_ref) end
                    local action = policy.decide_exit(b)
                    bridges[key] = nil
                    logger:info("bridge ended", { key = key })
                    -- A turn arrived while this bridge was draining: now that its EXIT
                    -- confirms it is fully gone (reply flushed + persisted), start the
                    -- replacement for that turn. One bridge per conversation across the
                    -- handoff -- never two sessions deriving a reply at once.
                    if action == "respawn" then
                        if spawn_for(key, pending) then
                            logger:info("bridge restarted after clean stop", { key = key })
                            for _, queued in ipairs(pending_more) do
                                local inbound = type(queued.inbound) == "table" and queued.inbound or {}
                                local message_id = trim(inbound.external_message_id)
                                if message_id ~= "" then seen.forget(key .. ":" .. message_id) end
                                handle_data({ kind = "turn", turn_ref = queued._turn_ref })
                            end
                        else
                            for _, queued in ipairs(pending_more) do turn_supervisor.schedule_retry(queued._turn_ref) end
                        end
                    end
                    return
                end
            end
        end

        -- A bridge message is admitted from the recorded bridge process carrying
        -- the token the hub issued it at spawn.
        local function admitted_bridge(bridge: any, data: any, sender: any?): boolean
            return bridge ~= nil and sender ~= nil and bridge.pid == sender
                and type(bridge.token) == "string" and bridge.token == data.bridge_token
        end

        handle_data = function(data: any, sender: any?)
            if type(data) ~= "table" then
                logger:warn("drop malformed conversation hub message")
                return
            end

            if data.kind == "health" then
                local bridge = bridges[tostring(data.key or "")]
                if not admitted_bridge(bridge, data, sender) then
                    logger:warn("reject health notification outside its admitted bridge")
                    return
                end
                local ok, health_err = responder_health.report_bridge(bridge, data, sender)
                if not ok then
                    local stopped, stop_err = process.cancel(bridge.pid :: string)
                    if stopped then bridge.draining = true end
                    for _, ref in pairs(bridge.outstanding_turns or {}) do turn_supervisor.schedule_retry(ref) end
                    logger:error("bridge health failed; route enters recovery", { key = data.key,
                        error = health_err, cancel_error = stop_err })
                end
                return
            end

            if data.kind == "publish" then
                local bridge = bridges[tostring(data.key or "")]
                local result, publish_err = publication.publish(bridge, data, sender)
                if sender ~= nil and type(data.reply_topic) == "string" then
                    local _, reply_err = process.send(sender, data.reply_topic,
                        publication.response(result, publish_err))
                    if reply_err then error("publication acknowledgement failed: " .. tostring(reply_err)) end
                end
                return
            end

            if data.kind == "startup_failed" or data.kind == "append_failed" then
                -- A bridge was handed a turn that could not be durably recorded. That
                -- turn may already be marked seen in the hub, so release the dedup entry:
                -- the provider's redelivery must be retriable, not suppressed as a
                -- duplicate of a turn that never landed. The bridge's monitored EXIT
                -- removes its record separately.
                local key = tostring(data.key or "")
                local bridge = bridges[key]
                if not admitted_bridge(bridge, data, sender) then
                    logger:warn("ignore turn failure outside its bridge", { key = key })
                    return
                end
                local message_id = trim(data.message_id)
                if key ~= "" and message_id ~= "" then
                    seen.forget(key .. ":" .. message_id)
                end
                logger:error("bridge failed before durable append; released turn for redelivery", {
                    key = key,
                    kind = tostring(data.kind),
                })
                turn_supervisor.schedule_retry(data.turn_ref)
                return
            end

            if data.kind == "appended" then
                local ref = data.turn_ref
                local id = turn_supervisor.turn_id(ref)
                if not id then return end
                local bridge = bridges[tostring(data.key or "")]
                if not admitted_bridge(bridge, data, sender) then
                    logger:warn("ignore append acknowledgement outside its bridge")
                    return
                end
                local db_id, db_err = consts.db_id()
                if db_err or not db_id then
                    logger:error("could not mark appended turn", { error = tostring(db_err) })
                    return
                end
                local stored, read_err = persist.get_accepted(db_id, id)
                if read_err or not stored then
                    logger:error("could not read appended turn", { error = tostring(read_err) })
                    return
                end
                local inbound = type(stored.inbound) == "table" and stored.inbound or {}
                if stored.key ~= data.key or trim(inbound.external_message_id) ~= trim(data.message_id) then
                    logger:warn("ignore mismatched append acknowledgement")
                    return
                end
                local marked, mark_err = turn_supervisor.mark_appended(db_id, id)
                if not marked then
                    logger:error("could not mark appended turn", { error = tostring(mark_err) })
                else
                    bridge.outstanding_turns[id] = nil
                end
                return
            end

            if data.kind == "clear" then
                local key = tostring(data.key or "")
                local b = key ~= "" and bridges[key] or nil
                if b and b.pid and not b.draining then
                    -- Stop the bridge and let its monitored EXIT remove it (drop_by_pid).
                    -- No grace window: a turn arriving before EXIT is held and replayed on a
                    -- fresh bridge, so a cleared session never overlaps its successor.
                    process.cancel(b.pid :: string)
                    b.draining = true
                    b.pending = nil
                    logger:info("cleared session", { key = key })
                end
                return
            end

            if data.kind ~= "turn" then
                logger:warn("drop unsupported conversation hub message")
                return
            end
            local route, load_err = execution_ref.load_turn(data.turn_ref)
            if load_err or not route then
                local db_id, db_err = consts.db_id()
                if db_err or not db_id then error(tostring(db_err or "channel database unavailable")) end
                local durable, read_err = persist.get_accepted(db_id, data.turn_ref.record_id)
                if read_err then error(tostring(read_err)) end
                local _, health_err = report_route(durable, "execution_admission_failed", load_err)
                logger:error("drop turn without protected admission", { error = tostring(load_err), health_error = health_err })
                if load_err then turn_supervisor.schedule_retry(data.turn_ref) end
                return
            end
            if route.delivery == "witness" then
                local recorded, record_err = publication.witness(data.turn_ref)
                if not recorded then
                    local _, health_err = report_route(route, "inbound_witness_failed", record_err)
                    logger:error("witness publication fails", { error = record_err, health_error = health_err })
                    turn_supervisor.schedule_retry(data.turn_ref)
                    return
                end
                local db_id, db_err = consts.db_id()
                if db_err or not db_id then error(tostring(db_err or "witness database unavailable")) end
                local marked, mark_err = turn_supervisor.mark_appended(db_id, data.turn_ref.record_id)
                if not marked then
                    local _, health_err = report_route(route, "inbound_witness_failed", mark_err)
                    logger:error("witness settlement fails", { error = mark_err, health_error = health_err })
                    turn_supervisor.schedule_retry(data.turn_ref)
                end
                return
            end
            route._turn_ref = data.turn_ref
            local key = tostring(route.key or "")
            if key == "" then
                turn_supervisor.schedule_retry(data.turn_ref)
                return
            end
            local session_id = trim(route.session_id)
            if session_id == "" then
                logger:error("drop turn without session_id", { key = key })
                turn_supervisor.schedule_retry(data.turn_ref)
                return
            end
            local start = type(route.start) == "table" and route.start or {}
            local agent_id = trim((start :: any).agent_id)
            local inbound = type(route.inbound) == "table" and route.inbound or {}
            local message_id = trim((inbound :: any).external_message_id)
            local dedup_key = message_id ~= "" and (key .. ":" .. message_id) or ""
            if dedup_key ~= "" and seen.contains(dedup_key) then
                return
            end

            local b = bridges[key]
            local action = policy.decide_route(b, session_id, agent_id)
            if b then
                local role = type(route.thread) == "table" and route.thread.role or ""
                local resolved, resolve_err = execution_ref.resolve(route.execution_ref, role, route)
                if resolve_err or not resolved then
                    if dedup_key ~= "" then seen.forget(dedup_key) end
                    logger:error("turn identity unavailable", { key = key, error = tostring(resolve_err) })
                    turn_supervisor.schedule_retry(data.turn_ref)
                    return
                end
                local fingerprint, fingerprint_err = frame_fingerprint(route, resolved)
                if fingerprint_err or not fingerprint then
                    if dedup_key ~= "" then seen.forget(dedup_key) end
                    logger:error("turn identity fingerprint unavailable", { key = key, error = fingerprint_err })
                    turn_supervisor.schedule_retry(data.turn_ref)
                    return
                end
                if b.fingerprint ~= fingerprint and not b.draining then action = "supersede" end
            end

            -- Supersede: a different session/agent. Stop the running bridge (non-graceful)
            -- and hold this turn for its successor -- started only once the old bridge's
            -- monitored EXIT lands, so it flushes and persists its reply first and the
            -- successor loads a history where the prior turn is already answered.
            if action == "supersede" then
                local bridge = b :: any
                process.cancel(bridge.pid :: string)
                bridge.draining = true
                bridge.pending = route
                bridge.pending_more = {}
                if dedup_key ~= "" then seen.mark(dedup_key) end
                logger:info("bridge superseded; draining for clean restart", { key = key })
                return
            end

            -- Hold: a stop is already in flight. Queue the latest turn; drop_by_pid replays
            -- it on EXIT. Marked seen so a redelivery during the wait is dropped.
            if action == "hold" then
                local bridge = b :: any
                if bridge.pending then
                    bridge.pending_more = bridge.pending_more or {}
                    bridge.pending_more[#bridge.pending_more + 1] = route
                else
                    bridge.pending = route
                end
                if dedup_key ~= "" then seen.mark(dedup_key) end
                return
            end

            -- Route: same session+agent, live bridge.
            if action == "route" then
                local bridge = b :: any
                local ok, send_err = process.send(bridge.pid :: string, "messages",
                    { inbound = inbound, turn_ref = data.turn_ref, reply_proof = route.reply_proof })
                if not ok then
                    local _, health_err = report_route(route, "bridge_dispatch_failed", send_err)
                    logger:error("bridge route failed", { key = key, error = send_err, health_error = health_err })
                    turn_supervisor.schedule_retry(data.turn_ref)
                    return
                end
                track_turn(bridge, data.turn_ref)
                if dedup_key ~= "" then seen.mark(dedup_key) end
                return
            end

            -- Spawn: no bridge for this conversation.
            if not spawn_for(key, route) then
                return
            end
            if dedup_key ~= "" then seen.mark(dedup_key) end
            logger:info("bridge spawned", { key = key, agent_id = agent_id })
        end

        if not _args.supervisor then
            local recovered, recovery_err = turn_supervisor.recover()
            if not recovered then
                error("conversation hub boot recovery failed: " .. tostring(recovery_err))
            end
        end

        while true do
            local active_retry_timer = turn_supervisor.timer()
            local cases = { msg_ch:case_receive(), events_ch:case_receive() }
            if active_retry_timer then cases[#cases + 1] = active_retry_timer:case_receive() end
            local result = channel.select(cases)

            if active_retry_timer and result.channel == active_retry_timer then
                turn_supervisor.timer_fired(active_retry_timer)
            elseif result.channel == events_ch then
                local event = result.value
                if event.kind == process.event.OUTDATED then
                    return process.upgrade(nil, { bridges = bridges, seen = seen.snapshot(),
                        supervisor = turn_supervisor.snapshot() })
                end
                if event.kind == process.event.CANCEL then
                    for _, b in pairs(bridges) do
                        if b.pid then process.cancel(b.pid :: string) end
                    end
                    logger:info("conversation session hub stopped")
                    return
                end
                if event.kind == process.event.EXIT or event.kind == process.event.LINK_DOWN then
                    if type(event.result) == "table" and event.result.error then
                        for key, bridge in pairs(bridges) do
                            if bridge.pid == event.from then
                                local ok, health_err = responder_health.report_bridge(bridge, {
                                    reason = "bridge_process_failed", message = tostring(event.result.error), state = "error",
                                }, event.from)
                                if not ok then
                                    logger:error("ended bridge health failed; route enters recovery", { key = key, error = health_err })
                                end
                            end
                        end
                    end
                    drop_by_pid(event.from)
                end
            elseif result.channel == msg_ch then
                -- An inbox message is a userdata with :topic()/:payload() methods, not
                -- a plain table; accept both shapes.
                local msg = result.value
                if type(msg) ~= "table" and type(msg) ~= "userdata" then goto continue end
                if (msg :: any):topic() ~= consts.HUB_TOPIC then goto continue end
                local payload = (msg :: any):payload()
                local env: any = payload and payload:data() or nil
                -- Hub messages arrive through the channel hub signal, which stamps
                -- the calling process as their origin.
                handle_data(env, type(env) == "table" and env.origin or nil)
                ::continue::
            end
        end
    end

    M.main = main
    return M
end

local M = construct({})
M.new = construct
return M
