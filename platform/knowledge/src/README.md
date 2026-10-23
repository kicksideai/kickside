# kickside/knowledge

Knowledge bases for the KickSide engine — KB registry, the document/graph
engine contract, ingestion/injection workers, concept-graph enrichment, and a
user-facing CRUD API.

## What it owns

- **Contracts** (`kickside.knowledge:*`)
  - `knowledge_bases` — the global registry that creates/finds/lists/deletes
    KBs as components and manages their feed sources, with rollback metadata on
    reversible operations.
- **Registry** — the canonical binding for `knowledge_bases`.
- **Lifecycle ownership** — every KB deletion goes through `knowledge_bases`,
  which tears down each engine store before removing the component. Higher-level
  packages may reference a KB, but they do not own or intercept its lifecycle.
- **Engine seam** — the model-agnostic `kb_store_lifecycle` contract that the
  knowledge control plane uses to create/read/update/delete a KB engine's
  per-component store row. Node/edge/embedding/summary/graph operations never
  cross this seam — they are the engine's own internal concern (kb10's
  `node_store`). kb10 owns the `kb10_*` schema and binds the lifecycle contract.
- **Workers** — ingestion/injection (`injection`). Concept-graph enrichment,
  digest, and node/graph reading belong to the KB engine.
- **Agent surface** — KB memory recall, query/ingest tools, a Knowledge Manager
  trait for engine discovery and KB lifecycle, and a `wippy.agent:memory`
  binding (`agent`, `traits`).
  The engine-neutral KB Reader uses QueryKB to return compact ranked passages,
  then re-reads a selected passage in digest-checked UTF-8 content pages. The
  engine's chunk policy owns the evidence; selected pages retain line breaks,
  tables, and attribute/value pairs.
  The Knowledge Manager tool is available through that trait in agent chat. It
  intentionally declares no MCP scopes, so Keeper's strict MCP dispatcher does
  not expose it to non-root MCP sessions.
- **HTTP API** — list/create/get/update/delete KBs, share + list access, ingest
  content/url, delete content by external identity, upload tokens, and search.

## Authorization

Handlers perform **no authentication or coarse authorization**. The host mounts
the endpoints on a router with `token_auth` + `endpoint_firewall`; the firewall
enforces the endpoint capability and returns 401/403. In-code checks use the
runtime primitives only: `component.validate_access(id, component.ACCESS.*)` for
per-KB domain access, and the published `kickside.users.persist:user_repo` seam
for the share user-existence check. The access-listing endpoint reads
`component_access` directly via `kickside.component.persist:component_reader`.

## Dependencies

- `kickside/component` — KBs are components; lifecycle, meta, access context, and
  the component reader all flow through `kickside.component:*`.
- `kickside/uploads` — document ingestion + upload tokens.
- `wippy/dataflow` — injection + enrichment dataflows.
- `wippy/agent`, `wippy/llm` — agent context/memory binding and embedding +
  extraction models.
- `kickside/contract` — the `embeddable` / `queryable` / `deletable` /
  `content_provider` contracts the KB provider bindings implement.

The module persists KBs as components through `kickside.component`; engine-owned
storage remains behind each engine's contracts. Its HTTP endpoints attach to the
required `api_router`, which must enforce auth + endpoint_firewall.

## Adding a KB engine

Add one `registry.entry` with `meta.type = kickside.kb_engine` per public
`kb_type`. The entry is the routing contract: declare `impl_id`,
`query_binding`, `store_contract` and `store_binding` (the binding of the store
contract that serves this engine's rows; empty uses the contract's default
binding), UI tags, stats labels, and default config there. The knowledge control plane resolves
create, read/list, query, delete, and source projection from that descriptor
instead of branching on engine names.

Engines that support durable content ingestion declare source projections in
the descriptor. Those workers materialize canonical KB content events into the
engine’s storage. Public content writes go through the KB-owned thread;
source materialization does not add a public store-mutation contract.

Ask uses only the configured `analysis_model`; document summarization has its own
model. With no analysis model, Ask returns ranked passages without generation.
The Ask response contains `success`, `query`, `answer`, `results`, and `count`.
`results` contains the ranked source passages, including their IDs and metadata.
Generated synthesis answers cite these passages with one-based references such
as `[1]`; the reference identifies `results[0]` in the JSON response. The API
does not declare a separate top-level `citations` field.
An agentic or synthesis error is returned to the caller; an agentic failure does
not invoke a second answering driver. Configuration reads and retrieval errors
are propagated before generation.
