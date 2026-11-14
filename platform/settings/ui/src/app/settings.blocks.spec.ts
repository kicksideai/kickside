import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, loadByTagName } from '@wippy-fe/proxy'
import Settings from './settings.vue'
import SettingsForm from './SettingsForm.vue'
import WcMount from '@widgets/app/WcMount.vue'

// The Settings page fetches /settings/blocks and renders a grouped left-nav.
// Selecting a namespace block renders the scoped SettingsForm; selecting a
// component block mounts that web component by tag. The authenticated API is
// the mocked `@wippy-fe/proxy` `api`, seeded per-URL via `globalThis.__api__`.
const catalog = {
  success: true,
  blocks: [
    { key: 'rasterize', title: 'Rasterization', group: 'Uploads', icon: 'tabler:photo', namespace: 'kickside.uploads.rasterize' },
    { key: 'sso', title: 'Single sign-on', group: 'Security', icon: 'tabler:key', component_tag: 'kickside-sso-admin' },
  ],
}

beforeEach(() => {
  ;(api.get as any).mockClear()
  ;(loadByTagName as any).mockClear?.()
  ;(globalThis as any).__api__ = {
    'settings/blocks': catalog,
    'settings?namespace': { success: true, settings: [{ namespace: 'kickside.uploads.rasterize', key: 'enabled', value: true, value_type: 'bool', default: true, is_default: true, editable: true }] },
  }
})

afterEach(() => { ;(globalThis as any).__api__ = {} })

describe('settings.vue blocks page', () => {
  it('renders the block catalog as a grouped sidebar', async () => {
    const w = mount(Settings)
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/api/v1/settings/blocks')
    expect(w.html()).toContain('Rasterization')
    expect(w.html()).toContain('Single sign-on')
    // Group headings.
    expect(w.find('.ks-nav-group').exists()).toBe(true)
    expect(w.html()).toContain('Uploads')
    expect(w.html()).toContain('Security')
    w.unmount()
  })

  it('selects the first block and renders its namespace-scoped form', async () => {
    const w = mount(Settings)
    await flushPromises()
    await flushPromises()

    // The first block (rasterize) is a namespace block: its scoped form fetched.
    expect(api.get).toHaveBeenCalledWith('/api/v1/settings?namespace=kickside.uploads.rasterize')
    expect(w.findComponent(SettingsForm).exists()).toBe(true)
    w.unmount()
  })

  it('mounts the web component by tag when a component block is selected', async () => {
    const w = mount(Settings)
    await flushPromises()

    const ssoItem = w.findAll('.ks-nav-item').find(b => b.text().includes('Single sign-on'))
    expect(ssoItem).toBeTruthy()
    await ssoItem!.trigger('click')
    await flushPromises()

    expect(w.findComponent(WcMount).exists()).toBe(true)
    expect(loadByTagName).toHaveBeenCalledWith('kickside-sso-admin', expect.anything())
    w.unmount()
  })

  it('deep-links to a block via the route prop', async () => {
    ;(globalThis as any).__props__ = { route: 'sso' }
    const w = mount(Settings)
    await flushPromises()

    expect(w.findComponent(WcMount).exists()).toBe(true)
    ;(globalThis as any).__props__ = { config: {} }
    w.unmount()
  })
})
