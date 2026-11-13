// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const readCss = (name: string) => readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../package', name), 'utf8')
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { api, host, on } from '@wippy-fe/proxy'
import { useComponentDeletion, type ComponentDeletionState } from '../package/useComponentDeletion'
import ComponentDeletion from '../package/ComponentDeletion.vue'
vi.mock('@wippy-fe/proxy', () => ({api: {get: vi.fn()}, on: vi.fn(() => vi.fn()), host: {handleError: vi.fn()}}))
const mounted: ReturnType<typeof mount>[] = []
afterEach(() => { for (const instance of mounted.splice(0)) instance.unmount(); vi.clearAllMocks() })
it('retains a marked row, takes list failure on refresh, and removes only on final deletion', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'pending', attempts: 0}}])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  await flushPromises()
  expect(rows.value).toHaveLength(1)
  expect(api.get).not.toHaveBeenCalled()
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'selected'})
  await flushPromises()
  expect(rows.value).toHaveLength(1)
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'dead', attempts: 3, last_error: 'cleanup refused'}}]
  await flushPromises()
  expect(rows.value[0].deletion_job?.status).toBe('dead')
  receive({event: 'component.deleted', component_id: 'other'})
  expect(rows.value).toHaveLength(1)
  receive({topic: 'component.selected', data: {event: 'component.deleted'}})
  expect(rows.value).toHaveLength(0)
})

it('takes deletion progress from an authorized list row without reading the component', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([
    {id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'dead', attempts: 3, last_error: 'cleanup refused'}},
  ])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  await flushPromises()
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(api.get).not.toHaveBeenCalled()
  expect(indicator.text()).toContain('Deletion failed')
  expect(indicator.find('button').exists()).toBe(true)
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

for (const job of [null, {status: 'cancelled', attempts: 0}]) {
  it(`offers retry for a marked component with ${job?.status ?? 'missing'} job`, async () => {
    const wrapper = mount(ComponentDeletion, {props: {state: {deleting_at: 'marked', deletion_job: job}}})
    mounted.push(wrapper)
    expect(wrapper.text()).toContain('Deletion failed')
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
}

it('keeps accepted progress spinning until a list confirms absence', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected'}])
  let acceptDeletion!: ReturnType<typeof useComponentDeletion>['acceptDeletion']
  mounted.push(mount(defineComponent({setup() {({acceptDeletion} = useComponentDeletion(rows, row => row.id)); return () => null}})))
  acceptDeletion('selected', {job_id: 'job'})
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(indicator.find('[role="progressbar"]').exists()).toBe(true)
  expect(indicator.find('button').exists()).toBe(false)
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job'}]
  await flushPromises()
  await indicator.setProps({state: rows.value[0]})
  expect(rows.value[0].deletion_job).toBeNull()
  expect(indicator.text()).toContain('Deletion failed')
  expect(api.get).not.toHaveBeenCalled()
})
it('leaves event progress unresolved until the list supplies it', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected'}])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'selected', deletion_job_id: 'job'})
  await flushPromises()
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(indicator.find('[role="progressbar"]').exists()).toBe(true)
  expect(indicator.find('button').exists()).toBe(false)
  expect(api.get).not.toHaveBeenCalled()
  expect(host.handleError).not.toHaveBeenCalled()
})
it('filters a late list response against deletion events even for ids outside the current page', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected'}])
  const removed = vi.fn()
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id, removed); return () => null}})))
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleted', component_id: 'selected'})
  receive({event: 'component.deleted', component_id: 'off-page'})
  await flushPromises()
  rows.value = [{id: 'selected'}, {id: 'off-page'}, {id: 'live'}]
  await flushPromises()
  expect(rows.value.map(row => row.id)).toEqual(['live'])
  expect(removed).toHaveBeenCalledExactlyOnceWith('selected')
})
it('marks accepted deletion locally before an unavailable refresh and clears a prior failed attempt', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deletion_job: {status: 'dead', attempts: 3}}])
  let acceptDeletion!: (componentId: string, result: {job_id?: string}) => void
  mounted.push(mount(defineComponent({setup() {({acceptDeletion} = useComponentDeletion(rows, row => row.id)); return () => null}})))
  acceptDeletion('selected', {job_id: 'new-job'})
  expect(rows.value[0].deleting_at).toBeTruthy()
  expect(rows.value[0].deletion_job_id).toBe('new-job')
  expect(rows.value[0].deletion_job).toBeUndefined()
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'selected'})
  await flushPromises()
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(indicator.find('[role="progressbar"]').exists()).toBe(true)
  expect(indicator.find('button').exists()).toBe(false)
})
it('reports other omitted rows when a list replacement also contains a deleted id', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'deleted'}, {id: 'omitted'}])
  const removed = vi.fn()
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id, removed); return () => null}})))
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleted', component_id: 'deleted'})
  await flushPromises()
  rows.value = [{id: 'deleted'}, {id: 'live'}]
  await flushPromises()
  expect(rows.value.map(row => row.id)).toEqual(['live'])
  expect(removed.mock.calls).toEqual([['deleted'], ['omitted']])
})

