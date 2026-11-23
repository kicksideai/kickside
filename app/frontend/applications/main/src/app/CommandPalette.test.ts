// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { WIPPY_INSTANCE } from '../constants'
import CommandPalette from './CommandPalette.vue'

vi.mock('@kickside/ui-kit/componentRealtime', () => ({ subscribeComponentMeta: vi.fn() }))
vi.mock('../composables/useContributions', () => ({
  useContributions: () => ({
    get: () => [
      { id: 'first', label: 'First action', component_tag: 'kickside-test-first' },
      { id: 'next', label: 'Next action', component_tag: 'kickside-test-next', hotkey: 'mod+shift+n' },
    ],
    load: vi.fn(),
  }),
}))

it('keeps focus with the active view and ignores mounts from abandoned commands', async () => {
  let finishFirst!: () => void
  const loadByTagName = vi.fn((tag: string) => tag === 'kickside-test-first'
    ? new Promise<void>(resolve => { finishFirst = resolve })
    : Promise.resolve())
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  await router.push('/')
  const wrapper = mount(CommandPalette, {
    attachTo: document.body,
    global: { plugins: [router], provide: { [WIPPY_INSTANCE as symbol]: { loadByTagName } } },
  })

  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }))
  await flushPromises()
  const dialog = wrapper.get('dialog')
  expect((dialog.element as HTMLDialogElement).open).toBe(true)
  const search = wrapper.get('[role="combobox"]')
  expect(document.activeElement).toBe(search.element)
  expect(search.attributes('aria-activedescendant')).toBe('command-palette-option-0')
  await search.trigger('keydown', { key: 'ArrowDown' })
  expect(search.attributes('aria-activedescendant')).toBe('command-palette-option-1')
  await search.trigger('keydown', { key: 'ArrowUp' })
  await search.trigger('keydown', { key: 'Enter' })
  await flushPromises()
  expect(document.activeElement).toBe(wrapper.get('[aria-label="Back to commands"]').element)
  expect(loadByTagName).toHaveBeenCalledWith('kickside-test-first')

  await dialog.trigger('cancel')
  expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, metaKey: true, shiftKey: true }))
  await flushPromises()
  finishFirst()
  await flushPromises()
  expect(wrapper.find('kickside-test-first').exists()).toBe(false)
  expect(wrapper.find('kickside-test-next').exists()).toBe(true)

  await dialog.trigger('cancel')
  expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element)
  await dialog.trigger('cancel')
  expect(wrapper.find('dialog').exists()).toBe(false)
})
