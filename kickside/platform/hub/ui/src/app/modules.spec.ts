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

  it('reloads every initial data group after false to true without remounting or losing the search', async () => {
    const api = makeApi()
    installHost(api)
    const wrapper = mount(Modules, { global: { stubs } })
    await flushPromises()
    const root = wrapper.element
    const search = wrapper.get('input.km-filter')
    await search.setValue('acme')
    const count = (url: string) => (api.get as any).mock.calls.filter(([value]: [string]) => value === url).length
    const initial = new Map([
      ['/api/v1/user/me', count('/api/v1/user/me')],
      ['/api/v1/hub/auth', count('/api/v1/hub/auth')],
      ['/api/v1/keeper/hub/dependencies', count('/api/v1/keeper/hub/dependencies')],
      ['/api/v1/keeper/hub/browse', count('/api/v1/keeper/hub/browse')],
    ])

    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()

    for (const [url, before] of initial) expect(count(url)).toBeGreaterThan(before)
    expect(wrapper.element).toBe(root)
    expect((search.element as HTMLInputElement).value).toBe('acme')
    wrapper.unmount()
  })



  it('waits for installed dependencies before rendering recommended modules', async () => {
    const deps = deferred<any>()
    installHost(makeApi({
      '/api/v1/keeper/hub/dependencies': deps.promise,
    }))
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    expect(w.html()).toContain('Loading modules')
    expect(w.html()).not.toContain('Acme Tools')

    deps.resolve({ success: true, dependencies: [{ id: 'dep1', component: 'kickside/core', version: '0.1.4' }] })
    await flushPromises()
    const html = w.html()
    expect(html).toContain('Acme Tools')
    expect(html).not.toContain('KickSide Core')
    w.unmount()
  })

  it('uses Keeper registry state for installed roots and transitive modules', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: [
          { id: 'app.deps:stat_analysis', component: 'acme/stat-analysis', version: '0.1.6', is_root: true, source: 'hub' },
        ],
        modules: [
          { name: 'acme/stat-analysis', version: '0.1.6', is_root: true, source: 'hub' },
          { name: 'wippy-langs/r', version: '0.2.6', transitive: true, is_root: false, source: 'hub', used_by: ['acme/stat-analysis'], used_by_count: 1 },
        ],
      },
      '/api/v1/keeper/hub/browse': {
        success: true,
        items: [
          { full_name: 'acme/stat-analysis', display_name: 'Statistical Analysis', type: 'plugin', description: 'Analysis', keywords: ['kickside'], total_downloads: 5, latest_version: '0.1.6' },
          { full_name: 'wippy-langs/r', display_name: 'R', type: 'library', description: 'R runtime', keywords: ['kickside'], total_downloads: 4, latest_version: '0.2.6' },
        ],
        total: 2,
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()

    const catalogRows = w.findAll('.mod-card, .feat-card')
    expect(catalogRows.some(row => row.text().includes('Statistical Analysis'))).toBe(false)
    expect(catalogRows.some(row => row.text() === 'R')).toBe(false)

    const rows = w.findAll('.inst-row')
    expect(rows).toHaveLength(2)
    const statAnalysis = rows.find(row => row.text().includes('acme/stat-analysis'))
    expect(statAnalysis).toBeTruthy()
    expect(statAnalysis!.text()).toContain('root')
    expect(statAnalysis!.find('button[aria-label="Uninstall acme/stat-analysis"]').exists()).toBe(true)

    const rRuntime = rows.find(row => row.text().includes('wippy-langs/r'))
    expect(rRuntime).toBeTruthy()
    expect(rRuntime!.text()).toContain('transitive')
    expect(rRuntime!.find('.km-danger').exists()).toBe(false)
    expect(rRuntime!.find('button[disabled][aria-label*="Cannot uninstall"]').attributes('title')).toContain('used by acme/stat-analysis')
    expect(w.find('.km-collapse-head').text()).toContain('2 modules')
    expect((api.get as any).mock.calls.some((call: any[]) => call[0] === '/api/v1/hub/installed-modules')).toBe(false)
    w.unmount()
  })

  it('does not invent installed modules when the registry graph is unavailable', async () => {
    const api = makeApi({
      __get: (url: string) => {
        if (url === '/api/v1/keeper/hub/dependencies') return new Error('dependency graph unavailable')
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()

    expect(w.findAll('.mod-card, .feat-card').some(row => row.text().includes('Workspace'))).toBe(true)
    expect(w.findAll('.inst-row')).toHaveLength(0)
    expect(w.text()).toContain('dependency graph unavailable')
    expect((api.get as any).mock.calls.some((call: any[]) => call[0] === '/api/v1/hub/installed-modules')).toBe(false)
    w.unmount()
  })

  it('does not hide catalog modules behind incomplete dependency roots', async () => {
    installHost(makeApi({
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: [
          {
            id: 'app.deps:crm',
            component: 'acme/crm',
            version: '>=v0.0.0',
            installed: false,
            installed_entries_count: 0,
            entries: [],
            is_root: true,
            source: 'hub',
          },
        ],
        modules: [{ name: 'acme/crm', version: '', is_root: true, source: 'hub' }],
      },
      '/api/v1/keeper/hub/browse': {
        success: true,
        items: [
          { full_name: 'acme/crm', display_name: 'Acme CRM', type: 'library', description: 'CRM', keywords: ['kickside'], total_downloads: 1, latest_version: '0.1.12' },
        ],
        total: 1,
      },
    }))
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    expect(w.html()).toContain('Acme CRM')
    expect(w.find('.inst-list').exists()).toBe(false)
    w.unmount()
  })


  it('marks private catalog and installed modules when visibility metadata is present', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: [
          {
            id: 'dep1',
            component: 'kickside/core',
            version: '0.1.4',
            is_root: true,
            source: 'hub',
            meta: { hub: { visibility: 'private' } },
          },
        ],
        modules: [{ name: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' }],
      },
      '/api/v1/keeper/hub/browse': {
        success: true,
        items: [
          { full_name: 'acme/private-tools', display_name: 'Private Tools', type: 'library', description: 'internal helpers', keywords: ['kickside'], total_downloads: 8, latest_version: '1.0.0', visibility: 'private' },
          { full_name: 'kickside/core', display_name: 'KickSide Core', type: 'library', description: 'engine', keywords: ['kickside'], total_downloads: 50, latest_version: '0.1.4', visibility: 'private' },
        ],
        total: 2,
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()

    const card = w.findAll('.mod-card, .feat-card').find(r => r.text().includes('Private Tools'))
    expect(card).toBeTruthy()
    expect(card!.text()).toContain('private')

    const installedRow = w.findAll('.inst-row').find(r => r.text().includes('kickside/core'))
    expect(installedRow).toBeTruthy()
    expect(installedRow!.text()).toContain('private')

    await card!.trigger('click')
    await flushPromises()
    expect(w.find('.d-hero').text()).toContain('private')
    expect(w.find('.d-side').text()).toContain('Visibility')
    expect(w.find('.d-side').text()).toContain('Private')
    w.unmount()
  })

  it('searches and filters the installed list independently', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const installedSearch = w.find('input[aria-label="Search installed modules"]')
    expect(installedSearch.exists()).toBe(true)
    await installedSearch.setValue('workspace')
    let rows = w.findAll('.inst-row')
    expect(rows).toHaveLength(1)
    expect(rows[0].text()).toContain('chestor/workspace')
    expect(w.html()).toContain('1 of 2')

    await installedSearch.setValue('')
    await setSelect(w, 'Filter installed modules', 'root')
    rows = w.findAll('.inst-row')
    expect(rows).toHaveLength(1)
    expect(rows[0].text()).toContain('kickside/core')
    expect(rows[0].text()).not.toContain('chestor/workspace')

    await setSelect(w, 'Filter installed modules', 'transitive')
    rows = w.findAll('.inst-row')
    expect(rows).toHaveLength(1)
    expect(rows[0].text()).toContain('chestor/workspace')

    await installedSearch.setValue('nomatch')
    expect(w.findAll('.inst-row')).toHaveLength(0)
    expect(w.html()).toContain('No installed modules match this filter')
    w.unmount()
  })











  it('collapses and re-expands the Installed section on click', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    expect(w.find('.inst-list').exists()).toBe(true)
    await w.find('.km-collapse-head').trigger('click')
    expect(w.find('.inst-list').exists()).toBe(false)
    await w.find('.km-collapse-head').trigger('click')
    expect(w.find('.inst-list').exists()).toBe(true)
    expect(w.html()).toContain('kickside/core')
    w.unmount()
  })

  it('filters the catalog from the search box', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const input = w.find('input.km-filter')
    await input.setValue('nonexistent-xyz')
    expect(w.html()).toContain('No available modules match this filter')
    await input.setValue('acme')
    expect(w.html()).toContain('Acme Tools')
    w.unmount()
  })

  it('opens the detail view when a catalog card is clicked', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.find('.mod-card, .feat-card').trigger('click')
    await flushPromises()
    expect(w.find('.d-page').exists()).toBe(true)
    expect(w.html()).toContain('Acme Tools')
    // Back to the list
    await w.find('.d-back').trigger('click')
    expect(w.find('.km-list').exists()).toBe(true)
    w.unmount()
  })

  it('loads installed detail entries from the provenance-backed dependency inventory', async () => {
    const api = makeApi()
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()

    await w.findAll('.inst-row').find(row => row.text().includes('kickside/core'))!.trigger('click')
    await flushPromises()

    expect(w.find('.d-page').exists()).toBe(true)
    expect((api.get as any).mock.calls.some((call: any[]) => call[0] === '/api/v1/keeper/registry/entries')).toBe(false)
    expect((api.get as any).mock.calls.filter((call: any[]) => call[0] === '/api/v1/keeper/hub/dependencies').length).toBeGreaterThan(1)
    w.unmount()
  })

  it('closes the install dialog and shows installed actions after install succeeds', async () => {
    let acmeInstalled = false
    const installedDeps = () => ({
      success: true,
      dependencies: [
        { id: 'dep1', component: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' },
        ...(acmeInstalled ? [{ id: 'app.deps:tools', component: 'acme/tools', version: '1.0.0', is_root: true, source: 'hub' }] : []),
      ],
      modules: [
        { name: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' },
        { name: 'chestor/workspace', version: '0.1.0', transitive: true, is_root: false, source: 'hub', used_by: ['kickside/core'], used_by_count: 1 },
        ...(acmeInstalled ? [{ name: 'acme/tools', version: '1.0.0', is_root: true, source: 'hub' }] : []),
      ],
    })
    const api = makeApi({
      __get: (url: string) => {
        if (url === '/api/v1/keeper/hub/dependencies') return installedDeps()
        return undefined
      },
      __post: (url: string) => {
        if (url === '/api/v1/keeper/hub/dependencies/plan') {
          return {
            success: true,
            module_count: 1,
            dependency: { id: 'app.deps:tools' },
            install_payload: { id: 'app.deps:tools' },
            graph: [{ module: 'acme/tools', path: 'acme/tools', version: '1.0.0', direct: true }],
            requirements: [],
            missing_requirements: [],
            migrations: [],
          }
        }
        if (url === '/api/v1/keeper/hub/dependencies/install') {
          acmeInstalled = true
          return { success: true, dependency: { id: 'app.deps:tools' }, apply: { stage: 'applied' } }
        }
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()

    await w.find('.mod-card, .feat-card').trigger('click')
    await flushPromises()
    expect(w.find('.d-hero-actions').text()).toContain('Install')
    await w.find('.d-hero-actions .km-btn').trigger('click')
    await flushPromises()
    expect(w.find('.km-dialog-2p').exists()).toBe(true)

    await w.findAll('button').find(b => b.text().includes('Skip scan'))!.trigger('click')
    await flushPromises()
    await w.find('.km-modal-foot .km-btn:last-child').trigger('click')
    await flushPromises()

    expect(w.find('.km-dialog-2p').exists()).toBe(false)
    expect(w.find('.d-hero-actions').text()).not.toContain('Install')
    expect(w.find('.d-hero-actions').text()).toContain('Update')
    expect(w.html()).toContain('installed')
    w.unmount()
  })




})
