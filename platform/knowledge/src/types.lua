-- Result shapes and invariant vocabulary for the kickside.knowledge control
-- plane. Documents each method's output at the contract surface. Reference
-- cross-module via the import alias (e.g. kb_types.CreateResult).

local M = {}

-- A persisted rollback step: the contract method to call and its args, replayed
-- on teardown.
type RollbackStep = { method: string, args: table }

-- Public component row returned by kickside.component:component_service list
-- methods for KB components. Store-specific engine state is intentionally not
-- part of this shape; callers resolve it through the engine store contract.
type ComponentRow = {
    component_id: string,
    impl_id: string,
    created_at: string,
    updated_at: string,
    meta: { [string]: string }?,
    parent_id: string?,
    position: string?,
    path: string?,
}

-- knowledge_bases.create result. kb_type is one of kb_types.KB_TYPE values.
type CreateResult = {
    component_id: string,
    kb_type: string,
    name: string?,
    rollback: RollbackStep,
}

-- knowledge_bases.upsert envelope. The upserted KB record is
-- the public per-component row.
type UpsertResult = { kb: ComponentRow, created: boolean, rollback: RollbackStep? }

-- Bare component handle returned by update/delete.
type ComponentRef = { component_id: string, deleted: boolean?, in_progress: boolean?, status: string?,
    cleanup_pending: boolean?, kind: string?, retryable: boolean?, details: any?, discarded: any? }

M.RollbackStep = RollbackStep
M.ComponentRow = ComponentRow
M.CreateResult = CreateResult
M.UpsertResult = UpsertResult
M.ComponentRef = ComponentRef

M.COMPONENT_CLASS = "knowledge_base"

-- KB engine store LIFECYCLE contract knowledge's control plane resolves to reach
-- the per-component store of whichever engine backs a KB. Model-agnostic: only the
-- store lifecycle (create/get/update/delete) crosses this seam. Node/edge/embedding/
-- graph state is the engine's own concern. Engine impl/embed/query/store binding ids
-- are discovered through the kb_engine registry, never hardcoded here.
M.KB_STORE_LIFECYCLE_CONTRACT = "kickside.knowledge:kb_store_lifecycle"

-- KB type discriminator stored in kickside_component_meta.kb_type.
M.KB_TYPE = { DOCUMENT = "document", WIKI = "wiki" }

-- Registry ids for the injection agent's content tools.
M.TOOL_SELECT_KB = "kickside.knowledge.traits.kb_ingest:select_kb"
M.TOOL_EMBED_CONTENT = "kickside.knowledge.traits.kb_ingest:embed_content"
M.TOOL_FETCH_URL = "kickside.knowledge.traits.kb_ingest:fetch_url"

return M
