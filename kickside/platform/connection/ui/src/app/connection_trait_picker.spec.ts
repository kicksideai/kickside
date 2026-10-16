import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ConnectionTraitPicker from './ConnectionTraitPicker.vue'

beforeEach(() => {
  ;(globalThis as any).__props__ = {
    config: {},
    provider: 'phantombuster',
    label: 'PhantomBuster connection',
  }
  ;(globalThis as any).__events__ = []
  ;(globalThis as any).__api__ = {
    '/connections?provider=phantombuster': {
      success: true,
      connections: [
        { component_id: 'pb1', name: 'Phantom main', provider: 'phantombuster', connection_state: 'connected' },
      ],
    },
  }
})

describe('ConnectionTraitPicker', () => {
  it('renders the label and composes wc-connection-picker scoped to the provider', async () => {
    const w = mount(ConnectionTraitPicker)
    await flushPromises()

    expect(w.text()).toContain('PhantomBuster connection')

    const picker = w.element.querySelector('wc-connection-picker')
    expect(picker).toBeTruthy()
    expect(picker!.getAttribute('providers')).toBe('phantombuster')
    expect(picker!.getAttribute('reply-only')).toBe('false')
    expect(picker!.getAttribute('placeholder')).toBe('Auto-select default')

    w.unmount()
  })

  it('publishes connection_id through the trait config contract and shows its status', async () => {
    const w = mount(ConnectionTraitPicker)
    await flushPromises()

    const picker = w.element.querySelector('wc-connection-picker')!
    picker.dispatchEvent(new CustomEvent('change', { detail: { connection_id: 'pb1' } }))
    await flushPromises()

    expect((globalThis as any).__events__).toContainEqual({
      name: 'config-changed',
      detail: { connection_id: 'pb1' },
    })
    expect(w.text()).toContain('Connected')

    w.unmount()
  })
})
