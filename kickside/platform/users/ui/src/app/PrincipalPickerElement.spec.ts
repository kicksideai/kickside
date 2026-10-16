import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

const emit = vi.fn()
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => ({ value: {} }), useEvents: () => emit }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(), post: vi.fn() } }))
import PrincipalPicker from './PrincipalPicker.vue'
import PrincipalPickerElement from './PrincipalPickerElement.vue'

describe('PrincipalPickerElement event seam', () => {
  it.each([
    { id: 'u-1', principal_id: 'u-1', assignee: 'u-1', type: 'user', label: 'Ada' },
    { id: '', principal_id: '', assignee: '', type: 'user', label: '' },
  ])('forwards one selection/clear as exactly one config update', async (detail) => {
    emit.mockReset()
    const wrapper = mount(PrincipalPickerElement, { global: { stubs: { Icon: true, AnchoredPanel: true } } })
    wrapper.getComponent(PrincipalPicker).vm.$emit('change', detail)
    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith('config-changed', detail)
    wrapper.unmount()
  })
})
