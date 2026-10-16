import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SettingsForm from './SettingsForm.vue'
import Provider from './provider.vue'
import Storage from './storage.vue'

const boolSetting = {
  namespace: 'kickside.uploads.rasterize',
  key: 'rasterize_empty_enabled',
  title: 'Rasterize empty documents',
  value: true,
  value_type: 'bool',
  default: false,
  is_default: false,
  editable: true,
  description: 'Render sparse documents.',
}

beforeEach(() => {
  ;(globalThis as any).__api__ = {
    'settings?namespace': { success: true, settings: [boolSetting] },
  }
  ;(globalThis as any).__props__ = {
    config: {
      namespace: 'kickside.uploads.rasterize',
      title: 'Rasterization',
    },
  }
})

afterEach(() => {
  ;(globalThis as any).__api__ = {}
  ;(globalThis as any).__props__ = { config: {} }
})

async function expectWorkingSwitch(
  wrapper: ReturnType<typeof mount>,
  accessibleName: string,
) {
  await flushPromises()
  const toggle = wrapper.get('[role="switch"]')

  expect(toggle.attributes('aria-label')).toBe(accessibleName)
  expect(toggle.attributes('aria-checked')).toBe('true')

  await toggle.setValue(false)
  expect(toggle.attributes('aria-checked')).toBe('false')
}

describe('Settings boolean controls', () => {
  it('uses PrimeVue ToggleSwitch in the generic namespace form', async () => {
    const wrapper = mount(SettingsForm, {
      props: { namespace: 'kickside.uploads.rasterize' },
    })

    await expectWorkingSwitch(wrapper, 'Rasterize empty documents')
    wrapper.unmount()
  })

  it('uses PrimeVue ToggleSwitch in the storage panel', async () => {
    const wrapper = mount(Storage)

    await expectWorkingSwitch(wrapper, 'Rasterize empty documents')
    wrapper.unmount()
  })

  it('uses PrimeVue ToggleSwitch in the provider panel', async () => {
    const wrapper = mount(Provider)

    await expectWorkingSwitch(wrapper, 'Rasterize empty documents')
    wrapper.unmount()
  })
})
