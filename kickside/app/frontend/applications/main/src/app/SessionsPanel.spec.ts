// @vitest-environment happy-dom

import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const loadByTagName = vi.fn()
let connectedVisibility: string[] = []

vi.mock('../composables/useWippy', () => ({
  useWippy: () => ({ loadByTagName }),
}))

import SessionsPanel from './SessionsPanel.vue'

describe('SessionsPanel visibility lifecycle', () => {
  beforeAll(() => {
    if (!customElements.get('kickside-sessions')) {
      customElements.define('kickside-sessions', class extends HTMLElement {
        connectedCallback() {
          connectedVisibility.push(this.getAttribute('data-wippy-visible') || '')
        }
      })
    }
  })

  beforeEach(() => {
    loadByTagName.mockReset()
    loadByTagName.mockResolvedValue(undefined)
    connectedVisibility = []
  })

  it('sets visibility before connection and reveals the retained sessions element in place', async () => {
    const wrapper = mount(SessionsPanel, {
      props: { activeSessionId: 'session-a', visible: false },
      attachTo: document.body,
    })
    await flushPromises()

    const element = wrapper.find('kickside-sessions').element
    expect(element.getAttribute('data-wippy-visible')).toBe('false')
    expect(element.getAttribute('active-session-id')).toBe('session-a')
    expect(connectedVisibility).toEqual(['false'])
    expect(loadByTagName).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ activeSessionId: 'session-b', visible: true })

    expect(wrapper.find('kickside-sessions').element).toBe(element)
    expect(element.getAttribute('data-wippy-visible')).toBe('true')
    expect(element.getAttribute('active-session-id')).toBe('session-b')
    expect(connectedVisibility).toEqual(['false'])
    expect(loadByTagName).toHaveBeenCalledTimes(1)
  })
})
