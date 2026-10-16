import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { api as proxyApi } from '@wippy-fe/proxy'
import InstallDialog from './InstallDialog.vue'

function makeApi(over: Record<string, unknown> = {}) {
  const plan = {
    success: true,
    module_count: 2,
    dependency: { id: 'app.deps:tools' },
    install_payload: { id: 'app.deps:tools' },
    graph: [
      { module: 'acme/tools', path: 'acme/tools', version: '1.0.0', direct: true, size_bytes: 2048, entry_count: 5 },
      { module: 'wippy/dep', path: 'acme/tools/wippy/dep', parent: 'acme/tools', version: '0.2.0', direct: false, shared: true, size_bytes: 512 },
    ],
    requirements: [
      { name: 'router', parameter_name: 'app.deps:router', full_id: 'app.deps:router', module: 'acme/tools', required: true, missing: true, expected_kind: 'http.router', value: '', default: '', targets: [{ entry: 'acme.tools.api:list.endpoint', path: '.meta.router' }], suggestions: [{ value: 'app:api', label: 'app:api' }] },
      { name: 'store', parameter_name: 'wippy/dep:store', full_id: 'wippy/dep:store', module: 'wippy/dep', required: false, transitive: true, value: '', default: 'app.env:store' },
    ],
    missing_requirements: ['app.deps:router'],
    migrations: [{ id: 'app.deps:tools:mig1', status: 'pending' }],
  }
  const data: Record<string, unknown> = {
    '/api/v1/keeper/hub/versions': { success: true, items: [{ version: '1.0.0' }, { version: '0.9.0' }] },
    '/api/v1/keeper/hub/readme': { success: true, content: '# Tools\n\nHelpers.' },
    '/api/v1/keeper/hub/dependencies': { success: true, dependencies: [] },
    '/api/v1/keeper/hub/dependencies/plan': plan,
    '/api/v1/keeper/hub/scan': { success: true, overall_status: 'clean', modules: [], scanned: 2, total: 2 },
    ...over,
  }
  const response = (url: string, payload?: unknown) => {
    const override = typeof over.__post === 'function' ? (over.__post as (url: string, body?: unknown) => unknown)(url, payload) : undefined
    const body = override ?? data[url] ?? { success: true }
    if (body instanceof Error) return Promise.reject(body)
    if (body && typeof (body as Promise<unknown>).then === 'function') {
      return (body as Promise<unknown>).then(resolved => ({ data: resolved, status: 200 }))
    }
    return Promise.resolve({ data: body, status: 200 })
  }
  return {
    get: vi.fn((url: string) => response(url)),
    post: vi.fn((url: string, body?: unknown) => response(url, body)),
    delete: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 })),
  }
}

// Route the fake api implementation through the mocked @wippy-fe/proxy `api`
// (the composable now reads the synchronous proxy client, not window.$W).
function installHost(api: { get: unknown; post: unknown; delete: unknown }) {
  ;(proxyApi.get as any).mockImplementation(api.get)
  ;(proxyApi.post as any).mockImplementation(api.post)
  ;(proxyApi.delete as any).mockImplementation(api.delete)
}

const stubs = { Icon: true }
const baseProps = { open: true, mode: 'install' as const, component: 'acme/tools', version: '1.0.0', currentId: null, catalogItem: null, installedDep: null }

function buttonWithText(w: VueWrapper, text: string) {
  const button = w.findAll('button').find(b => b.text().includes(text))
  expect(button, `button containing "${text}"`).toBeTruthy()
  return button!
}

function requirementField(w: VueWrapper) {
  const field = w.find('input.km-w-full')
  expect(field.exists(), 'requirement input').toBe(true)
  return field
}

