local registry = require("registry")

-- Stable vocabulary for the shared external-conversation session engine. A
-- conversation is an external thread (a DM or a shared channel) bridged to a
-- user-owned wippy.session. The only durable engine state is the slim mapping
-- (provider, external_id) -> session_id; the run-as identity, agent, and history
-- are resolved/derived per turn. These names are a wire contract shared by the
-- persist layer, the thread events, the hub, and the bridge; keep them stable.
local M = {}

-- Per-node session hub: maintains the live bridges and routes turns to them. The
-- receive seams (kickside.dm:receive, kickside.channel:receive) forward
-- normalized turns here with a run-as identity spec.
M.HUB_NAME = "kickside.channel.session_hub"
M.HUB_TOPIC = "kickside.channel.inbound"
M.BRIDGE_REGISTRY_PREFIX = "kickside.channel.bridge:"

-- A bridge keeps its live session process alive between turns and idle-terminates
-- after this responder-configurable default.
M.DEFAULT_RUNTIME_IDLE_SECONDS = 10 * 60

-- When a shared channel stays quiet this long, the next inbound starts a fresh
-- wippy.session history instead of reusing stale channel context.
M.DEFAULT_SESSION_IDLE_SECONDS = 2 * 60 * 60

-- Threads are written through the kickside.core:threads contract (see thread_bridge),
-- not private impl-function ids.

-- Registry entry whose meta.db_id holds the configured channel database resource.
-- The target_db ns.requirement rewrites that field per deployment.
M.DB_CONFIG = "kickside.channel:db_config"
M.PROCESS_CONFIG = "kickside.channel:process_config"

-- The session mapping table (provider, external_id) -> session_id. It holds the
-- mapping only, never sessions themselves -- those live in wippy.session.
M.SESSION_MAP_TABLE = "kickside_channel_sessions"

-- Channel thread class + reply/inbound event types appended to the immutable log.
M.THREAD_CLASS = "kickside.channel"
-- A responder is itself an automation, so the events it emits land on its own
-- automation-class thread (the automation module declares class: automation on its
-- kinds), distinct from the channel conversation thread above.
M.RESPONDER_THREAD_CLASS = "automation"
M.EVENT = {
    INBOUND = "kickside.channel.events:message.inbound",
    REPLY_SENT = "kickside.channel.events:reply.sent",
    REPLY_FAILED = "kickside.channel.events:reply.failed",
}

-- Resolve the configured DB id the persist layer binds to. Fails closed: an unset
-- id is a deployment-wiring error, not a silent fallback.
function M.db_id(): (string?, string?)
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string, nil
end

function M.process_host(): (string?, string?)
    local entry = select(1, registry.get(M.PROCESS_CONFIG)) :: any
    return entry.meta.host_id :: string, nil
end

-- external_ref is the natural key for a channel thread: provider, the connection
-- component delivering it, and the provider's conversation id.
function M.external_ref(provider: string, component_id: string, channel_id: string): string
    return provider .. ":" .. component_id .. ":" .. channel_id
end

function M.event_external_source(provider: string): string
    return "kickside.channel." .. provider
end

return M
