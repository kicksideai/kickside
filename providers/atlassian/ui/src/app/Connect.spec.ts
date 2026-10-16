import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const post = vi.fn()
const emitted: Array<[string, unknown]> = []
const runtimeProps: Record<string, unknown> = {}
const CALLBACK_ORIGIN = 'https://app.example'
const STATE_TOKEN = 'state-1'

vi.mock('@wippy-fe/proxy', () => ({ api: { post: (...args: unknown[]) => post(...args) } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: runtimeProps }),
  useEvents: () => (name: string, payload: unknown) => { emitted.push([name, payload]) },
}))

import Connect from './Connect.vue'

type TestPopup = Window & { closed: boolean; location: { href: string }; close: ReturnType<typeof vi.fn> }

function makePopup(): TestPopup {
  const popup = {
    closed: false,
    location: { href: '' },
    close: vi.fn(),
  } as unknown as TestPopup
  popup.close.mockImplementation(() => { popup.closed = true })
  return popup
}

function initResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      success: true,
      authorization_url: 'https://auth.atlassian.example/authorize',
      redirect_uri: `${CALLBACK_ORIGIN}/api/public/oauth/callback`,
      state_token: STATE_TOKEN,
      ...overrides,
    },
  }
}

function oauthMessage(source: Window, origin: string, data: Record<string, unknown>) {
  window.dispatchEvent(new MessageEvent('message', {
    source,
    origin,
    data: { type: 'oauth_result', state_token: STATE_TOKEN, ...data },
  }))
}

let wrapper: VueWrapper | null
let popup: TestPopup

describe('Atlassian OAuth popup trust boundary', () => {
  beforeEach(() => {
    emitted.length = 0
    for (const key of Object.keys(runtimeProps)) delete runtimeProps[key]
    wrapper = null
    popup = makePopup()
    post.mockReset().mockResolvedValue(initResponse())
    vi.spyOn(window, 'open').mockReturnValue(popup)
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  async function connect() {
    wrapper = mount(Connect)
    await wrapper.get('.atl-primary').trigger('click')
    await flushPromises()
  }

  it('reauthorizes the canonical component id instead of creating a new connection', async () => {
    runtimeProps.componentId = 'existing-connection'
    await connect()
    expect(post).toHaveBeenCalledWith('/api/v1/oauth/providers/atlassian/init', expect.objectContaining({ component_id: 'existing-connection' }))
  })

  it('opens synchronously and binds the popup to backend callback identity', async () => {
    await connect()

    expect(window.open).toHaveBeenCalledWith('about:blank', 'oauth_atlassian', expect.any(String))
    expect(post).toHaveBeenCalledWith('/api/v1/oauth/providers/atlassian/init', expect.any(Object))
    expect(popup.location.href).toBe('https://auth.atlassian.example/authorize')
  })

  it('ignores messages from another source, origin, or state token', async () => {
    await connect()

    oauthMessage(makePopup(), CALLBACK_ORIGIN, { success: true })
    oauthMessage(popup, 'https://evil.example', { success: true })
    oauthMessage(popup, CALLBACK_ORIGIN, { success: true, state_token: 'wrong' })
    await wrapper!.vm.$nextTick()

    expect(emitted).toEqual([])
    expect(popup.close).not.toHaveBeenCalled()
  })

  it('accepts success only from the verified callback popup', async () => {
    await connect()
    oauthMessage(popup, CALLBACK_ORIGIN, { success: true })
    await wrapper!.vm.$nextTick()

    expect(emitted).toEqual([['oauth-result', { success: true }]])
    expect(popup.close).toHaveBeenCalledOnce()
  })

  it('reports popup close as cancellation rather than success', async () => {
    vi.useFakeTimers()
    await connect()
    popup.closed = true
    await vi.advanceTimersByTimeAsync(600)

    const message = 'Atlassian authorization was cancelled before completion'
    expect(emitted).toContainEqual(['oauth-result', { success: false, error: message }])
    expect(emitted).not.toContainEqual(['oauth-result', { success: true }])
    expect(wrapper!.text()).toContain(message)
  })

  it('rejects init responses without a verifiable callback identity', async () => {
    post.mockResolvedValue(initResponse({ redirect_uri: 'javascript:alert(1)', state_token: '' }))
    await connect()

    expect(emitted).toEqual([])
    expect(wrapper!.text()).toContain('valid callback identity')
    expect(popup.close).toHaveBeenCalledOnce()
  })

  it('cleans up the popup, timer, and message listener on unmount', async () => {
    vi.useFakeTimers()
    const removeListener = vi.spyOn(window, 'removeEventListener')
    await connect()
    expect(vi.getTimerCount()).toBe(1)

    wrapper!.unmount()
    wrapper = null

    expect(popup.close).toHaveBeenCalledOnce()
    expect(removeListener).toHaveBeenCalledWith('message', expect.any(Function))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps a blocked-popup retry available without monitoring a missing popup', async () => {
    const retry = makePopup()
    vi.mocked(window.open).mockReturnValueOnce(null).mockReturnValueOnce(retry)
    const addListener = vi.spyOn(window, 'addEventListener')
    await connect()

    expect(wrapper!.text()).toContain('Your browser blocked the popup')
    expect(addListener).not.toHaveBeenCalledWith('message', expect.any(Function))

    await wrapper!.get('.atl-warn button').trigger('click')
    expect(addListener).toHaveBeenCalledWith('message', expect.any(Function))
    oauthMessage(retry, CALLBACK_ORIGIN, { success: true })
    await wrapper!.vm.$nextTick()
    expect(emitted).toEqual([['oauth-result', { success: true }]])
  })
})
