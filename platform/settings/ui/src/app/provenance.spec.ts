import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SettingsForm from './SettingsForm.vue'

const now = new Date('2026-10-02T12:00:00Z')
const updatedAt = new Date(now.getTime() - 5 * 60_000).toISOString()

beforeEach(() => {
  vi.setSystemTime(now)
  ;(globalThis as any).__api__ = {
    '/api/v1/settings': { success: true, settings: [
      {
        namespace: 'kickside.ui', key: 'title', value: 'KickSide', value_type: 'string',
        default: 'KickSide', is_default: false, editable: true,
        updated_by: 'admin', updated_at: updatedAt,
      },
    ] },
  }
})
afterEach(() => { delete (globalThis as any).__api__ })

describe('SettingsForm provenance timestamp', () => {
  it('renders the override time as a relative label, not the raw RFC3339 value', async () => {
    const w = mount(SettingsForm, { props: { namespace: 'kickside.ui' } })
    await flushPromises()
    const prov = w.find('.ks-prov')
    expect(prov.exists()).toBe(true)
    expect(prov.text()).toContain('by admin')
    expect(prov.text()).toContain('5m ago')
    expect(prov.text()).not.toContain(updatedAt)
    w.unmount()
  })
})
