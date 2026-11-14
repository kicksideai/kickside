import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import ConnectionPicker from './ConnectionPicker.vue'
import Button from 'primevue/button'

const callbackOrigin = 'https://app.example'
const stateToken = 'state-1'
const provider = {
  provider: 'generic-oauth',
  title: 'Generic OAuth',
  oauth_provider: 'generic-oauth',
  default_scopes: [],
}

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
      authorization_url: 'https://identity.example/authorize',
      redirect_uri: `${callbackOrigin}/api/public/oauth/callback`,
      state_token: stateToken,
      ...overrides,
    },
  }
}

function message(source: Window, origin: string, overrides: Record<string, unknown> = {}) {
  window.dispatchEvent(new MessageEvent('message', {
    source,
    origin,
    data: { type: 'oauth_result', success: true, state_token: stateToken, ...overrides },
  }))
}

const defaultGet = vi.mocked(api.get).getMockImplementation()!
const defaultPost = vi.mocked(api.post).getMockImplementation()!

let wrapper: VueWrapper | null
let popup: TestPopup

describe('generic OAuth popup trust boundary', () => {
  beforeEach(() => {
    wrapper = null
    popup = makePopup()
    vi.spyOn(window, 'open').mockReturnValue(popup)
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, connections: [] } })
    vi.mocked(api.post).mockResolvedValue(initResponse())
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
    vi.mocked(api.get).mockImplementation(defaultGet)
    vi.mocked(api.post).mockImplementation(defaultPost)
  })

  async function connect() {
    wrapper = mount(ConnectionPicker, { props: { providers: [provider], provider: provider.provider } })
    await flushPromises()
    await wrapper.get('[data-connect]').trigger('click')
    await flushPromises()
  }

  it('uses themed footer buttons and blocks duplicate connection while OAuth waits', async () => {
    await connect()
    const buttons = wrapper!.findAllComponents(Button)
    const cancel = buttons.find(button => button.props('label') === 'Cancel')!
    const connecting = buttons.find(button => button.attributes('data-connect') !== undefined)!
    expect(cancel.props('severity')).toBe('secondary')
    expect(cancel.props('outlined')).toBe(true)
    expect((cancel.element as HTMLButtonElement).disabled).toBe(true)
    expect(connecting.props('loading')).toBe(true)
    expect((connecting.element as HTMLButtonElement).disabled).toBe(true)
    expect(connecting.props('label')).toBe('Waiting…')
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it('accepts success only from the exact popup, callback origin, and state token', async () => {
    await connect()
    expect(popup.location.href).toBe('https://identity.example/authorize')

    message(makePopup(), callbackOrigin)
    message(popup, 'https://evil.example')
    message(popup, callbackOrigin, { state_token: 'other-state' })
    await wrapper!.vm.$nextTick()
    expect(wrapper!.emitted('connected')).toBeUndefined()

    message(popup, callbackOrigin)
    await wrapper!.vm.$nextTick()
    expect(wrapper!.emitted('connected')).toHaveLength(1)
    expect(popup.close).toHaveBeenCalledOnce()
  })

  it('rejects an init response without a verifiable callback identity', async () => {
    vi.mocked(api.post).mockResolvedValue(initResponse({ redirect_uri: 'javascript:alert(1)', state_token: '' }))
    await connect()

    expect(wrapper!.emitted('connected')).toBeUndefined()
    expect(wrapper!.text()).toContain('valid callback identity')
    expect(popup.close).toHaveBeenCalledOnce()
  })

  it('does not treat an unconfirmed popup close as success', async () => {
    await connect()
    popup.closed = true
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(wrapper!.emitted('connected')).toBeUndefined()
    expect(wrapper!.text()).toContain('closed before the app received confirmation')
  })

  it('does not infer success from existing rows when the baseline snapshot failed', async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce(new Error('snapshot unavailable'))
      .mockResolvedValueOnce({
        data: { success: true, connections: [{ component_id: 'existing', updated_at: 'now' }] },
      })
    await connect()
    popup.closed = true
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(wrapper!.emitted('connected')).toBeUndefined()
    expect(wrapper!.text()).toContain('closed before the app received confirmation')
  })

  it('closes the popup and removes timer/listener state on unmount', async () => {
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const clearTimer = vi.spyOn(globalThis, 'clearInterval')
    await connect()
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    wrapper!.unmount()
    wrapper = null
    expect(popup.close).toHaveBeenCalledOnce()
    expect(removeListener).toHaveBeenCalledWith('message', expect.any(Function))
    expect(clearTimer).toHaveBeenCalled()
  })
})
