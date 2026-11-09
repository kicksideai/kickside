// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ItemFiles from './ItemFiles.vue'

const proxy = vi.hoisted(() => ({ api: { get: vi.fn() }, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@wippy-fe/proxy', () => proxy)
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

const files = [{ locked: false, filename: 'image.png', content_type: 'image/png' }]

let view: ReturnType<typeof mount> | undefined
afterEach(() => { view?.unmount() })

async function openPreview() {
  view = mount(ItemFiles, { props: { itemId: 'review', files }, global: { stubs: { 'wc-resource-view': true } } })
  await view.get('[data-testid="inbox-file-preview"]').trigger('click')
  await flushPromises()
  return view
}

// The shared viewer owns the byte request and shows its refusal: see RenderImage.spec.ts in kickside/renderers.
it('hands the viewer-scoped byte endpoint to the shared viewer and never reads the bytes itself', async () => {
  const preview = (await openPreview()).get('[source-url]')
  expect(preview.attributes('source-url')).toBe('/api/v1/inbox/review/files/1')
  expect(preview.attributes('content-type')).toBe('image/png')
  expect(preview.attributes('filename')).toBe('image.png')
  expect(proxy.api.get).not.toHaveBeenCalled()
})

it('shows an alert in place of the viewer when the shared viewer cannot load', async () => {
  proxy.loadByTagName.mockRejectedValueOnce(new Error('wc-resource-view is unavailable'))
  const opened = await openPreview()
  expect(opened.get('[role="alert"]').text()).toContain('wc-resource-view is unavailable')
  expect(opened.find('[source-url]').exists()).toBe(false)
})
