# Buying-committee map (coverage req 26)

`kickside/scratchpad/gtm/final_coverage.md` req 26: auto-build a buying-committee map with roles and likely objections per deal. CRM supports associations; no committee workflow exists.

## Compose
- Signals already flowing: call attendees (fireflies extraction, precall 621d3df), calendar meeting attendees (calendar composition 0482d51), contacts resolve (idempotent identity), CRM person↔company↔opportunity associations, job titles.
- Committee model: per-opportunity map — members (resolved contacts) with inferred buying role (champion/economic/technical/user/blocker — standard MEDDIC-ish vocabulary), engagement level (from interaction timeline), inferred objections (from call extractions per person), and gaps (roles with nobody identified).
- Build path: declared workflow triggered on new interaction events for a deal (call processed, meeting held) OR manual "Map the committee" action; incremental — updates the existing map, never rebuilds from scratch losing human edits (human role assignments are protected fields via the field policy).
- Inference: deterministic first (title→role heuristics, attendance→engagement), one LLM pass for role/objection refinement over the evidence; LLM-absent = heuristic-only map flagged needs-attention.
- Surface: a committee panel on the deal (CRM record view contribution) — calm: members, role chips, engagement, one gap line; proposed role changes go through review like other proposed field updates.
- Home: deal_intelligence module (harness ready). Storage: committee as component-owned read model or CRM sub-records — pick what the CRM association model already supports best; do NOT invent a parallel entity store (crm is the substrate).
- Optional installable "New deal interactions → committee map refresh" under Deal intelligence; binding_spec UNDER meta.

## Laws
Declarative; ~300-line files; no parallel implementations; TDD (role heuristics, incremental merge preserving human edits, gap detection, fallback); suites green; present-tense comments, no emoji; commit scoped, do NOT push, exclude node_modules. VM gotcha: no `type(x)=="table" and x[k] or nil` in select-bounded vararg loops. App :8085; restart detached only if registry changed; verify installables in GET /api/v1/automation-catalog.

Report: what shipped, commits, test counts, catalog verification.
