# Agent memory literature → Journal trait

This note records the design evidence used to refine the Journal agent trait.
It is a design input, not a claim that every cited system maps directly onto
KickSide.

## Evidence

- [LongMemEval](https://arxiv.org/abs/2410.10813) separates indexing,
  retrieval, and reading. Its strongest practical findings are finer memory
  granularity, expanded retrieval keys, explicit temporal query expansion,
  structured reading, and abstention when evidence is absent.
- [LongMemEval-V2](https://arxiv.org/abs/2605.12493) evaluates memory as context
  gathering for downstream agents. Its AgentRunbook baseline separates raw
  observations, state-transition events, and reusable strategy/gotcha notes,
  then queries only relevant streams.
- [A-MEM](https://arxiv.org/abs/2502.12110) shows that contextual note
  attributes, meaningful links, and memory evolution improve multi-hop and
  temporal recall. Evolution must not destroy old evidence in an auditable
  system.
- [RAPTOR](https://arxiv.org/abs/2401.18059) retrieves across multiple levels
  of abstraction while retaining leaves. Summaries help global questions but
  cannot replace granular source evidence.
- [GraphRAG](https://arxiv.org/abs/2404.16130) distinguishes local retrieval
  from global sensemaking and uses hierarchical community summaries with
  drill-down. The important adaptation here is query intent and multiscale
  evidence, not an entity-only ontology.
- [HaluMem](https://arxiv.org/abs/2511.03506) localizes persistent memory
  failures to extraction, updating, and answering. Incorrect modification,
  omission, and version conflict are first-class failure modes; end-to-end QA
  alone cannot diagnose them.
- [MemoryAgentBench](https://arxiv.org/abs/2507.05257) adds long-range
  understanding, test-time learning, and selective forgetting to retrieval
  accuracy. Journal models forgetting as lifecycle/retention while immutable
  actions remain auditable.
- [SWE-agent](https://arxiv.org/abs/2405.15793) finds that agent interfaces
  should expose a small set of simple, compact actions, concise state feedback,
  and guardrails that accelerate recovery.
- [MemGPT](https://arxiv.org/abs/2310.08560) motivates explicit working- and
  archival-memory tiers. Journal's cursor is the working position; graph,
  immutable events, summaries, and embeddings are durable tiers.

## Resulting trait rules

1. Resume through one compact cursor handle; do not make agents carry journal,
   graph, node, episode, and lease identities when the handle can resolve them.
2. Retrieve by intent: current chain, local hybrid, journal-wide memory,
   temporal change, or whole-branch sensemaking. Start compact and drill down.
3. Add temporal bounds when state can change. Keyword and semantic evidence are
   rank-fused, rather than concatenating one entire result class before another.
4. Keep observations/evidence distinct from findings and decisions. Mark
   inference with confidence and preserve subjects, references, and provenance.
5. Supersede instead of overwrite. Preserve failed approaches and conflicts;
   derived summaries and links must stay traceable to evidence.
6. Abstain or keep a claim unresolved when evidence is missing, stale,
   contradictory, or only inferred.
7. Checkpoints are recovery packets: completed work, active claims, blockers,
   unverified assumptions, and next proof actions—not raw transcript dumps.
8. Delegation inherits a bounded context packet and explicit close
   requirements. Child integration is recorded and reviewable.
9. Keep leased task governance optional. The default memory trait remains
   ontology-neutral and exposes four tools; the work adapter adds only the two
   strict task tools not already present.

## Evaluation obligations

- Recall: exact, associative, temporal, multi-hop, multiscale, and unknown
  premise/abstention cases.
- Updates: coverage, preservation, consistency, supersession, and omission.
- Agent ACI: schema-token budget, bounded responses, self-routing continuation,
  malformed-call recovery, and no need to clone identifiers after expiry.
- Scale: large event volumes, long node bodies, many graphs, concurrent cursors,
  and deterministic projection replay.
