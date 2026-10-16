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

  it.each([365, 30, 0, true, false])('renders typed default %s and preserves it through preview and install', async (value) => {
    const key = 'acme.tools:retention'
    const plan = {
      module_count: 1,
      graph: [{ module: 'acme/tools', version: '1.0.0', direct: true }],
      requirements: [{ name: 'retention', parameter_name: key, module: 'acme/tools',
        required: true, value, default: value, suggestions: [{ value }] }],
      missing_requirements: [],
    }
    const api = makeApi({ '/api/v1/keeper/hub/dependencies/plan': plan })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    expect(w.find('.km-req.is-missing').exists()).toBe(false)
    expect((requirementField(w).element as HTMLInputElement).value).toBe(String(value))
    expect(w.find(`datalist option[value="${String(value)}"]`).exists()).toBe(true)
    expect(w.text()).toContain('1/1')
    // Changing the version policy replans with the same typed bindings.
    await buttonWithText(w, 'Pin 1.0.0').trigger('click')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    const planCalls = (api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/plan')
    expect(planCalls.length).toBeGreaterThan(1)
    expect(planCalls.at(-1)[1].parameters).toEqual([{ name: key, value }])
    const preview = buttonWithText(w, 'Preview changes')
    expect(preview.attributes('disabled')).toBeUndefined()
    await preview.trigger('click')
    await flushPromises()
    const calls = () => (api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(calls()[0][1].parameters).toEqual([{ name: key, value }])
    // Text input edits and cleared values must not lose numeric/boolean typing.
    await requirementField(w).setValue('')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    expect(w.find('.km-req.is-missing').exists()).toBe(true)
    await requirementField(w).setValue(String(value))
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    await preview.trigger('click')
    await flushPromises()
    expect(calls().at(-1)[1].parameters).toEqual([{ name: key, value }])
    // Closing and reopening must not regress into a render failure.
    await w.setProps({ open: false })
    await w.setProps({ open: true })
    await flushPromises()
    expect(w.find('.km-req.is-missing').exists()).toBe(false)
    await buttonWithText(w, 'Skip scan').trigger('click')
    await flushPromises()
    await w.find('.km-modal-foot .km-btn:last-child').trigger('click')
    await flushPromises()
    expect(calls().at(-1)[1].parameters).toEqual([{ name: key, value }])
    w.unmount()
  })









  it('carries forward installed parameters by short name on update', async () => {
    const props = {
      ...baseProps,
      mode: 'update' as const,
      currentId: 'app.deps:tools',
      installedDep: {
        id: 'app.deps:tools',
        namespace: 'app.deps',
        name: 'tools',
        component: 'acme/tools',
        version: '1.0.0',
        parameters: { router: 'app:api' },
      },
    }
    const w = mount(InstallDialog, { props, global: { stubs } })
    await flushPromises()
    const field = requirementField(w)
    expect((field.element as HTMLInputElement).value).toBe('app:api')
    expect(w.find('.km-req.is-missing').exists()).toBe(false)
    w.unmount()
  })

  it('selects the newest release and tracks it for updates by default', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/versions': {
        success: true,
        items: [{ version: '0.1.23' }, { version: '0.1.22' }],
      },
      '/api/v1/keeper/hub/dependencies/plan': {
        success: true,
        module_count: 1,
        dependency: { id: 'app.deps:crm' },
        install_payload: { id: 'app.deps:crm' },
        graph: [{ module: 'acme/crm', version: '0.1.23', direct: true }],
        requirements: [],
        missing_requirements: [],
        migrations: [],
      },
      '/api/v1/keeper/hub/dependencies/install': {
        success: true,
        dependency: { id: 'app.deps:crm' },
      },
    })
    installHost(api)
    const props = {
      ...baseProps,
      mode: 'update' as const,
      component: 'acme/crm',
      version: '',
      currentId: 'app.deps:crm',
      installedDep: {
        id: 'app.deps:crm',
        namespace: 'app.deps',
        name: 'crm',
        component: 'acme/crm',
        version: '*',
      },
    }
    const w = mount(InstallDialog, { props, global: { stubs } })
    await flushPromises()

    expect(w.text()).toContain('Track updates')
    await buttonWithText(w, 'Skip scan').trigger('click')
    await buttonWithText(w, 'Update').trigger('click')
    await flushPromises()

    const installCall = (api.post as any).mock.calls.find((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installCall?.[1]).toMatchObject({
      component: 'acme/crm',
      id: 'app.deps:crm',
      version: '>=0.1.23',
    })
    w.unmount()
  })

  it('carries forward matching installed dependency parameters on new installs', async () => {
    const scopePlan = {
      success: true,
      module_count: 1,
      dependency: { id: 'app.deps:models' },
      install_payload: { id: 'app.deps:models' },
      graph: [{ module: 'kickside/models', version: '1.0.0', direct: true }],
      requirements: [
        { name: 'user_security_scope', parameter_name: 'kickside.uploads.security:user_security_scope', full_id: 'kickside.uploads.security:user_security_scope', module: 'kickside/models', required: true, missing: true, value: '', suggestions: [] },
      ],
      missing_requirements: ['kickside.uploads.security:user_security_scope'],
      migrations: [],
    }
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': scopePlan,
      '/api/v1/keeper/hub/dependencies': {
        success: true,
        dependencies: [
          {
            id: 'app.deps:automation',
            namespace: 'app.deps',
            name: 'automation',
            component: 'kickside/automation',
            version: '1.0.0',
            parameters: [{ name: 'user_security_scope', value: 'app.security:user' }],
          },
        ],
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    await buttonWithText(w, 'Requirements').trigger('click')
    await flushPromises()
    const field = requirementField(w)
    expect((field.element as HTMLInputElement).value).toBe('app.security:user')
    expect(w.find('.km-req.is-missing').exists()).toBe(false)
    w.unmount()
  })









})
