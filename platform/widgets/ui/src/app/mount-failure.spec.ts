// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const loadByTagName = vi.fn(async () => { throw new Error('not available') })
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName }))

const WcMount = (await import('./WcMount.vue')).default
const MultiSelectField = (await import('./MultiSelectField.vue')).default

describe('shared mount failures', () => {
  it('shows a directed retry state without exposing the missing custom-element tag', async () => {
    const wrapper = mount(WcMount, { props: { tag: 'wc-test-missing-setup' } })
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toBe('This setup panel couldn’t load.Try again')
    expect(alert.text()).not.toContain('wc-test-missing-setup')
    expect(alert.classes()).toContain('kx-wcmount-fail')

    await alert.get('button').trigger('click')
    await flushPromises()
    expect(loadByTagName).toHaveBeenCalledTimes(2)
  })

  it('gives a failed multi-select the same recoverable state', async () => {
    const wrapper = mount(MultiSelectField, {
      props: { source: '/api/test/items', selected: [], tag: 'wc-test-missing-picker' },
    })
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toBe('This picker couldn’t load.Try again')
    expect(alert.classes()).toContain('kx-msfield-fail')
    expect(alert.find('button').exists()).toBe(true)
  })
})
