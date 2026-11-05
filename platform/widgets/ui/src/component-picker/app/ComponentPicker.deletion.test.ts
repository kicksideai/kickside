// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { api, on } from '@wippy-fe/proxy'
import ComponentPicker from './ComponentPicker.vue'
const props = ref({source: '/api/v1/webhooks', deleteEndpoint: '/api/v1/webhooks', value: '{"thread_id":"selected"}'})
const emit = vi.fn()
vi.mock('@iconify/vue', () => ({Icon: {template: '<span />'}}))
vi.mock('../constants.ts', () => ({useComponentProps: () => props, useComponentEvents: () => emit}))
vi.mock('@wippy-fe/proxy', () => ({api: {get: vi.fn(), delete: vi.fn()}, on: vi.fn(() => vi.fn()), host: {handleError: vi.fn()}}))
for (const unavailable of [false, true]) it(`retains accepted deletion with refresh unavailable=${unavailable}`, async () => {
  props.value.value = '{"thread_id":"selected"}'
  let accepted = false
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (accepted && unavailable) throw new Error('Read unavailable')
    return ({data: String(url).includes('/components/')
    ? {success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'pending', attempts: 0}}
    : {success: true, items: [{id: 'selected', label: 'Selected webhook', ...(accepted ? {deleting_at: 'marked', deletion_job_id: 'job'} : {})}]}}) as never
  })
  vi.mocked(api.delete).mockImplementation(async () => {accepted = true; return {data: {success: true, deleted: false, in_progress: true, job_id: 'job'}} as never})
  const wrapper = mount(ComponentPicker, {global: {stubs: {AnchoredPanel: {props: ['open'], template: '<div v-if="open"><slot /></div>'}}}})
  await flushPromises()
  await wrapper.get('.cp').trigger('click')
  await flushPromises()
  await wrapper.get('[data-test="cp-del"]').trigger('click')
  await wrapper.get('[data-test="cp-del-confirm"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('.cp-value').text()).toBe('Selected webhook')
  expect(wrapper.find('.cp-row').exists()).toBe(true)
  expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
  expect(wrapper.get('.cp-row-main').attributes('disabled')).toBeDefined()
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleted', component_id: 'selected'})
  await flushPromises()
  expect(wrapper.find('.cp-row').exists()).toBe(false)
  expect(wrapper.get('.cp-value').text()).not.toBe('Selected webhook')
  wrapper.unmount()
})
