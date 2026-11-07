// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { api, loadByTagName, on } from '@wippy-fe/proxy'
import Connections from './connections.vue'

vi.hoisted(() => {
  Object.defineProperty(window, '__WIPPY_APP_API__', {
    configurable: true,
    value: { api: { get: vi.fn() }, on: vi.fn(), host: { handleError: vi.fn() }, loadByTagName: vi.fn() },
  })
})
let refresh: () => Promise<void>
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: {} }),
  useEvents: () => vi.fn(),
  useHostVisibilityRefresh: (callback: () => Promise<void>) => { refresh = callback; void callback() },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.resetAllMocks()
})

function serve(reads: unknown[]) {
  vi.mocked(on).mockReturnValue(vi.fn() as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.startsWith('/api/v1/connections?')) return { data: await reads.shift() } as never
    if (url.endsWith('/providers/discover')) return { data: { success: true, providers: [] } } as never
    throw new Error('unexpected request ' + url)
  })
}

const failed = { success: false, error: { message: 'connections unavailable' } }

it('reports a failed first read as the load error, not as an empty list', async () => {
  serve([failed])
  wrapper = mount(Connections, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.text()).toContain('Couldn\'t load connections')
  expect(wrapper.text()).toContain('connections unavailable')
  expect(wrapper.findAll('.live-card')).toHaveLength(0)
})

it('keeps the listed connections and reports a failed later read as the list error', async () => {
  serve([{ success: true, connections: [{ component_id: 'kept', name: 'Kept connection', provider: 'generic' }], total_count: 1 }, failed])
  wrapper = mount(Connections, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.findAll('.live-card')).toHaveLength(1)
  await refresh()
  await flushPromises()
  expect(wrapper.get('.msg.err').text()).toContain('connections unavailable')
  expect(wrapper.findAll('.live-card')).toHaveLength(1)
})

it('ignores a further page that settles after a newer reload', async () => {
  let resolvePage!: (page: unknown) => void
  serve([
    { success: true, connections: [{ component_id: 'old', name: 'Old connection', provider: 'generic' }], total_count: 2, has_more: true },
    new Promise(resolve => { resolvePage = resolve }),
    { success: true, connections: [{ component_id: 'fresh', name: 'Fresh connection', provider: 'generic' }], total_count: 1, has_more: false },
  ])
  wrapper = mount(Connections, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  await wrapper.get('.list-foot button').trigger('click')
  await refresh()
  await flushPromises()
  expect(wrapper.text()).toContain('Fresh connection')

  resolvePage({ success: true, connections: [{ component_id: 'stale', name: 'Stale connection', provider: 'generic' }], total_count: 2, has_more: false })
  await flushPromises()

  expect(wrapper.findAll('.live-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Fresh connection')
  expect(wrapper.text()).not.toContain('Stale connection')
  expect(wrapper.find('.list-foot button').exists()).toBe(false)
})
