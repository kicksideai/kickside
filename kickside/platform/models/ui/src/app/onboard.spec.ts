import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, host } from '@wippy-fe/proxy'

// useModelsApi reads the authenticated axios client from `@wippy-fe/proxy`;
// mock it and drive the data path through the spies below.
vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  host: { toast: vi.fn(), confirm: vi.fn(), handleError: vi.fn() },
}))

// The component pulls its host event/prop bridge from the webcomponent runtime,
// which needs the Wippy host globals at import time. Stub it for the test.
const emittedToHost = vi.hoisted(() => vi.fn())
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => ({ value: {} }), useEvents: () => emittedToHost }))

import Onboard from './Onboard.vue'
import SelectField from './shared/SelectField.vue'

// Route the admin payload and the class catalog to their own URLs so the review
// stage has both providers and a declared, populated class to render.
function mockHost(admin: Record<string, unknown>, classes: unknown[] = []) {
  ;(api.get as any).mockImplementation(async (url: string) => {
    if (url.includes('/models/classes')) return { data: { success: true, classes } }
    return { data: { success: true, adapters: [], presets: [], profiles: [], models: [], ...admin } }
  })
  ;(api.post as any).mockImplementation(async () => ({ data: { success: true } }))
  ;(api.put as any).mockImplementation(async () => ({ data: { success: true } }))
  ;(api.delete as any).mockImplementation(async () => ({ data: { success: true } }))
  return api
}

