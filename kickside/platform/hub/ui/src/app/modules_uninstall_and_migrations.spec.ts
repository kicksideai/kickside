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








  it('does not render a direct uninstall action for transitive rows', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const workspace = w.findAll('.inst-row').find(r => r.text().includes('chestor/workspace'))
    expect(workspace).toBeTruthy()
    expect(workspace!.find('.km-danger').exists()).toBe(false)
    const disabledUninstall = workspace!.find('button[disabled][aria-label*="Cannot uninstall"]')
    expect(disabledUninstall.exists()).toBe(true)
    expect(disabledUninstall.attributes('title')).toContain('used by kickside/core')
    w.unmount()
  })







  it('shows why an installed detail page cannot uninstall a transitive module', async () => {
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    const workspace = w.findAll('.inst-row').find(r => r.text().includes('chestor/workspace'))
    await workspace!.trigger('click')
    await flushPromises()
    const uninstall = w.find('.d-hero-actions button[disabled]')
    expect(uninstall.exists()).toBe(true)
    expect(uninstall.text()).toContain('Uninstall')
    expect(uninstall.attributes('title')).toContain('used by kickside/core')
    w.unmount()
  })

  it('requires an uninstall preview before running the real uninstall', async () => {
    const api = makeApi({
      __post: (url: string, body: any) => {
        if (url === '/api/v1/keeper/hub/dependencies/uninstall' && body?.dry_run) {
          return { success: true, preview: { removed: [{ name: 'kickside/core', version: '0.1.4' }], kept: [{ name: 'chestor/workspace', version: '0.1.0' }], kept_under_uncertainty: [], warnings: ['review migrations'] } }
        }
        if (url === '/api/v1/keeper/hub/dependencies/uninstall') {
          return { success: true, payload: { execution: [{ step: 'remove.entries', status: 'ok' }] } }
        }
        return undefined
      },
    })
    installHost(api)
    const navChanged = vi.fn()
    window.addEventListener('kickside:nav-changed', navChanged)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.find('.inst-row .km-danger').trigger('click')
    await flushPromises()
    expect(w.html()).toContain('Removed')
    expect(w.html()).toContain('Kept, still needed')
    expect(w.html()).toContain('review migrations')
    await w.find('.km-modal-foot .km-btn-danger').trigger('click')
    await flushPromises()
    const uninstallCalls = (api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/uninstall')
    expect(uninstallCalls).toHaveLength(2)
    expect(uninstallCalls[0][1]).toMatchObject({ id: 'dep1', component: 'kickside/core', dry_run: true })
    expect(uninstallCalls[1][1]).toMatchObject({ id: 'dep1', component: 'kickside/core' })
    expect(w.html()).toContain('remove entries')
    expect(navChanged).toHaveBeenCalledTimes(1)
    window.removeEventListener('kickside:nav-changed', navChanged)
    w.unmount()
  })

  it('keeps uninstall clickable when preview returns no preview payload', async () => {
    const api = makeApi({
      __post: (url: string, body: any) => {
        if (url === '/api/v1/keeper/hub/dependencies/uninstall' && body?.dry_run) {
          return { success: true }
        }
        if (url === '/api/v1/keeper/hub/dependencies/uninstall') {
          return { success: true, payload: { execution: [{ step: 'remove.entries', status: 'ok' }] } }
        }
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.find('.inst-row .km-danger').trigger('click')
    await flushPromises()
    expect(w.html()).toContain('Uninstall preview returned no preview data.')
    const uninstall = w.find('.km-modal-foot .km-btn-danger')
    expect(uninstall.attributes('disabled')).toBeUndefined()

    await uninstall.trigger('click')
    await flushPromises()
    const calls = (api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/uninstall')
    expect(calls).toHaveLength(2)
    expect(calls.some((c: any[]) => !c[1]?.dry_run)).toBe(true)
    expect(w.html()).toContain('remove entries')
    w.unmount()
  })

  it('renders DEPENDENCY_REQUIRED required_by roots and blocks uninstall', async () => {
    const err = Object.assign(new Error('dependency required'), {
      response: {
        status: 409,
        data: {
          success: false,
          code: 'DEPENDENCY_REQUIRED',
          error: 'dependency required',
          details: { required_by: { 1: 'kickside/app', 2: 'kickside/admin' } },
        },
      },
    })
    const api = makeApi({
      __post: (url: string, body: any) => url === '/api/v1/keeper/hub/dependencies/uninstall' && body?.dry_run ? err : undefined,
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.find('.inst-row .km-danger').trigger('click')
    await flushPromises()
    expect(w.html()).toContain('DEPENDENCY_REQUIRED')
    expect(w.html()).toContain('required by: kickside/app, kickside/admin')
    expect(w.html()).toContain('Uninstall blocked:')
    expect(w.html()).toContain('Still required by: kickside/app, kickside/admin')
    expect(w.find('.km-modal-foot .km-btn-danger').attributes('disabled')).toBeDefined()
    w.unmount()
  })

  it('explains migration-policy blocks before uninstall can run', async () => {
    const err = Object.assign(new Error('dependency has applied migrations'), {
      response: {
        status: 409,
        data: {
          success: false,
          code: 'MIGRATIONS_APPLIED',
          error: 'dependency has applied migrations; choose migration_policy=down or migration_policy=leave',
          details: {},
        },
      },
    })
    const api = makeApi({
      __post: (url: string, body: any) => url === '/api/v1/keeper/hub/dependencies/uninstall' && body?.dry_run ? err : undefined,
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.find('.inst-row .km-danger').trigger('click')
    await flushPromises()
    expect(w.html()).toContain('MIGRATIONS_APPLIED')
    expect(w.html()).toContain('Applied migrations exist')
    expect(w.html()).toContain('Leave applied migrations')
    expect(w.find('.km-modal-foot .km-btn-danger').attributes('disabled')).toBeDefined()
    expect(w.find('.km-modal-foot .km-btn-danger').attributes('title')).toContain('Applied migrations exist')
    w.unmount()
  })

  it('sends migration_policy=down for uninstall preview and run when rollback is selected', async () => {
    const api = makeApi({
      __post: (url: string, body: any) => {
        if (url === '/api/v1/keeper/hub/dependencies/uninstall' && body?.dry_run) {
          return { success: true, preview: { removed: [{ name: 'kickside/core', version: '0.1.4' }], kept: [], kept_under_uncertainty: [], warnings: [] } }
        }
        if (url === '/api/v1/keeper/hub/dependencies/uninstall') {
          return { success: true, payload: { execution: [{ step: 'run.down_migrations', status: 'ok' }] } }
        }
        return undefined
      },
    })
    installHost(api)
    const w = mount(Modules, { global: { stubs } })
    await flushPromises()
    await w.find('.inst-row .km-danger').trigger('click')
    await flushPromises()
    await setSelect(w, 'Uninstall migration policy', 'down')
    await w.find('.km-modal-foot .km-btn-danger').trigger('click')
    await flushPromises()

    const calls = (api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/uninstall')
    expect(calls.some((c: any[]) => c[1]?.dry_run && c[1]?.migration_policy === 'down')).toBe(true)
    expect(calls.some((c: any[]) => !c[1]?.dry_run && c[1]?.migration_policy === 'down')).toBe(true)
    expect(w.html()).toContain('run down migrations')
    w.unmount()
  })









})
