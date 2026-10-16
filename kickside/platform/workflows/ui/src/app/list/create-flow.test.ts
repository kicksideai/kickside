import { describe, expect, it, vi } from 'vitest'
import { WorkflowCreateFlow, type CreateFlowDeps } from './create-flow'

// The create sequence must be idempotent across a failed scaffold: `createWorkflow` persists
// the component immediately, so a naive retry would mint a second empty untitled draft. These
// prove the flow reuses the first draft on retry and sweeps a draft the user abandons — the
// root fix for the "multiple empty/untitled drafts" the list accumulated.

function makeDeps(over: Partial<CreateFlowDeps> = {}): { deps: CreateFlowDeps; calls: Record<string, number> } {
  const calls = { create: 0, scaffold: 0, labels: 0, delete: 0 }
  const deps: CreateFlowDeps = {
    createWorkflow: vi.fn(async () => { calls.create++; return `wf_${calls.create}` }),
    applyScaffold: vi.fn(async () => { calls.scaffold++ }),
    setLabels: vi.fn(async () => { calls.labels++ }),
    deleteWorkflow: vi.fn(async () => { calls.delete++ }),
    ...over,
  }
  return { deps, calls }
}

describe('WorkflowCreateFlow', () => {
  it('creates once, scaffolds, and returns the id', async () => {
    const { deps, calls } = makeDeps()
    const flow = new WorkflowCreateFlow(deps)
    const id = await flow.create('Lead router', '')
    expect(id).toBe('wf_1')
    expect(calls.create).toBe(1)
    expect(calls.scaffold).toBe(1)
    expect(flow.pendingDraftId).toBe('')
  })

  it('applies a label after scaffolding when one is given', async () => {
    const { deps, calls } = makeDeps()
    const flow = new WorkflowCreateFlow(deps)
    await flow.create('Lead router', '  sales  ')
    expect(deps.setLabels).toHaveBeenCalledWith('wf_1', ['sales'])
    expect(calls.labels).toBe(1)
  })

  it('skips labels when the label is blank', async () => {
    const { deps, calls } = makeDeps()
    const flow = new WorkflowCreateFlow(deps)
    await flow.create('Lead router', '   ')
    expect(calls.labels).toBe(0)
  })

  it('still opens the workflow when the label call fails', async () => {
    const { deps } = makeDeps({ setLabels: vi.fn(async () => { throw new Error('label service down') }) })
    const flow = new WorkflowCreateFlow(deps)
    const id = await flow.create('Lead router', 'sales')
    expect(id).toBe('wf_1')
    expect(flow.pendingDraftId).toBe('')
  })

  it('reuses the same draft on retry after a scaffold failure — never a second create', async () => {
    let failNext = true
    const { deps, calls } = makeDeps({
      applyScaffold: vi.fn(async () => {
        calls.scaffold++
        if (failNext) { failNext = false; throw new Error('apply failed') }
      }),
    })
    const flow = new WorkflowCreateFlow(deps)

    await expect(flow.create('Lead router', '')).rejects.toThrow('apply failed')
    // The draft was created but not scaffolded — it is retained for the retry.
    expect(calls.create).toBe(1)
    expect(flow.pendingDraftId).toBe('wf_1')

    const id = await flow.create('Lead router', '')
    expect(id).toBe('wf_1')
    // Crucially: createWorkflow was NOT called again.
    expect(calls.create).toBe(1)
    expect(calls.scaffold).toBe(2)
    expect(flow.pendingDraftId).toBe('')
  })

  it('abandon deletes a pending draft and clears it', async () => {
    const { deps, calls } = makeDeps({ applyScaffold: vi.fn(async () => { calls.scaffold++; throw new Error('boom') }) })
    const flow = new WorkflowCreateFlow(deps)
    await expect(flow.create('Lead router', '')).rejects.toThrow('boom')
    expect(flow.pendingDraftId).toBe('wf_1')

    await flow.abandon()
    expect(deps.deleteWorkflow).toHaveBeenCalledWith('wf_1')
    expect(calls.delete).toBe(1)
    expect(flow.pendingDraftId).toBe('')
  })

  it('abandon is a no-op with no pending draft', async () => {
    const { deps, calls } = makeDeps()
    const flow = new WorkflowCreateFlow(deps)
    await flow.create('Lead router', '')
    await flow.abandon()
    expect(calls.delete).toBe(0)
  })

  it('abandon clears the draft even when delete fails, so nothing dangles pending', async () => {
    const { deps } = makeDeps({
      applyScaffold: vi.fn(async () => { throw new Error('boom') }),
      deleteWorkflow: vi.fn(async () => { throw new Error('delete failed') }),
    })
    const flow = new WorkflowCreateFlow(deps)
    await expect(flow.create('Lead router', '')).rejects.toThrow('boom')
    await flow.abandon()
    expect(flow.pendingDraftId).toBe('')
  })
})
