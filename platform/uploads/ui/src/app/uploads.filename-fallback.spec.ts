import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Uploads from './uploads.vue'

beforeEach(() => {
  ;(globalThis as any).__uploadHandlers__ = []
  ;(globalThis as any).__calls__ = []
  ;(globalThis as any).__api__ = {
    '/uploads/list': {
      success: true,
      component_id: 'uploads-u1',
      uploads: [{ uuid: 'u9', filename: '', status: 'completed', size: 10, mime_type: 'text/plain', created_at: '2026-10-14T12:00:00Z' }],
    },
    '/uploads/u9/artifacts': { success: true, artifacts: [] },
  }
})

describe('uploads.vue filename fallback', () => {
  it('never shows the raw uuid as the primary file name in the list row', async () => {
    const w = mount(Uploads)
    await flushPromises()
    const name = w.find('.kx-name')
    expect(name.text()).toContain('Untitled file')
    expect(name.text().trim()).not.toBe('u9')
    w.unmount()
  })

  it('identifies an unnamed file by its type and date without displaying its uuid', async () => {
    const w = mount(Uploads)
    await flushPromises()
    expect(w.find('.kx-row').text()).not.toContain('u9')
    expect(w.find('.kx-row').text()).toContain('Text')
    expect(w.find('.kx-date').text()).not.toBe('')
    w.unmount()
  })

  it('never puts the raw uuid alone into the row action aria-labels', async () => {
    const w = mount(Uploads)
    await flushPromises()
    const preview = w.find('[data-testid="uploads-row-preview"]')
    const del = w.find('[data-testid="uploads-row-delete"]')
    expect(preview.attributes('aria-label')).toBe('Preview Untitled file')
    expect(del.attributes('aria-label')).toBe('Delete Untitled file')
    w.unmount()
  })

  it('never shows the raw uuid as the primary name in the preview header', async () => {
    const w = mount(Uploads)
    await flushPromises()
    await w.find('[data-testid="uploads-row-preview"]').trigger('click')
    await flushPromises()
    const name = w.find('.kx-pv-name')
    expect(name.exists()).toBe(true)
    expect(name.text()).toContain('Untitled file')
    expect(w.find('.kx-pv-head').text()).not.toContain('u9')
    expect(w.find('.kx-pv-sub').text()).toContain('Text')
    expect(w.find('.kx-pv-sub').text()).toContain('Oct 14')
    w.unmount()
  })
})
