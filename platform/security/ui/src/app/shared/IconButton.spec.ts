import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IconButton from './IconButton.vue'

describe('IconButton', () => {
  it('renders an explicitly non-submit PrimeVue button with an accessible name', () => {
    const wrapper = mount(IconButton, { props: { icon: 'tabler:plus', label: 'New scope' } })
    const button = wrapper.get('button')

    expect(button.classes()).toContain('p-button')
    expect(button.classes()).toContain('p-button-text')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('New scope')
    expect(button.attributes('title')).toBe('New scope')
  })

  it('emits once when enabled and blocks interaction while spinning', async () => {
    const enabled = mount(IconButton, { props: { icon: 'tabler:refresh', label: 'Refresh' } })
    await enabled.get('button').trigger('click')
    expect(enabled.emitted('click')).toHaveLength(1)

    const spinning = mount(IconButton, {
      props: { icon: 'tabler:refresh', label: 'Refresh', spin: true },
    })
    const button = spinning.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('p-button-loading')
    expect(button.find('.p-button-loading-icon').exists()).toBe(true)
    await button.trigger('click')
    expect(spinning.emitted('click')).toBeUndefined()
  })

  it('maps danger, size, and pressed-state compatibility props', () => {
    const wrapper = mount(IconButton, {
      props: {
        icon: 'tabler:trash',
        label: 'Delete',
        variant: 'danger',
        size: 'sm',
        active: true,
      },
    })
    const button = wrapper.get('button')

    expect(button.classes()).toContain('p-button-danger')
    expect(button.classes()).toContain('p-button-sm')
    expect(button.attributes('aria-pressed')).toBe('true')
  })
})
