// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { CrmObject } from '../crm-types'

const loadByTagName = vi.fn().mockResolvedValue(undefined)

vi.mock('@wippy-fe/proxy', () => ({
  loadByTagName: (...args: unknown[]) => loadByTagName(...args),
}))
vi.mock('@iconify/vue', () => ({
  Icon: { props: ['icon'], template: '<i :data-icon="icon" />' },
}))

const SettingsObjectDialog = (await import('./SettingsObjectDialog.vue')).default

function mountDialog(object: CrmObject | null = null) {
  return mount(SettingsObjectDialog, {
    props: { object },
    global: { stubs: { teleport: true } },
  })
}

describe('settings object dialog', () => {
  it('loads the canonical picker and saves its selected icon', async () => {
    const wrapper = mountDialog()
    await flushPromises()

    expect(loadByTagName).toHaveBeenCalledWith('wc-icon-picker', { timeoutMs: 8000 })
    const picker = wrapper.get('wc-icon-picker')
    expect(picker.attributes('fallback')).toBe('tabler:category')
    picker.element.dispatchEvent(new CustomEvent('select', { detail: 'tabler:building' }))
    await wrapper.get('input[placeholder="Companies"]').setValue('Companies')
    await wrapper.get('input[placeholder="Display name"]').setValue('Company name')
    await wrapper.findAll('button').find((button) => button.text().includes('Save'))!.trigger('click')

    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual({
      label: 'Companies',
      type: '',
      icon: 'tabler:building',
      titleLabel: 'Company name',
    })
  })

  it('preserves the icon when editing an existing object', async () => {
    const wrapper = mountDialog({
      type: 'company',
      label: 'Companies',
      icon: 'tabler:building-skyscraper',
    })
    await flushPromises()

    expect(wrapper.get('wc-icon-picker').attributes('value')).toBe('tabler:building-skyscraper')
  })
})
