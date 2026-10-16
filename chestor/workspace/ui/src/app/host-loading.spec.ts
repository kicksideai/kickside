import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { loadByTagName } from '@wippy-fe/proxy'
import EntryRenderer from './EntryRenderer.vue'
import ShareHost from './ShareHost.vue'
vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))

describe('public widget recovery', () => {
  it('retries an unavailable renderer without exposing its internal tag', async () => {
    vi.mocked(loadByTagName).mockRejectedValueOnce(new Error('Bundle unavailable'))
    const view = mount(EntryRenderer, { props: { tag: 'northwind-test-renderer', attrs: { 'entry-id': 'fictional' } } })
    await flushPromises()
    expect(view.text()).toContain('Content is unavailable.')
    expect(view.text()).not.toContain('northwind-test-renderer')
    customElements.define('northwind-test-renderer', class extends HTMLElement {})
    await view.get('button').trigger('click')
    await flushPromises()
    expect(view.find('northwind-test-renderer').exists()).toBe(true)
    expect(view.text()).not.toContain('unavailable')
    view.unmount()
  })
  it('shows retry and close when the shared popup fails to load', async () => {
    vi.mocked(loadByTagName).mockRejectedValueOnce(new Error('Bundle unavailable'))
    const view = mount(ShareHost, { props: { config: '{}' } })
    await flushPromises()
    expect(view.text()).toContain('Sharing is unavailable.')
    expect(view.get('[role=dialog]').attributes('aria-label')).toBe('Sharing')
    expect(view.find('.ws-modal').exists()).toBe(true)
    customElements.define('kickside-share', class extends HTMLElement {})
    await view.get('button[aria-label="Retry sharing"]').trigger('click')
    await flushPromises()
    expect(view.find('kickside-share').exists()).toBe(true)
    view.unmount()
  })
})
