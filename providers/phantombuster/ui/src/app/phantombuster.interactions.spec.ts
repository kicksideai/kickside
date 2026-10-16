import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PhantomBusterPicker from './PhantomBusterPicker.vue'

beforeEach(() => {
  globalThis.__props__ = { config: {} }
  globalThis.__events__ = []
  globalThis.__api__ = {
    '/connections?provider=phantombuster': {
      success: true,
      connections: [
        { component_id: 'pb1', name: 'Phantom main', connection_state: 'connected' },
      ],
    },
  }
})

describe('PhantomBusterPicker', () => {
  it('loads PhantomBuster connections through the provider-scoped endpoint', async () => {
    const w = mount(PhantomBusterPicker)
    await flushPromises()

    expect(w.text()).toContain('PhantomBuster connection')
    const picker = w.element.querySelector('wc-connection-picker')!
    expect(picker.getAttribute('providers')).toBe('phantombuster')
    expect(picker.getAttribute('placeholder')).toBe('Auto-select default')

    w.unmount()
  })

  it('publishes the selected connection_id through config-changed', async () => {
    const w = mount(PhantomBusterPicker)
    await flushPromises()

    w.element.querySelector('wc-connection-picker')!.dispatchEvent(
      new CustomEvent('change', { detail: { connection_id: 'pb1' } }),
    )
    await flushPromises()

    expect(globalThis.__events__).toContainEqual({
      name: 'config-changed',
      detail: { connection_id: 'pb1' },
    })

    w.unmount()
  })

})
