# Flow Points v1 — final implementation report

## Scope and placement

Flow Points now has one home: `platform/workflows/src/flow_points.lua`, adjacent to
the existing `kickside.runnable:launch` seam. The former `platform/flowpoints`
package is deleted. No app lockfile wiring was added or changed.

The only executable route is:

```text
declared flow.point -> workflows flow_points.resolve/invoke
                    -> kickside.runnable:launch
                    -> workflow runner / durable run
```

No SDK or helper builds a runnable at invocation time. Points accept declared,
exact workflow artifacts only. Function and DAG defaults are refused until their
catalogs can expose and execute a revision-addressed immutable digest.

## Blocker acceptance

1. **One resolver/store:** `kickside.workflows:flow_points` owns catalog parsing,
   binding rows, resolution, invocation and await; the old package is removed and
   the runnable `flow_point` adapter delegates to `invoke` rather than resolving.
2. **One declaration grammar:** point interfaces require `input_schema`,
   `output_schema`, and `error_schema`; aliases are rejected.
3. **Authority enforced:** every list/bind/restore checks the component instance
   ownership (`owner_impl_id`) and component ACL. Dispatch checks ownership again;
   caller mode captures an identity, while component-owner mode persists a frozen
   owner identity, live-reconstructs it, and fails closed if ownership changed.
4. **Envelope at the final seam:** bind and every dispatch re-check schema
   variance, target kind, durability/suspension/effect declaration, scope ceiling,
   declared limits, reviewed-target policy and current target availability.
5. **Truthful exact artifacts:** workflow target identity is a canonical SHA-256
   snapshot of source/interface. Stored declaration, interface, capability and
   artifact digests must all match at dispatch; unaddressable function/DAG kinds
   are rejected.
6. **Race-safe lineage and bounded await:** binding writes require
   `expected_revision` and use a CAS predicate; consumer projection is performed
   on the same database connection. UUID invocation IDs are persisted before
   launch with component, point, binding, target, digest snapshot and authority.
   Await re-reads that durable row and uses global/workspace/point admission caps.
7. **Deletion cleanup:** the generic component teardown optionally invokes the
   flow-point cleanup contract before unregistering. It removes binding/revision
   and consumer rows, invalidates cache, and tombstones historical invocations.

## Stage 3: customize/clone and REST

Workflow defaults use the existing immutable `definitions.export` plus
`definitions_api.import_portable` path, which creates a distinct unpublished
draft. No default is imperatively lowered or executed by the customization API.

Component-hosted REST endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/components/{component_id}/flow-points` | component-owned catalog and action state |
| PUT | `/components/{component_id}/flow-points/{point_id}/binding` | exact bind; body includes `target`, optional frozen `mappings`, and `expected_revision` |
| DELETE | `/components/{component_id}/flow-points/{point_id}/binding` | **Restore default**; body requires `expected_revision` |
| POST | `/components/{component_id}/flow-points/{point_id}/customize` | export/import clone of the exact default workflow version |

## FE contract

`GET` returns only points owned by that component implementation. Every row has
`state` (`default`, `customized`, or `incompatible`), an explicit `error` when
resolution fails, the declared default, optional current binding, and backend
computed `actions`.

- Workflow default: display **Customize** and call `POST .../customize`.
- Restore is always **Restore default**, requires the row's current binding
  revision, and states that it affects future invocations only.
- Function/DAG defaults cannot be declared in v1; they are not falsely presented
  as editable workflow code.
- A 409 with `binding_revision_conflict` means reload the row before retrying.

## Verification

- Focused default -> bind -> stale CAS rejection -> restore -> envelope reject -> async descriptor -> bounded await: 4 tests (including setup).
- All workflow chunks: 295 tests passed (the final focused harness adds one case to the prior chunk total).
- All automation chunks: 360 tests passed.
- `wippy lint` still reports pre-existing workflow type diagnostics outside this
  slice; no new flow-point diagnostic was present after the runnable adapter type
  fix.

The live application on 8085 was not restarted or mutated.
