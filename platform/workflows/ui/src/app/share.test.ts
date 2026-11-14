// @vitest-environment happy-dom
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

const loadByTagName = vi.fn(async () => {})
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName }))

const { WORKFLOW_SHARE_TAG, mountWorkflowShare, workflowShareConfig } = await import('./share')

describe('workflow share wiring', () => {
  it('uses the generic component access cascade for the workflow component id', () => {
    expect(workflowShareConfig('wf/a b', 'Lead qualification')).toEqual({
      resource_id: 'wf/a b',
      access_url: '/api/v1/component-access/grants/wf%2Fa%20b',
      share_url: '/api/v1/component-access/share/wf%2Fa%20b',
      title: 'Lead qualification',
    })
  })

  it('loads and mounts kickside-share by tag rather than duplicating sharing UI', async () => {
    const host = document.createElement('div')
    const close = vi.fn()
    const el = await mountWorkflowShare(host, 'wf-42', 'Workflow 42', close)
    expect(loadByTagName).toHaveBeenCalledWith(WORKFLOW_SHARE_TAG, { timeoutMs: 8000 })
    expect(el.tagName.toLowerCase()).toBe(WORKFLOW_SHARE_TAG)
    expect(JSON.parse(el.getAttribute('config') || '{}')).toMatchObject({ resource_id: 'wf-42' })
    el.dispatchEvent(new Event('close'))
    expect(close).toHaveBeenCalledOnce()
  })

  it('closes the owner when the embedded share dialog disappears without a close event', async () => {
    if (!customElements.get(WORKFLOW_SHARE_TAG)) {
      customElements.define(WORKFLOW_SHARE_TAG, class extends HTMLElement {
        constructor() {
          super()
          this.attachShadow({ mode: 'open' }).innerHTML = '<div role="dialog">Share</div>'
        }
      })
    }

    const host = document.createElement('div')
    const close = vi.fn()
    const el = await mountWorkflowShare(host, 'wf-43', 'Workflow 43', close)
    await Promise.resolve()
    el.shadowRoot!.innerHTML = ''
    await flushPromises()

    expect(close).toHaveBeenCalledOnce()
    el.dispatchEvent(new Event('close'))
    expect(close).toHaveBeenCalledOnce()
  })
})
