// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import ModelPicker from './ModelPicker.vue'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() } }))
vi.mock('../constants.ts', () => ({
  useComponentProps: () => ref({ value: 'class:fast', capability: 'vision' }),
  useComponentEvents: () => vi.fn(),
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
vi.mock('primevue/select', () => ({ default: { name: 'Select', props: ['options', 'modelValue'], template: '<div />' } }))

describe('capability-filtered class selection', () => {
  it('offers models and classes whose resolved model has the requested capability', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => ({ data: url.includes('/classes')
      ? { success: true, classes: [
          { name: 'fast', capability: 'generate', models: [{ name: 'image-model', title: 'Image model' }] },
          { name: 'text', capability: 'generate', models: [{ name: 'text-model', title: 'Text model' }] },
          { name: 'mixed', capability: 'generate', models: [{ name: 'text-model', title: 'Text model' }, { name: 'image-model', title: 'Image model' }] },
          { name: 'empty', capability: 'generate', models: [] },
        ] }
      : { success: true, models: [{ name: 'image-model', title: 'Image model', class: ['fast', 'mixed'] }] },
    }))
    const wrapper = mount(ModelPicker)
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/models/list?capability=vision')
    expect(wrapper.findComponent({ name: 'Select' }).props('options')).toEqual([
      expect.objectContaining({ group: 'Classes', items: [expect.objectContaining({ value: 'class:fast' })] }),
      expect.objectContaining({ group: 'Models', items: [expect.objectContaining({ value: 'image-model' })] }),
    ])
    wrapper.unmount()
  })
})
