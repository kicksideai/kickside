local contract = require("contract")
local component = require("component")
local uuid = require("uuid")
local persist = require("channel_persist")
local consts = require("channel_consts")
local types = require("channel_types")
local trace_context = require("trace_context")
local security = require("security")
local execution_identity = require("execution_identity")
local agent_ref = require("agent_ref")
local logger = require("logger"):named("kickside.channel.receive")
local receive_witness = require("channel_receive_witness")
local publication = require("channel_publication")
local turn_recovery = require("channel_turn_recovery")
local channel_refusal = require("channel_refusal")
local responder_health = require("responder_health")
local responder = require("channel_responder")
local hub_signal = require("hub_signal")

-- kickside.channel:receive -- the provider-neutral inbound seam for shared
-- channels, and the shared inbound-routing surface every conversation surface runs
-- on. A connection provider normalizes a channel message and delivers it here.
-- This module owns channel policy: it resolves WHICH installed responder
-- automation covers the channel (an indexed component-meta lookup keyed by
-- connection + channel), picks the agent and responder execution reference,
-- and hands the turn to route_turn. Unrouted channels (no bot attached) are ignored,
-- not errors. No link/clear: a channel runs under the installer, not a linked
-- external user.
--
-- route_turn (plus normalize / trace_for_turn / send_hub / trim) is the single
-- inbound-routing implementation; kickside.dm imports it and drives it with a
-- subject-identity spec, so the session + trace + Route + hub-send orchestration
-- lives here once. Callers differ only in the spec they build and the extra result
-- fields they stamp (dm adds user_id).
local function construct(dependencies: any): any
local selected_hub = dependencies.hub or hub_signal
local selected_publish = dependencies.publish or publication.write
local trusted_ingress = dependencies.trusted_ingress or function(resource: string): boolean
    local actor = security.actor()
    if actor and execution_identity.is_maintenance_key(actor:id()) then return true end
    return security.can("channel.receive.inject", resource) == true
end
local M = {}
local RUNTIME_READER = "kickside.contract:runtime_reader"
-- The automation binding installed responders register under; the routing lookup
-- scopes to it so it never scans other automation types.
local RESPONDER_IMPL = "kickside.channel.responder:channel_responder"
function M.trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- normalize copies the transport fields off a raw inbound and validates them.
-- opts.require_external_user additionally requires a non-empty external_user_id
-- (the DM surface routes by external identity; a shared channel does not).
function M.normalize(args: any, opts: any?): (any?, string?)
    opts = type(opts) == "table" and opts or {}
    args = type(args) == "table" and args or {}
    local inbound: { [string]: any } = {}
    inbound.provider = M.trim(args.provider)
    inbound.reply_component_id = M.trim(args.reply_component_id)
    inbound.reply_resource_id = M.trim(args.reply_resource_id or args.channel_id)
    inbound.channel_id = M.trim(args.channel_id)
    inbound.external_user_id = M.trim(args.external_user_id)
    inbound.external_username = M.trim(args.external_username)
    inbound.external_display_name = M.trim(args.external_display_name)
    inbound.external_message_id = M.trim(args.external_message_id)
    inbound.text = type(args.text) == "string" and args.text or ""
    inbound.attachments = type(args.attachments) == "table" and args.attachments or {}
    inbound.trace_context = type(args.trace_context) == "table" and args.trace_context or nil

    if inbound.provider == "" then return nil, "provider is required" end
    if inbound.external_message_id == "" then return nil, "external_message_id is required for reply admission" end
    if inbound.reply_resource_id == "" then return nil, "reply_resource_id is required" end
    if inbound.channel_id == "" then return nil, "channel_id is required" end
    if opts.require_external_user and inbound.external_user_id == "" then return nil, "external_user_id is required" end
    if inbound.text == "" and #inbound.attachments == 0 then return nil, "text or attachments are required" end
    return inbound, nil
end

