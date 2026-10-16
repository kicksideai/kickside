// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { recordRoute } from '../crm-route'

const propsRef = ref<Record<string, unknown>>({ route: '' })
const emit = vi.fn()
const get = vi.fn()
const post = vi.fn()
const unsubscribe = vi.fn()
const subscribe = vi.fn((_topic: unknown, _listener: unknown) => unsubscribe)

vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => propsRef, useEvents: () => emit }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) }, on: (topic: unknown, listener: unknown) => subscribe(topic, listener), host: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() } }))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const CrmSurface = (await import('./CrmSurface.vue')).default
const boot = { success: true, crm_id: 'crm-1', workspace_label: 'GTM CRM', can_write: true, objects: [{ type: 'person', label: 'People' }], attributes: [], pipelines: [], views: [] }
const stubs = {
  CrmCreate: { emits: ['created'], template: '<button data-test="create-crm" @click="$emit(\'created\', { id: \'crm-new\' })">Create CRM</button>' },
  CrmSidebar: { props: ['crmId', 'objects', 'activeObject', 'activeSurface', 'workspaceLabel', 'canWrite'], emits: ['navigate'], template: '<nav data-test="sidebar" :data-write="canWrite">{{ workspaceLabel }} {{ activeObject }}<button data-test="object-route" @click="$emit(\'navigate\', objects[0].type)">Open object</button></nav>' },
  RecordsView: { props: ['crmId', 'object', 'objects', 'attributes', 'pipelines', 'canWrite', 'revision'], template: '<div data-test="records" :data-write="canWrite" :data-revision="revision">{{ crmId }}:{{ object.type }}</div>' },
  RecordDetail: { props: ['crmId', 'recordId', 'object', 'objects', 'attributes', 'canWrite'], emits: ['back', 'navigate', 'changed'], template: '<div data-test="detail">{{ crmId }}:{{ recordId }}</div>' },
  ReviewQueue: { props: ['crmId', 'objects', 'attributes', 'canWrite'], template: '<div data-test="review" />' },
  CrmSettings: { props: ['crmId', 'initial', 'canWrite'], template: '<div data-test="model" />' },
}

