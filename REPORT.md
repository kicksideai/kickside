<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# Data target contract revision

The definable, loadable and readable family is provisional and has no consumers yet. Existing targets use independent READ, WRITE and DELETE bits, with grants unioned across their components and ancestors. Visibility is checked before operation permissions: an unreadable target returns `not_found`, while a visible target lacking the required permission returns `permission_denied`. Loading requires READ and WRITE on every call, including definition and rehearsal paths. Removal requires READ and DELETE. Definition planning requires READ.

Commit and rehearsal ownership assertions compare only the runs that own load-stamped rows. Unstamped rows do not enter an empty-owner assertion. JSON Schema conditionals enforce the documented coercion and retry rules. All three contract files identify the family as provisional.

## Validation

The new access and ownership guards fail before the correction on SQLite and PostgreSQL. Payload guards fail before the coercion and refusal constraints are applied. The complete contract suite passes 678 tests on each engine with Wippy v0.3.59a, and unfiltered CI-style lint passes on both engines. Dependencies resolve fresh through the module lockrefresh target.

Six schema tests load all three contract files and validate all 32 method schemas as Draft 2020-12. They validate example requests, successful responses and refusal responses for all 16 methods, resolve local references, check closed-object required fields, and reject missing fields, extra fields, conflicting scope selectors, invalid retry classifications and coercion declarations. These tests validate contract declarations and payloads; the family has no implementation to exercise.

The coverage suite passes 87 tests. The scenario map and issue-audit checks pass. The original revision's commits remain ancestors of this branch with their authorship intact.

## Compatibility

Every published contract ID and existing method name remains. `definable.remove` is additive. The provisional family has no implementations or callers in the product repositories.

Potentially breaking schema revisions in this change are `target_version` becoming `data_version`; removal of `limits.max_replace_scopes`; required `limits.max_period_in`; required `planned` on successful definition results and `component_id` on successful writes; relaxed existing-target definition inputs; and the expanded storage-type vocabulary. No compatibility layer is added for this unused provisional family.

The access rule changes unreadable existing-target refusals to `not_found`, explicitly requires both READ and WRITE for loading, and rechecks access during a load. Empty ownership assertions permit unstamped rows. Error responses must carry a supported provider-unavailable reason and cannot mark other refusal classes retriable. Bulk-writable type descriptions must declare their coercion; non-bulk-writable types cannot declare one.

No persisted data, endpoint, requirement, event, or installation update procedure changes. No table is written and no migration is required. Additional steady-state storage is zero at both 10x and 100x load.
