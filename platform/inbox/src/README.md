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
- **Realtime**: personal component metadata retains `component.<id>` /
  `component.meta.changed`. Private addressed work sends the contentless
  `inbox.changed` topic to the recipient's authenticated connections after the
  projection commits. Both signals reload the live-authorized list from `/inbox`.
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
| GET | `/inbox` | list personal and live-group items, counts, and realtime `component_ids` (`status`, `type`, `priority`, `page`, `limit`) |
| GET | `/inbox/item-types` | declared item types + render metadata |
| POST | `/inbox` | enqueue an item or upsert/close an explicitly addressed aggregate |
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
actions still go through `inbox_resolve`. Pending snapshots share one visit and
resolution identity; reopening closed or human-resolved work starts a new visit
so it can receive a new decision. Sender closure preserves a recorded human outcome.

## SPEC: Principal-addressed aggregates

An item type opts into trusted delivery with `meta.send_permission`, an exact
action name owned by its declaring module. Inbox checks that action against the
canonical item-type **entry ID**, never an item ID, metadata, or an ID pattern.
The declaring module grants this pair in its own producer policy, for example:

```yaml
- name: item_type.awaiting
  kind: registry.entry
  meta:
    type: inbox.item_type
    value: awaiting
    actions: [dismiss]
    send_permission: example.inbox.send
- name: inbox_sender
  kind: security.policy
  meta: { private: true, service_only: true }
  policy:
    actions: example.inbox.send
    resources: example:item_type.awaiting
    effect: allow
```

An authorized producer supplies `recipient = {kind = "user" | "group", id = ...}`,
`item_type`, `source_id`, and `aggregate_key`. The aggregate identity contains all
four values, including the recipient kind. `sender_id` records the authenticated
producer; it cannot be supplied by the request. Creation and content updates need
live source READ. A sender with the exact type's send permission may close or
delete an existing addressed item without source READ: creation already authorized
that source, and closing returns no source information. Recipient eligibility
grants the addressed item independently of source READ; attachment providers still authorize every viewer separately.

Use the writer library under the sender’s actor and scope:

```lua
inbox_writer.create({ recipient = { kind = "user", id = reviewer_id },
    item_type = "awaiting", source_id = source_id, aggregate_key = "review",
    idempotency_key = "snapshot-3", title = "Review awaits you" })
inbox_writer.resolve_aggregate({ recipient = { kind = "user", id = reviewer_id },
    item_type = "awaiting", source_id = source_id, aggregate_key = "review",
    idempotency_key = "snapshot-4" })
```

The public writable sink supplies Inbox's publisher capabilities. It accepts the
same fields in `input` or destination `config`. `POST /inbox` accepts these fields
at the top level; `status: resolved` closes addressed work without content.
Sink upsert and delete share the writer's identity resolution: personal records
use the source identity, addressed records scope it by canonical type and recipient,
and aggregates use their source/aggregate tuple (plus type and recipient for addressed work).
Resolved identities carry both the ID and its store: the personal owner or the
private addressed recipient. The same upgrade lookup preserves a retained personal
ID and its recipient owner when upsert acknowledges it. Legacy upsert and decision
re-arm acknowledge this identity without updating or reopening its history. Sink delete uses that
owner even when the authorized sender is a different user; it never selects the
sender's same-named item. An identity is not an authorization capability: addressed
mutations recheck the sender permission before using its named store.
Delete needs no content or destination reference. Deleting an already-absent item
is an idempotent no-op with `result: deleted` and the same identity receipt, including
a retraction redelivered after resolution. Other writer callers retain their
`NOT_FOUND` behaviour; the HTTP delete API may answer 404 for an absent item.
Each delivery creates or updates the aggregate with one snapshot event, conditioned
on its observed subject version (zero for creation). A delivery key binds an
immutable request within the sender and recipient store.
Delivery receipts live as long as event retention, so senders must retry within
that window. After item retention removes a resolved decision, re-arming that
signal creates a new decision. A retry of an applied key appends nothing,
including after a newer update or closure. A changed request
with that key is a conflict, including a concurrent append deduplicated by Core:
Inbox compares the durable bound payload before reporting success. A concurrent
unapplied delivery whose observed version is stale is a conflict. Closing an
addressed aggregate that has never existed returns `NOT_FOUND`.
Nonaggregate addressed identities encode the authorized item type, recipient
kind and ID, and producer ID, so a combined personal/group view cannot collide.
Only the same immutable delivery can reuse an existing identity; a different delivery
is a conflict. Actor-bound items retain their stored identity and existing behavior.

