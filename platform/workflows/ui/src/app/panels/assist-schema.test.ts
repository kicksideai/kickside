import { afterEach, describe, expect, it, vi } from 'vitest'
import { assistSchema, isSchemaAssistOk, SCHEMA_ASSIST_TIMEOUT_MS } from './assist-schema'
import { ASSIST_TEMPORARY, ASSIST_UNAVAILABLE } from './assist-error'
import { api } from '@wippy-fe/proxy'

vi.mock('@wippy-fe/proxy', () => ({
  api: { post: vi.fn() },
}))

const post = api.post as unknown as ReturnType<typeof vi.fn>
afterEach(() => post.mockReset())

describe('assistSchema', () => {
  it('posts the intent, current schema, and context to the pinned endpoint', async () => {
    post.mockResolvedValue({ data: { success: true, schema: { type: 'object', properties: { email: {} } }, notes: 'ok' } })
    const cur = { type: 'object', properties: {} }
    const r = await assistSchema('a lead with email', cur, { surface: 'workflow.boundary.start', sample: { x: 1 } })
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/assist/schema', {
      intent: 'a lead with email',
      current_schema: cur,
      context: { surface: 'workflow.boundary.start', sample: { x: 1 } },
    }, expect.objectContaining({ timeout: SCHEMA_ASSIST_TIMEOUT_MS }))
    expect(isSchemaAssistOk(r)).toBe(true)
    if ('schema' in r) {
      expect(r.schema).toEqual({ type: 'object', properties: { email: {} } })
      expect(r.notes).toBe('ok')
    }
  })

  it('omits current_schema and context when not provided', async () => {
    post.mockResolvedValue({ data: { success: true, schema: {} } })
    await assistSchema('anything')
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/assist/schema', { intent: 'anything' }, expect.objectContaining({ timeout: SCHEMA_ASSIST_TIMEOUT_MS }))
  })

  it('degrades to a human unavailable sentence on a 404 (assist unavailable here)', async () => {
    post.mockRejectedValue({ response: { status: 404 } })
    const r = await assistSchema('x')
    expect(r).toEqual({ error: ASSIST_UNAVAILABLE, unavailable: true })
  })

  it('renders the backend message (not the bare code) on an assist_unavailable outage', async () => {
    post.mockResolvedValue({ data: { success: false, error: 'assist_unavailable', message: 'AI assist is temporarily unavailable — try again shortly.' } })
    const r = await assistSchema('x')
    expect(r).toEqual({ error: 'AI assist is temporarily unavailable — try again shortly.' })
  })

  it('maps a bare assist_unavailable code (no message) to a directed sentence', async () => {
    post.mockResolvedValue({ data: { success: false, error: 'assist_unavailable' } })
    const r = await assistSchema('x')
    expect(r).toEqual({ error: ASSIST_TEMPORARY })
  })

  it('degrades to unavailable when the SPA fallback returns HTML (a string body)', async () => {
    post.mockResolvedValue({ data: '<!DOCTYPE html><html></html>' })
    const r = await assistSchema('x')
    expect(isSchemaAssistOk(r)).toBe(false)
    if ('unavailable' in r) expect(r.unavailable).toBe(true)
  })

  it('surfaces a server error verbatim on success:false', async () => {
    post.mockResolvedValue({ data: { success: false, error: 'intent too vague' } })
    const r = await assistSchema('x')
    expect(r).toEqual({ error: 'intent too vague' })
  })

  it('rejects a non-object schema in the response', async () => {
    post.mockResolvedValue({ data: { success: true, schema: 'not-a-schema' } })
    const r = await assistSchema('x')
    expect(isSchemaAssistOk(r)).toBe(false)
  })

  it('turns an aborted request into a directed cancelled result', async () => {
    post.mockRejectedValue({ code: 'ERR_CANCELED', name: 'CanceledError' })
    expect(await assistSchema('x')).toEqual({ error: 'Draft cancelled.' })
  })
})
