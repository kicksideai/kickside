import { expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import { applyCommands } from './defs'
vi.mock('@wippy-fe/proxy', () => ({ api: { post: vi.fn(async () => ({ data: { success: true, events: [], head_seq: 1 } })) } }))
it('sends config edits through the authenticated fetch adapter with keepalive', async () => {
  const commands = [{ type: 'node.update' as const, body: { id: 'n', config: { prompt: 'latest' } } }]
  await applyCommands('wf', commands)
  expect(api.post).toHaveBeenLastCalledWith('/api/v1/workflows/wf/apply', { commands }, { adapter: 'fetch', fetchOptions: { keepalive: true } })
})
it('retains the ordinary fetch path for bodies above the keepalive budget', async () => {
  const commands = [{ type: 'node.update' as const, body: { id: 'n', config: { prompt: 'x'.repeat(65536) } } }]
  await applyCommands('wf', commands)
  expect(api.post).toHaveBeenLastCalledWith('/api/v1/workflows/wf/apply', { commands }, { adapter: 'fetch', fetchOptions: { keepalive: false } })
})
