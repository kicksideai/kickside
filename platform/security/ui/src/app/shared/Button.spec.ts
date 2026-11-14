import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from './Button.vue'

describe('Button', () => {
  it('preserves its label, icon, submit type, variant, and size API', () => {
    const wrapper = mount(Button, {
      props: { type: 'submit', icon: 'tabler:device-floppy', variant: 'danger', small: true },
      slots: { default: 'Save scope' },
    })

    const button = wrapper.get('button')
    expect(button.classes()).toContain('p-button')
    expect(button.classes()).toContain('p-button-danger')
    expect(button.classes()).toContain('p-button-sm')
    expect(button.attributes('type')).toBe('submit')
    expect(button.text()).toContain('Save scope')
    expect(button.find('svg').exists()).toBe(true)
  })

  it('emits once when enabled and blocks interaction while loading', async () => {
    const enabled = mount(Button, { slots: { default: 'Save' } })
    await enabled.get('button').trigger('click')
    expect(enabled.emitted('click')).toHaveLength(1)

    const loading = mount(Button, {
      props: { loading: true, icon: 'tabler:device-floppy' },
      slots: { default: 'Saving' },
    })
    const button = loading.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('p-button-loading')
    expect(button.find('.p-button-loading-icon').exists()).toBe(true)
    await button.trigger('click')
    expect(loading.emitted('click')).toBeUndefined()
  })

  it('maps ghost and soft to PrimeVue neutral variants', () => {
    const ghost = mount(Button, { props: { variant: 'ghost' }, slots: { default: 'Cancel' } })
    expect(ghost.get('button').classes()).toContain('p-button-outlined')
    expect(ghost.get('button').classes()).toContain('p-button-secondary')

    const soft = mount(Button, { props: { variant: 'soft' }, slots: { default: 'Duplicate' } })
    expect(soft.get('button').classes()).toContain('p-button-secondary')
    expect(soft.get('button').classes()).not.toContain('p-button-outlined')
  })
})
