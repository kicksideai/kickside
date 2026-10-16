import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { api } from '@wippy-fe/proxy'
import InstallDialog from './InstallDialog.vue'
import { useInstallDialog } from './useInstallDialog'

const key = 'acme.tools:scope'
const row = { name: 'scope', full_id: key, parameter_name: key, module: 'acme/tools', required: true,
  missing: true, value: '', expected_kind: 'security.scope', suggestions: [
    { value: 'host:members', kind: 'security.scope' }, { value: 'host:admins', kind: 'security.scope' },
  ] }
const props = { open: true, mode: 'install' as const, component: 'acme/tools', version: '1.0.0' }
function seed(rows: unknown[] = [row]) {
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, items: [], dependencies: [] } } as any)
  vi.mocked(api.post).mockImplementation(async (_url: string, body: any) => ({ data: {
    success: true, applicable: true, install_payload: { id: 'app:tools' }, graph: [],
    requirements: rows.map((r: any) => {
      const binding = body?.parameters?.find((p: any) => p.name === r.parameter_name)
      return binding ? { ...r, value: binding.value, missing: false } : r
    }),
  } }) as any)
}
function button(w: ReturnType<typeof mount>, text: string) {
  return w.findAll('button').find(b => b.text() === text)!
}
function respond(w: ReturnType<typeof mount>, parameters = [{ name: key, value: 'host:members', reason: 'Matches the reader audience.' }]) {
  w.element.addEventListener('instrumentRequirementResolution', (e: Event) => {
    const detail = (e as CustomEvent).detail
    detail.accept()
    detail.respond({ success: true, parameters })
  })
}
describe('Hub AI review', () => {
  beforeEach(() => { vi.clearAllMocks(); seed() })
  it('uses a native modal and shared pickers without PrimeVue popups', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises()
    expect(w.find('dialog.km-dialog').exists()).toBe(true)
    expect(w.find('[aria-label="scope"]').exists()).toBe(true)
    expect(w.findComponent({ name: 'Dialog' }).exists()).toBe(false)
    expect(w.findComponent({ name: 'Select' }).exists()).toBe(false)
  })
  it.each(['install', 'update'] as const)('reviews before applying in the %s flow', async mode => {
    const w = mount(InstallDialog, { props: { ...props, mode, currentId: mode === 'update' ? 'app:tools' : null } })
    await flushPromises()
    respond(w)
    await button(w, 'Resolve with AI').trigger('click')
    await flushPromises()
    expect(w.find('input.km-w-full').element).toHaveProperty('value', '')
    expect(w.text()).toContain('Matches the reader audience.')
    expect(w.find('.km-foot-note').text()).toContain('Review 1 AI suggestion')
    expect(button(w, 'Accept')).toBeTruthy()
    expect(button(w, 'Reject')).toBeTruthy()
    expect(button(w, 'Edit')).toBeTruthy()
    expect(vi.mocked(api.post).mock.calls.some(([url]: [string, ...unknown[]]) => url.endsWith('/install'))).toBe(false)
    await button(w, 'Accept').trigger('click')
    await flushPromises()
    expect(w.find('input.km-w-full').element).toHaveProperty('value', 'host:members')
    const calls = vi.mocked(api.post).mock.calls.filter(([url]: [string, ...unknown[]]) => url.endsWith('/plan'))
    expect(calls.at(-1)?.[1]).toMatchObject({ parameters: [{ name: key, value: 'host:members' }],
      ...(mode === 'update' ? { id: 'app:tools' } : {}) })
  })
  it('rejects a proposal without changing the binding', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises(); respond(w)
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    await button(w, 'Reject').trigger('click'); await flushPromises()
    expect(w.find('input.km-w-full').element).toHaveProperty('value', '')
    expect(w.text()).not.toContain('Matches the reader audience.')
  })
  it('edits a proposal and requires a fresh plan', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises(); respond(w)
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    await button(w, 'Edit').trigger('click'); await flushPromises()
    await w.find('input.km-w-full').setValue('host:admins')
    await vi.advanceTimersByTimeAsync(350); await flushPromises()
    expect(vi.mocked(api.post).mock.calls.filter(([url]: [string, ...unknown[]]) => url.endsWith('/plan')).at(-1)?.[1])
      .toMatchObject({ parameters: [{ name: key, value: 'host:admins' }] })
  })
  it('shows the no-model state and leaves manual input enabled', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises()
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    expect(w.text()).toContain('MODEL_UNAVAILABLE')
    expect(w.find('input.km-w-full').attributes('disabled')).toBeUndefined()
  })
  it('ignores an AI reply after a manual edit', async () => {
    const state = reactive({ ...props }); let c!: ReturnType<typeof useInstallDialog>
    const w = mount({ setup() { c = useInstallDialog(state, vi.fn()); return () => null } }); await flushPromises()
    const target = new EventTarget(); let detail: any
    target.addEventListener('instrumentRequirementResolution', (e: Event) => { detail = (e as CustomEvent).detail; detail.accept() })
    const request = c.resolveRequirementsWithAI(target)
    c.setParameter(c.requirements.value[0], 'host:admins')
    detail.respond({ success: true, parameters: [{ name: key, value: 'host:members', reason: 'Old answer' }] })
    await request; await flushPromises()
    expect(c.parameterValues.value[key]).toBe('host:admins')
    expect(c.pendingSuggestions.value).toEqual({})
    expect(detail.signal.aborted).toBe(true)
  })
  it('scopes unresolved literals and excludes resolved rows', async () => {
    seed([row, { ...row, full_id: 'acme.tools:kept', parameter_name: 'acme.tools:kept', value: false,
      expected_kind: undefined, expected_type: 'boolean', missing: false },
    { ...row, full_id: 'acme.tools:literal', parameter_name: 'acme.tools:literal', expected_kind: undefined,
      expected_type: 'integer', suggestions: [] }])
    let c!: ReturnType<typeof useInstallDialog>
    mount({ setup() { c = useInstallDialog(reactive(props), vi.fn()); return () => null } }); await flushPromises()
    const target = new EventTarget(); let detail: any
    target.addEventListener('instrumentRequirementResolution', (e: Event) => {
      detail = (e as CustomEvent).detail; detail.accept(); detail.respond({ success: true, parameters: [] })
    })
    await c.resolveRequirementsWithAI(target)
    expect(detail.requirements.map((r: any) => r.name)).toEqual([key, 'acme.tools:literal'])
  })
  it('copies all proposals for editing and replans once with both values', async () => {
    const other = 'acme.tools:other'
    seed([row, { ...row, name: 'other', full_id: other, parameter_name: other }])
    const w = mount(InstallDialog, { props }); await flushPromises()
    respond(w, [{ name: key, value: 'host:members', reason: 'Readers' }, { name: other, value: 'host:admins', reason: 'Operators' }])
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    expect(button(w, 'Edit all')).toBeTruthy()
    await button(w, 'Edit all').trigger('click'); await flushPromises()
    expect(w.findAll('.km-ai-proposal')).toHaveLength(0)
    expect(w.findAll('input.km-w-full').map(input => (input.element as HTMLInputElement).value)).toEqual(['host:members', 'host:admins'])
    await vi.advanceTimersByTimeAsync(350); await flushPromises()
    expect(vi.mocked(api.post).mock.calls.filter(([url]: [string, ...unknown[]]) => url.endsWith('/plan')).at(-1)?.[1])
      .toMatchObject({ parameters: [{ name: key, value: 'host:members' }, { name: other, value: 'host:admins' }] })
  })
  it.each([['object', { enabled: false }], ['array', ['a']]])('auto-fits a %s default without losing its type', async (type, value) => {
    seed([{ ...row, expected_kind: undefined, expected_type: type, default: value, suggestions: [] }])
    const w = mount(InstallDialog, { props }); await flushPromises()
    expect(w.find('input.km-w-full').attributes('placeholder')).toBe(JSON.stringify(value))
    await button(w, 'Auto-fit').trigger('click'); await vi.advanceTimersByTimeAsync(350); await flushPromises()
    expect(vi.mocked(api.post).mock.calls.filter(([url]: [string, ...unknown[]]) => url.endsWith('/plan')).at(-1)?.[1])
      .toMatchObject({ parameters: [{ name: key, value }] })
  })
  it('retains the other pending proposal after one acceptance', async () => {
    const other = 'acme.tools:other'
    seed([row, { ...row, name: 'other', full_id: other, parameter_name: other }])
    const w = mount(InstallDialog, { props }); await flushPromises()
    respond(w, [{ name: key, value: 'host:members', reason: 'Readers' }, { name: other, value: 'host:admins', reason: 'Operators' }])
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    await button(w, 'Accept').trigger('click'); await flushPromises()
    expect(w.findAll('.km-ai-proposal')).toHaveLength(1)
    expect(w.findAll('input.km-w-full').map(input => (input.element as HTMLInputElement).value)).toEqual(['host:members', ''])
    await button(w, 'Accept all').trigger('click'); await flushPromises()
    expect(w.findAll('.km-ai-proposal')).toHaveLength(0)
    expect(w.findAll('input.km-w-full').map(input => (input.element as HTMLInputElement).value)).toEqual(['host:members', 'host:admins'])
  })
  it.each(['close', 'version'] as const)('ignores a late AI reply after %s changes', async change => {
    const state = reactive({ ...props }); let c!: ReturnType<typeof useInstallDialog>
    mount({ setup() { c = useInstallDialog(state, vi.fn()); return () => null } }); await flushPromises()
    const target = new EventTarget(); let detail: any
    target.addEventListener('instrumentRequirementResolution', (e: Event) => { detail = (e as CustomEvent).detail; detail.accept() })
    const request = c.resolveRequirementsWithAI(target)
    if (change === 'close') state.open = false
    else c.version.value = '2.0.0'
    await flushPromises()
    detail.respond({ success: true, parameters: [{ name: key, value: 'host:members', reason: 'Old plan' }] })
    await request; await flushPromises()
    expect(c.pendingSuggestions.value).toEqual({})
    expect(detail.signal.aborted).toBe(true)
  })
  it('rejects all proposals without changing either binding', async () => {
    const other = 'acme.tools:other'
    seed([row, { ...row, name: 'other', full_id: other, parameter_name: other }])
    const w = mount(InstallDialog, { props }); await flushPromises()
    respond(w, [{ name: key, value: 'host:members', reason: 'Readers' }, { name: other, value: 'host:admins', reason: 'Operators' }])
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    await button(w, 'Reject all').trigger('click'); await flushPromises()
    expect(w.findAll('.km-ai-proposal')).toHaveLength(0)
    expect(w.findAll('input.km-w-full').map(input => (input.element as HTMLInputElement).value)).toEqual(['', ''])
  })
  it('shows a typed failure with details while manual entry remains available', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises()
    w.element.addEventListener('instrumentRequirementResolution', (e: Event) => {
      const detail = (e as CustomEvent).detail; detail.accept()
      detail.respond({ success: false, code: 'UNAVAILABLE', kind: 'Unavailable', error: 'Model is offline', details: { provider: 'fast' } })
    })
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    expect(w.text()).toContain('Unavailable')
    expect(w.text()).toContain('Model is offline')
    expect(w.text()).toContain('fast')
    expect(w.find('input.km-w-full').attributes('disabled')).toBeUndefined()
  })
  it('ends a timed-out request and ignores its late reply', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises(); let detail: any
    w.element.addEventListener('instrumentRequirementResolution', (e: Event) => { detail = (e as CustomEvent).detail; detail.accept() })
    await button(w, 'Resolve with AI').trigger('click')
    expect(w.text()).toContain('Resolving…')
    await vi.advanceTimersByTimeAsync(20000); await flushPromises()
    expect(w.text()).toContain('TIMEOUT')
    expect(detail.signal.aborted).toBe(true)
    detail.respond({ success: true, parameters: [{ name: key, value: 'host:members', reason: 'Too late' }] })
    await flushPromises()
    expect(w.findAll('.km-ai-proposal')).toHaveLength(0)
  })
  it('retains row diagnostics for a rejected model answer', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises()
    w.element.addEventListener('instrumentRequirementResolution', (e: Event) => {
      const detail = (e as CustomEvent).detail; detail.accept()
      detail.respond({ success: true, parameters: [], requirements: [{ ...row,
        resolution_error: { kind: 'Invalid', code: 'INVALID_CHOICE', message: 'Value fails the current plan', details: { requirement: key } } }] })
    })
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    expect(w.find('[role="alert"]').text()).toContain('Value fails the current plan')
    expect(w.find('[role="alert"]').text()).toContain(key)
    expect(w.findAll('.km-ai-proposal')).toHaveLength(0)
  })
  it('announces the selected version mode', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises()
    const radios = w.findAll('[aria-pressed]')
    expect(radios).toHaveLength(2)
    expect(radios.map(r => r.attributes('aria-pressed'))).toEqual(['false', 'true'])
    await radios[0].trigger('click')
    expect(radios.map(r => r.attributes('aria-pressed'))).toEqual(['true', 'false'])
  })
  it('does not schedule a highlight timeout after unmount while rendering is pending', async () => {
    const w = mount(InstallDialog, { props }); await flushPromises()
    button(w, 'Install').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await Promise.resolve()
    w.unmount()
    await flushPromises()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('does not invalidate a reviewed plan on an unchanged input event', async () => {
    seed([{ ...row, value: 'host:members', missing: false }])
    const w = mount(InstallDialog, { props }); await flushPromises()
    const before = vi.mocked(api.post).mock.calls.length
    await w.find('input.km-w-full').trigger('input')
    await w.find('input.km-w-full').trigger('blur')
    await vi.advanceTimersByTimeAsync(350); await flushPromises()
    expect(vi.mocked(api.post).mock.calls).toHaveLength(before)
  })
  it('keeps a reviewed transitive value in requirement_bindings after the planner resolves it', async () => {
    seed([{ ...row, module: 'dep/child', transitive: true, depth: 1 }])
    vi.mocked(api.post).mockImplementation(async (_url: string, body: any) => ({ data: {
      success: true, applicable: true, graph: [], install_payload: { id: 'app:tools' },
      requirements: [{ ...row, module: 'dep/child', transitive: true, depth: 1,
        ...(body?.requirement_bindings?.length ? { value: body.requirement_bindings[0].value, missing: false } : {}) }],
    } }) as any)
    const w = mount(InstallDialog, { props }); await flushPromises(); respond(w)
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    await button(w, 'Accept all').trigger('click'); await flushPromises()
    const plan = vi.mocked(api.post).mock.calls.filter(([url]: [string, ...unknown[]]) => url.endsWith('/plan')).at(-1)?.[1]
    expect(plan).toMatchObject({ requirement_bindings: [{ name: key, value: 'host:members' }] })
    expect((plan as any).parameters).toBeUndefined()
    await button(w, 'Preview changes').trigger('click'); await flushPromises()
    const preview = vi.mocked(api.post).mock.calls.filter(([url]: [string, ...unknown[]]) => url.endsWith('/install')).at(-1)?.[1]
    expect(preview).toMatchObject({ requirement_bindings: [{ name: key, value: 'host:members' }] })
  })
  it('blocks apply when the current planner marks a complete plan inapplicable', async () => {
    seed([{ ...row, value: 'host:members', missing: false }])
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, applicable: false, requirements: [], graph: [] } } as any)
    let c!: ReturnType<typeof useInstallDialog>
    mount({ setup() { c = useInstallDialog(reactive(props), vi.fn()); return () => null } }); await flushPromises()
    c.skipScan(); c.primaryAction(); c.preview(); await flushPromises()
    expect(vi.mocked(api.post).mock.calls.some(([url]: [string, ...unknown[]]) => url.endsWith('/install'))).toBe(false)
  })
  it.each([
    ['boolean', false, 'false'], ['integer', 0, '0'], ['number', 1.5, '1.5'],
    ['object', { enabled: false }, '{"enabled":false}'], ['array', ['a'], '["a"]'],
  ])('retains %s proposals and manual edits as typed values', async (type, value, text) => {
    seed([{ ...row, expected_kind: undefined, expected_type: type, suggestions: [] }])
    const w = mount(InstallDialog, { props }); await flushPromises()
    respond(w, [{ name: key, value, reason: 'Fits the declared type.' }] as any)
    await button(w, 'Resolve with AI').trigger('click'); await flushPromises()
    await button(w, 'Accept all').trigger('click'); await flushPromises()
    expect(w.find('input.km-w-full').element).toHaveProperty('value', text)
    expect(vi.mocked(api.post).mock.calls.filter(([url]: [string, ...unknown[]]) => url.endsWith('/plan')).at(-1)?.[1])
      .toMatchObject({ parameters: [{ name: key, value }] })
  })
})
