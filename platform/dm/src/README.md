# kickside/dm

Bridges inbound external direct messages (from `kickside.connection` providers —
discord, telegram, …) onto **private, user-owned agent-chat threads**.

## Model

1. **Identity comes from the link.** Providers normalize their inbound event and
   call `kickside.dm:receive` as the system gateway process; a connection is shared
   transport and owns no DM identity. DM resolves the external sender to an internal
   user via the `kickside.identity` link service (`external_id -> user_id`). An
   unlinked sender gets link instructions and nothing runs; `link <code>` binds the
   external identity to the code's user.

2. **A DM is a private, user-owned thread.** A linked conversation maps to a
   `kickside.core` thread (`thread_class = "kickside.dm"`,
   `external_ref = "<provider>:<reply_component_id>:<channel_id>"`),
   owned by the linked user. It is the decoupler and audit trail: inbound appends
   `message.inbound`, the reply lifecycle appends `reply.sent` / `reply.failed`.

3. **A user-owned session drives the agent.** The shared chat runtime
   maps one `wippy.session` per DM (`(provider, external_id) -> session_id`) and
   runs it under the **linked user's** actor + scope. The default agent is the DM
   greeter, whose only tool is redirect: it lists / switches to the user's own
   `user_agent` components. `/clear` rotates the session id; a later message
   reuses it (the session rehydrates — continue after sleep).

4. **The reply is pure transport, at the system level.** The bot sends via the
   connection's reply provider, which reads the connection's bot token at the
   system level, so the linked user need not have access to the connection. The
   session and agent identity stay purely the linked user.

DM owns no DM-specific database table. The shared chat runtime stores the
slim mapping `kickside_channel_sessions (provider, external_id) -> session_id`.
Everything else is derived: the user from the link, the scope from the resolver,
the agent and history from the session.

## Ownership

`kickside.dm` owns: the `kickside.dm:receive` contract, the `link`/`/clear`
commands, DM thread/event vocabulary, and Route construction. The shared
chat runtime in `kickside.channel` owns the session mapping, hub, bridge,
thread append/reply handoff. DM does **not** own external identity linking
(`kickside.identity`), provider plumbing or credentials (`kickside.connection`
providers), the session/agent runtime (`wippy.session`, `kickside.agents`), or
scope resolution (`kickside.contract:scope_resolver`).

## Provider Contract

Any channel provider normalizes its inbound event into a neutral envelope:

- `provider`, for example `discord`
- `reply_component_id`, the connection/reply-provider component owning credentials
- `reply_resource_id`, the provider resource to send replies to
- `channel_id`, the provider conversation/channel id
- `external_user_id`, the sender identity
- `external_message_id`, when available, for dedup
- `text`, `attachments`, and provider-specific `metadata`

The receive call runs as the **system gateway** process. Providers carry no
`automation_id`, `agent_id`, or session knowledge.

## Dependencies

DM owns no host resources. It directly declares the Identity, Connection,
Channel, Agents, Core, and Contract packages whose production entries it uses;
Channel owns and exposes the shared session persistence requirement.
