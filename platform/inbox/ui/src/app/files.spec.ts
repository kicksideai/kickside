// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import InboxItem from './InboxItem.vue'
import { isItem, type Item } from './item'

vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: vi.fn(async () => {}) }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))
const views: ReturnType<typeof mount>[] = []
afterEach(() => { for (const view of views.splice(0)) view.unmount() })
function mountItem(value: Item) {
  const view = mount(InboxItem, { props: { item: value }, global: { plugins: [PrimeVuePlugin], stubs: { 'wc-resource-view': true } } })
  views.push(view)
  return view
}

const item = { id: 'review:document', item_type: 'notice', title: 'Review document', status: 'pending', priority: 'normal', files: [
  { locked: false, filename: 'report.pdf', content_type: 'application/pdf', size: 2048, view_url: '/documents?file=example' },
  { locked: true },
] }

describe('Inbox files', () => {
  it('accepts existing items and validates optional file metadata', () => {
    expect(isItem({ ...item, files: undefined })).toBe(true)
    expect(isItem(item)).toBe(true)
    expect(isItem({ ...item, files: [{ locked: false, size: 'unknown' }] })).toBe(false)
    expect(isItem({ ...item, files: [{ filename: 'report.pdf' }] })).toBe(false)
  })
  it('shows metadata and the provider deep link with an inline shared preview', async () => {
    const view = mountItem(item)
    expect(view.text()).toContain('report.pdf')
    expect(view.text()).toContain('2.0 KB')
    expect(view.find('[data-testid="inbox-file-open"]').attributes('href')).toBe('/documents?file=example')
    await view.find('[data-testid="inbox-file-preview"]').trigger('click')
    await flushPromises()
    const preview = view.find('[source-url]')
    expect(preview.attributes('content-type')).toBe('application/pdf')
    expect(preview.attributes('filename')).toBe('report.pdf')
    expect(preview.attributes('source-url')).toBe('/api/v1/inbox/review%3Adocument/files/1')
  })
  it('toggles the preview label and expanded state', async () => {
    const view = mountItem(item)
    const button = view.find('[data-testid="inbox-file-preview"]')
    expect(button.text()).toBe('Preview')
    expect(button.attributes('aria-expanded')).toBe('false')
    await button.trigger('click')
    await flushPromises()
    expect(button.text()).toBe('Close preview')
    expect(button.attributes('aria-expanded')).toBe('true')
    await button.trigger('click')
    expect(button.text()).toBe('Preview')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(view.find('[source-url]').exists()).toBe(false)
  })
  it('renders inaccessible files without names, links or preview controls', () => {
    const view = mountItem(item)
    const locked = view.find('[data-testid="inbox-file-locked"]')
    expect(locked.text()).toBe('Locked file')
    expect(locked.find('a, button').exists()).toBe(false)
  })
  it('renders provider links inside an opaque frame origin', () => {
    const origin = vi.spyOn(window.location, 'origin', 'get').mockReturnValue('null')
    try {
      const view = mountItem(item)
      expect(view.find('[data-testid="inbox-file-open"]').attributes('href')).toBe('/documents?file=example')
    } finally { origin.mockRestore() }
  })
  it('does not render executable provider links', () => {
    const view = mountItem({ ...item, files: [{ ...item.files[0], view_url: 'javascript:alert(1)' }] })
    expect(view.find('[data-testid="inbox-file-open"]').exists()).toBe(false)
  })
})
