import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import SettingsForm from './SettingsForm.vue'

const settings = [
  { namespace: 'kickside.ui', key: 'title', value: 'KickSide', value_type: 'string', default: 'KickSide', is_default: true, editable: true },
  { namespace: 'kickside.ui', key: 'max', value: 5, value_type: 'int', default: 5, is_default: true, editable: true, schema: { type: 'integer', minimum: 1, maximum: 10 } },
  { namespace: 'kickside.ui', key: 'flag', value: true, value_type: 'bool', default: false, is_default: false, editable: true },
]

beforeEach(() => {
  ;(globalThis as any).__api__ = {
    '/api/v1/settings': { success: true, settings },
  }
  vi.clearAllMocks()
})

afterEach(() => {
  ;(globalThis as any).__api__ = {}
})

function settingRow(wrapper: VueWrapper, key: string) {
  const row = wrapper.findAll('.ks-row').find(candidate =>
    candidate.get('.ks-key').text() === key,
  )
  expect(row, `setting row for ${key}`).toBeDefined()
  return row!
}

function buttonWithAccessibleName(wrapper: VueWrapper | DOMWrapper<Element>, name: string) {
  const button = wrapper.findAll('button').find(candidate =>
    candidate.attributes('aria-label') === name || candidate.text().trim() === name,
  )
  expect(button, `button named ${name}`).toBeDefined()
  return button!
}

function mountSettings() {
  return mount(SettingsForm, {
    props: { namespace: 'kickside.ui' },
    global: { stubs: { Icon: true } },
  })
}

describe('SettingsForm interactions', () => {
  it('loads the namespace declarations as rows', async () => {
    const wrapper = mountSettings()
    await flushPromises()

    expect(wrapper.findAll('.ks-key').map(key => key.text())).toEqual(['flag', 'max', 'title'])
    wrapper.unmount()
  })
})

describe('SettingsForm save/reset', () => {
  it('disables a pristine non-boolean Save and enables it when dirty', async () => {
    const wrapper = mountSettings()
    await flushPromises()

    const row = settingRow(wrapper, 'title')
    const save = buttonWithAccessibleName(row, 'Save')
    expect(save.attributes()).toHaveProperty('disabled')

    await row.get('input[type="text"]').setValue('New Title')
    expect(save.attributes()).not.toHaveProperty('disabled')
    wrapper.unmount()
  })

  it('saves a dirty value through the proxy with the exact payload', async () => {
    let resolvePut!: (value: { data: { success: boolean } }) => void
    vi.mocked(api.put).mockImplementationOnce(() => new Promise(resolve => {
      resolvePut = resolve
    }))
    const wrapper = mountSettings()
    await flushPromises()

    const row = settingRow(wrapper, 'title')
    await row.get('input[type="text"]').setValue('New Title')
    const save = buttonWithAccessibleName(row, 'Save')
    await save.trigger('click')
    await flushPromises()

    expect(api.put).toHaveBeenCalledTimes(1)
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.ui',
      key: 'title',
      value: 'New Title',
    })
    expect(buttonWithAccessibleName(row, 'Saving…').attributes()).toHaveProperty('disabled')

    resolvePut({ data: { success: true } })
    await flushPromises()
    expect(buttonWithAccessibleName(settingRow(wrapper, 'title'), 'Save').attributes()).toHaveProperty('disabled')
    wrapper.unmount()
  })

  it('shows Reset only for an override and sends the exact null payload', async () => {
    const wrapper = mountSettings()
    await flushPromises()

    expect(settingRow(wrapper, 'title').find('[aria-label="Reset to default"]').exists()).toBe(false)

    const reset = buttonWithAccessibleName(settingRow(wrapper, 'flag'), 'Reset to default')
    expect(reset.attributes('aria-label')).toBe('Reset to default')
    expect(reset.attributes('title')).toBe('Reset to default')

    await reset.trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledTimes(1)
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.ui',
      key: 'flag',
      value: null,
    })
    wrapper.unmount()
  })
})
