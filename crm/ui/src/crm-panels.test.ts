// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'

const loadByTagName = vi.fn()

vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: (...args: unknown[]) => loadByTagName(...args) }))

const { loadRecordPanelElement } = await import('./crm-panels')

// Each case owns a distinct tag: registration and the per-tag dedupe are both
// page-session globals, exactly as they are in a running surface.
afterEach(() => { loadByTagName.mockReset(); vi.restoreAllMocks() })

describe('CRM record-panel element loading', () => {
  it('resolves a declared tag through the platform views API and never names a bundle', async () => {
    loadByTagName.mockResolvedValue(undefined)
    await loadRecordPanelElement('wc-panel-resolved')
    expect(loadByTagName).toHaveBeenCalledWith('wc-panel-resolved', { timeoutMs: 8000 })
  })

  it('loads a tag once for concurrent and repeated requests', async () => {
    loadByTagName.mockResolvedValue(undefined)
    await Promise.all([loadRecordPanelElement('wc-panel-deduped'), loadRecordPanelElement('wc-panel-deduped')])
    await loadRecordPanelElement('wc-panel-deduped')
    expect(loadByTagName).toHaveBeenCalledTimes(1)
  })

  it('skips resolution for an element the browser already knows', async () => {
    customElements.define('wc-panel-registered', class extends HTMLElement {})
    await loadRecordPanelElement('wc-panel-registered')
    expect(loadByTagName).not.toHaveBeenCalled()
  })

  it('tolerates a contribution whose bundle cannot be resolved', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    loadByTagName.mockRejectedValue(new Error('no view.component registered for tag'))
    await expect(loadRecordPanelElement('wc-panel-missing')).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalled()
    expect(customElements.get('wc-panel-missing')).toBeUndefined()
  })

  it('tolerates a host that offers no proxy globals at all', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    loadByTagName.mockImplementation(() => { throw new Error('Proxy globals not found') })
    await expect(loadRecordPanelElement('wc-panel-hostless')).resolves.toBeUndefined()
  })
})
