import { afterEach, describe, expect, it, vi } from 'vitest'
import { ASSIST_TIMEOUT_MS, assistEdgeIntent, assistEdgeMapping, isAssistTransform, isEdgeIntentPreview } from './assist'
import { api } from '@wippy-fe/proxy'

vi.mock('@wippy-fe/proxy', () => ({
  api: { post: vi.fn() },
}))

const post = api.post as unknown as ReturnType<typeof vi.fn>
const edge = { id: 'e1', source_id: 'a', target_id: 'b', transform: '' }
const up = { type: 'object', properties: { id: {} } }
const down = { type: 'object', required: ['email'], properties: { email: {} } }

afterEach(() => post.mockReset())

describe('assistEdgeMapping', () => {
  it('posts the edge and both schemas to the workflow assist endpoint', async () => {
    post.mockResolvedValue({ data: { success: true, transform: '{ email: output.id }' } })
    const r = await assistEdgeMapping('wf-9', edge, up, down)
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/wf-9/assist/edge', {
      edge: { source_id: 'a', target_id: 'b', transform: '' },
      upstream_schema: up,
      downstream_schema: down,
    }, { timeout: ASSIST_TIMEOUT_MS, signal: undefined })
    expect(isAssistTransform(r)).toBe(true)
    if ('transform' in r) expect(r.transform).toBe('{ email: output.id }')
  })

  it('surfaces the server error verbatim on success:false', async () => {
    post.mockResolvedValue({ data: { success: false, error: 'schemas share no fields' } })
    const r = await assistEdgeMapping('wf-9', edge, up, down)
    expect(r).toEqual({ error: 'schemas share no fields' })
  })

  it('reports a truthful not-available message when the endpoint 404s', async () => {
    post.mockRejectedValue({ response: { status: 404 } })
    const r = await assistEdgeMapping('wf-9', edge, up, down)
    expect(isAssistTransform(r)).toBe(false)
    if ('error' in r) expect(r.error).toBe('The mapping assistant isn’t available yet.')
  })

  it('narrows a transform result through the guard', () => {
    expect(isAssistTransform({ transform: '{ email: output.id }' })).toBe(true)
    expect(isAssistTransform({ error: 'x' })).toBe(false)
  })
})

describe('assistEdgeIntent', () => {
  it('posts the declared topology vocabulary to the write-gated edge endpoint', async () => {
    post.mockResolvedValue({ data: { success: true, kind: 'condition', predicate: 'output.score > 50', summary: 'Continue for high scores.' } })
    const r = await assistEdgeIntent(
      'wf-9', edge, up, down, 'continue when score is above 50', true,
      [{ kind: 'branch', title: 'Condition' }, { kind: 'block', title: 'Wait for' }],
    )
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/wf-9/assist/edge', {
      mode: 'intent',
      edge: { source_id: 'a', target_id: 'b', transform: '' },
      intent: 'continue when score is above 50',
      upstream_schema: up,
      downstream_schema: down,
      source_failure_available: true,
      available_steps: [{ kind: 'branch', title: 'Condition' }, { kind: 'block', title: 'Wait for' }],
    }, { timeout: ASSIST_TIMEOUT_MS, signal: undefined })
    expect(isEdgeIntentPreview(r)).toBe(true)
    expect(r).toEqual({ kind: 'condition', predicate: 'output.score > 50', summary: 'Continue for high scores.' })
  })

  it('accepts a server-validated Failed-route preview and rejects malformed unions', async () => {
    post.mockResolvedValueOnce({ data: { success: true, kind: 'failure_route', available: true, source_port: 'failed', summary: 'Use Failed.' } })
    expect(await assistEdgeIntent('wf-9', edge, up, down, 'on failure', true, [])).toEqual({
      kind: 'failure_route', available: true, source_port: 'failed', summary: 'Use Failed.',
    })
    post.mockResolvedValueOnce({ data: { success: true, kind: 'condition', predicate: 42 } })
    expect(await assistEdgeIntent('wf-9', edge, up, down, 'if x', false, [])).toEqual({
      error: 'The assistant returned no usable connection preview.',
    })
  })

  it('accepts only the canonical Block identity on insertion previews', async () => {
    post.mockResolvedValueOnce({ data: {
      success: true, kind: 'insert_node', block_id: 'signal', block_title: 'Wait for', summary: 'Wait for a signal.',
    } })
    expect(await assistEdgeIntent('wf-9', edge, up, down, 'wait here', false, [])).toEqual({
      kind: 'insert_node', block_id: 'signal', block_title: 'Wait for', summary: 'Wait for a signal.',
    })

    post.mockResolvedValueOnce({ data: {
      success: true, kind: 'insert_node', node_kind: 'block', node_title: 'Wait for', summary: 'Wait for a signal.',
    } })
    expect(await assistEdgeIntent('wf-9', edge, up, down, 'wait here', false, [])).toEqual({
      error: 'The assistant returned no usable connection preview.',
    })
  })
})
