# kickside.channel

Provider-neutral channel responder: attach an agent to a shared surface (chat
channel, group, room) so it answers there. The sibling of `kickside.dm`.

## Difference from kickside.dm

| | kickside.dm | kickside.channel |
|---|---|---|
| Surface | one external user's DM | a shared channel/group |
| Runs as | the linked external user | the automation's frozen installer |
| Identity source | scope_resolver (linked user) | runtime_reader (frozen `_execution_identity`) |
| `external_user_id` | the user (identity) | attribution only |

The envelope (`receive`) is identical; only identity resolution differs.

## Ownership

- **kickside.automation** — lifecycle (install/uninstall), the frozen execution
  identity, the rollback chain (teardown), discovery (`meta.type:
  kickside.automation`), and `runtime_reader`.
- **kickside.channel surface** — routing (`channel_id` -> installed
  automation), installer-identity reconstruction, and the `receive` contract.
- **shared chat runtime in kickside.channel** — session mapping, hub,
  bridge, thread append/reply handoff, used by both `kickside.channel` and
  `kickside.dm`.
- **wippy.session** — chat memory, compaction, idle-stop/rehydrate.
- **provider adapter** (discord, ...) — transport, normalize -> `receive`, the
  announce binding, and `reply_provider` (outbound). Nothing generic.

## Flow

```
inbound:  provider normalizes -> kickside.channel:receive(envelope)
            -> route channel_id -> installed automation
            -> reconstruct installer identity (runtime_reader)
            -> run/continue the persistent session under it, agent = automation.agent_id
            -> reply via kickside.connection:reply_provider
```

Adding a provider is a thin adapter: transport + normalize + announce binding;
no routing, dispatch, or session code.
