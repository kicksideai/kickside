import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Uploads from './uploads.vue'

// An upload row with no filename (in flight right after creation, or a source
// that never reported one) must never show its raw uuid as the file name — the
// row, its action aria-labels, and the preview header all fall back to a
// neutral "Untitled upload" label, with the uuid demoted to a secondary detail
// only where there is room for one (the row and the preview header).

beforeEach(() => {
  ;(globalThis as any).__uploadHandlers__ = []
  ;(globalThis as any).__calls__ = []
  ;(globalThis as any).__api__ = {
    '/uploads/list': {
      success: true,
      component_id: 'uploads-u1',
      uploads: [{ uuid: 'u9', filename: '', status: 'completed', size: 10, mime_type: 'text/plain' }],
    },
    '/uploads/u9/artifacts': { success: true, artifacts: [] },
  }
})

describe('uploads.vue filename fallback', () => {
  it('never shows the raw uuid as the primary file name in the list row', async () => {
    const w = mount(Uploads)
    await flushPromises()
    const name = w.find('.kx-name')
    expect(name.text()).toContain('Untitled upload')
    expect(name.text().trim()).not.toBe('u9')
    w.unmount()
  })

  it('demotes the uuid to a secondary detail rather than dropping it entirely', async () => {
    const w = mount(Uploads)
    await flushPromises()
    expect(w.find('.kx-name .kx-uuid').text()).toBe('u9')
    w.unmount()
  })

  it('never puts the raw uuid alone into the row action aria-labels', async () => {
    const w = mount(Uploads)
    await flushPromises()
    const preview = w.find('[data-testid="uploads-row-preview"]')
    const del = w.find('[data-testid="uploads-row-delete"]')
    expect(preview.attributes('aria-label')).toBe('Preview Untitled upload')
    expect(del.attributes('aria-label')).toBe('Delete Untitled upload')
    w.unmount()
  })

  it('never shows the raw uuid as the primary name in the preview header', async () => {
    const w = mount(Uploads)
    await flushPromises()
    await w.find('[data-testid="uploads-row-preview"]').trigger('click')
    await flushPromises()
    const name = w.find('.kx-pv-name')
    expect(name.exists()).toBe(true)
    expect(name.text()).toContain('Untitled upload')
    expect(name.find('.kx-uuid').text()).toBe('u9')
    w.unmount()
  })
})
