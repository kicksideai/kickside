import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const get = vi.fn()
const post = vi.fn()
const toast = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (...a: any[]) => get(...a), post: (...a: any[]) => post(...a), put: vi.fn(() => Promise.resolve({ data: {} })) },
  host: { toast: (...a: any[]) => toast(...a) },
}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: { config: { resource_id: 'r1', access_url: '/api/v1/things/r1/access' } } }),
  useEvents: () => vi.fn(),
}))

import Share from './share.vue'

const stubs = { Icon: true, AnchoredPanel: { template: '<div><slot /></div>' } }

// An access row whose subject was deleted since the grant was made (a revoked
// user, a stale group id) resolves to no match at all -- resolvePrincipals()
// returns nothing for it. The row must never fall back to printing the raw
// principal id as its name.
describe('share.vue unresolved principal fallback', () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); toast.mockReset() })

  it('never shows the raw principal id as the primary access-row label', async () => {
    get.mockImplementation((url: string) => {
      if (url.includes('access-model')) return Promise.resolve({ data: { success: true, capabilities: [{ bit: 1, key: 'read', label: 'Read' }] } })
      if (url.includes('/access')) {
        return Promise.resolve({
          data: { success: true, access: [{ subject_id: 'usr_deleted_9f2c', subject_type: 'user', access_mask: 1 }] },
        })
      }
      return Promise.resolve({ data: { success: true } })
    })
    post.mockImplementation((url: string) => {
      if (url.includes('principals/resolve')) return Promise.resolve({ data: { success: true, principals: [] } })
      return Promise.resolve({ data: { success: true } })
    })
    const w = mount(Share, { global: { stubs } })
    await flushPromises()
    const label = w.find('.kxs-row-label')
    // The primary text node (everything but the secondary .kxs-id span) is the
    // neutral fallback, never the raw id.
    const primaryText = Array.from(label.element.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .trim()
    expect(primaryText).toBe('Unknown user')
    expect(label.find('.kxs-id').text()).toBe('usr_deleted_9f2c')
    w.unmount()
  })

  it('names an unresolved group distinctly from an unresolved user', async () => {
    get.mockImplementation((url: string) => {
      if (url.includes('access-model')) return Promise.resolve({ data: { success: true, capabilities: [{ bit: 1, key: 'read', label: 'Read' }] } })
      if (url.includes('/access')) {
        return Promise.resolve({
          data: { success: true, access: [{ subject_id: 'grp:stale-1', subject_type: 'group', access_mask: 1 }] },
        })
      }
      return Promise.resolve({ data: { success: true } })
    })
    post.mockImplementation((url: string) => {
      if (url.includes('principals/resolve')) return Promise.reject(new Error('resolve failed'))
      return Promise.resolve({ data: { success: true } })
    })
    const w = mount(Share, { global: { stubs } })
    await flushPromises()
    const label = w.find('.kxs-row-label')
    const primaryText = Array.from(label.element.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .trim()
    expect(primaryText).toBe('Unknown group')
    expect(label.find('.kxs-id').text()).toBe('grp:stale-1')
    w.unmount()
  })
})
