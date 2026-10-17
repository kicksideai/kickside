# KickSide Realtime

A centralized contract for pushing topics to connected UIs, over `wippy/relay`.

Modules call one seam instead of touching the relay directly, so realtime stays
decoupled and consistent across the app.

## Contract `kickside.contract:realtime`

- `broadcast({ topic, data? })` — fan a topic out to **every** connected client.
  The relay central hub (`wippy.central`) forwards any non-control topic to all
  user hubs. Use for global changes (e.g. nav layout) every UI must reflect.
- `notify({ user_id, topic, data? })` — push a topic to **one** user's clients
  (their `user.<id>` hub). Use for per-user events (e.g. an inbox item).

Both are no-ops when no hub is live (no open clients); UIs reconcile on next
load. The FE subscribes to the topic via the Wippy instance (`instance.on(topic, …)`).
