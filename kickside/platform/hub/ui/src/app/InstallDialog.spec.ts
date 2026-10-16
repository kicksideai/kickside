import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { api as proxyApi } from '@wippy-fe/proxy'
import InstallDialog from './InstallDialog.vue'
import { useInstallDialog } from './useInstallDialog.ts'
import { reactive } from 'vue'

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


  it('keeps an AI-resolved typed candidate typed', async () => {
    const key = 'acme.tools:strict'
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': {
        success: true,
        module_count: 1,
        install_payload: { id: 'app.deps:tools' },
        graph: [{ module: 'acme/tools', version: '1.0.0', direct: true }],
        // A typed host option the planner offers as true/false, with nothing bound yet:
        // the only carrier of its type is the suggestion list.
        requirements: [{
          name: 'strict', parameter_name: key, full_id: key, module: 'acme/tools',
          required: true, missing: true, value: '',
          suggestions: [{ value: true, label: 'Strict' }, { value: false, label: 'Lenient' }],
        }],
        missing_requirements: [key],
        migrations: [],
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    w.element.addEventListener('instrumentRequirementResolution', (event: Event) => {
      const detail = (event as CustomEvent).detail
      detail.accept()
      detail.respond({ success: true, parameters: [{ name: key, value: false, reason: 'Lenient mode fits.' }] })
    })
    await buttonWithText(w, 'Requirements').trigger('click')
    await buttonWithText(w, 'Resolve with AI').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Review AI suggestions before applying.')
    expect((requirementField(w).element as HTMLInputElement).value).toBe('')
    await buttonWithText(w, 'Accept all').trigger('click')
    await flushPromises()
    expect((requirementField(w).element as HTMLInputElement).value).toBe('false')
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    const call = (api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install').at(-1)
    expect(call?.[1].parameters).toEqual([{ name: key, value: false }])
    w.unmount()
  })

  it('refuses to submit a value that does not match a typed requirement', async () => {
    const key = 'acme.tools:retention'
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': {
        success: true,
        module_count: 1,
        install_payload: { id: 'app.deps:tools' },
        graph: [{ module: 'acme/tools', version: '1.0.0', direct: true }],
        requirements: [{ name: 'retention', parameter_name: key, full_id: key, module: 'acme/tools',
          required: true, value: 30, default: 30, suggestions: [{ value: 30 }] }],
        missing_requirements: [],
        migrations: [],
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    await requirementField(w).setValue('12abc')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    expect(w.find('.km-req.is-invalid').exists()).toBe(true)
    expect(w.text()).toContain('expects a number')
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    const installCalls = (api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installCalls).toHaveLength(0)
    // Correcting the value clears the block and submits the number.
    await requirementField(w).setValue('45')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    expect(w.find('.km-req.is-invalid').exists()).toBe(false)
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.filter((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install').at(-1)?.[1].parameters)
      .toEqual([{ name: key, value: 45 }])
    w.unmount()
  })



  it('marks the requirements section as blocking and jumps there on Install', async () => {
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    // A required, unset requirement → the footer flags it and Install jumps.
    expect(w.find('.km-foot-note').exists()).toBe(true)
    await w.find('.km-modal-foot .km-btn:last-child').trigger('click')
    await flushPromises()
    // Requirements section is now active and shows the required router field.
    expect(w.html()).toContain('router')
    expect(w.find('.km-req.is-missing').exists()).toBe(true)
    w.unmount()
  })

  it('auto-fits missing requirements from clear planner suggestions', async () => {
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    const field = requirementField(w)
    expect((field.element as HTMLInputElement).value).toBe('')
    expect(w.find('datalist option[value="app:api"]').exists()).toBe(true)
    const footerAutoFit = w.findAll('.km-modal-foot button').find(b => b.text().includes('Auto-fit'))
    expect(footerAutoFit, 'footer Auto-fit button').toBeTruthy()
    await footerAutoFit!.trigger('click')
    await flushPromises()
    expect((field.element as HTMLInputElement).value).toBe('app:api')
    expect(w.find('.km-req.is-missing').exists()).toBe(false)
    w.unmount()
  })

  it('resolves ambiguous requirements through the host and accepts only planner candidates', async () => {
    installHost(makeApi({
      '/api/v1/keeper/hub/dependencies/plan': {
        success: true,
        module_count: 1,
        dependency: { id: 'app.deps:tools' },
        install_payload: { id: 'app.deps:tools' },
        graph: [{ module: 'acme/tools', version: '1.0.0', direct: true }],
        requirements: [{
          name: 'router', parameter_name: 'acme.tools:router', full_id: 'acme.tools:router',
          module: 'acme/tools', required: true, missing: true, expected_kind: 'http.router', value: '',
          targets: [{ entry: 'acme.tools:serve.endpoint', path: '.meta.router' }],
          suggestions: [{ value: 'app:api', label: 'Private API' }, { value: 'app:api.public', label: 'Public API' }],
        }],
        missing_requirements: ['acme.tools:router'],
        migrations: [],
      },
    }))
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    const requests: unknown[] = []
    w.element.addEventListener('instrumentRequirementResolution', (event: Event) => {
      const detail = (event as CustomEvent).detail
      requests.push(detail)
      detail.accept()
      detail.respond({
        success: true,
        parameters: [
          { name: 'acme.tools:router', value: 'invented:router' },
          { name: 'acme.tools:router', value: 'app:api.public', reason: 'Public API fits the artifact.' },
        ],
      })
    })
    await buttonWithText(w, 'Requirements').trigger('click')
    await buttonWithText(w, 'Resolve with AI').trigger('click')
    await flushPromises()
    expect(requests).toHaveLength(1)
    expect((requirementField(w).element as HTMLInputElement).value).toBe('')
    expect(w.text()).toContain('Review AI suggestions before applying.')
    expect((requirementField(w).element as HTMLInputElement).value).toBe('')
    await buttonWithText(w, 'Accept all').trigger('click')
    await flushPromises()
    expect((requirementField(w).element as HTMLInputElement).value).toBe('app:api.public')
    w.unmount()
  })

  it('allows custom requirement values when planner suggestions exist', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/install': {
        success: true,
        dry_run: true,
        payload: { execution: [{ step: 'validate.parameters', status: 'ok' }] },
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    const field = requirementField(w)
    expect(w.find('datalist option[value="app:api"]').exists()).toBe(true)
    await field.setValue('custom:api')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    expect((field.element as HTMLInputElement).value).toBe('custom:api')
    const installCall = (api.post as any).mock.calls.find((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installCall?.[1].parameters).toEqual([{ name: 'app.deps:router', value: 'custom:api' }])
    w.unmount()
  })




  it('renders resolved transitive requirements read-only and never submits them', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/install': {
        success: true,
        dry_run: true,
        payload: { execution: [{ step: 'validate.parameters', status: 'ok' }] },
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    expect(w.html()).toContain('configured by wippy/dep; install it directly to override')
    const field = requirementField(w)
    await field.setValue('app:api')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    const installCall = (api.post as any).mock.calls.find((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installCall?.[1].parameters).toEqual([{ name: 'app.deps:router', value: 'app:api' }])
    expect(w.html()).toContain('validate parameters')
    w.unmount()
  })

  it('allows missing transitive requirements to be configured by fully-qualified name', async () => {
    const transitivePlan = {
      success: true,
      module_count: 2,
      dependency: { id: 'app.deps:tools' },
      install_payload: { id: 'app.deps:tools' },
      graph: [
        { module: 'acme/tools', path: 'acme/tools', version: '1.0.0', direct: true },
        { module: 'wippy/dep', namespace: 'wippy.dep', path: 'acme/tools/wippy/dep', parent: 'acme/tools', version: '0.2.0', depth: 1, direct: false },
      ],
      requirements: [
        { name: 'scope', parameter_name: 'wippy.dep:scope', full_id: 'wippy.dep:scope', module: 'wippy/dep', namespace: 'wippy.dep', depth: 1, required: true, missing: true, transitive: true, expected_kind: 'security.scope', value: '', suggestions: [{ value: 'app.security:user', label: 'Users' }] },
      ],
      missing_requirements: ['wippy.dep:scope'],
      migrations: [],
    }
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': transitivePlan,
      '/api/v1/keeper/hub/dependencies/install': {
        success: true,
        dry_run: true,
        payload: { execution: [{ step: 'validate.parameters', status: 'ok' }] },
      },
    })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    expect(w.html()).toContain('1 required setting missing')
    const rowAutoFit = w.findAll('.km-req button').find(b => b.text().includes('Auto-fit'))
    expect(rowAutoFit, 'row Auto-fit button').toBeTruthy()
    await rowAutoFit!.trigger('click')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    await buttonWithText(w, 'Preview changes').trigger('click')
    await flushPromises()
    const installCall = (api.post as any).mock.calls.find((c: any[]) => c[0] === '/api/v1/keeper/hub/dependencies/install')
    expect(installCall?.[1].requirement_bindings).toEqual([{ name: 'wippy.dep:scope', value: 'app.security:user' }])
    expect(installCall?.[1].parameters).toBeUndefined()
    w.unmount()
  })







})


