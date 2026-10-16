import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ModelEditor from './ModelEditor.vue'

describe('model editor', () => {
  it('preserves a provider-owned string thinking effort on save', async () => {
    const wrapper = mount(ModelEditor, {
      props: {
        model: {
          name: 'string-reasoner',
          title: 'String reasoner',
          description: 'Fast coding model.',
          provider_id: 'test.provider',
          provider_model: 'string-reasoner',
          capabilities: ['generate', 'reasoning'],
          class: ['premium'],
          priority: 10_000,
          max_tokens: 272_000,
          output_tokens: 0,
          source: 'registry',
          enabled: true,
          options: {
            reasoning_model_request: true,
            thinking_effort: 'medium',
            use_responses_lite: true,
            provider_specific: 'keep-me',
          },
        },
        profiles: [],
        saving: false,
      },
    })

    await wrapper.find('form').trigger('submit')

    const payload = wrapper.emitted('save')?.[0]?.[0] as { options?: Record<string, unknown> }
    expect(payload.options).toMatchObject({
      reasoning_model_request: true,
      thinking_effort: 'medium',
      use_responses_lite: true,
      provider_specific: 'keep-me',
    })
  })

  it('keeps numeric thinking effort numeric', async () => {
    const wrapper = mount(ModelEditor, {
      props: {
        model: {
          name: 'numeric-reasoner',
          title: 'Numeric Reasoner',
          provider_id: 'test.provider',
          provider_model: 'numeric-reasoner',
          capabilities: ['generate', 'reasoning'],
          class: ['reasoning'],
          priority: 10,
          max_tokens: 32_000,
          output_tokens: 0,
          source: 'registry',
          enabled: true,
          options: { reasoning_model_request: true, thinking_effort: 4 },
        },
        profiles: [],
        saving: false,
      },
    })

    await wrapper.find('form').trigger('submit')

    const payload = wrapper.emitted('save')?.[0]?.[0] as { options?: Record<string, unknown> }
    expect(payload.options?.thinking_effort).toBe(4)
  })
})