Addressed items live in Inbox-owned Core threads and projections. Only Inbox’s
storage identity owns these components; recipients receive no component ACL grant.
Delivery provisions this store through the public Threads contract. It never
writes into a recipient-owned component. A nonaggregate delivery first checks
the recipient’s materialized preupgrade item under an isolated recipient read
scope, after sender authorization; retained creation receipts also acknowledge
deleted history. A matching materialized type remains authoritative after event
retention and resolution; no private pending copy is created. This
compatibility probe returns the existing ID and personal owner, never recipient content.
Personal deletion also uses the materialized item after event retention; a
retained creation event permits deletion before the projection has caught up.

Inbox hides an addressed aggregate whose source component no longer exists.
The existence check runs only in the read path, over items already read from the
viewer's eligible stores, in deduplicated pages of at most 128 IDs. Callers cannot
supply the source IDs checked. The internal lookup has no callable function entry;
recipient READ on the source is not required. Deleted-source items are hidden from
lists, counts and badges and refuse resolution (`NOT_FOUND`), including after event
retention. The projection fold performs no source-existence read and derives no
source information from caller-supplied events or state.

Senders close their own items when the source goes away, for example in the
source's deletion callback, using the exact type's send permission without source
READ. Inbox hides those items meanwhile; terminal items age out after `item_days`.
An unclosed pending item remains stored. Personal aggregate access rules and
nonaggregate record/workflow source identifiers retain their existing semantics.
A source deletion racing an in-flight callback is a known race; subsequent
eligibility checks refuse the gone item.

### Materialized item retention

The binding's `retention.event_days: 7` governs Core event history independently
of `retention.item_days: 30` (default 30), which Inbox enforces in its own
projection fold. Each new event batch removes at most 1,000 items from that
store: any terminal status (`approved`, `rejected`, `dismissed`, `resolved`)
whose resolution time is older than the item window. Pending items are never
pruned by the fold, regardless of creation age, source existence or a legacy
retirement timestamp. A reopened aggregate starts a new pending visit; creation
age does not govern terminal retention.
For both personal and addressed aggregates, a version snapshot with its declared
item type reconstructs an absent item, including a reopen whose creation receipt
is still retained. A status-only version updates an existing item.

This applies to personal and addressed projections, including existing stores.
Existing terminal items use their stored resolution time; if one has no time,
its first fold starts the window. Legacy retirement timestamps do not affect
retention; no schema migration is needed. Counts are recomputed after removal, and
the existing post-commit summary and viewer badge paths use the retained items.
Excess expired items drain on successive folds; 1,000 removals exceed Core's
default 200-event batch. An idle store keeps its last items until its next event:
growth requires activity, and activity prunes. Item retention does not change the
separate event-retention limit on delivery receipts.

Reads combine the viewer’s existing personal projection and private addressed
items for that user and the live groups returned by the public directory. Joining
and leaving apply with the same session. A group-directory failure or one group’s
store failure omits that group work and leaves personal work available. Direct
Core reads of the private store are refused to recipients, including departed
members with stamped membership. No membership feed or per-member copy exists.

One eligible viewer’s resolution closes the item for every viewer. The resolver
rechecks live eligibility and version before callbacks, which run under that
viewer’s actor and scope with the unchanged `resolution_id`. Pending sender
snapshots and lifecycle closure preserve this visit identity. The terminal write
is fenced by Core’s unique external resolution ID: no human resolution may already
exist for that visit. It does not advance or require the sender snapshot subject
version. A successful callback can therefore record its action and resolver even
when the sender refreshes or closes the item before the terminal append. Two
humans may both enter callbacks, but exactly one terminal event is recorded; the
other receives CONFLICT. Providers retain their resolution-ID/action/form binding
obligation. Sender closure after a human resolution preserves the human outcome;
a new pending delivery after closure or human resolution starts a new visit.
A decision from a previous visit cannot resolve the reopened visit. Sender
lifecycle closure uses the snapshot path without human callbacks. Actor-owned metadata cleanup
excludes every addressed item: their store belongs to Inbox, including user-addressed
work. Viewer deletion of addressed items requires current eligibility; authorized sink
retractions target the resolved recipient store. Both use
a conditional `item.deleted` append in the private store. An ordinary delete
identity includes the current item version, so a fresh snapshot that revives an
aggregate can be deleted again. Viewer delete retries remain idempotent after the card
disappears, but revoked members cannot delete or replay a delete. A delete key cannot name a different item.

