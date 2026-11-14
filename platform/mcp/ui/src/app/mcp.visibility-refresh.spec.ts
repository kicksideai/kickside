import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { api } from '@wippy-fe/proxy'
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@widgets/app/AnchoredPanel.vue', () => ({ default: { template: '<div><slot /></div>' } }))
import Mcp from './mcp.vue'

// The MCP UI test does not load another module's Vite entrypoint. Model the
// embedded picker's public catalog-load contract while the Agents picker tests
// exercise the real component implementation.
class EmbeddedTraitPickerHarness extends HTMLElement {
  static get observedAttributes() { return ['refresh-key'] }

  connectedCallback() { void api.get('/api/v1/agents/traits') }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === 'refresh-key' && oldValue !== null && oldValue !== newValue) {
      void api.get('/api/v1/agents/traits')
    }
  }
}

if (!customElements.get('wc-agent-trait-picker')) {
  customElements.define('wc-agent-trait-picker', EmbeddedTraitPickerHarness)
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe('MCP retained-surface refresh', () => {
  it('loads the embedded trait catalog initially and again after false to true', async () => {
    const callsBefore = (api.get as any).mock.calls.length
    const w = mount(Mcp)
    await flushPromises()
    const root = w.element
    expect((api.get as any).mock.calls.slice(callsBefore).map((c: any[]) => c[0])).toEqual(['/api/v1/mcp/credentials'])

    const newCredential = w.findAll('button').find(button => button.text().includes('New credential'))
    expect(newCredential).toBeDefined()
    await newCredential!.trigger('click')
    await flushPromises()
    const picker = document.querySelector('wc-agent-trait-picker') as HTMLElement
    expect(picker).toBeTruthy()
    expect(picker.getAttribute('refresh-key')).toBe('0')
    const initialUrls = (api.get as any).mock.calls.slice(callsBefore).map((c: any[]) => c[0])
    expect(initialUrls.filter((url: string) => url === '/api/v1/agents/traits')).toEqual(['/api/v1/agents/traits'])

    ;(globalThis as any).__hostVisibility__.value = true
    await nextTick()
    await flushPromises()
    const refreshedUrls = (api.get as any).mock.calls.slice(callsBefore).map((c: any[]) => c[0])
    expect(refreshedUrls.filter((url: string) => url === '/api/v1/mcp/credentials'))
      .toEqual(['/api/v1/mcp/credentials', '/api/v1/mcp/credentials'])
    expect(refreshedUrls.filter((url: string) => url === '/api/v1/agents/traits'))
      .toEqual(['/api/v1/agents/traits', '/api/v1/agents/traits'])
    expect(w.element).toBe(root)
    expect(document.querySelector('wc-agent-trait-picker')).toBe(picker)
    expect(picker.getAttribute('refresh-key')).toBe('1')
    ;(globalThis as any).__hostVisibility__.value = false
    w.unmount()
  })

  it('ignores an older credentials response that finishes after a reveal refresh', async () => {
    const get = api.get as any
    const originalImplementation = get.getMockImplementation()
    const stale = deferred<any>()
    let credentialCalls = 0
    get.mockImplementation((url: string) => {
      if (url === '/api/v1/mcp/credentials') {
        credentialCalls += 1
        if (credentialCalls === 1) return stale.promise
        return Promise.resolve({ data: { success: true, credentials: [{ credential_id: 'fresh', label: 'Fresh credential', token_prefix: 'fresh' }] } })
      }
      return Promise.resolve({ data: { success: true, traits: [] } })
    })

    const w = mount(Mcp)
    await flushPromises()
    ;(globalThis as any).__hostVisibility__.value = true
    await nextTick()
    await flushPromises()
    expect(w.text()).toContain('Fresh credential')

    stale.resolve({ data: { success: true, credentials: [{ credential_id: 'stale', label: 'Stale credential', token_prefix: 'stale' }] } })
    await flushPromises()
    expect(w.text()).toContain('Fresh credential')
    expect(w.text()).not.toContain('Stale credential')

    ;(globalThis as any).__hostVisibility__.value = false
    w.unmount()
    get.mockImplementation(originalImplementation)
  })
})
