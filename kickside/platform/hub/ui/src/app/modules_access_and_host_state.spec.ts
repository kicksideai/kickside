import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Select from 'primevue/select'
import { api as proxyApi } from '@wippy-fe/proxy'
import Modules from './modules.vue'

// A fake host api routed by URL, returning success envelopes so modules.vue runs
// its full load path (auth → hub auth → installed + catalog) under a real mount.
function makeApi(over: Record<string, any> = {}) {
  const browseItems = [
    { full_name: 'acme/tools', display_name: 'Acme Tools', type: 'library', description: 'helpers', keywords: ['kickside'], total_downloads: 1200, latest_version: '1.0.0' },
    { org: 'kickside', name: 'core', display_name: 'KickSide Core', type: 'app', description: 'engine', keywords: ['kickside'], total_downloads: 50, latest_version: '0.1.4' },
    { full_name: 'chestor/workspace', display_name: 'Workspace', type: 'library', description: 'workspace surface', keywords: ['kickside'], total_downloads: 25, latest_version: '0.1.0' },
    { full_name: 'kickside/kickside', display_name: 'KickSide App', type: 'application', description: 'root app shell', keywords: ['kickside'], total_downloads: 5, latest_version: '0.1.34' },
    { full_name: 'kickside/demo', display_name: 'Demo App', type: 'application', description: 'temporary demo app', keywords: ['kickside'], total_downloads: 4, latest_version: '0.1.0' },
    { full_name: 'kickside/old', display_name: 'Old Module', type: 'library', deprecated: true, description: 'retired', keywords: ['kickside'], total_downloads: 3, latest_version: '0.1.0' },
  ]
  const data: Record<string, any> = {
    '/api/v1/user/me': { success: true, security: { is_admin: true } },
    '/api/v1/hub/auth': { success: true, authenticated: true, username: 'admin' },
    '/api/v1/keeper/hub/dependencies': {
      success: true,
      dependencies: [{ id: 'dep1', component: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' }],
      modules: [
        { name: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' },
        { name: 'chestor/workspace', version: '0.1.0', transitive: true, is_root: false, source: 'hub', used_by: ['kickside/core'], used_by_count: 1 },
      ],
    },
    '/api/v1/keeper/hub/browse': { success: true, items: browseItems, total: browseItems.length },
    '/api/v1/keeper/registry/entries': { success: true, entries: [] },
    '/api/v1/keeper/hub/readme': { success: true, content: '# Readme\n\ntext' },
    '/api/v1/keeper/hub/versions': { success: true, items: [{ version: '1.0.0' }] },
    ...over,
  }
  return {
    get: vi.fn((url: string, config?: any) => {
      const value = typeof over.__get === 'function' ? over.__get(url, config) : undefined
      if (value !== undefined) {
        if (value && typeof value.then === 'function') return value.then((resolved: any) => ({ data: resolved, status: 200 }))
        if (value instanceof Error) return Promise.reject(value)
        return Promise.resolve({ data: value, status: 200 })
      }
      const body = data[url] ?? { success: true }
      if (body && typeof body.then === 'function') {
        return body.then((resolved: any) => ({ data: resolved, status: 200 }))
      }
      return Promise.resolve({ data: body, status: 200 })
    }),
    post: vi.fn((url: string, body?: any) => {
      const value = typeof over.__post === 'function' ? over.__post(url, body) : undefined
      const response = value ?? data[url] ?? { success: true }
      if (response && typeof response.then === 'function') return response.then((resolved: any) => ({ data: resolved, status: 200 }))
      if (response instanceof Error) return Promise.reject(response)
      return Promise.resolve({ data: response, status: 200 })
    }),
    delete: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 })),
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(r => { resolve = r })
  return { promise, resolve }
}

// Route the fake api implementation through the mocked @wippy-fe/proxy `api`
// (the composable now reads the synchronous proxy client, not window.$W).
function installHost(api: any) {
  ;(proxyApi.get as any).mockImplementation(api.get)
  ;(proxyApi.post as any).mockImplementation(api.post)
  ;(proxyApi.delete as any).mockImplementation(api.delete)
}

// Drive a PrimeVue Select's v-model by aria-label — there is no native <select>
// to setValue on, so emit the update:modelValue the v-model binding listens for.
async function setSelect(w: any, ariaLabel: string, value: string) {
  const sel = w.findAllComponents(Select).find(
    (s: any) => s.props('ariaLabel') === ariaLabel || s.attributes('aria-label') === ariaLabel,
  )
  expect(sel, `select "${ariaLabel}"`).toBeTruthy()
  sel.vm.$emit('update:modelValue', value)
  await flushPromises()
}

const stubs = { Icon: true, 'wc-render-markdown': true }

describe('modules.vue (mounted)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as any).__hostVisibility__.value = false
    installHost(makeApi())
  })


  it('loads auth, catalog and installed, then renders the toolbar + grid', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const html = w.html()
    // Toolbar present (Refresh/Filter/Sort)
    expect(w.find('.km-sec-bar-toolbar').exists()).toBe(true)
    expect(w.find('input.km-filter').exists()).toBe(true)
    // Catalog shows tagged modules of every package type and hides installed ones.
    expect(html).toContain('Acme Tools')
    expect(html).not.toContain('KickSide Core') // installed → filtered out of catalog
    expect(html).not.toContain('Workspace') // transitive dependency → filtered out of catalog
    expect(html).toContain('KickSide App')
    expect(html).toContain('Demo App')
    expect(html).not.toContain('Old Module')
    // Installed section is visible by default and separate from discovery.
    expect(w.find('.km-collapse-head').exists()).toBe(true)
    expect(w.find('.inst-list').exists()).toBe(true)
    expect(html).toContain('kickside/core')
    expect(html).toContain('root')
    expect(html).toContain('chestor/workspace')
    expect(html).toContain('transitive')
    expect(html).toContain('used by kickside/core')
    w.unmount()
  })
























  it('shows the access-denied state for a non-admin', async () => {
    installHost(makeApi({ '/api/v1/user/me': { success: true, security: { is_admin: false } } }))
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    expect(w.find('.km-denied').exists()).toBe(true)
    w.unmount()
  })

  it('shows a single Hub-token prompt when the token is expired', async () => {
    installHost(makeApi({ '/api/v1/hub/auth': { success: true, authenticated: true, expired: true, username: 'admin' } }))
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const prompts = w.findAll('.km-msg').filter(e => /hub token/i.test(e.text()))
    expect(prompts).toHaveLength(1)
    expect(prompts[0].text()).toContain('expired')
    w.unmount()
  })

  it('shows only the top-line Hub-token button (not an inline duplicate or stacked error) when the catalog is unauthorized', async () => {
    installHost(makeApi({
      '/api/v1/hub/auth': { success: true, authenticated: false },
      '/api/v1/keeper/hub/browse': { success: false, code: 'UNAUTHORIZED', error: 'token required' },
    }))
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    // The single token control is the top-line toolbar button — no inline duplicate prompt, no stacked error banner.
    expect(w.find('.km-hub-auth button').exists()).toBe(true)
    expect(w.findAll('.km-msg').filter(e => /hub token/i.test(e.text()))).toHaveLength(0)
    expect(w.find('.km-msg-err').exists()).toBe(false)
    w.unmount()
  })

  it('does not crash and gates to the admin screen when the host api is unavailable', async () => {
    // With the auth call failing, admin can't be resolved, so the component
    // renders the access-denied gate rather than crashing.
    ;(proxyApi.get as any).mockImplementation(() => Promise.reject(new Error('host API unavailable')))
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    expect(w.find('.km-denied').exists()).toBe(true)
    w.unmount()
  })
})