-- trace_for_turn derives the turn's trace context. domain is the correlation kind
-- ("channel" | "dm"); extra_parts are correlation parts inserted after the
-- {provider, reply_component_id, channel_id} prefix and before the optional
-- {"message", message_id} suffix (dm inserts {"user", external_id}). An inbound
-- trace context is continued (correlation key filled if missing); otherwise a fresh
-- one begins.
function M.trace_for_turn(inbound: any, domain: string, extra_parts: { string }): (any?, error?)
    local parts: { any } = {
        M.trim((inbound :: any).provider),
        M.trim((inbound :: any).reply_component_id),
        M.trim((inbound :: any).channel_id),
    }
    if type(extra_parts) == "table" then
        for _, part in ipairs(extra_parts :: { any }) do
            parts[#parts + 1] = part
        end
    end
    local message_id = M.trim((inbound :: any).external_message_id)
    if message_id ~= "" then
        parts[#parts + 1] = "message"
        parts[#parts + 1] = message_id
    end
    local correlation_key, corr_err = trace_context.pack_correlation(domain, parts)
    if corr_err then return nil, corr_err end

    if type((inbound :: any).trace_context) == "table" then
        local ctx, ctx_err = trace_context.normalize((inbound :: any).trace_context)
        if ctx_err then return nil, ctx_err end
        if ctx then
            if not (ctx :: table).correlation_key then
                (ctx :: table).correlation_key = correlation_key
            end
            return ctx, nil
        end
    end
    return trace_context.begin(domain, correlation_key), nil
end

-- send_hub hands one message to the session hub through the channel hub signal,
-- so the ingress principal needs no process messaging authority.
function M.send_hub(payload: any): (boolean, string?)
    local ok, send_err = selected_hub.send(payload)
    if not ok then return false, tostring(send_err or "hub unavailable") end
    return true, nil
end

-- Control notices have no bridge append, so their durable acceptance is already
-- complete when the sealed reply proof is stored.
function M.accept_notice(inbound: any, principal: types.Principal): (any?, string?)
    local provider = M.trim(type(inbound) == "table" and inbound.provider or nil)
    local component_id = M.trim(type(inbound) == "table" and inbound.reply_component_id or nil)
    local resource_id = M.trim(type(inbound) == "table" and inbound.reply_resource_id or nil)
    local message_id = M.trim(type(inbound) == "table" and inbound.external_message_id or nil)
    if provider == "" or component_id == "" or resource_id == "" or message_id == "" then
        return nil, "notice admission coordinates are required"
    end
    local db_id, db_err = consts.db_id()
    if db_err or not db_id then return nil, "notice admission database unavailable: " .. tostring(db_err) end

    local turn_ref = { owner_id = "channel.turn", record_id = uuid.v7(), generation = 1 }

    local route = {
        session_provider = provider,
        execution_ref = { owner_id = "channel.notice", record_id = message_id, generation = 1 },
        thread = { role = "notice" },
        reply = { component_id = component_id, resource_id = resource_id },
        inbound = { external_message_id = message_id },
    }
    local _, accept_err, proof = persist.accept_turn(db_id, route, principal, turn_ref.record_id)
    if accept_err or not proof then
        return nil, "notice admission failed: " .. tostring(accept_err or "missing reply proof")
    end
    return proof, nil
end

-- session_admission builds the protected admission a DM session owns: its
-- execution record is the session itself, bound to the verified link.
function M.session_admission(identity: any): (any?, string?)
    local link_id = type(identity) == "table" and identity.link_id or ""
    if type(link_id) ~= "string" or link_id == "" then return nil, "DM link is required" end
    local valid, validation_err = execution_identity.validate(identity)
    if not valid then return nil, tostring(validation_err) end
    return { owner_id = "channel.session", generation = 1, link_id = link_id, identity = identity }, nil
end

-- route_turn is the shared session + trace + Route + hub-send orchestrator. The
-- caller resolves identity + policy and hands a spec: the route key, the session
-- (provider, subject) to map, execution_ref, the thread shape, session start config, the
-- reply event pair, and the trace domain + extra correlation parts. It resolves the
-- conversation session id, derives the trace, assembles the Route (reply target
-- trimmed off inbound), and sends the turn to the hub. Returns the routed/error
-- result; the caller stamps any extra fields (dm adds user_id).
function M.route_turn(inbound: any, spec: types.RouteSpec): any
    local db_id, derr = consts.db_id()
    if derr or not db_id then
        return { accepted = false, status = "error", error = tostring(derr) }
    end
    local policy = type((spec :: any).session_policy) == "table" and (spec :: any).session_policy or {}
    local max_idle_seconds: integer? = nil
    if (policy :: any).rotate_after_idle == true then
        local raw_idle = tonumber((policy :: any).idle_seconds)
        if raw_idle and raw_idle > 0 then max_idle_seconds = math.floor(raw_idle) end
    end
    local ref = spec.execution_ref
    local record: any
    if (spec :: any).admission ~= nil then
        local session_record, record_err = M.session_admission((spec :: any).admission)
        if record_err or not session_record then
            return { accepted = false, status = "error", error = record_err }
        end
        record = session_record
    elseif type(ref) == "table" and ref.owner_id == "automation.component" then
        local receipt, receipt_err = component.get_identity_receipt(ref.record_id)
        if receipt_err or not receipt or receipt.identity_generation ~= ref.generation then
            return { accepted = false, status = "error", error = tostring(receipt_err or "responder generation changed") }
        end
        local valid, validation_err = execution_identity.validate(receipt.execution_identity)
        if not valid then
            local result = publication.response(nil, validation_err)
            result.accepted, result.status = false, "error"
            return result
        end
        record = { owner_id = ref.owner_id, record_id = ref.record_id, generation = ref.generation,
            link_id = "", identity = receipt.execution_identity }
    else
        return { accepted = false, status = "error", error = "unsupported execution_ref" }
    end
    local admission = record.identity
    -- Every session id this acquisition publishes commits with its admission, so
    -- a concurrent first message observes either no mapping or an admitted one.
    local session_id, _, serr = persist.get_or_create(db_id, consts.SESSION_MAP_TABLE,
        spec.session_provider, spec.session_subject, max_idle_seconds, record)
    if serr or not session_id or session_id == "" then
        local blocked = channel_refusal.status(serr, nil)
        if blocked then return blocked end
        return { accepted = false, status = "error", error = "could not resolve conversation session: " .. tostring(serr) }
    end
    local previous, read_err = persist.get_admission(db_id, session_id)
    if read_err then return { accepted = false, status = "error", error = read_err } end
    if not previous then
        return { accepted = false, status = "error", error = "conversation session admission is missing" }
    end
    local record_id = record.owner_id == "channel.session" and session_id or record.record_id
    if previous.provider ~= spec.session_provider
        or previous.external_id ~= spec.session_subject
        or previous.owner_id ~= record.owner_id
        or previous.record_id ~= record_id
        or previous.generation ~= record.generation
        or previous.link_id ~= record.link_id
        or not execution_identity.same_principal(previous.identity.principal, admission.principal) then
        local rotated, rotate_err = persist.rotate_with_archive(db_id, consts.SESSION_MAP_TABLE,
            spec.session_provider, spec.session_subject, session_id,
            "admission_changed", record)
        if rotate_err or not rotated then
            local blocked = channel_refusal.status(rotate_err, session_id)
            if blocked then return blocked end
            return { accepted = false, status = "error", error = tostring(rotate_err) }
        end
        session_id = rotated
    end
    if record.owner_id == "channel.session" then
        ref = { owner_id = "channel.session", record_id = session_id, generation = 1 }
    end

    local turn_trace, trace_err = M.trace_for_turn(inbound, spec.trace_domain, spec.trace_parts)
    if trace_err then
        return { accepted = false, status = "error", session_id = session_id, error = trace_err }
    end
    (inbound :: any).trace_context = turn_trace

    if type(ref) ~= "table" or type(ref.record_id) ~= "string"
        or ref.record_id == "" or type(ref.generation) ~= "number" then
        return { accepted = false, status = "error", error = "invalid execution_ref" }
    end
    local route: types.Route = {
        key = spec.route_key,
        delivery = spec.delivery,
        session_id = session_id,
        session_provider = spec.session_provider,
        execution_ref = ref :: types.ExecutionRef,
        thread = spec.thread,
        start = spec.start,
        reply = {
            component_id = M.trim((inbound :: any).reply_component_id),
            resource_id = M.trim((inbound :: any).reply_resource_id),
            sent_event = spec.reply_sent_event,
            failed_event = spec.reply_failed_event,
        },
        inbound = inbound :: types.Envelope,
    }
    local turn_ref = { owner_id = "channel.turn", record_id = uuid.v7(), generation = 1 }
    local turn_id, accept_err = persist.accept_turn(db_id, route, admission.principal, turn_ref.record_id)
    if accept_err or not turn_id then
        local blocked = channel_refusal.status(accept_err, session_id)
        if blocked then return blocked end
        return { accepted = false, status = "error", session_id = session_id,
            error = "could not persist accepted turn: " .. tostring(accept_err) }
    end
    if spec.delivery == "witness" then
        local witnessed, witness_err = receive_witness.record(inbound, ref, M.trim, function(method, body)
            return selected_publish(route.key, turn_ref, method, body)
        end)
        if not witnessed then
            return { accepted = false, status = "unrouted", error = witness_err }
        end
        local marked, mark_err = turn_recovery.mark_appended(db_id, turn_ref.record_id)
        if not marked then
            return { accepted = false, status = "unrouted", error = mark_err }
        end
        return { accepted = true, status = "witnessed" }
    end
    local sent, send_err = M.send_hub({ kind = "turn", turn_ref = turn_ref })
    if not sent then
        return {
            accepted = false,
            status = "error",
            session_id = session_id,
            error = "could not route conversation turn to hub: " .. tostring(send_err or "hub unavailable"),
        }
    end
    return { accepted = true, status = "routed", session_id = session_id }
end

-- resolve_route(component_id, channel_id) -> (matched?, err?). Finds the responder
-- covering this channel on this connection through ONE indexed read: the routing
-- keys live in component meta (kickside_component_meta, composite key/value index),
-- so a with_meta lookup selects the responder id directly -- no list-everything scan.
-- The single matched component's private state is then read for the authoritative
-- pause flag and the routing overlay, and its engine-frozen execution identity to
-- run as. Unrouted (no responder) and paused both return no match; the caller treats
-- either as unrouted. A trusted system read (opened without an actor).
local function resolve_route(component_id: string, channel_id: string): (any?, any?)
    local rows, list_err = component.list_system({
        impl_ids = { RESPONDER_IMPL },
        meta = { connection_id = component_id, channel_id = channel_id },
    })
    if list_err then return nil, list_err end
    if type(rows) ~= "table" or #(rows :: { any }) == 0 then
        return nil, nil
    end
    local matched_id = M.trim((rows :: { any })[1].component_id)
    if matched_id == "" then return nil, nil end

    local def, gerr = contract.get(RUNTIME_READER)
    if gerr or not def then return nil, "runtime_reader unavailable: " .. tostring(gerr) end
    local reader, oerr = (def :: any):open()
    if oerr or not reader then return nil, "runtime_reader open failed: " .. tostring(oerr) end
    local res, rerr = reader:get({ id = matched_id, include_state = true, include_drive_status = true })
    if rerr then return nil, tostring(rerr) end
    if type(res) ~= "table" or (res :: any).success == false then
        return nil, tostring(res and (res :: any).error or "runtime_reader get failed")
    end
    local automation = type((res :: any).automation) == "table" and (res :: any).automation or {}
    local state = type((automation :: any).state) == "table" and (automation :: any).state or {}
    local paused = (state :: any).paused == true
    local drive_status = (automation :: any).drive_status
    if type(drive_status) == "table" and type(drive_status.drives) == "table" then
        for _, drive in ipairs(drive_status.drives) do
            if drive.drive_key == "main" then paused = drive.enabled == false; break end
        end
    end
    local session_policy, policy_err = responder.session_policy(state.session_policy)
    if policy_err then return nil, policy_err end
    return {
        component_id = matched_id,
        paused = paused,
        agent_id = M.trim((state :: any).agent_id),
        identity_generation = tonumber((automation :: any).identity_generation),
        traits = type((state :: any).traits) == "table" and (state :: any).traits or {},
        trait_contexts = type((state :: any).trait_contexts) == "table" and (state :: any).trait_contexts or {},
        context = M.trim((state :: any).context),
        response_policy = type((state :: any).response_policy) == "table" and (state :: any).response_policy or {},
        session_policy = session_policy,
        system_prompt = M.trim((state :: any).system_prompt),
    }, nil
end

-- agent_exists reports whether the responder's frozen agent still exists. A deleted
-- agent must fail the turn visibly here, not crash the session runtime downstream.
local function agent_exists(agent_id: string): (boolean, any?)
    if agent_id == "" then return false end
    local component_id = agent_ref.user_component_id(agent_id)
    if component_id == nil then return true end
    local rows, read_err = component.list_system({ component_ids = { component_id } })
    if read_err then return false, read_err end
    return type(rows) == "table" and #(rows :: { any }) > 0, nil
end

function M.receive(args: any): any
    if not trusted_ingress("kickside.channel:receive") then
        return { accepted = false, status = "error", error = "trusted channel ingress is required" }
    end
    local inbound, nerr = M.normalize(args)
    if nerr or not inbound then
        return { accepted = false, status = "error", error = nerr or "invalid inbound" }
    end
    local provider: string = M.trim(inbound.provider)
    local component_id: string = M.trim(inbound.reply_component_id)
    local channel_id: string = M.trim(inbound.channel_id)

    local function finish(result: any, owner_id: string, reason: string, state: string?): any
        result.reason = reason
        local ok, health_err = responder_health.report(owner_id, reason, result.error, state or "error")
        if not ok then
            return { accepted = false, status = "error", reason = "health_write_failed", error = health_err,
                cause = result }
        end
        result.health_reported = true
        return result
    end
    -- 1. Route: which responder covers this channel, and as whom to run. A lookup
    -- failure or an uncovered channel has no responder to report on, and routing
    -- never describes the connection's own health.
    local matched, rerr = resolve_route(component_id, channel_id)
    if rerr then
        return { accepted = false, status = "error", reason = "routing_lookup_failed", error = rerr }
    end
    if type(matched) ~= "table" then
        return { accepted = false, status = "unrouted", reason = "channel_unrouted",
            error = "no responder covers this channel" }
    end
    local owner_id = (matched :: any).component_id :: string
    local receipt, receipt_err = component.get_identity_receipt((matched :: any).component_id)
    if receipt_err or not receipt then
        return finish({ accepted = false, status = "error", error = receipt_err or "identity unavailable" }, owner_id, "execution_identity_unavailable")
    end
    if type((matched :: any).component_id) ~= "string"
        or type(receipt.identity_generation) ~= "number" then
        return finish({ accepted = false, status = "error", error = "responder identity receipt is invalid" }, owner_id, "execution_identity_invalid")
    end
    local ref: types.ExecutionRef = { owner_id = "automation.component",
        record_id = (matched :: any).component_id :: string,
        generation = receipt.identity_generation :: integer }
    local agent_id = M.trim((matched :: any).agent_id)
    local paused = (matched :: any).paused == true
    local agent_ok, agent_err = agent_exists(agent_id)
    if agent_err then return finish({ accepted = false, status = "error", error = agent_err }, owner_id, "agent_lookup_failed") end

    local principal = receipt.principal
    if type(principal) ~= "table" or type(principal.kind) ~= "string"
        or type(principal.id) ~= "string" then
        return finish({ accepted = false, status = "error", error = "responder principal is invalid" }, owner_id, "execution_identity_invalid")
    end
    local user_id = type(principal) == "table" and principal.kind == "user"
        and M.trim(principal.id) or ""
    local audience: { string } = {}
    if user_id ~= "" then audience[1] = user_id end

    -- 2. Build the channel spec (protected execution reference, channel consts,
    -- per-responder system_prompt) and route it through the shared orchestrator.
    local spec: types.RouteSpec = {
        delivery = (paused or not agent_ok) and "witness" or nil,
        route_key = consts.external_ref(provider, component_id, channel_id),
        session_provider = provider,
        session_subject = channel_id,
        execution_ref = ref,
        thread = {
            impl_id = "kickside.channel:channel_kind",
            class = consts.THREAD_CLASS,
            title_prefix = "Channel",
            managed_by = "kickside.channel",
            receive_target = "kickside.channel:receive",
            role = "channel",
            user_ids = audience,
            owner_principal = principal :: types.Principal,
            audience_principals = { principal :: types.Principal },
            inbound_event = consts.EVENT.INBOUND,
        },
        start = {
            component_id = (matched :: any).component_id,
            agent_id = agent_id,
            session_kind = "CHANNEL",
            system_prompt = (matched :: any).system_prompt :: string,
            traits = (matched :: any).traits :: { string },
            trait_contexts = (matched :: any).trait_contexts,
            context = (matched :: any).context :: string,
            response_policy = (matched :: any).response_policy,
            session_policy = (matched :: any).session_policy,
        },
        session_policy = (matched :: any).session_policy,
        reply_sent_event = consts.EVENT.REPLY_SENT,
        reply_failed_event = consts.EVENT.REPLY_FAILED,
        trace_domain = "channel",
        trace_parts = {},
    }
    local result = M.route_turn(inbound, spec)
    if paused or not agent_ok then
        if result.accepted ~= true then
            return finish({ accepted = false, status = "unrouted", error = result.error }, owner_id, "inbound_witness_failed")
        end
        if paused then
            return finish({ accepted = false, status = "unrouted", error = "responder paused" }, owner_id, "responder_disabled")
        end
        if agent_id == "" then
            return finish({ accepted = false, status = "unrouted", error = "responder agent is missing" }, owner_id, "agent_missing")
        end
        return finish({ accepted = false, status = "error", error = "responder agent " .. agent_id .. " no longer exists" }, owner_id, "agent_missing")
    end
    if result.accepted ~= true then return finish(result, owner_id, responder_health.reason(result.error, "turn_admission_failed")) end
    return result
end
M.new = construct
return M
end
return construct({})