it('keeps accepted deletion when an older list arrives after a failed refresh', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected'}])
  let acceptDeletion!: ReturnType<typeof useComponentDeletion>['acceptDeletion']
  mounted.push(mount(defineComponent({setup() {({acceptDeletion} = useComponentDeletion(rows, row => row.id)); return () => null}})))
  let resolveList!: (rows: (ComponentDeletionState & {id: string})[]) => void
  const list = new Promise<(ComponentDeletionState & {id: string})[]>(resolve => {resolveList = resolve}).then(list => {rows.value = list})
  acceptDeletion('selected', {job_id: 'accepted-job'})
  const markedAt = rows.value[0].deleting_at
  const refresh = vi.fn().mockRejectedValue(new Error('Refresh unavailable'))
  await expect(refresh()).rejects.toThrow('Refresh unavailable')
  resolveList([{id: 'selected'}])
  await list
  await flushPromises()
  expect(rows.value[0].deleting_at).toBe(markedAt)
  expect(rows.value[0].deletion_job_id).toBe('accepted-job')
  expect(rows.value[0].deletion_job).toBeUndefined()
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(indicator.find('[role="progressbar"]').exists()).toBe(true)
  expect(indicator.find('button').exists()).toBe(false)
})

it('ignores an old list snapshot after an accepted retry', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deleting_at: 'marked', deletion_job_id: 'old-job', deletion_job: {status: 'dead', attempts: 3}}])
  let acceptDeletion!: ReturnType<typeof useComponentDeletion>['acceptDeletion']
  mounted.push(mount(defineComponent({setup() {({acceptDeletion} = useComponentDeletion(rows, row => row.id)); return () => null}})))
  acceptDeletion('selected', {job_id: 'retry-job'})
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'old-job', deletion_job: {status: 'dead', attempts: 3}}]
  await flushPromises()
  expect(rows.value[0].deletion_job_id).toBe('retry-job')
  expect(rows.value[0].deletion_job).toBeUndefined()
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(indicator.find('[role="progressbar"]').exists()).toBe(true)
  expect(indicator.find('button').exists()).toBe(false)
  expect(api.get).not.toHaveBeenCalled()
})

for (const job of [null, {status: 'dead', attempts: 3}, {status: 'cancelled', attempts: 1}]) {
  it(`keeps confirmed ${job?.status ?? 'missing'} progress and retry during list refresh`, async () => {
    const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: job}])
    mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
    await flushPromises()
    rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: job}]
    await flushPromises()
    const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
    expect(rows.value[0].deletion_job).toEqual(job)
    expect(indicator.text()).toContain('Deletion failed')
    expect(indicator.find('[role="progressbar"]').exists()).toBe(false)
    expect(indicator.find('button').exists()).toBe(true)
    rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'running', attempts: 1}}]
    await flushPromises()
    expect(rows.value[0].deletion_job?.status).toBe('running')
    expect(api.get).not.toHaveBeenCalled()
  })
}

it('does not carry resolved failure to a different job on list refresh', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deleting_at: 'marked', deletion_job_id: 'old-job', deletion_job: {status: 'dead', attempts: 3}}])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  await flushPromises()
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'new-job'}]
  await flushPromises()
  expect(rows.value[0].deletion_job).toBeNull()
})

it('keeps an off-page accepted deletion marked when a stale page returns', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'page-two'}])
  let acceptDeletion!: ReturnType<typeof useComponentDeletion>['acceptDeletion']
  mounted.push(mount(defineComponent({setup() {({acceptDeletion} = useComponentDeletion(rows, row => row.id)); return () => null}})))
  acceptDeletion('page-two', {job_id: 'accepted-job'})
  const markedAt = rows.value[0].deleting_at
  rows.value = [{id: 'page-one'}]
  await flushPromises()
  rows.value = [{id: 'page-two'}]
  await flushPromises()
  expect(rows.value[0].deleting_at).toBe(markedAt)
  expect(rows.value[0].deletion_job_id).toBe('accepted-job')
  expect(rows.value[0].deletion_job).toBeUndefined()
})

it('takes the server retry handle and progress together and retains only matching progress', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected'}])
  let acceptDeletion!: ReturnType<typeof useComponentDeletion>['acceptDeletion']
  mounted.push(mount(defineComponent({setup() {({acceptDeletion} = useComponentDeletion(rows, row => row.id)); return () => null}})))
  acceptDeletion('selected', {job_id: 'attempt-a'})
  const running = {status: 'running', attempts: 1}
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'attempt-b', deletion_job: running}]
  await flushPromises()
  expect(rows.value[0].deletion_job_id).toBe('attempt-b')
  expect(rows.value[0].deletion_job).toEqual(running)
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'attempt-a', deletion_job: {status: 'dead', attempts: 3}}]
  await flushPromises()
  expect(rows.value[0].deletion_job_id).toBe('attempt-b')
  expect(rows.value[0].deletion_job).toEqual(running)
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'selected', deletion_job_id: 'attempt-a'})
  await flushPromises()
  expect(rows.value[0].deletion_job_id).toBe('attempt-b')
  expect(rows.value[0].deletion_job).toEqual(running)
  rows.value = []
  await flushPromises()
  rows.value = [{id: 'selected', deleting_at: 'marked', deletion_job_id: 'attempt-a', deletion_job: {status: 'dead', attempts: 3}}]
  await flushPromises()
  expect(rows.value[0].deletion_job_id).toBe('attempt-b')
  expect(rows.value[0].deletion_job).toBeUndefined()
})