describe('CRM maintained surface', () => {
  beforeEach(() => {
    propsRef.value = { route: '' }
    emit.mockReset(); get.mockReset(); post.mockReset(); unsubscribe.mockReset(); subscribe.mockClear()
    post.mockResolvedValue({ data: { success: true } })
  })

  it('bootstraps once and renders records from maintained Vue components', async () => {
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm')
    expect(subscribe).toHaveBeenCalledWith('kickside.thread.crm-1.projection.kickside.crm:read_model', expect.any(Function))
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-1:person')
    expect(wrapper.get('[data-test="sidebar"]').text()).toContain('person')
    expect(wrapper.get('[data-test="sidebar"]').text()).toContain('GTM CRM')
  })

  it('opens the published componentId input and retains host navigation', async () => {
    propsRef.value = { componentId: 'crm-published', route: 'person' }
    get.mockResolvedValueOnce({ data: { ...boot, crm_id: 'crm-published' } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-published')
    await wrapper.get('[data-test="object-route"]').trigger('click')
    expect(emit).toHaveBeenCalledWith('navigate', { route: 'person' })
    wrapper.unmount()
  })

  it('selects the explicit Workspace entry when both ids are supplied', async () => {
    propsRef.value = { componentId: 'crm-published', entryId: 'crm-managed', route: 'crm-managed' }
    get.mockResolvedValueOnce({ data: { ...boot, crm_id: 'crm-managed' } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-managed')
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-managed:person')
    wrapper.unmount()
  })

  it('opens the managed entry without treating its host route as an object type', async () => {
    propsRef.value = { entryId: 'crm-2', route: 'crm-2' }
    get.mockResolvedValueOnce({ data: { ...boot, crm_id: 'crm-2' } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-2')
    expect(subscribe).toHaveBeenCalledWith('kickside.thread.crm-2.projection.kickside.crm:read_model', expect.any(Function))
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-2:person')
    expect(wrapper.find('.crm-chooser').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps managed object navigation inside the entry instead of routing the host', async () => {
    propsRef.value = { entryId: 'crm-2', route: 'crm-2' }
    get.mockResolvedValueOnce({ data: { ...boot, crm_id: 'crm-2' } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    await wrapper.get('[data-test="object-route"]').trigger('click')
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-2:person')
    expect(emit).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('clears a stale record immediately while the host round-trips navigation', async () => {
    propsRef.value = { route: recordRoute('person', 'missing-record') }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[data-test="detail"]').text()).toBe('crm-1:missing-record')
    await wrapper.get('[data-test="object-route"]').trigger('click')
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-1:person')
    expect(emit).toHaveBeenCalledWith('navigate', { route: 'person' })
  })

  it('opens the record a link from outside the CRM names plainly', async () => {
    // The exact address the owner reported: a meetings contact chip, as the
    // browser sends it. It used to render the People list.
    propsRef.value = { route: 'person/person%3Ahubspot%3A150366411620' }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[data-test="detail"]').text()).toBe('crm-1:person:hubspot:150366411620')
    expect(wrapper.find('[data-test="records"]').exists()).toBe(false)
  })

  it('opens the same record when the id carries nothing that needs escaping', async () => {
    // The shell hands its path over percent-encoded, and this id has no percent
    // sequence in it, so the one decode leaves it exactly as it arrived.
    propsRef.value = { route: 'person/person:hubspot:150366411620' }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[data-test="detail"]').text()).toBe('crm-1:person:hubspot:150366411620')
  })

  // The decode happens once, in one place. A second one would read the "%41"
  // inside this id as an escape and open a record called "aAb" that nobody has.
  it('opens a record whose id contains a literal percent sequence', async () => {
    propsRef.value = { route: `person/${encodeURIComponent('a%41b')}` }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[data-test="detail"]').text()).toBe('crm-1:a%41b')
  })

  // An address naming an object type this CRM does not have. Falling back to the
  // first object rendered People for a link to a retired type -- a page that
  // looked like it worked and answered a question nobody asked.
  it('says so when the route names an object type this CRM does not have', async () => {
    propsRef.value = { route: 'ghost' }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.find('[data-test="records"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="detail"]').exists()).toBe(false)
    const missing = wrapper.get('[data-test="unknown-object"]')
    expect(missing.text()).toContain('ghost')
    await missing.get('button').trigger('click')
    expect(emit).toHaveBeenCalledWith('navigate', { route: 'person' })
  })

  it('does not open a record under an object type this CRM does not have', async () => {
    propsRef.value = { route: recordRoute('ghost', 'person:hubspot:1') }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.find('[data-test="detail"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="records"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="unknown-object"]').text()).toContain('ghost')
  })

  it('says it cannot open a record it cannot name, instead of showing the list', async () => {
    propsRef.value = { route: 'person/r~%%%' }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.find('[data-test="records"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="detail"]').exists()).toBe(false)
    const missing = wrapper.get('[data-test="unresolved-record"]')
    expect(missing.text()).toContain('Record not found')
    // And the way out is the object it was addressed under.
    await missing.get('button').trigger('click')
    expect(emit).toHaveBeenCalledWith('navigate', { route: 'person' })
  })

  it('still opens the object list when the route names no record', async () => {
    propsRef.value = { route: 'person' }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-1:person')
    expect(wrapper.find('[data-test="unresolved-record"]').exists()).toBe(false)
  })

  it('preserves a slash-qualified provider id through its opaque route', async () => {
    propsRef.value = { route: recordRoute('person', 'contacts/524190630611') }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[data-test="detail"]').text()).toBe('crm-1:contacts/524190630611')
  })

  it('shows backend errors and never substitutes fake objects', async () => {
    get.mockResolvedValueOnce({ data: { success: false, error: 'CRM access denied' } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('CRM access denied')
    expect(wrapper.find('[data-test="records"]').exists()).toBe(false)
  })

  it('renders the canonical creation flow when no CRM has been provisioned', async () => {
    get.mockResolvedValueOnce({ data: { success: true, provisioned: false, can_create: true } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.text()).toContain('Create your CRM')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    get.mockResolvedValueOnce({ data: { ...boot, crm_id: 'crm-new' } })
    await wrapper.get('[data-test="create-crm"]').trigger('click')
    await flushPromises()
    expect(get).toHaveBeenLastCalledWith('/api/v1/workspace/crm/crm-new')
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-new:person')
  })

  it('shows the unavailable state when the caller cannot create a CRM', async () => {
    get.mockResolvedValueOnce({ data: { success: true, provisioned: false, can_create: false } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.find('[data-test="create-crm"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('An administrator can create a CRM workspace')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('renders a workspace chooser on a 409 and opens the picked workspace', async () => {
    const candidates = [{ crm_id: 'crm-1', component_id: 'crm-1', label: 'GTM' }, { crm_id: 'crm-2', component_id: 'crm-2', label: 'Ops' }]
    get.mockResolvedValueOnce({ data: { success: false, code: 'multiple_crm_components', candidates } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    const chooser = wrapper.get('.crm-chooser')
    expect(chooser.text()).toContain('GTM')
    expect(chooser.text()).toContain('Ops')
    expect(wrapper.find('[data-test="records"]').exists()).toBe(false)
    get.mockResolvedValueOnce({ data: boot })
    await wrapper.findAll('.crm-chooser-list button').find((node) => node.text().includes('GTM'))!.trigger('click')
    await flushPromises()
    expect(get).toHaveBeenLastCalledWith('/api/v1/workspace/crm/crm-1')
    expect(wrapper.get('[data-test="records"]').text()).toBe('crm-1:person')
  })

  it('uses the explicit bootstrap write capability', async () => {
    get.mockResolvedValueOnce({ data: { ...boot, can_write: false } })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.get('[data-test="records"]').attributes('data-write')).toBe('false')
    expect(wrapper.get('[data-test="sidebar"]').attributes('data-write')).toBe('false')
  })

  it('answers a burst of read-model advances with one view refresh and no bootstrap', async () => {
    vi.useFakeTimers()
    try {
      get.mockResolvedValue({ data: boot })
      const wrapper = mount(CrmSurface, { global: { stubs } })
      await vi.runOnlyPendingTimersAsync()
      expect(get).toHaveBeenCalledTimes(1)
      expect(wrapper.get('[data-test="records"]').attributes('data-revision')).toBe('0')

      const advance = subscribe.mock.calls[0][1] as () => void
      // A sync projecting a batch: many advances inside one settling window.
      for (let i = 0; i < 40; i++) { advance(); vi.advanceTimersByTime(25) }
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()

      // The schema state was never refetched, and the active view was asked to
      // refresh exactly once for the whole burst.
      expect(get).toHaveBeenCalledTimes(1)
      expect(wrapper.get('[data-test="records"]').attributes('data-revision')).toBe('1')
      wrapper.unmount()
    } finally { vi.useRealTimers() }
  })

  it('reconciles schema at a bounded rate while advances never stop', async () => {
    vi.useFakeTimers()
    try {
      get.mockResolvedValue({ data: boot })
      const wrapper = mount(CrmSurface, { global: { stubs } })
      await vi.runOnlyPendingTimersAsync()
      const advance = subscribe.mock.calls[0][1] as () => void
      // Sixty seconds of uninterrupted advances -- the shape that made the surface
      // look like it was polling.
      for (let i = 0; i < 600; i++) { advance(); vi.advanceTimersByTime(100) }
      await vi.runOnlyPendingTimersAsync()

      // One bootstrap at mount plus one reconcile per 30s window, against 600 events.
      expect(get).toHaveBeenCalledTimes(3)
      // The view still refreshed at the coalescing ceiling, not per event.
      expect(Number(wrapper.get('[data-test="records"]').attributes('data-revision'))).toBe(30)
      wrapper.unmount()
    } finally { vi.useRealTimers() }
  })

  it('routes the review and model surfaces from reserved routes', async () => {
    propsRef.value = { route: 'review' }
    get.mockResolvedValueOnce({ data: boot })
    const wrapper = mount(CrmSurface, { global: { stubs } })
    await flushPromises()
    expect(wrapper.find('[data-test="review"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="records"]').exists()).toBe(false)
  })
})