describe('InstallDialog (mounted)', () => {
  beforeEach(() => { vi.clearAllMocks(); installHost(makeApi()) })















  it('shows security scan unavailable without surfacing malformed-body noise', async () => {
    const api = makeApi({ '/api/v1/keeper/hub/scan': new Error('Request failed with status code 404') })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    await buttonWithText(w, 'Run scan').trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/scan')).toBe(true)
    expect(w.html()).toContain('Security scan unavailable')
    expect(w.html()).not.toContain('empty or malformed response body')
    w.unmount()
  })

  it('renders install refusal message and execution ledger without raw JSON', async () => {
    const err = Object.assign(new Error('parameter targets a namespace outside the install graph'), {
      response: {
        status: 400,
        data: {
          success: false,
          code: 'PARAMETER_TARGET_UNKNOWN',
          error: 'parameter targets a namespace outside the install graph',
          details: { payload: { execution: [{ step: 'validate.parameters', status: 'failed', message: 'unknown parameter namespace' }] } },
        },
      },
    })
    const api = makeApi({ '/api/v1/keeper/hub/dependencies/install': err })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    const field = requirementField(w)
    await field.setValue('app:api')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    expect(w.html()).toContain('PARAMETER_TARGET_UNKNOWN')
    expect(w.html()).toContain('parameter targets a namespace outside the install graph')
    expect(w.html()).toContain('validate parameters')
    expect(w.html()).not.toContain('{&quot;')
    w.unmount()
  })

  it('replaces a successful preview ledger with the real install failure ledger', async () => {
    let installs = 0
    const err = Object.assign(new Error('apply failed'), {
      response: {
        status: 500,
        data: {
          success: false,
          error: 'apply failed',
          details: { payload: { execution: [{ step: 'apply.entries', status: 'failed', message: 'transaction rolled back' }] } },
        },
      },
    })
    const api = makeApi({
      __post: (url: string, body?: any) => {
        if (url !== '/api/v1/keeper/hub/dependencies/install') return undefined
        installs++
        if (body?.dry_run) return { success: true, dry_run: true, payload: { execution: [{ step: 'preview.changes', status: 'ok' }] } }
        return err
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    await requirementField(w).setValue('app:api')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    expect(w.html()).toContain('preview changes')

    await buttonWithText(w, 'Skip scan').trigger('click')
    await w.find('.km-modal-foot .km-btn:last-child').trigger('click')
    await flushPromises()

    expect(installs).toBe(2)
    expect(w.html()).toContain('apply entries')
    expect(w.html()).toContain('transaction rolled back')
    expect(w.html()).not.toContain('preview changes')
    w.unmount()
  })

  it('waits for an explicit scan decision after planning', async () => {
    const api = makeApi()
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/scan')).toBe(false)
    expect(w.html()).toContain('Security scan not run')
    expect(w.html()).toContain('Running the reviewer may spend LLM tokens')
    await buttonWithText(w, 'Run scan').trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/scan')).toBe(true)
    const scanNav = w.findAll('.km-2p-navitem')[3]
    expect(scanNav.find('.km-sev-ok-fg').exists()).toBe(true)
    w.unmount()
  })

  it('previews from the scan step without requiring a scan decision', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': {
        success: true,
        module_count: 1,
        dependency: { id: 'app.deps:tools' },
        install_payload: { id: 'app.deps:tools' },
        graph: [{ module: 'acme/tools', path: 'acme/tools', version: '1.0.0', direct: true }],
        requirements: [],
        missing_requirements: [],
        migrations: [],
      },
      __post: (url: string, body?: unknown) => {
        if (url === '/api/v1/keeper/hub/dependencies/install') {
          expect(body).toMatchObject({ dry_run: true, component: 'acme/tools' })
          return { success: true, dry_run: true, apply: { stage: 'preview' }, payload: { execution: [{ step: 'preview.changes', status: 'ok' }] } }
        }
        return undefined
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    const scanNav = w.findAll('.km-2p-navitem')[3]
    await scanNav.trigger('click')
    await flushPromises()
    const previewButton = buttonWithText(w, 'Preview changes')
    expect(previewButton.attributes('disabled')).toBeUndefined()
    await previewButton.trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/scan')).toBe(false)
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install' && c[1]?.dry_run)).toBe(true)
    expect(w.html()).toContain('Dry-run preview')
    expect(w.html()).toContain('No changes were applied.')
    expect(w.html()).not.toContain('stage: —')
    expect(w.html()).toContain('preview changes')
    w.unmount()
  })

  it('requires a scan decision before install and allows explicit skip', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/install': { success: true, dependency: { id: 'app.deps:tools' }, apply: { stage: 'applied' } },
    })
    installHost(api)
    const navChanged = vi.fn()
    window.addEventListener('kickside:nav-changed', navChanged)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    const field = requirementField(w)
    await field.setValue('app:api')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    await w.find('.km-modal-foot .km-btn:last-child').trigger('click')
    await flushPromises()
    expect(w.html()).toContain('Security scan not run')
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')).toBe(false)

    await buttonWithText(w, 'Skip scan').trigger('click')
    await flushPromises()
    await w.find('.km-modal-foot .km-btn:last-child').trigger('click')
    await flushPromises()

    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/scan')).toBe(false)
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')).toBe(true)
    expect(navChanged).toHaveBeenCalledTimes(1)
    window.removeEventListener('kickside:nav-changed', navChanged)
    w.unmount()
  })

})
