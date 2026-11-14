import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@widgets/app/AnchoredPanel.vue', () => ({ default: { template: '<div><slot /></div>' } }))
import Mcp from './mcp.vue'

// This page renders inside a sandboxed frame, where location.origin is the string
// "null". Reading it produced the endpoint "null/api/public/mcp" on a workspace
// with no credentials yet — the one moment an operator most needs the URL. The
// server names the endpoint; the page prints what it is told.
describe('MCP endpoint URL', () => {
  beforeEach(() => {
    ;(globalThis as any).__api__ = {}
  })

  it('shows the endpoint the server names, before any credential exists', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/mcp/credentials': {
        success: true,
        credentials: [],
        mcp_url: 'https://mcp.example.test/api/public/mcp',
      },
    }
    const w = mount(Mcp)
    await flushPromises()
    expect(w.text()).toContain('https://mcp.example.test/api/public/mcp')
    expect(w.text()).not.toContain('null/api/public/mcp')
  })

  it('never glues a null origin onto the path when the server says nothing', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/mcp/credentials': { success: true, credentials: [] },
    }
    const origin = vi.spyOn(globalThis.location ?? ({} as Location), 'origin', 'get')
    origin.mockReturnValue('null' as unknown as string)
    const w = mount(Mcp)
    await flushPromises()
    expect(w.text()).not.toContain('null/api/public/mcp')
    expect(w.text()).toContain('/api/public/mcp')
    origin.mockRestore()
  })
})
