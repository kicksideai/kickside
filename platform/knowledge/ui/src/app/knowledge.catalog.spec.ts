// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { useKnowledgeCatalog } from './useKnowledgeCatalog'
import type { KbDetail } from './knowledge.types'

vi.hoisted(() => {
  Object.defineProperty(window, '__WIPPY_APP_API__', {
    configurable: true,
    value: { api: { get: vi.fn() }, on: vi.fn() },
  })
})

let wrapper: VueWrapper | undefined
let receive: (message: unknown) => void
const unsubscribe = vi.fn()

beforeEach(() => {
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receive = callback as typeof receive
    return unsubscribe
  })
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, items: [
    { id: 'first', name: 'First library', kb_type: 'records' },
  ] } } as never)
})
afterEach(() => {
  wrapper?.unmount()
  vi.resetAllMocks()
})

function catalog() {
  const detail = ref<KbDetail | null>(null)
  let controller!: ReturnType<typeof useKnowledgeCatalog>
  wrapper = mount(defineComponent({
    setup() {
      controller = useKnowledgeCatalog({ detail })
      return () => null
    },
  }))
  return { controller, detail }
}

it('discovers a library created outside an already mounted catalog', async () => {
  const { controller } = catalog()
  await controller.load()
  expect(controller.kbs.value.map(kb => kb.id)).toEqual(['first'])
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, items: [
    { id: 'second', name: 'Second library', kb_type: 'records' },
    { id: 'first', name: 'First library', kb_type: 'records' },
  ] } } as never)

  receive({ topic: 'component.second', data: {
    event: 'component.meta.changed', component_id: 'second',
    meta: { kb_type: 'records', status: 'ready' },
  } })
  await flushPromises()

  expect(controller.kbs.value.map(kb => kb.id)).toEqual(['second', 'first'])
  expect(on).toHaveBeenCalledWith('@message', expect.any(Function))
  expect(on).toHaveBeenCalledTimes(1)
  wrapper?.unmount()
  expect(unsubscribe).toHaveBeenCalledTimes(1)
  wrapper = undefined
})

it('patches known libraries and their open detail without fetching the catalog', async () => {
  const { controller, detail } = catalog()
  await controller.load()
  detail.value = { id: 'first', name: 'First library', kb_type: 'records' }
  vi.mocked(api.get).mockClear()

  receive({ event: 'component.meta.changed', component_id: 'first',
    meta: { title: 'Renamed library', document_count: '7' } })
  await flushPromises()

  expect(controller.kbs.value[0]).toMatchObject({ name: 'Renamed library', document_count: 7 })
  expect(detail.value).toMatchObject({ name: 'Renamed library', document_count: 7 })
  expect(api.get).not.toHaveBeenCalled()
})

it('discovers the first library when the mounted catalog is empty', async () => {
  vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, items: [] } } as never)
  const { controller } = catalog()
  await controller.load()
  expect(controller.kbs.value).toEqual([])
  receive({ topic: 'component.first', data: {
    event: 'component.meta.changed', meta: { kb_type: 'records' },
  } })
  await flushPromises()
  expect(controller.kbs.value.map(kb => kb.id)).toEqual(['first'])
})

it('serializes discovery refreshes and drops queued work after unmount', async () => {
  const { controller } = catalog()
  await controller.load()
  vi.mocked(api.get).mockClear()

  let resolveFirst!: (value: unknown) => void
  let resolveSecond!: (value: unknown) => void
  vi.mocked(api.get)
    .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }) as never)
    .mockImplementationOnce(() => new Promise(resolve => { resolveSecond = resolve }) as never)
  receive({ event: 'component.meta.changed', component_id: 'second', meta: { kb_type: 'records' } })
  receive({ event: 'component.meta.changed', component_id: 'third', meta: { kb_type: 'records' } })
  expect(api.get).toHaveBeenCalledTimes(1)

  resolveFirst({ data: { success: true, items: [{ id: 'second', name: 'Second library', kb_type: 'records' }] } })
  await flushPromises()
  expect(api.get).toHaveBeenCalledTimes(2)

  receive({ event: 'component.meta.changed', component_id: 'fourth', meta: { kb_type: 'records' } })
  expect(api.get).toHaveBeenCalledTimes(2)
  wrapper?.unmount()
  wrapper = undefined
  resolveSecond({ data: { success: true, items: [{ id: 'third', name: 'Third library', kb_type: 'records' }] } })
  await flushPromises()
  expect(api.get).toHaveBeenCalledTimes(2)
  expect(controller.kbs.value.map(kb => kb.id)).toEqual(['second'])
})

it('waits for the initial catalog read before refreshing a discovered library', async () => {
  const { controller } = catalog()
  let resolveInitial!: (value: unknown) => void
  let resolveRefresh!: (value: unknown) => void
  vi.mocked(api.get)
    .mockImplementationOnce(() => new Promise(resolve => { resolveInitial = resolve }) as never)
    .mockImplementationOnce(() => new Promise(resolve => { resolveRefresh = resolve }) as never)

  const initial = controller.load()
  receive({ event: 'component.meta.changed', component_id: 'second', meta: { kb_type: 'records' } })
  expect(api.get).toHaveBeenCalledTimes(1)

  resolveInitial({ data: { success: true, items: [{ id: 'first', name: 'First library', kb_type: 'records' }] } })
  await initial
  await flushPromises()
  expect(api.get).toHaveBeenCalledTimes(2)
  resolveRefresh({ data: { success: true, items: [{ id: 'second', name: 'Second library', kb_type: 'records' }] } })
  await flushPromises()
  expect(controller.kbs.value.map(kb => kb.id)).toEqual(['second'])
})

it('keeps a later manual catalog result over an older discovery response', async () => {
  const { controller } = catalog()
  await controller.load()
  vi.mocked(api.get).mockClear()
  let resolveDiscovery!: (value: unknown) => void
  let resolveManual!: (value: unknown) => void
  vi.mocked(api.get)
    .mockImplementationOnce(() => new Promise(resolve => { resolveDiscovery = resolve }) as never)
    .mockImplementationOnce(() => new Promise(resolve => { resolveManual = resolve }) as never)

  receive({ event: 'component.meta.changed', component_id: 'second', meta: { kb_type: 'records' } })
  const manual = controller.load()
  resolveManual({ data: { success: true, items: [{ id: 'manual', name: 'Manual refresh', kb_type: 'records' }] } })
  await manual
  resolveDiscovery({ data: { success: true, items: [{ id: 'second', name: 'Second library', kb_type: 'records' }] } })
  await flushPromises()
  expect(controller.kbs.value.map(kb => kb.id)).toEqual(['manual'])
})

it('ignores unrelated components and surfaces a failed discovery read', async () => {
  const { controller } = catalog()
  await controller.load()
  vi.mocked(api.get).mockClear()
  receive({ event: 'component.meta.changed', component_id: 'agent', meta: { title: 'Agent' } })
  await flushPromises()
  expect(api.get).not.toHaveBeenCalled()

  vi.mocked(api.get).mockRejectedValue(new Error('Catalog unavailable'))
  receive({ event: 'component.meta.changed', component_id: 'second', meta: { kb_type: 'records' } })
  await flushPromises()
  expect(controller.error.value).toBe('Catalog unavailable')
  expect(controller.kbs.value.map(kb => kb.id)).toEqual(['first'])
})
