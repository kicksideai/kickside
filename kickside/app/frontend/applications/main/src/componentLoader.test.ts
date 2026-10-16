// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { WIPPY_INSTANCE } from './constants'

const host = vi.hoisted(() => {
  const bridge = { loadByTagName: vi.fn() }
  const provided = new Map<unknown, unknown>()
  const api = { get: vi.fn() }
  const proxy = {
    config: { env: { APP_API_URL: 'https://example.test' } },
    host: {},
    api,
    get loadByTagName() { return bridge.loadByTagName },
  }
  const app = { use: vi.fn(), provide: vi.fn((key: unknown, value: unknown) => provided.set(key, value)), mount: vi.fn() }
  return { bridge, provided, api, proxy, app }
})

vi.mock('vue', async importOriginal => ({
  ...await importOriginal<typeof import('vue')>(), createApp: () => host.app,
}))
vi.mock('@wippy-fe/proxy', () => ({ default: host.proxy }))
vi.mock('./app/app.vue', () => ({ default: {} }))
vi.mock('./router', () => ({ createAppRouter: vi.fn(), resolveInitialPath: () => '/' }))
vi.mock('./icons', () => ({ registerShellIcons: vi.fn() }))

async function bootstrap() {
  vi.stubGlobal('__WIPPY_APP_API__', host.bridge)
  const { createMainApp } = await import('./app')
  createMainApp()
  return host.provided.get(WIPPY_INSTANCE) as typeof host.proxy
}

describe('shell Host component loading contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    host.provided.clear()
  })

  it('uses Host loading with the public application origin', async () => {
    const loader = host.bridge.loadByTagName = vi.fn().mockResolvedValue(undefined)
    const proxy = await bootstrap()
    expect(proxy.loadByTagName).toBe(loader)
    await proxy.loadByTagName('example-relative-component')

    expect(proxy).toBe(host.proxy)
    expect(proxy.config.env.APP_API_URL).toBe('https://example.test')
    expect(loader).toHaveBeenCalledExactlyOnceWith('example-relative-component')
    expect(host.api.get).not.toHaveBeenCalled()
  })

  it('keeps the Host loader while autoload and explicit callers share a pending definition', async () => {
    const tag = 'example-shared-component'
    let finish!: () => void
    const autoload = new Promise<void>(resolve => { finish = resolve })
    const loader = host.bridge.loadByTagName = vi.fn(() => autoload)
    const proxy = await bootstrap()
    expect(proxy.loadByTagName).toBe(loader)
    const callers = [proxy.loadByTagName(tag), proxy.loadByTagName(tag)]
    const sameLoader = host.bridge.loadByTagName === loader
    finish()
    await Promise.all(callers)

    expect(sameLoader).toBe(true)
    expect(loader).toHaveBeenCalledTimes(2)
    expect(host.api.get).not.toHaveBeenCalled()
  })

  it('propagates the Host malformed-descriptor error without a second registry request', async () => {
    const error = new Error('loadByTagName(example-invalid-component): registry entry missing baseUrl or browser')
    const loader = host.bridge.loadByTagName = vi.fn().mockRejectedValue(error)
    const proxy = await bootstrap()

    expect(proxy.loadByTagName).toBe(loader)
    await expect(proxy.loadByTagName('example-invalid-component')).rejects.toBe(error)
    expect(loader).toHaveBeenCalledExactlyOnceWith('example-invalid-component')
    expect(host.api.get).not.toHaveBeenCalled()
  })
})
