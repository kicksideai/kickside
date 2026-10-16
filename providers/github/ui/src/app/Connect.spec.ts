import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Connect from './Connect.vue'
import { api } from '@wippy-fe/proxy'

const emitted: Array<[string, unknown]> = []
const runtimeProps: Record<string, unknown> = {}
const CALLBACK_ORIGIN = 'https://app.example'
const STATE_TOKEN = 'state-1'

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: runtimeProps }),
  useEvents: () => (name: string, payload: unknown) => { emitted.push([name, payload]) },
}))

vi.mock('@wippy-fe/proxy', () => ({
  api: { post: vi.fn() },
}))

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
      authorization_url: 'https://github.com/login/oauth/authorize',
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

describe('GitHub Connect', () => {
  beforeEach(() => {
    emitted.length = 0
    for (const key of Object.keys(runtimeProps)) delete runtimeProps[key]
    wrapper = null
    popup = makePopup()
    vi.mocked(api.post).mockReset()
    vi.spyOn(window, 'open').mockReturnValue(popup)
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('reauthorizes the canonical component id instead of creating a new connection', async () => {
    runtimeProps.componentId = 'existing-connection'
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/oauth/providers/github/init', expect.objectContaining({ component_id: 'existing-connection' }))
  })

  it('defaults to OAuth and starts a popup bound to the backend callback identity', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)

    expect(wrapper.text()).toContain('GitHub OAuth')
    expect(wrapper.text()).toContain('Sign in with GitHub')
    expect(wrapper.text()).not.toContain('Save token connection')

    await wrapper.get('button.gh-primary').trigger('click')

    expect(api.post).toHaveBeenCalledWith('/api/v1/oauth/providers/github/init', {
      name: 'GitHub',
      scopes: ['read:user', 'user:email', 'public_repo'],
    })
    expect(popup.location.href).toBe('https://github.com/login/oauth/authorize')
    expect(wrapper.text()).not.toContain('Personal access token is required')
  })

  it('sends private-repo and organization scopes when selected', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)

    await wrapper.get('input[value="repo"]').setValue(true)
    await wrapper.get('label.gh-check input').setValue(true)
    await wrapper.get('button.gh-primary').trigger('click')

    expect(api.post).toHaveBeenCalledWith('/api/v1/oauth/providers/github/init', {
      name: 'GitHub',
      scopes: ['read:user', 'user:email', 'repo', 'read:org'],
    })
  })

  it('ignores oauth results from a forged origin', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')

    oauthMessage(popup, 'https://evil.example', { success: true })
    await wrapper.vm.$nextTick()

    expect(emitted).not.toContainEqual(['oauth-result', { success: true }])
    expect(popup.close).not.toHaveBeenCalled()
    expect(wrapper.get('button.gh-primary').text()).toBe('Connecting...')
  })

  it('ignores oauth results from any window other than the opened popup', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')

    oauthMessage(makePopup(), CALLBACK_ORIGIN, { success: true })
    await wrapper.vm.$nextTick()

    expect(emitted).not.toContainEqual(['oauth-result', { success: true }])
    expect(popup.close).not.toHaveBeenCalled()
  })

  it('ignores oauth results with a different state token', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')

    oauthMessage(popup, CALLBACK_ORIGIN, { success: true, state_token: 'other-state' })
    await wrapper.vm.$nextTick()

    expect(emitted).toEqual([])
    expect(popup.close).not.toHaveBeenCalled()
  })

  it('reports a user-closed popup as cancellation, never success', async () => {
    vi.useFakeTimers()
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')

    popup.closed = true
    await vi.advanceTimersByTimeAsync(800)
    await wrapper.vm.$nextTick()

    const message = 'GitHub authorization was cancelled before completion'
    expect(emitted).toContainEqual(['oauth-result', { success: false, error: message }])
    expect(emitted).not.toContainEqual(['oauth-result', { success: true }])
    expect(wrapper.text()).toContain(message)
  })

  it('accepts a verified success only from the bound callback popup', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')

    oauthMessage(popup, CALLBACK_ORIGIN, { success: true })
    await wrapper.vm.$nextTick()

    expect(emitted).toEqual([['oauth-result', { success: true }]])
    expect(popup.close).toHaveBeenCalledOnce()
    expect(wrapper.get('button.gh-primary').text()).toBe('Sign in with GitHub')
  })

  it('accepts and reports a verified OAuth failure', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse())
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')

    oauthMessage(popup, CALLBACK_ORIGIN, { success: false, error: 'Access denied' })
    await wrapper.vm.$nextTick()

    expect(emitted).toEqual([['oauth-result', { success: false, error: 'Access denied' }]])
    expect(wrapper.text()).toContain('Access denied')
    expect(popup.close).toHaveBeenCalledOnce()
  })

  it('keeps a blocked-popup retry available and monitors only the popup that opens', async () => {
    const retryPopup = makePopup()
    vi.mocked(window.open)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(retryPopup)
    vi.mocked(api.post).mockResolvedValue(initResponse())
    const addListener = vi.spyOn(window, 'addEventListener')
    wrapper = mount(Connect)

    await wrapper.get('button.gh-primary').trigger('click')
    expect(wrapper.text()).toContain('Your browser blocked the popup')
    expect(addListener).not.toHaveBeenCalledWith('message', expect.any(Function))

    await wrapper.get('.gh-warn button').trigger('click')
    expect(wrapper.text()).toContain('Popup blocked - allow popups and retry')
    expect(wrapper.find('.gh-warn').exists()).toBe(true)
    expect(addListener).not.toHaveBeenCalledWith('message', expect.any(Function))

    await wrapper.get('.gh-warn button').trigger('click')
    expect(addListener).toHaveBeenCalledWith('message', expect.any(Function))
    expect(wrapper.find('.gh-warn').exists()).toBe(false)

    oauthMessage(retryPopup, CALLBACK_ORIGIN, { success: true })
    await wrapper.vm.$nextTick()
    expect(emitted).toEqual([['oauth-result', { success: true }]])
  })

  it('closes the popup and removes its timer and message listener on unmount', async () => {
    vi.useFakeTimers()
    vi.mocked(api.post).mockResolvedValue(initResponse())
    const removeListener = vi.spyOn(window, 'removeEventListener')
    wrapper = mount(Connect)
    await wrapper.get('button.gh-primary').trigger('click')
    expect(vi.getTimerCount()).toBe(1)

    wrapper.unmount()
    wrapper = null

    expect(popup.close).toHaveBeenCalledOnce()
    expect(removeListener).toHaveBeenCalledWith('message', expect.any(Function))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not attach or navigate a popup when init resolves after unmount', async () => {
    let resolveInit!: (value: ReturnType<typeof initResponse>) => void
    vi.mocked(api.post).mockReturnValue(new Promise(resolve => { resolveInit = resolve }))
    const addListener = vi.spyOn(window, 'addEventListener')
    wrapper = mount(Connect)
    void wrapper.get('button.gh-primary').trigger('click')
    await flushPromises()

    wrapper.unmount()
    wrapper = null
    resolveInit(initResponse())
    await flushPromises()

    expect(popup.close).toHaveBeenCalledOnce()
    expect(popup.location.href).toBe('')
    expect(addListener).not.toHaveBeenCalledWith('message', expect.any(Function))
  })

  it('requires a token only on the personal access token tab', async () => {
    wrapper = mount(Connect)

    await wrapper.findAll('button.gh-tab')[1].trigger('click')
    await wrapper.get('button.gh-primary').trigger('click')

    expect(wrapper.text()).toContain('Personal access token is required')
    expect(api.post).not.toHaveBeenCalled()
  })

  it('saves a personal access token connection', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })
    wrapper = mount(Connect)

    await wrapper.findAll('button.gh-tab')[1].trigger('click')
    await wrapper.get('input[type="password"]').setValue('github_pat_test')
    await wrapper.get('button.gh-primary').trigger('click')

    expect(api.post).toHaveBeenCalledWith('/api/v1/connections', {
      impl_id: 'kickside.github.connection:github_connection',
      name: 'GitHub',
      private_context: { token: 'github_pat_test' },
      validate: true,
    })
    expect(emitted).toContainEqual(['connection-saved', { success: true }])
  })
})
