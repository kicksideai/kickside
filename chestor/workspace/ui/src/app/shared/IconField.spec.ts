import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { loadByTagName } from '@wippy-fe/proxy'
import IconField from './IconField.vue'

describe('IconField public widget boundary', () => {
  beforeEach(() => {
    vi.mocked(loadByTagName).mockReset()
    vi.mocked(loadByTagName).mockResolvedValue(undefined)
  })

  it('loads wc-icon-picker and relays its selection through v-model', async () => {
    const wrapper = mount(IconField, {
      props: { modelValue: 'tabler:file', fallback: 'tabler:folder' },
    })
    await flushPromises()

    expect(loadByTagName).toHaveBeenCalledWith('wc-icon-picker', { timeoutMs: 8000 })
    const picker = wrapper.element.querySelector('wc-icon-picker') as HTMLElement
    expect(picker).toBeTruthy()
    expect(picker.getAttribute('value')).toBe('tabler:file')
    expect(picker.getAttribute('fallback')).toBe('tabler:folder')

    picker.dispatchEvent(new CustomEvent('select', { detail: 'tabler:graph' }))
    expect(wrapper.emitted('update:modelValue')).toEqual([['tabler:graph']])

    await wrapper.setProps({ modelValue: 'tabler:database', fallback: undefined })
    expect(picker.getAttribute('value')).toBe('tabler:database')
    expect(picker.hasAttribute('fallback')).toBe(false)
    wrapper.unmount()
  })

  it('shows a recoverable error if the widget bundle cannot be loaded', async () => {
    vi.mocked(loadByTagName).mockRejectedValueOnce(new Error('bundle unavailable'))
    const wrapper = mount(IconField, { props: { modelValue: '' } })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Icon picker is unavailable')
    expect(wrapper.find('wc-icon-picker').exists()).toBe(false)

    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('wc-icon-picker').exists()).toBe(true)
    wrapper.unmount()
  })
})
