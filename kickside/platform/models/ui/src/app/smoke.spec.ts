import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { onMounted, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import Models from './models.vue'
import ProviderProfileEditor from './ProviderProfileEditor.vue'

// useModelsApi reads the authenticated axios client from `@wippy-fe/proxy`.
// Mock it and drive each test's data path by (re)configuring the spies below.
vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  host: { toast: vi.fn(), confirm: vi.fn(), handleError: vi.fn() },
}))
;(globalThis as any).__hostVisibility__ = ref(false)
function useHostVisibilityRefresh(callback: () => unknown) {
  const visible = (globalThis as any).__hostVisibility__
  onMounted(() => callback())
  watch(visible, (next: boolean, previous: boolean) => {
    if (previous === false && next === true) callback()
  })
  return visible
}
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh }))

// Seed the mocked api: `get` returns the admin payload merged with `data`;
// the write verbs succeed. `overrides` replaces individual spies (e.g. a
// dedicated `put`/`post` to assert the call).
function mockHost(data: Record<string, unknown>, overrides: Record<string, () => Promise<unknown>> = {}) {
  ;(api.get as any).mockImplementation(async () => ({ data: { success: true, adapters: [], presets: [], profiles: [], models: [], ...data } }))
  ;(api.post as any).mockImplementation(async () => ({ data: { success: true } }))
  ;(api.put as any).mockImplementation(async () => ({ data: { success: true } }))
  ;(api.delete as any).mockImplementation(async () => ({ data: { success: true } }))
  for (const [k, fn] of Object.entries(overrides)) (api as any)[k].mockImplementation(fn)
  return api
}

