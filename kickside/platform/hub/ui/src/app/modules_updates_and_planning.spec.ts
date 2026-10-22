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



  it('uses the package planner for application packages instead of inventing deployment policy', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const app = w.findAll('.mod-card, .feat-card').find(row => row.text().includes('KickSide App'))
    expect(app).toBeTruthy()
    await app!.trigger('click')
    await flushPromises()

    const action = w.findAll('button').find(button => button.text().trim() === 'Install')
    expect(action).toBeTruthy()
    expect(action!.attributes('disabled')).toBeUndefined()
    await action!.trigger('click')
    await flushPromises()
    expect(w.findComponent({ name: 'InstallDialog' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'InstallDialog' }).props('component')).toBe('kickside/kickside')
    w.unmount()
  })








  it.each(['failed', 'blocked'])('retries all roots as one batch after a middle-root plan is %s', async (mode) => {
    const components = ['kickside/core', 'chestor/workspace', 'acme/tools']
    let refuse = true
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: components.map((component, index) => ({ id: `dep${index}`, component,
          version: '1.0.0', is_root: true, source: 'hub' })),
        modules: components.map(name => ({ name, version: '1.0.0', is_root: true, source: 'hub' })),
      },
      __get: (url: string) => url === '/api/v1/keeper/hub/versions'
        ? { success: true, items: [{ version: '1.1.0', is_latest: true }] } : undefined,
      __post: (url: string, body: any) => {
        if (url === '/api/v1/keeper/hub/dependencies/plan') {
          if (refuse && body.component === components[1]) {
            return mode === 'failed' ? new Error('planner refusal')
              : { success: true, missing_requirements: ['required-setting'] }
          }
          return { success: true, missing_requirements: [] }
        }
        if (url === '/api/v1/keeper/hub/dependencies/install') return { success: true }
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.findAll('button').find(b => b.text().includes('Scan updates'))!.trigger('click')
    await flushPromises()
    await w.findAll('button').find(b => b.text().includes('Update all'))!.trigger('click')
    await flushPromises()
    const installs = () => (api.post as any).mock.calls.filter((call: any[]) =>
      call[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installs()).toHaveLength(0)
    expect(w.html()).not.toContain('inst-update planning')
    expect(w.html()).not.toContain('inst-update updating')
    expect(w.text()).toContain(mode === 'failed' ? 'planner refusal' : 'required-setting')
    const retry = w.findAll('button').find(b => b.text().includes('Update all'))!
    expect(retry.attributes('disabled')).toBeUndefined()
    refuse = false
    await retry.trigger('click')
    await flushPromises()
    expect(installs()).toHaveLength(1)
    expect(installs()[0][1]).toEqual({
      dependencies: components.map(component => ({ component, version: '>=1.1.0', run_migrations: true })),
      run_migrations: true, migration_policy: 'up',
    })
    expect(w.html()).not.toContain('inst-update planning')
    expect(w.html()).not.toContain('inst-update updating')
    w.unmount()
  })

  it('scans installed roots and updates their dependency graph atomically', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: [
          { id: 'dep1', component: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' },
          { id: 'dep2', component: 'chestor/workspace', version: '0.1.0', is_root: true, source: 'hub' },
        ],
        modules: [
          { name: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' },
          { name: 'chestor/workspace', version: '0.1.0', is_root: true, source: 'hub' },
        ],
      },
      __get: (url: string, config?: any) => {
        if (url === '/api/v1/keeper/hub/versions') {
          const module = config?.params?.module
          if (module === 'kickside/core') return { success: true, items: [{ version: '0.1.5', is_latest: true }] }
          if (module === 'chestor/workspace') return { success: true, items: [{ version: '0.1.1', is_latest: true }] }
        }
        return undefined
      },
      __post: (url: string, body: any) => {
        if (url === '/api/v1/keeper/hub/dependencies/plan') {
          expect(body.run_migrations).toBe(true)
          return { success: true, missing_requirements: [], install_payload: { id: 'dep1' } }
        }
        if (url === '/api/v1/keeper/hub/dependencies/install') {
          return { success: true, dependency: { id: 'dep1' } }
        }
        return undefined
      },
    })
    installHost(api)
    const navChanged = vi.fn()
    window.addEventListener('kickside:nav-changed', navChanged)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()

    await w.findAll('button').find(b => b.text().includes('Scan updates'))!.trigger('click')
    await flushPromises()
    expect(w.html()).toContain('0.1.4 → 0.1.5')
    expect(w.html()).toContain('2 updates')

    await w.findAll('button').find(b => b.text().includes('Update all'))!.trigger('click')
    await flushPromises()
    const installCall = (api.post as any).mock.calls.find((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installCall?.[1]).toMatchObject({
      run_migrations: true,
      migration_policy: 'up',
    })
    expect(installCall?.[1].dependencies).toEqual([
      { component: 'kickside/core', version: '>=0.1.5', run_migrations: true },
      { component: 'chestor/workspace', version: '>=0.1.1', run_migrations: true },
    ])
    expect(navChanged).toHaveBeenCalled()
    window.removeEventListener('kickside:nav-changed', navChanged)
    w.unmount()
  })

  it.each([
    { label: 'transitive package', root: false, dependencyId: null },
    { label: 'graph root without a dependency entry', root: true, dependencyId: null },
    { label: 'existing dependency entry', root: true, dependencyId: 'custom.dependencies:search-alias' },
  ])('uses the dependency destination for a $label update', async ({ root, dependencyId }) => {
    const component = 'example/search'
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: dependencyId ? [{ id: dependencyId, namespace: 'custom.dependencies',
          name: 'search-alias', component, version: '1.0.0', source: 'registry' }] : [],
        modules: [{ name: component, version: '1.0.0', is_root: root, transitive: !root,
          source: 'registry', used_by: ['example/application'], used_by_count: 1 }],
      },
      '/api/v1/keeper/hub/versions': { success: true, items: [{ version: '1.1.0' }, { version: '1.0.0' }] },
      '/api/v1/keeper/hub/dependencies/plan': {
        success: true, module_count: 1, requirements: [], missing_requirements: [],
        graph: [{ module: component, version: '1.1.0', direct: true }],
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const row = w.findAll('.inst-row').find(r => r.text().includes(component))!
    expect(row.exists()).toBe(true)
    await row.findAll('button').find(b => b.attributes('aria-label')?.includes('update planner'))!.trigger('click')
    await flushPromises()
    const dialog = w.findComponent({ name: 'InstallDialog' })
    const planCalls = () => api.post.mock.calls.filter(call => call[0] === '/api/v1/keeper/hub/dependencies/plan')
    expect(planCalls().length).toBeGreaterThan(0)
    expect(JSON.parse(JSON.stringify(planCalls().at(-1)![1]))).toEqual({
      component, version: '>=1.1.0', run_migrations: true, ...(dependencyId ? { id: dependencyId } : {}),
    })
    expect(dialog.props('currentId')).toBe(dependencyId)
    expect(dialog.props('installedDep').id).toBe(dependencyId || component)
    expect(dialog.findAll('p').some(p => p.text().includes('application root dependency'))).toBe(!dependencyId)
    await dialog.findAll('button').find(b => b.text().includes('Preview changes'))!.trigger('click')
    await flushPromises()
    await dialog.findAll('button').find(b => b.text().includes('Skip scan'))!.trigger('click')
    await flushPromises()
    await dialog.find('.km-modal-foot .km-btn:last-child').trigger('click')
    await flushPromises()
    const installs = api.post.mock.calls.filter(call => call[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installs).toHaveLength(2)
    for (const [index, call] of installs.entries()) {
      expect(JSON.parse(JSON.stringify(call[1]))).toEqual({
        component, version: '>=1.1.0', migration_policy: 'up',
        ...(dependencyId ? { id: dependencyId } : {}), ...(index === 0 ? { dry_run: true } : {}),
      })
    }
    w.unmount()
  })

  it('opens a manual update at latest instead of re-submitting the installed version', async () => {
    const api = makeApi({
      __get: (url: string, config?: any) => {
        if (url === '/api/v1/keeper/hub/versions' && config?.params?.module === 'kickside/core') {
          return { success: true, items: [{ version: '0.1.5' }, { version: '0.1.4' }] }
        }
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()

    const row = w.findAll('.inst-row').find(r => r.text().includes('kickside/core'))
    expect(row).toBeTruthy()
    const update = row!.findAll('button').find(b => b.attributes('aria-label')?.includes('update planner'))
    expect(update).toBeTruthy()
    await update!.trigger('click')
    await flushPromises()

    const dialog = w.findComponent({ name: 'InstallDialog' })
    expect(dialog.exists()).toBe(true)
    expect(dialog.props('mode')).toBe('update')
    expect(dialog.props('version')).toBe('')
    w.unmount()
  })

  it('leaves no root stuck planning when one plan fails during update all', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: [
          { id: 'dep1', component: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' },
          { id: 'dep2', component: 'chestor/workspace', version: '0.1.0', is_root: true, source: 'hub' },
        ],
        modules: [
          { name: 'kickside/core', version: '0.1.4', is_root: true, source: 'hub' },
          { name: 'chestor/workspace', version: '0.1.0', is_root: true, source: 'hub' },
        ],
      },
      __get: (url: string, config?: any) => {
        if (url === '/api/v1/keeper/hub/versions') {
          const module = config?.params?.module
          if (module === 'kickside/core') return { success: true, items: [{ version: '0.1.5', is_latest: true }] }
          if (module === 'chestor/workspace') return { success: true, items: [{ version: '0.1.1', is_latest: true }] }
        }
        return undefined
      },
      __post: (url: string, body: any) => {
        // The first root plans cleanly; the second one's plan fails outright.
        if (url === '/api/v1/keeper/hub/dependencies/plan') {
          if (body.component === 'chestor/workspace') return new Error('planner unavailable')
          return { success: true, missing_requirements: [], install_payload: { id: 'dep1' } }
        }
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.findAll('button').find(b => b.text().includes('Scan updates'))!.trigger('click')
    await flushPromises()
    await w.findAll('button').find(b => b.text().includes('Update all'))!.trigger('click')
    await flushPromises()
    // A failed plan aborts the batch: nothing is installed, and no row is left
    // spinning on a transient status.
    expect((api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')).toHaveLength(0)
    expect(w.html()).not.toContain('inst-update planning')
    expect(w.html()).not.toContain('inst-update updating')
    expect(w.html()).toContain('inst-update failed')
    expect(w.text()).toContain('planner unavailable')
    // Update all is offered again rather than staying disabled forever.
    expect(w.findAll('button').find(b => b.text().includes('Update all'))!.attributes('disabled')).toBeUndefined()
    w.unmount()
  })

  it('blocks update all when the planner still reports missing requirements', async () => {
    const api = makeApi({
      __get: (url: string, config?: any) => {
        if (url === '/api/v1/keeper/hub/versions' && config?.params?.module === 'kickside/core') {
          return { success: true, items: [{ version: '0.1.5', is_latest: true }] }
        }
        return undefined
      },
      __post: (url: string) => {
        if (url === '/api/v1/keeper/hub/dependencies/plan') {
          return { success: true, missing_requirements: ['kickside.core.security:required_scope'] }
        }
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.findAll('button').find(b => b.text().includes('Scan updates'))!.trigger('click')
    await flushPromises()
    await w.findAll('button').find(b => b.text().includes('Update all'))!.trigger('click')
    await flushPromises()

    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')).toBe(false)
    expect(w.html()).toContain('blocked')
    expect(w.html()).toContain('kickside.core.security:required_scope')
    w.unmount()
  })















})
