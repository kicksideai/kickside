<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# Upload HTTP deduplication response

Builds on and supersedes #397, preserving its commits. `POST /uploads` includes `deduped: true` when identical bytes reuse an upload for the same user. The response keeps the existing UUID and omits the field for a newly created upload. The module reference documents this response contract.

The regression invokes the real `create_upload` handler through the HTTP probe with authenticated user context and real upload admission, storage and persistence. It asserts both successful responses, their component ID, the shared UUID and the optional deduplication field.

## Validation

The regression fails on `origin/main` on SQLite and PostgreSQL because the duplicate response omits `deduped`. It passes with the handler change. All 478 uploads tests pass on SQLite and PostgreSQL. Module lint passes on both profiles with refreshed dependencies and Wippy v0.3.59a. The internal coverage suite, scenario map check and issue audit consistency check pass.

## Compatibility

The only API addition is optional `deduped: true` on duplicate upload responses. Existing success fields, UUIDs, endpoint paths, registry entries, contracts, requirements, events and stored shapes retain their behavior. No migration is required.

The change adds no table or write. Incremental steady-state storage is zero at both 10x and 100x load.
