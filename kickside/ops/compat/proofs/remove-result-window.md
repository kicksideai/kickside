# Result-window retirement

Owner approval: `2026-10-14 owner: remove ReadToolResult/result window`.

The owner orders retirement of the five agents, two contract and four uploads
identities and the explicitly ordered `kickside.mcp_client:result_bounds` helper
recorded in `ops/compat/transitions.json`. The published baselines are
agents 0.1.63, contract 0.2.4, uploads 0.1.71 and mcp-client 0.1.15.
The original eleven-item inventory omits the published MCP preview helper; the
full removal retires twelve identities. Every caller in the removal batch
returns native tool results; list and content reads expose their native pages.
The independent model-aware checkpoint policy remains.

Local-mode delivery supersedes the PR procedure. The removing change lives on
`lane/remove-result-window-resume` in the Kickside repository and lands through
`land-merge.sh`; no PR or publication occurs. Commit receipts accompany the final
lane report. UI Studio keeps its own committed caller migration without publication.

Existing installations require the owner's manual configuration cleanup before
updating: remove retired direct tool/trait grants and keyed options while preserving
component restrictions, unrelated grants, checkpoint configuration, stored messages
and existing Uploads files. No engine migration rewrites these references.

The published-registry smoke guard calls the existing `apply_transitions` comparator.
Its behavioral tests prove an unrecorded removal fails, this exact recorded finding
passes, and a stale declaration fails. No second transition path exists.

## Local removing commits

- `components`: removing commit `7e43be393e0de99383839f8c935e74f0cc5f4059`, local merge `8dbe7140d88d3ccd6341850a5372bc21d62eb169`.
- `crm`: removing commit `5f35415238006e32f49395e43b70ed53c456b2d8`, local merge `cda945bcf4ced8908942419791920864b48505a6`.
- `chestor`: removing commit `20eeb37af170b47725a4fa6396aba28ff0c20e9b`, local merge `ae2b0b0f816b1e771394792bde02c06aeb265253`.
- `providers`: removing commit `d5058daf48f4cc69375fd24c48291b93aef37257`, local merge `c791c2ff0a52ea1380b113f74208c30053297f71`.
- `kickside`: removing commit `8ec9684b890da9cdc840b214232fab26258b05d0`, local merge `e491b3fb3512a28ff5b7e1030b84ef8a38f315f0`.

Each local merge uses the shared land-merge.sh in LOCAL MODE. No remote write or publication occurs. Registry retirements live in the Kickside and providers removing commits; other repositories migrate callers and native tools in the same batch.