describe('required setup installation completion', () => {
  it('verifies module setup before reporting an installation change', async () => {
    let release!: (value: unknown) => void
    const pending = new Promise(resolve => { release = resolve })
    let ready = false
    const status = () => ({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1',
      ready, status: ready ? 'ready' : 'missing' })
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': { success: true, requirements: [
        { name: 'required_setup', default: 'registry:v1:acme.tools:setup' },
      ], migrations: [], graph: [] },
      __post: (url: string) => url === '/api/v1/hub/required-setup' ? pending : undefined,
    })
    const get = api.get
    api.get = vi.fn((url: string) => url === '/api/v1/hub/required-setup'
      ? Promise.resolve({ data: status(), status: 200 }) : get(url))
    installHost(api)
    const changed = vi.fn()
    let controls!: ReturnType<typeof useInstallDialog>
    const w = mount({ setup() { controls = useInstallDialog(reactive({ ...baseProps }), changed); return () => null } })
    await flushPromises()
    controls.skipScan()
    controls.primaryAction()
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/hub/required-setup', { descriptor: 'acme.tools:setup' })
    expect(changed).not.toHaveBeenCalled()
    ready = true
    release(status())
    await flushPromises()
    expect(changed).toHaveBeenCalledWith('changed')
    w.unmount()
  })
  it('reports malformed setup as a plan error', async () => {
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': { success: true, requirements: [
        { name: 'required_setup', default: 'invalid' },
      ], graph: [], migrations: [] },
    })
    installHost(api)
    let controls!: ReturnType<typeof useInstallDialog>
    const w = mount({ setup() { controls = useInstallDialog(reactive({ ...baseProps }), vi.fn()); return () => null } })
    await flushPromises()
    expect(controls.planError.value).toContain('invalid required setup descriptor')
    expect(controls.primaryDisabled.value).toBe(true)
    w.unmount()
  })

  it('clears running state when an install closes and reopens', async () => {
    let release!: (value: unknown) => void
    const pending = new Promise(resolve => { release = resolve })
    const api = makeApi({
      '/api/v1/keeper/hub/dependencies/plan': { success: true, requirements: [], graph: [], migrations: [] },
      __post: (url: string) => url.endsWith('/install') ? pending : undefined,
    })
    installHost(api)
    const props = reactive({ ...baseProps })
    const changed = vi.fn()
    let controls!: ReturnType<typeof useInstallDialog>
    const w = mount({ setup() { controls = useInstallDialog(props, changed); return () => null } })
    await flushPromises()
    controls.skipScan()
    controls.primaryAction()
    await flushPromises()
    expect(controls.running.value).toBe(true)
    props.open = false
    await flushPromises()
    props.open = true
    await flushPromises()
    expect(controls.running.value).toBe(false)
    release({ success: true })
    await flushPromises()
    expect(changed).not.toHaveBeenCalledWith('changed')
    w.unmount()
  })

  it('cancels AI requirement replies when the dialog closes', async () => {
    installHost(makeApi())
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    let reply!: (value: unknown) => void
    let signal!: AbortSignal
    w.element.addEventListener('instrumentRequirementResolution', (event: Event) => {
      const detail = (event as CustomEvent).detail
      detail.accept()
      reply = detail.respond
      signal = detail.signal
    })
    // More than one planner-approved candidate makes AI resolution relevant.
    const controls = (w.vm as any).c as ReturnType<typeof useInstallDialog>
    controls.plan.value!.requirements![0].suggestions!.push({ value: 'app:other', label: 'Other' })
    const attempt = controls.resolveRequirementsWithAI(w.element)
    controls.close()
    expect(signal.aborted).toBe(true)
    reply({ success: true, parameters: [{ name: 'app.deps:router', value: 'app:other' }] })
    await attempt
    expect(controls.parameterValues.value['app.deps:router']).not.toBe('app:other')
    expect(controls.aiResolutionNotice.value).toBeNull()
    w.unmount()
  })

})
