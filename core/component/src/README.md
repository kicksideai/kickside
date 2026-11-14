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

## Authority checks (SPEC)

`validate_identity_authorizer_admin` and `validate_principal_access` check the
supplied typed principal's effective grants, including supplied live user
groups. `validate_principal_access` also applies the supplied placement filter.
Only these two validators omit the calling frame's implementation registry
visibility when answering the supplied principal's authority. Every other access
check requires caller implementation visibility alongside component grants and
the actor's placement filter, including prepared execution-identity writes whose
supplied subjects and prefixes were captured from the authenticated operator.
Supplying a subject snapshot does not waive implementation visibility. Trusted
callers own principal resolution and admission; an authority result grants no
ambient registry access.

## Kind mutation admission (SPEC)

A component kind binding declares `meta.mutation: open` or `closed`. An absent
value means open, preserving creation and updates for installed kinds without a
migration. Closed kinds require `component.kind.create` for creation and
`component.kind.update` for context and public metadata writes, with the exact
implementation binding ID as the permission resource. Placement uses ordinary
Component access and placement rules, independent of kind mutation admission.
This includes moving or reordering a closed-kind component, rewriting descendant
paths when an ancestor moves, and re-rooting children on `reparent_root` deletion.
Placement parents and directly moved components cannot lie under an accepted
delete mark, including while re-root pages retain their direct parent continuation
pointer. Reordering without a path change does not move descendants. Import
shares registration's creation check. Owning modules grant
these exact actions/resources only to their admission function entries through
`security.policies`; member scopes receive no kind mutation grants from Component.
The mode is read through Component's own declaration scope; its mutation,
deletion worker and retention entries hold an exact `funcs.call` grant on the private
`kickside.component:kind_declaration` reader. Admission does not depend on member
policies, and these attached grants do not let callers invoke the reader from
their own code. Caller registry visibility does not select the mode. Admission
then evaluates the exact kind grant in the requesting frame. A missing kind declaration and an absent mode remain open.
An invalid mode refuses mutation. Module-owned metadata floors, execution identity,
sharing, and internal declaration commands retain their separate authority.
`closed` governs create, context and public metadata.
Deletion remains governed by DELETE access and the kind's teardown.
Kind admission has no actor-ID exemption. Framework creation (including verified
declaration installs), imports and public updates of closed kinds require the
same exact kind grant in their calling frame. Maintenance creation additionally
requires exact-kind `component.own.maintenance`; that ownership capability does
not grant kind admission. Adoption changes ownership and execution identity under
`component.adopt`, without changing kind-governed data. A kind-mode or role change
during an in-flight request is a known operator race.
Initial public metadata, including a verified creation receipt's `public_meta`
(even an empty object), uses create admission. Receipt fields overlay the other
initial metadata; later public metadata changes require update admission.

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

Automation's verified `apply_declaration` receipt may supply an optional
`expected_revision` for the Component context subject. The declaration writer
checks it under the component row lock, in the same transaction as declaration,
state, public metadata and fence updates. A stale revision returns the native
nonretryable `CONFLICT`; an already-applied command replays its receipt before
this check. Omitting the field preserves unconditional declaration writes.
