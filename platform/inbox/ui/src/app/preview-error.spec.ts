// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h, useAttrs, computed } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import ItemFiles from './ItemFiles.vue'
import RenderImage from '../../../../renderers/ui/src/app/RenderImage.vue'

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => {
    const attrs = useAttrs()
    return computed(() => ({ sourceUrl: attrs['source-url'] }))
  },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

let view: ReturnType<typeof mount> | undefined
afterEach(() => { view?.unmount() })

it('shows a refused Inbox byte request in the shared preview error state', async () => {
  api.get.mockRejectedValueOnce(Object.assign(new Error('Request failed with status code 400'), {
    response: { status: 400, data: new Blob([JSON.stringify({
      success: false, kind: 'invalid', error: 'file exceeds the 25 MiB preview limit',
    })], { type: 'application/json' }) },
  }))
  view = mount(ItemFiles, {
    props: { itemId: 'review', files: [{ locked: false, filename: 'image.png', content_type: 'image/png' }] },
    global: { stubs: {
      'wc-resource-view': defineComponent({
        inheritAttrs: false,
        setup: (_, { attrs }) => () => h(RenderImage, attrs),
      }),
    } },
  })
  await view.get('[data-testid="inbox-file-preview"]').trigger('click')
  await flushPromises()
  expect(api.get).toHaveBeenCalledExactlyOnceWith('/api/v1/inbox/review/files/1', { responseType: 'blob' })
  expect(view.get('.rv-state.err').text()).toContain('Request failed with status code 400')
  expect(view.find('img').exists()).toBe(false)
})