describe('kickside onboard-models component', () => {
  beforeEach(() => { vi.clearAllMocks(); emittedToHost.mockReset() })

  it('opens on the provider tiles when nothing is connected', async () => {
    mockHost({
      presets: [{ id: 'openai', key: 'openai', title: 'OpenAI', provider_id: 'wippy.llm.openai:provider' }],
    })
    const wrapper = mount(Onboard)
    await flushPromises()
    expect(wrapper.find('.ob-tile').exists()).toBe(true)
    expect(wrapper.text()).toContain('OpenAI')
    expect(wrapper.text()).toContain('KickSide works without an AI model, but it is better with one.')
  })

  it('skips model setup and reports the model as unconfigured', async () => {
    mockHost({
      presets: [{ id: 'openai', key: 'openai', title: 'OpenAI', provider_id: 'wippy.llm.openai:provider' }],
    })
    const wrapper = mount(Onboard)
    await flushPromises()

    const skip = wrapper.findAll('button').find(button => button.text().includes('Skip for now'))!
    await skip.trigger('click')
    await flushPromises()
    expect(emittedToHost).toHaveBeenCalledWith('done', { status: 'skipped', model_configured: false })
  })

  it('mounts a minimal provider editor on the connect stage', async () => {
    mockHost({
      presets: [{ id: 'openai', key: 'openai', title: 'OpenAI', provider_id: 'wippy.llm.openai:provider', profile_editor_tag: 'kickside-model-provider-openai', config: { base_url: 'https://api.openai.com/v1' } }],
    })
    const wrapper = mount(Onboard)
    await flushPromises()
    await wrapper.get('.ob-tile').trigger('click')
    await flushPromises()
    expect(wrapper.find('.ob-model-warning').exists()).toBe(false)
    // Onboarding shows only the essential credential; everything else (base URL
    // for native providers, test model, env pointers) sits behind Advanced.
    expect(wrapper.find('.km-form').exists()).toBe(true)
    expect(wrapper.text()).toContain('API key')
    expect(wrapper.findAll('input[type="password"]').length).toBeGreaterThan(0)
    expect(wrapper.text()).not.toContain('Base URL')
    // Expanding Advanced reveals the rest.
    await wrapper.get('.km-adv-toggle').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Base URL')
  })

  it('opens on review with connected providers and per-class model selection', async () => {
    mockHost(
      {
        adapters: [{ id: 'wippy.llm.openai:provider', title: 'OpenAI' }],
        profiles: [{ id: 'p1', name: 'My OpenAI', provider_id: 'wippy.llm.openai:provider', enabled: true, status: 'healthy' }],
        models: [{ name: 'gpt-4o', title: 'GPT-4o', provider_id: 'wippy.llm.openai:provider', capabilities: ['generate'], enabled: true }],
      },
      [{ name: 'fast', title: 'Fast', declared: true, models: [{ name: 'gpt-4o', title: 'GPT-4o', priority: 80 }] }],
    )
    const wrapper = mount(Onboard)
    await flushPromises()
    expect(wrapper.text()).toContain('Connected')
    expect(wrapper.text()).toContain('My OpenAI')
    expect(wrapper.text()).toContain('Default model per capability')
    expect(wrapper.text()).toContain('Fast')
    expect(wrapper.findComponent(SelectField).exists()).toBe(true)
    expect(wrapper.find('.ob-model-warning').exists()).toBe(false)
  })

  it('renders a failed provider discovery error only once', async () => {
    const failure = 'Get "http://localhost:11434/v1/models": dial tcp 127.0.0.1:11434: i/o timeout'
    let created = false
    ;(api.get as any).mockImplementation(async (url: string) => {
      if (url.includes('/models/classes')) return { data: { success: true, classes: [] } }
      return {
        data: {
          success: true,
          adapters: [],
          presets: [{ id: 'ollama', key: 'ollama', title: 'Ollama', provider_id: 'wippy.llm.openai_compat:provider' }],
          profiles: created ? [{ id: 'ollama', name: 'Ollama', provider_id: 'wippy.llm.openai_compat:provider', enabled: true }] : [],
          models: [],
        },
      }
    })
    ;(api.post as any).mockImplementation(async (url: string) => {
      if (url.endsWith('/provider-profiles')) { created = true; return { data: { success: true } } }
      if (url.includes('/discover')) throw new Error(failure)
      return { data: { success: true } }
    })

    const wrapper = mount(Onboard)
    await flushPromises()
    await wrapper.get('.ob-tile').trigger('click')
    wrapper.getComponent({ name: 'ProviderProfileEditor' }).vm.$emit('save', {
      name: 'Ollama',
      provider_id: 'wippy.llm.openai_compat:provider',
      base_url: 'http://localhost:11434/v1',
    })
    await flushPromises()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text().split(failure)).toHaveLength(2)
    expect(wrapper.findAll('.ob-result.fail')).toHaveLength(1)
    expect(wrapper.text()).toContain('Skip for now')
    expect(wrapper.text()).not.toContain('Continue ›')
  })

  it('assigns a model to a class via PUT /models/cards', async () => {
    mockHost(
      {
        adapters: [{ id: 'wippy.llm.openai:provider', title: 'OpenAI' }],
        profiles: [{ id: 'p1', name: 'My OpenAI', provider_id: 'wippy.llm.openai:provider', enabled: true }],
        models: [{ name: 'gpt-4o', title: 'GPT-4o', provider_id: 'wippy.llm.openai:provider', capabilities: ['generate'], enabled: true }],
      },
      [{ name: 'fast', title: 'Fast', declared: true, models: [] }],
    )
    const put = api.put as any
    const wrapper = mount(Onboard)
    await flushPromises()

    // The per-class picker emits the chosen model name; that drives setClassModel.
    wrapper.getComponent(SelectField).vm.$emit('update:modelValue', 'gpt-4o')
    await flushPromises()

    expect(put).toHaveBeenCalledWith('/api/v1/models/cards', expect.objectContaining({
      name: 'gpt-4o',
      classes: ['fast'],
      priority: 1000,
    }))
  })

  it('reports a model configured only when a persisted enabled profile backs an assigned generation class', async () => {
    mockHost(
      {
        profiles: [{ id: 'p1', name: 'My OpenAI', provider_id: 'wippy.llm.openai:provider', enabled: true }],
        models: [{ name: 'gpt-4o', provider_id: 'wippy.llm.openai:provider', provider_profile_id: 'p1', capabilities: ['generate'], enabled: true }],
      },
      [{ name: 'fast', declared: true, capability: 'generate', models: [{ name: 'gpt-4o' }] }],
    )
    const wrapper = mount(Onboard)
    await flushPromises()
    const continueButton = wrapper.findAll('button').find(button => button.text().includes('Continue'))
    await continueButton!.trigger('click')
    expect(emittedToHost).toHaveBeenCalledWith('done', {
      status: 'completed',
      model_configured: true,
      model: {
        class: 'fast',
        model: 'gpt-4o',
        title: 'gpt-4o',
        provider_id: 'wippy.llm.openai:provider',
      },
    })
  })

  it('offers skip when a saved profile has no usable configured model', async () => {
    mockHost({
      profiles: [{ id: 'p1', name: 'My OpenAI', provider_id: 'wippy.llm.openai:provider', enabled: true }],
      models: [{ name: 'gpt-4o', provider_id: 'wippy.llm.openai:provider', provider_profile_id: 'p1', capabilities: ['generate'], enabled: true }],
    }, [{ name: 'fast', declared: true, capability: 'generate', models: [] }])
    const wrapper = mount(Onboard)
    await flushPromises()
    const skipButton = wrapper.findAll('button').find(button => button.text().includes('Skip for now'))
    expect(skipButton).toBeDefined()
    expect(wrapper.text()).not.toContain('Continue ›')
    await skipButton!.trigger('click')
    await flushPromises()
    expect(emittedToHost).toHaveBeenCalledWith('done', { status: 'skipped', model_configured: false })
  })
})
