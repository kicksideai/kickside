import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { loadByTagName } from '@wippy-fe/proxy'
import ConnectionPicker from './ConnectionPicker.vue'
import Connections from './connections.vue'

describe('connection provider selection', () => {
  it('preserves the custom setup and entered values when reselecting the current tile', async () => {
    const view = mount(ConnectionPicker, { props: { providers: [
      { provider: 'slack', title: 'Slack' },
      { provider: 'mcp-client', title: 'Remote MCP', create_ui_id: 'test-mcp-setup' },
    ] } })
    await flushPromises()
    await view.get('[data-provider-key="slack"]').trigger('click')
    await view.get('[data-provider-key="mcp-client"]').trigger('click')
    await flushPromises()
    const setup = view.get('.kx-engine-host').element.firstElementChild!
    const input = document.createElement('input')
    input.value = 'https://example.com/mcp'
    setup.appendChild(input)
    const mounts = vi.mocked(loadByTagName).mock.calls.length
    await view.get('[data-provider-key="mcp-client"]').trigger('click')
    await flushPromises()
    expect(view.get('.kx-engine-host').element.firstElementChild).toBe(setup)
    expect(input.value).toBe('https://example.com/mcp')
    expect(vi.mocked(loadByTagName).mock.calls.length).toBe(mounts)
    await view.get('[data-provider-key="slack"]').trigger('click')
    expect(setup.isConnected).toBe(false)
    view.unmount()
  })
})

describe('Remote MCP reconnect identity', () => {
  it('passes the existing non-OAuth connection identity to its setup component', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections?': { connections: [{ component_id: 'mcp-existing', name: 'Northwind MCP', provider: 'mcp_remote', oauth: false }] },
      '/api/v1/oauth/providers/discover': { providers: [] },
      '/api/v1/connections/providers/discover': { providers: [{ provider: 'mcp_remote', title: 'Remote MCP', create_ui_id: 'test-mcp-setup' }] },
    }
    const view = mount(Connections)
    await flushPromises()
    await view.get('[aria-label="Reconnect Northwind MCP"]').trigger('click')
    await flushPromises()
    const setup = view.get('.kx-engine-host').element.firstElementChild!
    expect(setup.getAttribute('component-id')).toBe('mcp-existing')
    expect(view.getComponent(ConnectionPicker).props('reauth')).toEqual({ componentId: 'mcp-existing', name: 'Northwind MCP' })
    view.unmount()
  })
})
