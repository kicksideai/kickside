-- Mirror the Channel route seam so DM's typed route is checked in this
-- isolated harness without loading the Channel runtime.
local M = {}

type Principal = { kind: string, id: string }
type ExecutionRef = { owner_id: string, record_id: string, generation: integer }
type ThreadShape = {
    class: string,
    title_prefix: string,
    managed_by: string,
    receive_target: string,
    role: string,
    user_ids: { string },
    owner_principal: Principal?,
    audience_principals: { Principal }?,
    inbound_event: string,
}
type Start = {
    agent_id: string,
    session_kind: string,
    system_prompt: string?,
    traits: { string }?,
    trait_contexts: any?,
    context: string?,
    session_policy: any?,
}
type RouteSpec = {
    route_key: string,
    session_provider: string,
    session_subject: string,
    execution_ref: ExecutionRef?,
    thread: ThreadShape,
    start: Start,
    reply_sent_event: string,
    reply_failed_event: string,
    trace_domain: string,
    trace_parts: { string },
    session_policy: any?,
    admission: any?,
}

M.RouteSpec = RouteSpec
return M
