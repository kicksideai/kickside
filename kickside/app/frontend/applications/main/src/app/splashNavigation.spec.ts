import { effectScope, nextTick, ref, watch } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { completeSplashNavigation } from './splashNavigation'
import { useChatController } from './useChatController'
import { useSessionWorkspace } from './useSessionWorkspace'

async function workspace(path = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: {} }] })
  await router.push(path)
  const chat = useChatController()
  const scope = effectScope()
  scope.run(() => {
    useSessionWorkspace({
      route: router.currentRoute.value,
      router,
      host: { layout: { broadcast: vi.fn() } } as never,
      chat,
      mobileNavOpen: ref(false), mobileSessionsOpen: ref(false),
      reportOwnedPanelError: vi.fn(),
    })
  })
  return { router, chat, scope }
}

describe('splash navigation', () => {
  it('starts the agent only after the Sessions route clears the previous chat', async () => {
    const { router, chat, scope } = await workspace()
    const activeRoute = new Proxy({} as never, { get: (_, key) => Reflect.get(router.currentRoute.value, key) })
    scope.run(() => useSessionWorkspace({
      route: activeRoute, router, host: { layout: { broadcast: vi.fn() } } as never,
      chat, mobileNavOpen: ref(false), mobileSessionsOpen: ref(false), reportOwnedPanelError: vi.fn(),
    }).start())
    const starts: { path: string; token: string }[] = []
    scope.run(() => watch(chat.startToken, token => { if (token) starts.push({ path: router.currentRoute.value.path, token }) }, { flush: 'sync' }))
    try {
      await completeSplashNavigation({ path: '/sessions', startToken: 'agent-token' }, {
        dismiss: async () => {}, isSplashActive: () => false,
        navigate: path => router.push(path), startChat: chat.startChat,
      })
      await nextTick()
      expect(starts).toEqual([{ path: '/sessions', token: 'agent-token' }])
      expect(chat.startToken.value).toBe('agent-token')
      expect(chat.generation.value).toBe(1)
    } finally { scope.stop() }
  })

  it('keeps the splash active when dismissal does not complete', async () => {
    const navigate = vi.fn(async () => {})
    const startChat = vi.fn()
    await completeSplashNavigation({ path: '/sessions', startToken: 'agent-token' }, {
      dismiss: async () => {}, isSplashActive: () => true, navigate, startChat,
    })
    expect(navigate).not.toHaveBeenCalled()
    expect(startChat).not.toHaveBeenCalled()
  })

  it('propagates navigation failure before issuing a session start', async () => {
    const startChat = vi.fn()
    const failure = new Error('navigation fails')
    await expect(completeSplashNavigation({ path: '/sessions', startToken: 'agent-token' }, {
      dismiss: async () => {}, isSplashActive: () => false,
      navigate: async () => { throw failure }, startChat,
    })).rejects.toBe(failure)
    expect(startChat).not.toHaveBeenCalled()
  })
})
