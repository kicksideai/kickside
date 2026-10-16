# Rowboat comparison — 2026-08-14

Studied repository: [rowboatlabs/rowboat](https://github.com/rowboatlabs/rowboat),
commit `6219c48f943c`.

## What Rowboat gets right

- Its memory is transparent and portable: local Markdown, Obsidian-style links,
  and user-editable notes rather than opaque model state.
- Source ingestion is incremental and crash-tolerant at the file boundary using
  mtime plus SHA-256 state.
- A daily curation pass collapses old activity, promotes recurring facts,
  retires stale items, and commits the rewrite to version history.
- Owner identity is injected explicitly rather than guessed from documents.
- Sub-agent execution has a durable parent-to-child turn link and keeps the
  child's intermediate reads out of the parent's context.

Primary implementation references:

- [knowledge graph README](https://github.com/rowboatlabs/rowboat/blob/6219c48f943c/apps/x/packages/core/src/knowledge/README.md)
- [spawn-agent implementation](https://github.com/rowboatlabs/rowboat/blob/6219c48f943c/apps/x/packages/core/src/runtime/assembly/spawn-agent.ts)
- [copilot/sub-agent instructions](https://github.com/rowboatlabs/rowboat/blob/6219c48f943c/apps/x/packages/core/src/runtime/assembly/copilot/instructions.ts)

## Why it is not the target architecture

The current `spawn-agent` contract says the child begins with no other context,
so the parent must put all facts, constraints, and output requirements into one
self-contained task. A child cannot spawn another child. This is adequate for
independent research compression but does not preserve a weeks-long formal
design branch, required governing notes, exact cursor position, proof gates, or
an evidence-bounded return protocol.

Rowboat's visible Markdown and gardener are therefore complementary ideas, not
a replacement for Journal. Journal should borrow the editable living-summary
experience and a packaged long-horizon gardening policy. Journal's durable
cursor, scoped authority coordinate, explicit required context, immutable event
history, source-range integration receipt, temporal/semantic recall, and
optional proof protocol address the deeper multi-agent project problem.

## Decisions applied to Journal

1. Keep exact event history authoritative while allowing generated summaries
   and graph organization to remain editable projections.
2. Keep owner/actor identity frozen on background maintenance jobs.
3. Preserve failed and stale material with lifecycle and successor links rather
   than cleaning it out invisibly.
4. Remove task bias from the default graph maintainer; ordinary nodes remain
   ontology-neutral.
5. Treat automatic external-harness cursor attachment and a packaged temporal
   gardener as explicit remaining work.

