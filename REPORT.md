<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# Upload reference authorization

Original-byte reads through a shared component verify both the caller's READ access and the reference's core-captured execution principal. That principal owns the upload or holds live READ on its uploads component. Public ownership metadata supplies no authority.

The component owned-metadata declaration supports reserved keys without validation callbacks. The upload read handler therefore verifies stored references using the existing private context and component ACL APIs. It exposes no private context to the caller.

## Validation

HTTP regressions cover registration, metadata edits, stored ownership edits, shared readers, multiple references, independent READ and WRITE capabilities, revocation, missing principals and upload-scoped tokens on both database engines. Full uploads and component suites pass on SQLite and PostgreSQL with the release runtime. Full harness lint succeeds for both profiles. Focused workspace, knowledge, CRM, upload-ingestion and channel attachment tests pass on both engines.

## Compatibility

Endpoint paths, registry identities, contracts, requirements, events and stored shapes stay unchanged. Existing references retain their core-captured identity without migration. References without a captured principal cannot grant byte access; the explicit component-metadata writer runs under the uploading principal, and no system-created reference kind receives implicit trust. Changes to public owner metadata remain accepted. Live READ revocation removes access through that principal's references.

The change introduces no table writes or retention schedule. Additional steady-state table size is zero at 10x and 100x load.
