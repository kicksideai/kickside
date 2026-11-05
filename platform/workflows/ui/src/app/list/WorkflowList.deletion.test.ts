import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { useComponentDeletion } from '@widgets/app/useComponentDeletion'
import { deleteWorkflow } from '../api/api'
import WorkflowList from './WorkflowList.vue'

vi.mock('@widgets/app/useComponentDeletion', () => ({useComponentDeletion: vi.fn(() => ({acceptDeletion: vi.fn()}))}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({useHostVisibilityRefresh: (load: () => void) => load(), useProps: () => ({value: {}})}))
vi.mock('@iconify/vue', () => ({Icon: {template: '<span />'}}))
vi.mock('../api/api', () => ({
  listWorkflows: vi.fn(async () => [{id: 'selected', title: 'Selected workflow', labels: []}]),
  deleteWorkflow: vi.fn(async () => ({job_id: 'accepted-job'})),
  applyCommands: vi.fn(), createWorkflow: vi.fn(), setWorkflowLabels: vi.fn(), humanError: String,
}))
vi.mock('../share', () => ({mountWorkflowShare: vi.fn()}))

it('forwards the accepted job handle before refreshing the list', async () => {
  const wrapper = mount(WorkflowList, {shallow: true, global: {stubs: {
    Dialog: {props: ['visible'], template: '<div v-if="visible"><slot /><slot name="footer" /></div>'},
    Button: {template: '<button><slot /></button>'},
  }}})
  await flushPromises()
  const {acceptDeletion} = vi.mocked(useComponentDeletion).mock.results.at(-1)!.value
  wrapper.findComponent({name: 'WorkflowTable'}).vm.$emit('ask-delete', {id: 'selected', title: 'Selected workflow'})
  await flushPromises()
  const confirm = wrapper.findAll('button').find(button => button.text() === 'Delete')!
  await confirm.trigger('click')
  await flushPromises()
  expect(deleteWorkflow).toHaveBeenCalledWith('selected')
  expect(acceptDeletion).toHaveBeenCalledWith('selected', {job_id: 'accepted-job'})
  wrapper.unmount()
})
