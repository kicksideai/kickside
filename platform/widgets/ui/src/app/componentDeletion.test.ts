import { afterEach, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { useComponentDeletion, type ComponentDeletionState } from './useComponentDeletion'
import ComponentDeletion from './ComponentDeletion.vue'
vi.mock('@wippy-fe/proxy', () => ({api: {get: vi.fn()}, on: vi.fn(() => vi.fn()), host: {handleError: vi.fn()}}))
const mounted: ReturnType<typeof mount>[] = []
afterEach(() => { for (const instance of mounted.splice(0)) instance.unmount(); vi.clearAllMocks() })
it('retains a marked row, reads failure on refresh, and removes only on final deletion', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job'}])
  vi.mocked(api.get).mockResolvedValue({data: {success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'pending', attempts: 0}}} as never)
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  await flushPromises()
  expect(rows.value).toHaveLength(1)
  expect(api.get).toHaveBeenCalledWith('/api/v1/components/selected')
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'selected'})
  await flushPromises()
  expect(rows.value).toHaveLength(1)
  vi.mocked(api.get).mockResolvedValue({data: {success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'dead', attempts: 3, last_error: 'cleanup refused'}}} as never)
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job'}]
  await flushPromises()
  expect(rows.value[0].deletion_job?.status).toBe('dead')
  receive({event: 'component.deleted', component_id: 'other'})
  expect(rows.value).toHaveLength(1)
  receive({topic: 'component.selected', data: {event: 'component.deleted'}})
  expect(rows.value).toHaveLength(0)
})
it('shows a spinner while active and a failure with explicit retry when dead', async () => {
  const state: ComponentDeletionState = {deleting_at: 'marked', deletion_job: {status: 'running', attempts: 1}}
  const wrapper = mount(ComponentDeletion, {props: {state}}); mounted.push(wrapper)
  expect(wrapper.text()).toContain('Deleting')
  expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
  await wrapper.setProps({state: {...state, deletion_job: {status: 'dead', attempts: 3, last_error: 'cleanup refused'}}})
  expect(wrapper.text()).toContain('Deletion failed')
  expect(wrapper.text()).toContain('cleanup refused')
  expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
  await wrapper.get('button').trigger('click')
  expect(wrapper.emitted('retry')).toHaveLength(1)
})

it('reports removal once when a later successful read omits a row', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected'}])
  const removed = vi.fn()
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id, removed); return () => null}})))
  rows.value = []
  await flushPromises()
  expect(removed).toHaveBeenCalledExactlyOnceWith('selected')
})
