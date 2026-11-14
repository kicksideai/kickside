import { describe, it, expect, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import KbCreate from './KbCreate.vue'

// KB creation must distinguish an engine/model catalog outage (directed error + retry)
// from an installed-but-empty catalog (the honest "no engine installed" notice). The
// default api.get mock (test-setup) resolves from __api__; capture it for restore.
const defaultGet = vi.mocked(api.get).getMockImplementation()!

afterEach(() => {
  vi.mocked(api.get).mockImplementation(defaultGet)
  ;(globalThis as any).__api__ = {}
})

describe('KbCreate outage vs empty', () => {
  it('renders a directed error with retry when the engine catalog request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('catalog offline'))
    const w = mount(KbCreate)
    await flushPromises()

    expect(w.text()).toContain("Couldn't load knowledge engines")
    expect(w.text()).toContain('catalog offline')
    const retry = w.findAll('button').find(b => /try again/i.test(b.text()))
    expect(retry).toBeTruthy()
    // An outage must NOT read as the honest empty state.
    expect(w.text()).not.toContain('No knowledge engine installed')

    // Retry recovers once the catalog endpoints respond again.
    vi.mocked(api.get).mockImplementation(defaultGet)
    ;(globalThis as any).__api__ = {
      '/api/v1/knowledge/engines': { success: true, engines: [] },
      '/api/v1/knowledge/models': { success: true, models: [] },
    }
    await retry!.trigger('click')
    await flushPromises()
    expect(w.text()).not.toContain("Couldn't load knowledge engines")
    expect(w.text()).toContain('No knowledge engine installed')
    w.unmount()
  })

  it('renders the honest empty notice when the catalog is genuinely empty', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/knowledge/engines': { success: true, engines: [] },
      '/api/v1/knowledge/models': { success: true, models: [] },
    }
    const w = mount(KbCreate)
    await flushPromises()

    expect(w.text()).not.toContain("Couldn't load knowledge engines")
    expect(w.text()).toContain('No knowledge engine installed')
    w.unmount()
  })
})
