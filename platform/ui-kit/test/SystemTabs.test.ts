// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import SystemTabs from '../package/SystemTabs.vue'

it('keeps counters, accessible labels and keyboard selection in the shared System tab bar', async () => {
  const view = mount(SystemTabs, {
    attachTo: document.body,
    props: { value: 'models', label: 'Model sections', items: [
      { value: 'models', label: 'Models', count: 0 },
      { value: 'classes', label: 'Classes', count: 12 },
    ] },
    global: { plugins: [PrimeVue] },
  })
  expect(view.get('[role=tablist]').attributes('aria-label')).toBe('Model sections')
  expect(view.findAll('.kx-system-tab-count').map(el => el.text())).toEqual(['0', '12'])
  const tabs = view.findAll('[role=tab]')
  await tabs[0].trigger('keydown', { code: 'ArrowRight' })
  expect(document.activeElement).toBe(tabs[1].element)
  expect(view.emitted('update:value')).toBeUndefined()
  await tabs[1].trigger('keydown', { code: 'Enter' })
  expect(view.emitted('update:value')).toEqual([['classes']])
  await view.setProps({ value: 'classes' })
  expect(tabs[1].attributes('aria-selected')).toBe('true')
  view.unmount()
})
