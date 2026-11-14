// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import ModelPicker from './ModelPicker.vue'

describe('model picker class capabilities', () => {
  it('offers only matching classes and preserves a saved incompatible selection', async () => {
    const propsRef = (globalThis as any).__props_ref__
    propsRef.value = { value: 'class:embed', capability: 'generate' }
    vi.mocked(api.get).mockImplementation(async (url: string) => ({ data: url.includes('/classes')
      ? { success: true, classes: [
          { name: 'embed', capability: 'embed', models: [] },
          { name: 'fast', capability: 'generate', models: [] },
        ] }
      : { success: true, models: [] } }))
    const wrapper = mount(ModelPicker)
    await flushPromises()
    const select = wrapper.findComponent({ name: 'Select' })
    expect(select.props('options')).toEqual([
      { group: 'Classes', items: [expect.objectContaining({ value: 'class:fast' })] },
    ])
    expect(select.props('modelValue')).toBe('class:embed')
    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })
})
