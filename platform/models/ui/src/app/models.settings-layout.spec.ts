// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SystemTabs from '@kickside/ui-kit/SystemTabs.vue'
import EmptyState from '@kickside/ui-kit/EmptyState.vue'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(async () => ({ data: { success: true, models: [], classes: [], profiles: [], adapters: [], presets: [] } })) }, host: {} }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (load: () => unknown) => { void load() } }))
import Models from './models.vue'

it('places shared navigation above the provider rail and preserves counters and both empty panes', async () => {
  const view = mount(Models)
  await flushPromises()
  const tabs = view.getComponent(SystemTabs)
  expect(tabs.props('items')).toEqual([
    { value: 'models', label: 'Models', count: 0 },
    { value: 'classes', label: 'Classes', count: 0 },
  ])
  expect(view.get('.kx-shell').element.contains(tabs.element)).toBe(false)
  expect(view.find('.kx-rail .kx-railhead').exists()).toBe(true)
  expect(view.getComponent(EmptyState).props('title')).toBe('No models yet')
  await view.getComponent(EmptyState).get('button').trigger('click')
  expect(view.text()).toContain('Add provider')
  await tabs.findAll('[role=tab]')[1].trigger('click')
  await flushPromises()
  expect(view.getComponent(EmptyState).props('title')).toBe('No model classes')
  view.unmount()
})
