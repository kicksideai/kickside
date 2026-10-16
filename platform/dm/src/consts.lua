-- Stable vocabulary for the kickside.dm surface. A DM is a private, user-owned
-- kickside.core thread that decouples a provider transport from a user-owned
-- wippy.session. The surface owns DM thread/event vocabulary and stamps it onto a
-- Route; the shared kickside.channel runtime owns the session mapping, hub,
-- bridge, thread writes, and reply. The user is derived from the kickside.identity
-- link, the scope from the scope_resolver, and the agent + history from the
-- session.

local M = {}

-- Every DM thread carries this class so list/filter targets DM threads.
M.THREAD_CLASS = "kickside.dm"

-- Thread event types the surface stamps onto a Route; the runtime appends them to
-- the DM thread's immutable log. The inbound user message and the reply lifecycle.
M.EVENT = {
    INBOUND = "kickside.dm.events:message.inbound",
    REPLY_SENT = "kickside.dm.events:reply.sent",
    REPLY_FAILED = "kickside.dm.events:reply.failed",
}

-- The default DM agent: a greeter whose only tool is redirect. A linked user is
-- handed to this agent until it redirects to one of the user's own agents.
M.GREETER_AGENT_ID = "kickside.dm.agents:greeter"

return M