it('finishes a deletion only for a marked row that leaves the list or a deletion event', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'plain'}, {id: 'marked', deleting_at: 'marked'}, {id: 'event'}])
  const finished = vi.fn()
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id, undefined, finished); return () => null}})))
  await flushPromises()
  rows.value = [rows.value[2]]
  await flushPromises()
  expect(finished.mock.calls).toEqual([['marked']])
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleted', component_id: 'event'})
  await flushPromises()
  expect(finished.mock.calls).toEqual([['marked'], ['event']])
})

it('follows another actor deleting listed rows from deletion events without reading their components', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'first'}, {id: 'second'}, {id: 'live'}])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  await flushPromises()
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'first', deletion_job_id: 'first-job'})
  receive({event: 'component.deleting', component_id: 'second', deletion_job_id: 'second-job'})
  await flushPromises()
  expect(rows.value.map(row => [row.id, row.deletion_job_id, !!row.deleting_at])).toEqual(
    [['first', 'first-job', true], ['second', 'second-job', true], ['live', undefined, false]])
  receive({event: 'component.deleted', component_id: 'first'})
  await flushPromises()
  expect(rows.value.map(row => row.id)).toEqual(['second', 'live'])
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(indicator.find('[role="progressbar"]').exists()).toBe(true)
  receive({event: 'component.deleted', component_id: 'second'})
  await flushPromises()
  expect(rows.value.map(row => row.id)).toEqual(['live'])
  expect(api.get).not.toHaveBeenCalled()
  expect(host.handleError).not.toHaveBeenCalled()
})

it('takes progress of a marked row from a list that also returns a deleted id', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'live'}])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleted', component_id: 'gone'})
  await flushPromises()
  rows.value = [{id: 'gone'}, {id: 'marked', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'dead', attempts: 3}}]
  await flushPromises()
  expect(rows.value.map(row => row.id)).toEqual(['marked'])
  expect(api.get).not.toHaveBeenCalled()
  expect(rows.value[0].deletion_job?.status).toBe('dead')
})

it('keeps a dead attempt and its retry when that attempt\'s deleting event arrives after the list read', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'dead', attempts: 3, last_error: 'cleanup refused'}}])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  await flushPromises()
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'selected', deletion_job_id: 'job'})
  await flushPromises()
  const indicator = mount(ComponentDeletion, {props: {state: rows.value[0]}}); mounted.push(indicator)
  expect(rows.value[0].deletion_job?.status).toBe('dead')
  expect(indicator.text()).toContain('Deletion failed')
  expect(indicator.find('button').exists()).toBe(true)
  receive({event: 'component.deleting', component_id: 'selected', deletion_job_id: 'retry-job'})
  await flushPromises()
  expect(rows.value[0].deletion_job_id).toBe('retry-job')
  expect(rows.value[0].deletion_job).toBeUndefined()
})

it('keeps list progress for the same attempt when its deleting event arrives', async () => {
  const rows = ref<(ComponentDeletionState & {id: string})[]>([{id: 'selected', deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'dead', attempts: 3, last_error: 'cleanup refused'}}])
  mounted.push(mount(defineComponent({setup() {useComponentDeletion(rows, row => row.id); return () => null}})))
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({event: 'component.deleting', component_id: 'selected', deletion_job_id: 'job'})
  await flushPromises()
  expect(rows.value[0].deletion_job?.status).toBe('dead')
})


it.each(['before', 'after'])('keeps the deletion spinner compact when theme CSS loads %s', (order) => {
  const kit = document.createElement('style')
  kit.textContent = readCss('component-deletion.css')
  const theme = document.createElement('style')
  theme.textContent = '.p-progressspinner { width: 100px; height: 100px; margin: 0 auto; }'
  document.head.append(...(order === 'before' ? [theme, kit] : [kit, theme]))
  const wrapper = mount(ComponentDeletion, {
    attachTo: document.body,
    props: {state: {deleting_at: 'marked', deletion_job: {status: 'running', attempts: 1}}},
  })
  mounted.push(wrapper)
  try {
    const spinner = wrapper.get('[role="progressbar"]').element
    expect(getComputedStyle(spinner).width).toBe('16px')
    expect(getComputedStyle(spinner).height).toBe('16px')
    expect(getComputedStyle(spinner).margin).toBe('0px')
  } finally {
    kit.remove()
    theme.remove()
  }
})
