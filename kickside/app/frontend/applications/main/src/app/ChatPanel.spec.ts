/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { waitForCustomElement } from './chatRuntime'
import ChatPanel from './ChatPanel.vue'

vi.mock('./chatRuntime', () => ({
  waitForCustomElement: vi.fn(() => Promise.resolve()),
}))

/**
 * Importing the component reaches the proxy, which throws outside a Wippy host
 * and took the whole file down with it - the suite collected zero tests and the
 * panel went uncovered. `ws` is captured so the send path can be asserted.
 */
const { ws } = vi.hoisted(() => ({ ws: { send: vi.fn(), sendWithResponse: vi.fn() } }))
vi.mock('@wippy-fe/proxy', () => ({
  ws,
  api: { get: vi.fn(() => Promise.resolve({ data: { success: true, agents: [] } })) },
}))

describe('ChatPanel', () => {
  beforeAll(() => {
    if (!customElements.get('wippy-chat'))
      customElements.define('wippy-chat', class extends HTMLElement {})
    if (!customElements.get('wippy-session-selector'))
      customElements.define('wippy-session-selector', class extends HTMLElement {})
  })

  beforeEach(() => {
    vi.mocked(waitForCustomElement).mockReset()
    vi.mocked(waitForCustomElement).mockResolvedValue()
    ws.send.mockReset()
    ws.sendWithResponse.mockReset()
  })

  it('keeps the split selector and chat elements stable while synchronizing sessions', async () => {
    const onSessionStarted = vi.fn()
    const onSessionSelect = vi.fn()
    const wrapper = mount(ChatPanel, {
      props: {
        generation: 0,
        sessionId: 'session-a',
        onSessionStarted,
        onSessionSelect,
        // The picker belongs to the panel's own chrome. On /sessions the page
        // owns navigation and renders no header, so there is nothing to assert
        // about a picker there.
        closable: true,
      },
    })
    await flushPromises()

    const chat = wrapper.element.querySelector('wippy-chat')
    const selector = wrapper.element.querySelector('wippy-session-selector')
    expect(chat).not.toBeNull()
    expect(selector).not.toBeNull()
    expect(wrapper.find('.chat-panel__header').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Close chat"]').exists()).toBe(true)
    expect(chat?.getAttribute('show-selector')).toBe('false')
    expect(chat?.getAttribute('session-id')).toBe('session-a')
    expect(chat?.getAttribute('start-token')).toBe('')
    expect(selector?.getAttribute('active-session-id')).toBe('session-a')

    await wrapper.setProps({ sessionId: 'session-b' })
    expect(wrapper.element.querySelector('wippy-chat')).toBe(chat)
    expect(wrapper.element.querySelector('wippy-session-selector')).toBe(selector)
    expect(chat?.getAttribute('session-id')).toBe('session-b')
    expect(selector?.getAttribute('active-session-id')).toBe('session-b')

    await wrapper.setProps({ generation: 1, sessionId: '', startToken: 'start-b' })
    expect(wrapper.element.querySelector('wippy-chat')).toBe(chat)
    expect(wrapper.element.querySelector('wippy-session-selector')).toBe(selector)
    expect(chat?.getAttribute('session-id')).toBe('')
    expect(chat?.getAttribute('start-token')).toBe('start-b')
    expect(selector?.getAttribute('active-session-id')).toBe('')

    // Picking an existing session is a selection, not a start - the two are
    // separate emits because only one of them creates anything.
    selector?.dispatchEvent(new CustomEvent('select', { detail: { sessionId: 'session-c' } }))
    expect(wrapper.emitted('sessionSelect')).toEqual([['session-c']])
    expect(onSessionSelect).toHaveBeenCalledOnce()
    expect(onSessionStarted).not.toHaveBeenCalled()

    await wrapper.setProps({ sessionId: 'session-c' })
    expect(wrapper.element.querySelector('wippy-chat')).toBe(chat)
    expect(wrapper.element.querySelector('wippy-session-selector')).toBe(selector)
    expect(chat?.getAttribute('session-id')).toBe('session-c')
    expect(selector?.getAttribute('active-session-id')).toBe('session-c')

    wrapper.unmount()
    selector?.dispatchEvent(new CustomEvent('select', { detail: { sessionId: 'detached' } }))
    expect(onSessionSelect).toHaveBeenCalledOnce()
  })

  it('renders compat panel chrome and emits close without remounting chat', async () => {
    const wrapper = mount(ChatPanel, {
      props: {
        generation: 0,
        closable: true,
      },
    })
    await flushPromises()

    const chat = wrapper.element.querySelector('wippy-chat')
    const selector = wrapper.element.querySelector('wippy-session-selector')
    expect(selector).not.toBeNull()
    expect(chat?.getAttribute('show-selector')).toBe('false')

    await wrapper.get('button[aria-label="Close chat"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.element.querySelector('wippy-chat')).toBe(chat)
    expect(wrapper.element.querySelector('wippy-session-selector')).toBe(selector)
  })

  it('replaces only the blank chat element when New Chat is requested again', async () => {
    const wrapper = mount(ChatPanel, {
      props: { generation: 0 },
    })
    await flushPromises()

    const firstChat = wrapper.element.querySelector('wippy-chat') as (HTMLElement & { draft?: string }) | null
    const selector = wrapper.element.querySelector('wippy-session-selector')
    expect(firstChat).not.toBeNull()
    firstChat!.draft = 'stale draft'

    await wrapper.setProps({ generation: 1 })

    const nextChat = wrapper.element.querySelector('wippy-chat') as (HTMLElement & { draft?: string }) | null
    expect(nextChat).not.toBe(firstChat)
    expect(nextChat?.draft).toBeUndefined()
    expect(nextChat?.getAttribute('session-id')).toBe('')
    expect(nextChat?.getAttribute('start-token')).toBe('')
    expect(wrapper.element.querySelector('wippy-session-selector')).toBe(selector)
    wrapper.unmount()
  })

  it('hands the first message to the native chat start without awaiting a response', async () => {
    const wrapper = mount(ChatPanel, { props: { generation: 0, sessionsAppearance: true } })
    await flushPromises()
    const chat = wrapper.element.querySelector('wippy-chat')!
    await wrapper.get('textarea[aria-label="Message"]').setValue('hello')
    expect(chat.getAttribute('initial-message')).toBe('hello')
    expect(chat.querySelector('[slot="empty-state"]')).toBeNull()
    expect(chat.getAttribute('start-token')).toBe('')
    expect(wrapper.emitted('startChat')).toBeUndefined()

    chat.dispatchEvent(new CustomEvent('session-started', { detail: { sessionId: 'session-x' } }))
    await flushPromises()
    expect(wrapper.emitted('sessionStarted')).toEqual([['session-x']])
    expect(ws.sendWithResponse).not.toHaveBeenCalled()
    expect(ws.send).not.toHaveBeenCalled()
    expect(chat.getAttribute('initial-message')).toBe('')
    wrapper.unmount()
  })

  it('clears the initial draft when selection or a token start supersedes it', async () => {
    const wrapper = mount(ChatPanel, { props: { generation: 0, sessionsAppearance: true } })
    await flushPromises()
    const chat = wrapper.element.querySelector('wippy-chat')!
    await wrapper.get('textarea[aria-label="Message"]').setValue('old draft')
    await wrapper.setProps({ sessionId: 'existing' })
    expect(chat.getAttribute('initial-message')).toBe('')
    expect(wrapper.find('textarea[aria-label="Message"]').exists()).toBe(false)
    await wrapper.setProps({ sessionId: '', generation: 1 })
    expect(wrapper.get<HTMLTextAreaElement>('textarea[aria-label="Message"]').element.value).toBe('')
    await wrapper.get('textarea[aria-label="Message"]').setValue('another draft')
    await wrapper.setProps({ startToken: 'agent-token', generation: 2 })
    expect(chat.getAttribute('initial-message')).toBe('')
    expect(chat.getAttribute('start-token')).toBe('agent-token')
    expect(ws.send).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('resets the initial draft on repeated New Chat and retains it after a start error', async () => {
    const wrapper = mount(ChatPanel, { props: { generation: 0, sessionsAppearance: true } })
    await flushPromises()
    const chat = wrapper.element.querySelector('wippy-chat')!
    await wrapper.get('textarea[aria-label="Message"]').setValue('retry draft')
    chat.dispatchEvent(new CustomEvent('error', { detail: { message: 'Start rejected' } }))
    await flushPromises()
    expect(chat.getAttribute('initial-message')).toBe('retry draft')
    expect(wrapper.get('[role="alert"]').text()).toContain('Start rejected')
    await wrapper.setProps({ generation: 1 })
    expect(wrapper.get<HTMLTextAreaElement>('textarea[aria-label="Message"]').element.value).toBe('')
    expect(wrapper.element.querySelector('wippy-chat')?.getAttribute('initial-message')).toBe('')
    expect(ws.send).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('gates the native composer until the saved session metadata renders', async () => {
    const wrapper = mount(ChatPanel, {
      props: { generation: 0, sessionsAppearance: true, sessionId: 'saved-session' },
    })
    await flushPromises()
    const chat = wrapper.element.querySelector('wippy-chat')!
    expect(chat.getAttribute('hide-header')).toBeNull()
    expect(chat.getAttribute('custom-css')).toContain('[part="meta"]:empty')
    expect(chat.getAttribute('custom-css')).toMatch(/\[part="composer"\]\s*\{\s*visibility: hidden;/)
    expect(chat.getAttribute('session-id')).toBe('saved-session')
    expect(ws.send).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('reports a runtime error without unmounting the conversation', async () => {
    // The chat emits `error` for anything that goes wrong while it runs. Taking
    // the chat away over one loses the transcript the reader was in.
    const wrapper = mount(ChatPanel, { props: { generation: 0 } })
    await flushPromises()

    const chat = wrapper.element.querySelector('wippy-chat')
    chat!.dispatchEvent(new CustomEvent('error', { detail: { message: 'Could not send' } }))
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Could not send')
    // Still the same element: not remounted, not replaced.
    expect(wrapper.element.querySelector('wippy-chat')).toBe(chat)
    expect(wrapper.find('.chat-panel__failure').exists()).toBe(false)
    expect(wrapper.emitted('error')).toHaveLength(1)

    await wrapper.get('[role="alert"] button').trigger('click')
    expect(wrapper.find('.chat-panel__notice').exists()).toBe(false)
    expect(wrapper.element.querySelector('wippy-chat')).toBe(chat)
    wrapper.unmount()
  })

  it('fails visibly when either split tag is unavailable and retries both tags', async () => {
    vi.mocked(waitForCustomElement).mockImplementation(async (name) => {
      if (name === 'wippy-session-selector')
        throw new Error('Missing wippy-session-selector')
    })
    const wrapper = mount(ChatPanel, {
      props: { generation: 0, closable: true },
    })
    await flushPromises()

    expect(vi.mocked(waitForCustomElement).mock.calls.map(([name]) => name)).toEqual([
      'wippy-chat',
      'wippy-session-selector',
    ])
    expect(wrapper.get('[role="alert"]').text()).toContain('Missing wippy-session-selector')
    expect(wrapper.emitted('error')).toHaveLength(1)

    vi.mocked(waitForCustomElement).mockResolvedValue()
    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()

    expect(wrapper.element.querySelector('wippy-chat')).not.toBeNull()
    expect(wrapper.element.querySelector('wippy-session-selector')).not.toBeNull()
  })
})
