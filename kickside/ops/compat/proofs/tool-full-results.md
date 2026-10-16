# Full tool results

Owner approval: `2026-10-15 owner: tools return full structured results`.

ReadJournal returns complete stored task and fact records through one read
path. Text is never shortened, so the compact-only `fact_body_limit_bytes`
output property and the `*_truncated` markers no longer exist. The authority
view returns each task title as stored. The `detail` lens selector and the
compact `facts_detail` marker are removed; see
`tool-typed-failures-and-full-records.md`.

Proof: chestor journal native test `backend_e2e_test` case "returns strict
recovery reads as full stored records" asserts that the branch fact body and
task title equal the stored records and that the authority title equals the
stored title.
