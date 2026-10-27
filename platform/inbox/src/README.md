# kickside/inbox

Central review/approval inbox. Action results, reminders, and notices land here
for human review.

- **Items** are thread events reduced by the owner inbox projection
  (`pending -> approved | rejected | dismissed | resolved`). Built-in actions
  use their specific status; other declared actions use `resolved`. There is no
  parallel count/log table; callers derive counts from the same projected item
  list.
- **Item types are declarative**: a module registers a `registry.entry` with
  `meta.type = inbox.item_type` carrying render metadata (`value`, `name`, `icon`,
  `category`, `component_tag`, `component_base_path`, and optional
  `action_owner: component`). The UI maps an item's
  `item_type` to the item type's web component — adding an item type needs no
  inbox change. The host owns pending action controls unless the declaration
  explicitly assigns them to its component. Item metadata cannot change that
  ownership. The bundled `notice` item type is the base reference to copy.
- **Public meta**: after Core commits the projection, its declared post-commit
  worker writes component-wide renderable summary
  counts to component meta using flat, explicit `<thing>_count` fields
  (`pending_count`, `item_count`, `resolved_count`, `urgent_count`,
  `high_count`). `pending_count` is the actionable inbox badge. Do not store
  per-viewer unread/visited state in public meta.
- **Realtime**: the post-commit worker writes public meta, and the component engine emits
  `component.<id>` / `component.meta.changed`. The UI uses that canonical topic
  as its live invalidation signal and reloads the list from `/inbox`; there is no
  parallel inbox realtime topic.
- **Resolution consistency**: the canonical `inbox.item_type` declaration owns
  its allowed `actions`, optional side-effect-free `on_validate`, and optional
  idempotent `on_resolve`. Inbox invokes both callbacks synchronously under the
  resolver's actor and scope, and appends the one terminal `item.resolved` event
  only after they succeed. Item metadata is data, never executable binding
  authority. Because a callback may succeed immediately before an append fails,
  providers must bind the supplied stable `resolution_id` to exactly one action
  and form payload, make an identical retry idempotent, and reject a retry whose
  action or form differs. Inbox does not yet persist a terminal claim before
  invoking callbacks, so this provider contract is required. Pending items also
  resolve against the current live item-type declaration; declaration updates
  must remain backward-compatible with existing pending items until declaration
  version freezing is designed.
- **Workflow port**: `kickside.inbox.sink:inbox_item` is the canonical writable
  destination. It is a first-class `kickside.automation.port` backed by
  `kickside.inbox.sink:inbox_sink` and posts to the ambient actor's inbox.
  Workflow builders discover it from the same ports catalog as every other sink;
  there is no separate inbox dropdown/catalog path.

Empty item `metadata` and submitted `form` values serialize as JSON objects
(`{}`), using map-capacity Lua tables at storage and response boundaries.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/inbox` | list items (`status`, `type`, `priority`, `page`, `limit`) |
| GET | `/inbox/item-types` | declared item types + render metadata |
| POST | `/inbox` | enqueue an item |
| GET | `/inbox/{id}/files/{index}` | read attached file bytes as the current viewer |
| POST | `/inbox/{id}/{action}` | apply an action declared by the item's canonical item type |

Modules can also enqueue in-process via the `inbox_writer` library. Terminal
resolution always goes through `inbox_resolve`, which owns action validation and
callbacks before committing the event.

### Aggregate notices

The writable sink accepts optional `input.aggregate_key` and `input.source_id`
(also available in destination config). `source_id` names a component. One item
belongs to the tuple `(source_id, aggregate_key, ambient actor)` across deliveries.
The actor needs live READ access to that component on every write and read;
revoked or deleted sources hide their aggregate items from Inbox responses.
Items without `aggregate_key` keep their existing identity and resolution behavior.

An upsert with `status: pending` (the default) refreshes the title, body, priority
and metadata and reopens the aggregate. An upsert with `status: resolved`
explicitly closes it without requiring content. Both use existing `item.version`
events; resolution returns the writable contract's `updated` receipt. Resolving
an absent aggregate does not create an item. Replaying a delivery key has no new
effect, including after a later reopen. Supply a new `idempotency_key` for each
new snapshot and retain it for retries.

For example, call `kickside.inbox.sink:inbox_sink` through
`kickside.data:writable.write` with:

```lua
{ config = {}, sink_op = "upsert", origin = "review-source",
  idempotency_key = "review-snapshot-3",
  input = { source_id = component_id, aggregate_key = "pending-review",
    content = "3 files need review", metadata = { count = 3, link = "/review" } } }
```

When no work remains, send the same source and key with `status = "resolved"`
and a new delivery key. Inbox does not infer lifecycle from extension metadata.
In-process owners can use `inbox_writer.create({ aggregate_key = ..., source_id = ...,
item_type = ..., title = ..., ... })` and `inbox_writer.resolve_aggregate({
aggregate_key = ..., source_id = ..., idempotency_key = ... })`.
Source lifecycle resolution does not invoke human action callbacks. Human
actions still go through `inbox_resolve`; each refreshed aggregate version has
its own resolution identity so reopened work can receive a new decision.

Cross-user review delivery requires `inbox.assign` on `user:<assignee>`.
The application binds `kickside.inbox.security:assignment_security_scope` to its
administrator group. The default assigner group has no application members.
The review arm emits the declared Inbox output event as the sender, retains the
recipient's existing component ownership, and records `metadata.assigned_by`.
It never reconstructs the recipient's actor or reads the recipient's Inbox.
A recipient must have a provisioned Inbox. Re-arming uses the same event identity
and does not reopen a resolved decision.

## Files

Item creation, the Inbox sink, SubmitToInbox, and review Block config accept optional
`files: [{component_id, context?, title?}]` references. This reuses the generic
`content_provider` reference shape; for example, an upload reference uses
`component_id: "kickside.uploads:content_provider"` and `context: {upload_id: "..."}`.
References grant no access. The list and resolution APIs resolve `get_info` under
the viewer's actor and scope, returning only filename, content type, size, and the
provider's optional `view_url`. Inaccessible references return `{locked: true}`.
The shared resource viewer fetches preview bytes through the item file endpoint,
which invokes `get_content` under the current viewer identity on every request.
Existing items without files retain their behavior. Content versions that omit
`files` preserve existing references; an explicit empty list removes them. No data
migration is required.