List and viewer-computed navigation badge counts combine personal and eligible
addressed items. Each component’s public summary still describes that component
alone. `component_ids` names the legacy personal, addressed user and current
addressed group components for invalidation; list reads determine eligibility
and totals afresh.

Cross-user `arm_decision` calls the same authorized addressed writer with the
`flow_decision` type’s exact `inbox.assign` permission on
`kickside.inbox:item_type.flow_decision`. The application binds
`kickside.inbox.security:assignment_security_scope` to its assigner group. When
unbound, it resolves to the module's `kickside.inbox.security:assigner` scope,
which receives only this exact assignment grant; ordinary module members receive
no assignment authority. A decision
uses its type-scoped `workflow-decision:<dataflow_id>:<signal_id>` correlation, records
`metadata.assigned_by`, and cannot reopen on re-arm. Self decisions and already
stored actor-bound aggregates and decisions retain their existing read and resolve
path; no data migration is required from a production install before this feature.
Self-arming also checks the private type-scoped identity, so becoming the ambient
assignee cannot create a second personal copy of a pending, resolved or deleted
decision. Deleted private history is checked through its durable subject version.

Known: membership can change during a request after its eligibility check; the
next read reconciles it. Already stored decisions remain on their original thread.
Known: operators must keep one arming owner per signal while switching between
personal and delegated arming; simultaneous first writes to those two stores are
not one atomic operation.

## SPEC: Addressed realtime invalidation

After any personal or addressed write, refresh, closure, resolution or deletion
projection commits, its existing post-commit worker sends `inbox.changed` through `kickside.contract:realtime`
for a user, or `kickside.contract:realtime_batch` for a group. The topic has no item
content, identifiers, counts or metadata; the Inbox UI and its declared navigation
badge reload through their live-authorized read endpoints on the current user's
connection. Personal items notify their component owner on the same topic,
including actor-bound notices and self-assigned decisions. Personal component-meta
notifications remain unchanged. The trusted post-commit worker resolves the stored
personal component owner: its execution frame and deletion events need not
identify that user.

Each invocation reads one current `group_members.members` page of at most 128
unique users and dispatches at most one batch of 128. A keyset `next_cursor`
continues through a one-shot job in the existing Jobs service, with one attempt
and the same per-invocation bound. Its payload contains only recipient, thread,
committed sequence and member cursor. Inbox declares its direct Jobs dependency;
there is no new process, table or per-member item copy. Group listing omits
members who departed before that page's directory read.

Notification and continuation errors never fail a committed write or undo its
projection; the initial post-commit failure is logged and a failed continuation
is visible in Jobs. Hints are best effort: a worker crash between projection
commit and notification/enqueue can lose a hint. Known: membership may change
between a page read and dispatch, or behind its cursor; the next public read
always rechecks eligibility and totals. No notification grants content access.

## Files

Item creation, the Inbox sink, SubmitToInbox, and review Block config accept optional
`files: [{component_id, context?, title?}]` references. This reuses the generic
`content_provider` reference shape; for example, an upload reference uses
`component_id: "kickside.uploads:content_provider"` and `context: {upload_id: "..."}`.
References grant no access. Page queries return attachment counts and the existing
content-event version without calling providers or exposing references. The selected
reading view uses `GET /inbox?id=…&status=all` to resolve `get_info` under the viewer's
actor and scope, returning only filename, content type, size, and the provider's
optional `view_url`. Inaccessible references return `{locked: true}`. A metadata
outage affects the file section's manual retry, while the Inbox and item actions
remain available. Content versions invalidate the selected file metadata even when
the attachment count is unchanged.
Resolution responses return the committed outcome without file references or
provider reads, so unavailable preview storage cannot fail an approved decision.
The shared resource viewer fetches preview bytes through the item file endpoint,
which invokes `get_content` under the current viewer identity on every request.
Existing items without files retain their behavior. Content versions that omit
`files` preserve existing references; an explicit empty list removes them. No data
migration is required.
