// The create sequence for a new workflow, made idempotent across retries.
//
// A workflow is persisted in two steps: `createWorkflow` mints the component (server-side,
// immediately), then `applyScaffold` writes its Start/Finish/Error boundary. Because the
// component exists the instant step one returns, a failure in step two — or an abandon
// before it runs — would strand an empty, untitled draft; a naive retry would mint a
// second one. This flow holds the created id and reuses it on retry, so a scaffold failure
// is recoverable without accumulating orphans, and `abandon` sweeps a draft the
// user walked away from.

export interface CreateFlowDeps {
  createWorkflow(title: string, parentId?: string): Promise<string>
  applyScaffold(id: string): Promise<void>
  setLabels(id: string, labels: string[]): Promise<void>
  deleteWorkflow(id: string): Promise<void>
}

export class WorkflowCreateFlow {
  private draft = ''
  constructor(private deps: CreateFlowDeps) {}

  // The id of a workflow created but not yet fully scaffolded — non-empty only between a
  // failed create() and its retry or abandon().
  get pendingDraftId(): string {
    return this.draft
  }

  // Create (or reuse a prior draft), scaffold, then apply an optional label. On any failure
  // before scaffolding completes, the draft id is retained so the next call reuses it rather
  // than minting a second workflow. A label failure is soft: the workflow still opens.
  async create(title: string, label: string, parentId?: string): Promise<string> {
    if (!this.draft) this.draft = await this.deps.createWorkflow(title, parentId)
    await this.deps.applyScaffold(this.draft)
    const trimmed = label.trim()
    if (trimmed) {
      try {
        await this.deps.setLabels(this.draft, [trimmed])
      } catch {
        /* opened regardless — a label hiccup never blocks the new workflow */
      }
    }
    const id = this.draft
    this.draft = ''
    return id
  }

  // Best-effort teardown of a draft that was created but never scaffolded (the user closed
  // the dialog after a failed create). Clearing the id first means a delete failure leaves
  // nothing pending to retry — the row can still be removed from the list later.
  async abandon(): Promise<void> {
    if (!this.draft) return
    const id = this.draft
    this.draft = ''
    try {
      await this.deps.deleteWorkflow(id)
    } catch {
      /* leave it; the list's per-row delete is the fallback sweep */
    }
  }
}
