// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Uploads from './uploads.vue'
import type { ComponentProps } from '../types'

const props = ref<ComponentProps>({})
const navigate = vi.fn()
const get = vi.fn()
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
vi.mock('../constants', () => ({ useComponentProps: () => props, useComponentEvents: () => navigate }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => get(...args) }, host: {}, loadByTagName: () => Promise.resolve() }))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { onMounted } = await import('vue')
  return { useHostVisibilityRefresh: (fn: () => void) => onMounted(fn) }
})
vi.mock('@widgets/app/componentRealtime', () => ({ subscribeComponentMeta: vi.fn() }))
const file = { uuid: 'b1544a30-d59a-4d70-8edc-023a5f4adeb8', filename: 'report.txt', size: 5,
  mime_type: 'text/plain', status: 'completed', created_at: 0, raw_url: 'https://objects.example/report?signature=test' }
function render() {
  return mount(Uploads, { global: { stubs: {
    UploadPreviewDrawer: { props: ['preview', 'closePreview', 'activePreviewSource'], template: '<div data-testid="drawer"><span v-if="preview">{{ preview.filename }} {{ activePreviewSource(preview).sourceUrl }}</span><button @click="closePreview()">Close</button></div>' },
    Button: { template: '<button><slot /></button>' }, Tag: true, InputGroup: true, InputGroupAddon: true,
    InputText: true, Paginator: true, Select: true, Icon: true,
  } } })
}
beforeEach(() => {
  props.value = {}; navigate.mockReset(); get.mockReset()
  get.mockImplementation(async (url: string) => ({ data: url.endsWith('/list')
    ? { success: true, uploads: [], meta: { total: 0 } }
    : url.endsWith('/artifacts') ? { success: true, artifacts: [] } : { success: true, upload: file } }))
})
describe('upload deep links', () => {
  it('loads a file outside the list page and keeps its signed delivery URL', async () => {
    props.value = { route: file.uuid }
    const wrapper = render(); await flushPromises()
    expect(get).toHaveBeenCalledWith(`/api/v1/uploads/${file.uuid}`)
    expect(wrapper.get('[data-testid="drawer"]').text()).toContain(file.filename)
    expect(wrapper.text()).toContain(file.raw_url)
    expect(navigate).not.toHaveBeenCalled()
    await wrapper.get('[data-testid="drawer"] button').trigger('click')
    expect(navigate).toHaveBeenLastCalledWith('navigate', { path: '' })
    wrapper.unmount()
  })
  it('opens a processing upload without waiting for a list row', async () => {
    props.value = { route: file.uuid }
    get.mockResolvedValue({ data: { success: true, upload: { ...file, status: 'processing' } } })
    const wrapper = render(); await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).toContain(file.filename)
    wrapper.unmount()
  })
  it('reflects list preview selection in the host URL', async () => {
    get.mockResolvedValue({ data: { success: true, uploads: [file], meta: { total: 1 } } })
    const wrapper = render(); await flushPromises()
    await wrapper.get('[data-testid=uploads-row-preview]').trigger('click'); await flushPromises()
    expect(navigate).toHaveBeenLastCalledWith('navigate', { path: file.uuid })
    wrapper.unmount()
  })
  it.each([403, 404])('shows a clear unavailable state for HTTP %s', async status => {
    props.value = { route: 'unavailable' }
    get.mockImplementation(async (url: string) => {
      if (!url.endsWith('/list')) throw { response: { status } }
      return { data: { success: true, uploads: [] } }
    })
    const wrapper = render(); await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toMatch(/not found|permission/i)
    wrapper.unmount()
  })
  it('ignores an old read when the route changes or closes', async () => {
    let resolve!: (value: unknown) => void
    props.value = { route: 'old' }
    get.mockImplementation((url: string) => url.endsWith('/old') ? new Promise(r => { resolve = r })
      : Promise.resolve({ data: { success: true, uploads: [], upload: file } }))
    const wrapper = render(); await flushPromises()
    props.value = { route: file.uuid }; await flushPromises()
    expect(wrapper.text()).toContain(file.filename)
    props.value = { route: '' }; await flushPromises()
    resolve({ data: { success: true, upload: { ...file, uuid: 'old', filename: 'old.txt' } } }); await flushPromises()
    expect(wrapper.get('[data-testid="drawer"]').text()).not.toContain('.txt')
    expect(navigate).not.toHaveBeenCalled()
    wrapper.unmount()
  })
  it('follows host path changes while mounted, without emitting navigation', async () => {
    const wrapper = render(); await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).not.toContain(file.filename)
    props.value = { route: file.uuid }; await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).toContain(file.filename)
    props.value = { route: '' }; await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).not.toContain(file.filename)
    props.value = { route: file.uuid }; await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).toContain(file.filename)
    expect(navigate).not.toHaveBeenCalled()
    wrapper.unmount()
  })
  it('keeps the latest click through delayed host echoes, including the list route', async () => {
    const second = { ...file, uuid: '26d4a4dc-04d3-40ef-a608-88c64c507212', filename: 'second.txt' }
    get.mockImplementation(async (url: string) => ({ data: url.endsWith('/list')
      ? { success: true, uploads: [file, second], meta: { total: 2 } }
      : url.endsWith('/artifacts') ? { success: true, artifacts: [] } : { success: true, upload: file } }))
    const wrapper = render(); await flushPromises()
    await wrapper.findAll('[data-testid=uploads-row-preview]')[0].trigger('click')
    props.value = { route: 'older' }; await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).toContain(file.filename)
    props.value = { route: file.uuid }; await flushPromises()
    await wrapper.get('[data-testid=drawer] button').trigger('click')
    props.value = { route: 'older' }; await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).not.toContain('.txt')
    props.value = { route: '' }; await flushPromises()
    await wrapper.findAll('[data-testid=uploads-row-preview]')[1].trigger('click')
    props.value = { route: file.uuid }; await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).toContain(second.filename)
    props.value = { route: second.uuid }; await flushPromises()
    expect(navigate).toHaveBeenLastCalledWith('navigate', { path: second.uuid })
    props.value = { route: file.uuid }; await flushPromises()
    expect(wrapper.get('[data-testid=drawer]').text()).toContain(file.filename)
    wrapper.unmount()
  })

})
