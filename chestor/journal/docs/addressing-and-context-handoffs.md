# Addressing and context handoffs

The Journal separates human-readable coordinates from durable machine
identity. Agents should not carry a bag of unrelated journal, graph, node,
episode, and event IDs through a long implementation chain.

## Addressing layers

| Form | Example | Meaning | Agent normally retains it? |
|---|---|---|---|
| Cursor handle | `jc_FX4KSSH3696FE` | Globally resolvable journal plus one agent's mutable current graph/node | Yes—this is the normal working handle. |
| Graph coordinate | `architecture/activation-proof` | Human-readable, stable location inside one journal | Only when attaching or linking context. |
| Event identity | `decision:activation:v2` or UUID | Immutable fact, evidence, and idempotency identity | Only when evidence must be cited. |
| External reference | component/file/URI ref | Identity owned outside the Journal | Only at the boundary. |

Generated cursor handles use a typed `jc_` prefix and 64 random bits encoded
with the visually unambiguous Crockford alphabet. Allocation checks existing
handles before returning. Caller-selected mnemonic cursor IDs remain valid;
if the same mnemonic exists in several journals, resolution returns a bounded
candidate list and the caller adds `journal_id` once to disambiguate.

Opening a cursor is the only normal call that needs `journal_id` and an address.
Afterward the same handle works with `JournalContext`, `JournalFact`,
`JournalQuery`, and `JournalGraph`. A focused query defaults to the cursor's
graph and node. Moving the cursor changes what the handle resolves to without
changing the handle itself.

## Explicit context visibility

Hierarchy and semantic search cannot decide which design notes a delegated
agent must see. The cursor therefore owns a bounded `context_refs` list. Each
reference names a graph node and declares one load mode:

- `pointer`: identity, label, kind, and lifecycle only;
- `summary`: the default short preview;
- `full`: compact node attributes as well as the preview.

Each reference may include a reason and `required=true`. A child opened with
`parent_handle` inherits the parent's references and current position, then
adds or overrides its own. `inherit_context=false` is an explicit detached
research boundary. Resume also returns the parent cursor's assignment and
checkpoint, so a new harness can recover why it exists without receiving the
parent's entire transcript.

The resume envelope remains layered and bounded:

1. root-to-current containment chain;
2. explicit attached context at its configured depth;
3. parent assignment/checkpoint for delegated cursors;
4. local incident graph neighborhood;
5. accepted/pending child integration state;
6. non-bookkeeping event delta and truthful continuations.

## Retirement and supersession

Knowledge is not deleted merely because it stopped governing current work.
Set a node status such as `retired`, `rejected`, or `superseded`, retain the
failure/learning summary, and add an explicit `superseded_by` edge. When useful,
also place the replacement coordinate in `attrs.superseded_by`. Attached
historical nodes remain readable and visibly non-current; the replacement is
therefore discoverable without rewriting history.

Facts follow the same rule through lifecycle and `supersedes_event_id`.
Generated summaries and embeddings are projections and never replace the
immutable source identity.

## Handoff pattern

```text
parent = JournalContext(open, journal_id, address, context_refs)
child  = JournalContext(open, parent_handle=parent.handle, address, assignment)

resume = JournalContext(handle=child.handle)   # chain, refs, local context, delta
JournalFact(handle=child.handle, kind=observation, title=..., body=...)
JournalQuery(handle=child.handle, mode=context) # current node defaults automatically
JournalQuery(handle=child.handle, mode=memory, query=...) # journal-wide recall

JournalContext(continuation=resume.next.checkpoint, checkpoint=...)
JournalContext(handle=child.handle, op=integrate, disposition=pending, ...)
JournalContext(handle=parent.handle, op=integrate, disposition=accepted, ...)
closed = JournalContext(handle=child.handle, op=close, expected_revision=...)
JournalContext(handle=closed.return_to.handle) # exact parked parent position
```

Graph edits use the same handle. For a normal operation batch the caller does
not need to resolve the journal, graph, graph revision, or request identity:

```text
write = JournalGraph(handle=child.handle, operation={op=node.add, id=..., ...})
result = JournalQuery(continuation=write.verify)
```

`JournalGraph` resolves the cursor graph, reads its projected revision, creates
an idempotency request ID, and returns the touched addresses plus an executable
verification continuation. The optimistic check is still enforced; omission is
convenience, not last-write-wins. Supply an explicit `expected_revision` and
`request_id` when replaying or coordinating a transaction deliberately.
Use `operation` for one change and `operations` to commit a related batch
atomically. `JournalFact` similarly accepts its common fact fields directly;
the nested `data` object remains available for advanced event payloads.

Continuations are self-routing executable input objects, not prose hints. They
carry the cursor handle (or journal boundary for cursorless reads), so they can
be persisted, delegated to another harness, and passed back as the sole
`continuation` input to `JournalContext` or `JournalQuery`. Explicit fields on
the new call override continuation defaults. This applies to checkpointing,
event deltas, graph pages, temporal pages, search pages, evidence pages, and
request status.

Use graph-local `search`, `semantic`, or `hybrid` to investigate the current
structure. Use `memory` to recall event facts across the journal. Exact events
and graph history remain authority; embeddings are an associative discovery
projection and may be unavailable or rebuilding.

The parent cursor is never moved when the child opens. This makes pause/divert/
return reliable for a single agent as well as delegation: the child may represent
a task, experiment, audit, paper, or any other node, while `return_to` is merely
the continuation address supplied when that branch closes.

Cursor handles are continuity, not authority. The optional strict work trait
still owns task leases, fencing, gates, and verifier receipts when those
semantics are needed.
