# kickside/component

Component service and registry for user-owned resources (kickside fork).

## Features

- Component registration and discovery
- Access control and ownership validation (user + group subjects)
- Hierarchy/placement (lexorank ordering + materialized/ltree paths)
- Secure component access library

Trusted owners may call `kickside.component.system:exists` after their own
authorization checks. It reads Component's configured database and returns only
a boolean; it exposes no metadata, context or database handle. Its private
reader grants no authority when called directly. Public component queries and
their ACL checks keep using the existing component service.

Backed by the `kickside_components`, `kickside_component_meta`, and
`kickside_component_access` tables. Depends on the `kickside.contract:*` base
contracts (`component`, `deletable`).

## Owner metadata floors

A module reserves a public read-model key with a `registry.entry` whose
`meta.type` is `kickside.component.owned_meta_key` and whose `meta.key` is the
exact field name. Without a validator, public registration, metadata writes and
removal reject that key; unreserved fields retain their behavior.

An owner can add `validator: namespace:function_id` to that declaration. Public
registration, `set_meta` and batched `SET_META` invoke it before opening the
write transaction, alongside request authorization. It receives
`{component_id, key, principal, old_value, new_value}` and returns `true` or an
error. The principal comes from the acting security identity; maintenance
actors have no principal. Values use the stored string encoding; initial
creation has no old value and removal has no new value. Assignments, including
same-value writes, replacements and removals all validate. Batched changes
receive the values resulting from earlier commands in that request. A refusal
prevents the entire request from writing.

Validators perform read-only request authorization. The old value is a
pre-write snapshot, not a transactional precondition. Callbacks run after the
read connection is released, so they can read the same database on SQLite.
Trusted persistence callers authorize before opening their transaction; raw
persistence operations do not invoke callbacks. Reservations contain no host
resources or caller identities.

Trusted owners use `component_ops.raise_meta_floor(tx, component_id, key, value)`
in their transaction after checking component access. The operation locks the
component before its metadata, keeps the maximum finite nonnegative integer,
and retains existing row identity and creation time. It reports corrupt stored
values instead of replacing them. It adds no table, requirement or migration.

## Deleting placement dependents

`component.delete_children(parent_id)` requires DELETE access to the parent and
preflights DELETE access to every placement descendant before changing any
component. It deletes descendants children-first through the normal component
service, including each kind's deletable teardown. It observes existing deletion
jobs within a 30-second request deadline that starts before traversal and is
checked before each read and delete. Iterative traversal handles at most 1,000
descendants per request; larger trees return a conflict asking to delete in parts
before any deletion. An access refusal, teardown failure or incomplete deletion
returns a conflict with `deleted_count`. It names a blocker only when the caller
can read it; hidden access blockers return a generic conflict without an id.
The parent remains untouched; successfully deleted children stay deleted if
later cleanup fails. Pending or running jobs retain historical errors without
stopping the wait; terminal dead or cancelled jobs stop deletion.
No child is reparented. Callers delete the parent only after this function succeeds.