const flush = flushPromises

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe('kickside models component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as any).__hostVisibility__.value = false
  })

  it('reloads admin and class catalogs after false to true without remounting or losing the active view', async () => {
    mockHost({ classes: [{ name: 'fast', title: 'Fast', models: [] }] })
    const wrapper = mount(Models)
    await flush()
    const root = wrapper.element
    const requestCount = (url: string) => (api.get as any).mock.calls.filter(([value]: [string]) => value === url).length

    expect(requestCount('/api/v1/models/admin')).toBe(1)
    expect(requestCount('/api/v1/models/classes')).toBe(1)
    await wrapper.get('button[role="tab"]:nth-of-type(2)').trigger('click')
    await flush()
    expect(requestCount('/api/v1/models/classes')).toBe(2)

    ;(globalThis as any).__hostVisibility__.value = true
    await flush()

    expect(requestCount('/api/v1/models/admin')).toBe(2)
    expect(requestCount('/api/v1/models/classes')).toBe(3)
    expect(wrapper.element).toBe(root)
    expect(wrapper.get('button[role="tab"]:nth-of-type(2)').attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  it('keeps the newest class catalog when an older request finishes last', async () => {
    const stale = deferred<any>()
    let classRequests = 0
    ;(api.get as any).mockImplementation((url: string) => {
      if (url === '/api/v1/models/classes') {
        classRequests += 1
        if (classRequests === 1) return stale.promise
        return Promise.resolve({ data: { success: true, classes: [{ name: 'fresh', title: 'Fresh class', models: [] }] } })
      }
      return Promise.resolve({ data: { success: true, adapters: [], presets: [], profiles: [], models: [] } })
    })

    const wrapper = mount(Models)
    await flush()
    ;(globalThis as any).__hostVisibility__.value = true
    await flush()
    await wrapper.get('button[role="tab"]:nth-of-type(2)').trigger('click')
    await flush()
    expect(wrapper.text()).toContain('Fresh class')

    stale.resolve({ data: { success: true, classes: [{ name: 'stale', title: 'Stale class', models: [] }] } })
    await flush()
    expect(wrapper.text()).toContain('Fresh class')
    expect(wrapper.text()).not.toContain('Stale class')
    wrapper.unmount()
  })

  it('mounts the empty admin surface', async () => {
    mockHost({})
    const wrapper = mount(Models)
    await flush()
    expect(wrapper.text()).toContain('Providers')
    expect(wrapper.text()).toContain('Model pool')
    expect(wrapper.text()).toContain('No providers connected.')
    expect(wrapper.text()).toContain('No models yet')
  })

  it('renders connected providers and pooled models', async () => {
    mockHost({
      adapters: [{ id: 'wippy.llm.openai:provider', title: 'OpenAI' }],
      profiles: [{ id: 'p1', name: 'My OpenAI', provider_id: 'wippy.llm.openai:provider', enabled: true, status: 'healthy' }],
      models: [{ name: 'gpt-4o', title: 'GPT-4o', provider_id: 'wippy.llm.openai:provider', source: 'registry' }],
    })
    const wrapper = mount(Models)
    await flush()
    expect(wrapper.text()).toContain('My OpenAI')
    expect(wrapper.text()).toContain('GPT-4o')
    expect(wrapper.text()).toContain('built-in')
  })

  it('disables a model from the row action without deleting it', async () => {
    const put = vi.fn(async () => ({ data: { success: true } }))
    mockHost({
      adapters: [{ id: 'wippy.llm.openai:provider', title: 'OpenAI' }],
      models: [{
        name: 'heiko',
        title: 'Heiko',
        provider_id: 'wippy.llm.openai:provider',
        provider_model: 'heiko',
        source: 'registry',
        enabled: true,
        capabilities: ['generate'],
        class: ['fast'],
        max_tokens: 128000,
        output_tokens: 8192,
      }],
    }, { put })
    const wrapper = mount(Models)
    await flush()

    await wrapper.get('button[aria-label="Disable model"]').trigger('click')
    await flush()

    expect(put).toHaveBeenCalledWith('/api/v1/models/cards', expect.objectContaining({
      name: 'heiko',
      source: 'overlay',
      enabled: false,
    }))
  })

  it('keeps model probe results on the row with expandable details', async () => {
    const post = vi.fn(async () => ({
      data: {
        success: true,
        message: 'Model probe succeeded',
        model: 'heiko',
        provider_model: 'heiko-live',
        provider_id: 'wippy.llm.openai:provider',
        elapsed_ms: 37,
        tokens: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
        output: 'pong',
      },
    }))
    mockHost({
      adapters: [{ id: 'wippy.llm.openai:provider', title: 'OpenAI' }],
      models: [{
        name: 'heiko',
        title: 'Heiko',
        provider_id: 'wippy.llm.openai:provider',
        provider_model: 'heiko',
        source: 'registry',
        enabled: true,
        capabilities: ['generate'],
      }],
    }, { post })
    const wrapper = mount(Models)
    await flush()

    expect(wrapper.get('button[aria-label="Add provider"]').attributes('aria-pressed')).toBeUndefined()
    await wrapper.get('button[aria-label="Run model check"]').trigger('click')
    await flush()

    expect(post).toHaveBeenCalledWith('/api/v1/models/cards/test', { name: 'heiko' })
    // A successful probe reports on the row, never as a top-level error banner.
    expect(wrapper.find('.km-top-notice').exists()).toBe(false)

    const result = wrapper.get('button[aria-label="Model check succeeded. View details"]')
    expect(result.attributes('data-p-severity')).toBe('success')
    expect(result.attributes('data-p')).toContain('icon-only')
    expect(result.attributes('aria-pressed')).toBe('false')

    await result.trigger('click')
    await flush()

    expect(wrapper.get('button[aria-label="Model check succeeded. View details"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('.km-mrow-probe.ok').exists()).toBe(true)
    expect(wrapper.text()).toContain('Model probe succeeded (heiko-live)')
    expect(wrapper.text()).toContain('37 ms')
    expect(wrapper.text()).toContain('pong')
  })

  it('offers a saved-provider connection test independent of discovery support', async () => {
    const wrapper = mount(ProviderProfileEditor, {
      props: {
        specKey: 'openai_compat',
        mode: 'edit',
        adapter: { id: 'wippy.llm.openai_compat:provider', title: 'OpenAI Compatible', discoverable: false },
        profile: {
          id: 'towers',
          name: 'Towers',
          provider_id: 'wippy.llm.openai_compat:provider',
          enabled: true,
          config: { base_url: 'https://towers.internal.example/v1', test_model: 'gemma-4-12b' },
        },
        saving: false,
        testState: { status: 'idle' },
      },
    })
    // Test connection stays top-level; the test model lives under Advanced.
    expect(wrapper.text()).toContain('Test connection')
    await wrapper.get('.km-adv-toggle').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Test model')
    expect(wrapper.text()).toContain('Retry backoff (ms)')

    await wrapper.get('form').trigger('submit')
    const payload = wrapper.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(payload.retry).toEqual({ attempts: 0, backoff_ms: 0 })
  })
})
