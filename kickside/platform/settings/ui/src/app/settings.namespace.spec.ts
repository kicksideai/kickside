import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import SettingsForm from './SettingsForm.vue'

// SettingsForm is the namespace-scoped content of a settings block: it fetches
// the listing with ?namespace=<ns> and renders the per-value_type form for that
// one namespace's declarations. Data is seeded through the mocked proxy `api`.
beforeEach(() => {
  ;(api.get as any).mockClear()
  ;(globalThis as any).__api__ = {
    'settings?namespace': { success: true, settings: [{ namespace: 'kickside.uploads.rasterize', key: 'enabled', value: true, value_type: 'bool', default: true, is_default: true, editable: true }] },
  }
})

afterEach(() => { ;(globalThis as any).__api__ = {} })

describe('SettingsForm namespace scope', () => {
  it('requests only the scoped namespace and renders its fields', async () => {
    const w = mount(SettingsForm, { props: { namespace: 'kickside.uploads.rasterize' } })
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/api/v1/settings?namespace=kickside.uploads.rasterize')
    expect(w.html()).toContain('enabled')
    w.unmount()
  })
})
