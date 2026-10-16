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




  it('loads the plan and renders the two-pane shell with all sections', async () => {
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    expect(w.find('.km-dialog-2p').exists()).toBe(true)
    // Five section tabs in the rail.
    expect(w.findAll('.km-2p-navitem')).toHaveLength(5)
    // Modules section lists the direct module + its transitive dependency.
    const html = w.html()
    expect(html).toContain('acme/tools')
    expect(html).toContain('wippy/dep')
    expect(html).toContain('transitive')
    expect(html).toContain('shared')
    expect(html).not.toContain('acme.tools.api:list.endpoint .meta.router')
    w.unmount()
  })

  it('does not plan after the dialog closes during initial metadata loading', async () => {
    let releaseVersions!: (value: unknown) => void
    const versions = new Promise(resolve => { releaseVersions = resolve })
    const api = makeApi({ '/api/v1/keeper/hub/versions': versions })
    installHost(api)
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await Promise.resolve()

    await w.setProps({ open: false })
    releaseVersions({ success: true, items: [{ version: '1.0.0' }] })
    await flushPromises()

    expect((api.post as any).mock.calls.some((call: any[]) => call[0] === '/api/v1/keeper/hub/dependencies/plan')).toBe(false)
    w.unmount()
  })
















  it('emits close from the footer Cancel button', async () => {
    const w = mount(InstallDialog, { props: baseProps, global: { stubs } })
    await flushPromises()
    await w.find('.km-modal-foot .km-btn-text').trigger('click')
    expect(w.emitted('close')).toBeTruthy()
    w.unmount()
  })
})
