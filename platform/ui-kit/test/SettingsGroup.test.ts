// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import SettingsGroup from '../package/SettingsGroup.vue'
import SettingsItem from '../package/SettingsItem.vue'

let view: VueWrapper
afterEach(() => view?.unmount())

it('names a group by its heading and shows the item count beside it', () => {
  view = mount(SettingsGroup, { props: { title: 'Planning and tracking', count: 2 }, slots: { default: '<p>rows</p>' } })
  const section = view.get('section')
  const heading = view.get('h2')
  expect(heading.text()).toBe('Planning and tracking')
  expect(section.attributes('aria-labelledby')).toBe(heading.attributes('id'))
  expect(view.get('.kx-settings-group-count').text()).toBe('2')
  expect(view.get('.kx-settings-group-list').text()).toBe('rows')
})

it('renders an untitled group as a plain list', () => {
  view = mount(SettingsGroup, { slots: { default: '<p>rows</p>' } })
  expect(view.find('h2').exists()).toBe(false)
  expect(view.get('.kx-settings-group-list').text()).toBe('rows')
})

it('opens an item body from its expand control and reports the change', async () => {
  view = mount(SettingsItem, {
    attachTo: document.body,
    props: { title: 'Work Search', description: 'Find items by key or text.', expandLabel: 'Configure' },
    slots: { status: '<span class="state">Enabled</span>', actions: '<input type="checkbox" aria-label="Enable" />', default: '<p class="body">Settings</p>', meta: 'Needs Work Planning' },
  })
  const toggle = view.get('button.kx-settings-item-expand')
  expect(toggle.text()).toContain('Configure')
  expect(toggle.attributes('aria-expanded')).toBe('false')
  expect(toggle.attributes('aria-label')).toBe('Configure Work Search')
  expect(view.find('.kx-settings-item-panel').exists()).toBe(false)
  expect(view.get('.kx-settings-item-title').text()).toBe('Work Search')
  expect(view.get('.kx-settings-item-desc').text()).toBe('Find items by key or text.')
  expect(view.get('.kx-settings-item-meta').text()).toBe('Needs Work Planning')
  await toggle.trigger('click')
  expect(view.emitted('update:open')).toEqual([[true]])
  await view.setProps({ open: true })
  expect(toggle.attributes('aria-expanded')).toBe('true')
  const body = view.get('.kx-settings-item-panel')
  expect(body.attributes('id')).toBe(toggle.attributes('aria-controls'))
  expect(body.isVisible()).toBe(true)
  await view.setProps({ open: false })
  expect(view.get('.kx-settings-item-panel').isVisible()).toBe(false)
})

it('keeps a body mounted before its first open when asked', () => {
  view = mount(SettingsItem, { attachTo: document.body, props: { title: 'Files', keepMounted: true }, slots: { default: '<input aria-label="Limit" />' } })
  expect(view.get('.kx-settings-item-panel').isVisible()).toBe(false)
  expect(view.find('input').exists()).toBe(true)
})

it('omits the expand control when the item has no body', () => {
  view = mount(SettingsItem, { props: { title: 'Agent Queue' } })
  expect(view.find('button.kx-settings-item-expand').exists()).toBe(false)
  expect(view.find('.kx-settings-item-panel').exists()).toBe(false)
})
