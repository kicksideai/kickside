// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { mount, shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { api } from '@wippy-fe/proxy'
import DetailDrawer from './DetailDrawer.vue'
import Automations from './automations.vue'
import ActionMenu from './ActionMenu.vue'
import type { Automation, AutomationType } from './automation-types'
vi.mock('@iconify/vue', () => ({Icon: {template: '<span />'}}))
vi.mock('@wippy-fe/proxy', () => ({api: {get: vi.fn(), post: vi.fn()}, on: vi.fn(() => vi.fn()), host: {handleError: vi.fn()}}))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const {ref} = await import('vue')
  return {useProps: () => ref({}), useEvents: () => vi.fn(), useHostVisibilityRefresh: vi.fn()}
})
vi.mock('./useAutomationRealtime', () => ({useAutomationRealtime: () => ({syncRealtimeSubscriptions: vi.fn(), clearRealtimeSubscriptions: vi.fn(), refreshDriveStatus: vi.fn()})}))
vi.mock('./useAutomationData', () => ({useAutomationData: ({automations, types}: {automations: {value: Automation[]}; types: {value: AutomationType[]}}) => {
  automations.value = [{id: 'selected', title: 'Selected', type: 'generic', public_state: {status: 'active'}}]
  types.value = [{id: 'generic', controls: [{name: 'pause'}, {name: 'resume'}]}]
  return {fetchAutomations: vi.fn(), fetchTypes: vi.fn(), reload: vi.fn()}
}}))
const mounted: ReturnType<typeof mount>[] = []
afterEach(() => {for (const instance of mounted.splice(0)) instance.unmount(); vi.clearAllMocks()})
it('disables controls and menu actions in a mounted drawer when deletion starts', async () => {
  const automation = {id: 'selected', title: 'Selected', public_state: {status: 'active'}}
  const type = {id: 'generic', controls: [{name: 'pause'}, {name: 'resume'}]}
  const wrapper = mount(DetailDrawer, {props: {automation, type}, global: {stubs: {WcMount: true, ExecutionHistory: true}}}); mounted.push(wrapper)
  expect(wrapper.get('button[aria-label="Pause Selected"]').attributes('disabled')).toBeUndefined()
  await wrapper.setProps({automation: {...automation, deleting_at: 'marked'}})
  expect(wrapper.get('button[aria-label="Pause Selected"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('button[aria-label="More actions for Selected"]').attributes('disabled')).toBeDefined()
  wrapper.findComponent(ActionMenu).vm.$emit('select', 'pause')
  await nextTick()
  expect(wrapper.emitted('action')).toBeUndefined()
})
it('refuses drawer dispatch after the current automation becomes marked', async () => {
  const wrapper = shallowMount(Automations); mounted.push(wrapper)
  await flushPromises()
  await wrapper.get('button[aria-label="Open Selected details"]').trigger('click')
  const drawer = wrapper.findComponent(DetailDrawer)
  expect(drawer.exists()).toBe(true)
  drawer.props('automation')!.deleting_at = 'marked'
  await nextTick()
  for (const method of ['pause', 'resume', 'delete', 'share', 'reconfigure']) drawer.vm.$emit('action', method)
  await flushPromises()
  expect(api.post).not.toHaveBeenCalled()
  expect(wrapper.find('[data-testid="delete-automation-dialog"]').exists()).toBe(false)
})
