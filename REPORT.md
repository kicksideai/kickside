<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# Upload reference authorization

Component metadata owners can declare a read-only authorization validator on their existing owned-key registry entry. Registration, metadata assignments, replacements, removals and batched metadata commands invoke it before a write transaction opens. Rejection prevents the request from writing. Existing reservations without a callback keep their owner-only behavior.

Uploads owns `upload_id`. Assigning it requires the acting principal to own the upload or hold READ on its uploads component. Shared original-byte reads also verify a stored reference's core-captured principal. The read examines at most 16 readable components and checks each principal once. Public ownership metadata supplies no authority.

## Validation

Real HTTP regressions cover forged assignments, shared-component writes, replacements, stored references, independent READ and WRITE capabilities, revocation, ownership metadata changes, missing principals and scoped tokens. A combined harness invokes the real workspace file stage with the upload validator installed and verifies shared original-byte reads. General validator tests cover creation, updates, same-value assignments, removal, batched transitions and rejection before any writes. Transaction fault tests cover authorization error propagation.

## Compatibility

Endpoint paths, existing registry identities, contracts, requirements, events and stored shapes stay unchanged. The validator is an optional field on existing metadata-owner declarations. Legitimate stored references retain their captured principal without a migration; no reference kind receives implicit trust when that principal is absent. Live READ revocation removes access through that principal's references. References assigned before validation cannot recover the historical writer from existing data; the read retains its captured-principal check.

Unauthorized upload references now fail at assignment. Missing and unreadable originals and artifacts return the same 404 response; no documented client contract requires different responses. Upload owners, uploads-component READ grants and scoped read tokens retain access. The explicit component-metadata writer runs under the uploading principal; document, record and chat attachment stores use their own authorization paths.

No new table, stored field, retention schedule or migration is introduced. An upload reference uses the existing unique `(component_id, key)` metadata row. Additional steady-state table size is zero at both 10x and 100x load.
