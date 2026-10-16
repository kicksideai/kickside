# Self Reflection direct namespace tree

Owner approval: `2026-10-14 owner: approved DECISIONS.md section B`.

The `kickside.self_reflection.traits:self_reflection_tool` registry id and handler remain. Its optional `depth` input retires because the public tree contains only immediate namespace children at every accepted depth. The implementation counts those children directly and keeps the existing paged response fields and ordering. It does not build deeper nodes or summarize entries that the response discards.

`platform/self-reflection/test/src/self_reflection_test.lua` checks the unchanged direct tree, counts and names, and asserts that the declared tool schema omits `depth`. The runtime harness runs on SQLite and Postgres. No event, persisted record, identifier, requirement or endpoint changes; no manual installation data conversion applies.
