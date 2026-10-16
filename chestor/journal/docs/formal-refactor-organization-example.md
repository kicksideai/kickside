# Organizing a formal engine refactor

Flash cards are useful renderings of small records. They are not the structure of a
multi-month refactor. The journal stores a low-vocabulary graph; card, outline,
document, force, comparison, and timeline views are projections over the same nodes,
edges, events, references, and agent positions.

An abstract-interpretation refactor needs at least four simultaneously visible
layers:

1. **Project** — mission, non-negotiable invariants, acceptance gates, and the
   current integration frontier.
2. **Workstream** — semantic ownership, typed binding, reusable transformers,
   production cutover, and verification.
3. **Work unit** — one bounded design or implementation boundary, such as Rule and
   activation binding.
4. **Proof or experiment** — a precise obligation, candidate design, counterexample,
   audit observation, test receipt, or failed approach.

These are conventions expressed with `kind`, `status`, attributes, hierarchy, and
typed edges. They are not hard-coded task tables. The same base graph can organize
research, specifications, incidents, scientific arguments, or a body of knowledge.

## What must remain on the chain

Every agent position should be recoverable as an address plus a bounded context
chain. For this example, opening the activation binding position should recover:

- the project mission and corpus acceptance gate;
- the single-owner and cold/hot invariants that govern the branch;
- definitions of Program, Flow, Link, Schema, Binding, and equation WTO;
- the parent workstream and current work unit;
- open proof obligations and contradictions;
- evaluated alternatives, including why rejected designs failed;
- the selected successor and the evidence still needed to trust it;
- the agent's purpose, next action, and exit condition.

This is an agent cursor, not merely a bookmark. Two agents can point into different
branches of the same graph, carry different local assumptions, and still share the
same governing chain.

## Detached design work

When the answer is not yet known, alternatives should be explored in a detached
graph with:

- a research question;
- constraints and definitions imported by reference;
- expected outputs and closure criteria;
- candidate designs and their evidence;
- explicit contradictions and successor relationships;
- an integration receipt that names the destination graph and node.

The detached graph is allowed to be messy. It cannot silently mutate the canonical
project map. Its selected result returns through an explicit integration edge and a
receipt that preserves the rejected alternatives' distilled learning.

## Child-agent contract

A child agent should receive a small, mechanically assembled packet:

```text
address       journal / graph / node
chain         ancestors and governing cross-links
vocabulary    definitions actually referenced by this branch
constraints   invariants and known contradictions
inputs        source references and accepted evidence
assignment    the bounded question or mutation authority
exit proof    observable conditions required to report completion
return path   parent cursor and integration destination
```

On return, the parent should not accept only prose. The child records observations,
claims, evidence, changed references, unresolved contradictions, and an exit receipt.
This makes interruption, compaction, agent replacement, and multi-day resumption
recoverable from the graph rather than from conversational memory.

## Folding without forgetting

A failed approach remains a normal node or branch. Folding changes presentation, not
retention. The folded summary must say what was attempted, why it failed, what was
learned, and which candidate superseded it. Search, timeline, provenance, and force
relations still include it. This prevents later agents from repeating locally
rational failures after the original context has compacted away.

The local scenario in `local/scenarios/` instantiates this model for the Lean abstract
interpretation refactor and is intended to exercise the real authenticated Journal
API and all primary UI lenses.
