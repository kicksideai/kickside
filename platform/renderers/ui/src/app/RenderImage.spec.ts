// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import RenderImage from './RenderImage.vue'

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ref({ sourceUrl: '/api/v1/inbox/review/files/1' }),
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

let view: ReturnType<typeof mount> | undefined
afterEach(() => { view?.unmount() })

it('shows a refused byte request in the shared preview error state', async () => {
  api.get.mockRejectedValueOnce(Object.assign(new Error('Request failed with status code 400'), {
    response: { status: 400, data: new Blob([JSON.stringify({
      success: false, kind: 'invalid', error: 'file exceeds the 25 MiB preview limit',
    })], { type: 'application/json' }) },
  }))
  view = mount(RenderImage)
  await flushPromises()
  expect(api.get).toHaveBeenCalledExactlyOnceWith('/api/v1/inbox/review/files/1', { responseType: 'blob' })
  expect(view.get('.rv-state.err').text()).toContain('Request failed with status code 400')
  expect(view.find('img').exists()).toBe(false)
})
