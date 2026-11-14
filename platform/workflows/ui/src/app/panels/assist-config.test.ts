import { beforeEach, describe, expect, it, vi } from 'vitest'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { post } }))

import { assistConfig, isConfigAssistOk } from './assist-config'

describe('assistConfig', () => {
  beforeEach(() => post.mockReset())

  it('posts only intent and node identity to the server-resolved workflow-gated endpoint', async () => {
    post.mockResolvedValue({ data: { success: true, config: { prompt: 'Approve?', priority: 'urgent' }, notes: 'Drafted.' } })
    const result = await assistConfig({
      workflowId: 'wf/one', nodeId: 'review-1', intent: 'Urgent review',
    })
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/wf%2Fone/assist/config', {
      intent: 'Urgent review', node_id: 'review-1',
    }, { timeout: 105_000 })
    expect(isConfigAssistOk(result)).toBe(true)
    expect(result).toEqual({ config: { prompt: 'Approve?', priority: 'urgent' }, notes: 'Drafted.' })
  })

  it('passes the previous-step contract as drafting context without replacing server-resolved config authority', async () => {
    const configSchema = { type: 'object', properties: { context: { type: 'string', title: 'Context shown to approver' } } }
    post.mockResolvedValue({ data: { success: true, config: { context: '{ invoice: output.invoice }' }, config_schema: configSchema } })
    const upstreamSchema = {
      type: 'object', properties: { invoice: { type: 'object' }, internal_note: { type: 'string' } },
    }
    await assistConfig({
      workflowId: 'wf', nodeId: 'human-1', intent: 'Show the invoice to the approver', upstreamSchema,
    })
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/wf/assist/config', {
      intent: 'Show the invoice to the approver', node_id: 'human-1', upstream_schema: upstreamSchema,
    }, { timeout: 105_000 })
    await expect(assistConfig({ workflowId: 'wf', nodeId: 'human-1', intent: 'Again', upstreamSchema }))
      .resolves.toMatchObject({ configSchema })
  })

  it('shows the backend message and never leaks a bare error code', async () => {
    post.mockResolvedValue({ data: { success: false, code: 'invalid_draft', error: 'invalid_draft', message: 'Timeout must be at least 1.' } })
    await expect(assistConfig({
      workflowId: 'wf', nodeId: 'node', intent: 'x',
    })).resolves.toEqual({ error: 'Timeout must be at least 1.' })
  })

  it('preserves a directed structured 404 and maps only an endpoint-missing 404 to unavailable', async () => {
    post.mockRejectedValueOnce({ response: { status: 404, data: { success: false, code: 'node_not_found', message: 'This step no longer exists.' } } })
    await expect(assistConfig({ workflowId: 'wf', nodeId: 'gone', intent: 'x' }))
      .resolves.toEqual({ error: 'This step no longer exists.' })

    post.mockRejectedValueOnce({ response: { status: 404, data: '<html>not found</html>' } })
    await expect(assistConfig({ workflowId: 'wf', nodeId: 'node', intent: 'x' }))
      .resolves.toEqual({ error: 'AI assist isn’t available here yet.', unavailable: true })
  })
})
