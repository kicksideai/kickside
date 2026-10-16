// @vitest-environment happy-dom
import { flushPromises } from '@vue/test-utils'

import { createApp, h } from 'vue'
import type { CreateAppRouterOptions } from '@wippy-fe/router'
import { afterEach, describe, expect, it, vi } from 'vitest'

(window as unknown as Record<string, unknown>).__WIPPY_APP_API__ = {
  api: {},
  config: {},
  host: {
    classifyLink: vi.fn(),
    navigate: vi.fn(),
    onRouteChanged: vi.fn(),
  },
  html: {},
  loadByTagName: vi.fn(),
  loadWebComponent: vi.fn(),
  logger: {},
  on: vi.fn(),
  sanitize: vi.fn(),
  state: {},
  ws: {},
}

const mountedApps: ReturnType<typeof createApp>[] = []

afterEach(() => {
  for (const app of mountedApps.splice(0)) app.unmount()
  document.body.innerHTML = ''
})

async function mountRouter(
  initialPath: string,
  options: Omit<CreateAppRouterOptions, 'initialPath'>,
) {
  const { createAppRouter } = await import('./index')
  const router = createAppRouter(initialPath, options)
  const app = createApp({ render: () => h('div') })
  const root = document.createElement('div')
  document.body.appendChild(root)
  app.use(router)
  app.mount(root)
  mountedApps.push(app)
  await router.isReady()
  return router
}

describe('main app router integration', () => {
  it('primes the memory router from the host route', async () => {
    const onRouteChanged = vi.fn()
    const host = { onRouteChanged } as unknown as NonNullable<CreateAppRouterOptions['host']>
    const router = await mountRouter('/system/security', { host, on: null })

    expect(router.currentRoute.value.fullPath).toBe('/system/security')
    expect(onRouteChanged).toHaveBeenLastCalledWith('/system/security', undefined)
  })

  it('forwards local navigation to the host once', async () => {
    const onRouteChanged = vi.fn()
    const host = { onRouteChanged } as unknown as NonNullable<CreateAppRouterOptions['host']>
    const router = await mountRouter('/', { host, on: null })
    onRouteChanged.mockClear()

    await router.push('/connections')

    expect(router.currentRoute.value.fullPath).toBe('/connections')
    expect(onRouteChanged).toHaveBeenCalledTimes(1)
    expect(onRouteChanged).toHaveBeenCalledWith('/connections', undefined)
  })

  it('resolves the public sessions routes explicitly', async () => {
    const onRouteChanged = vi.fn()
    const host = { onRouteChanged } as unknown as NonNullable<CreateAppRouterOptions['host']>
    const router = await mountRouter('/sessions/session-123', { host, on: null })

    expect(router.currentRoute.value.name).toBe('session')
    expect(router.currentRoute.value.params.sessionId).toBe('session-123')

    await router.push('/sessions')

    expect(router.currentRoute.value.name).toBe('sessions')
    expect(onRouteChanged).toHaveBeenLastCalledWith('/sessions', undefined)
  })

  it('applies session Back and Forward history with host echo suppression', async () => {
    const onRouteChanged = vi.fn()
    const host = { onRouteChanged } as unknown as NonNullable<CreateAppRouterOptions['host']>
    let historyHandler: ((event: { path: string; navId?: number }) => void) | undefined
    const on = vi.fn((topic: string, callback: typeof historyHandler) => {
      expect(topic).toBe('@history')
      historyHandler = callback
      return vi.fn()
    }) as unknown as NonNullable<CreateAppRouterOptions['on']>
    const router = await mountRouter('/', { host, on })
    onRouteChanged.mockClear()

    historyHandler?.({ path: 'sessions', navId: 42 })
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/sessions')
    expect(onRouteChanged).toHaveBeenCalledTimes(1)
    expect(onRouteChanged).toHaveBeenLastCalledWith('/sessions', 42)

    historyHandler?.({ path: 'sessions/session-123', navId: 43 })
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/sessions/session-123')
    expect(router.currentRoute.value.name).toBe('session')
    expect(onRouteChanged).toHaveBeenCalledTimes(2)
    expect(onRouteChanged).toHaveBeenLastCalledWith('/sessions/session-123', 43)
  })
})
