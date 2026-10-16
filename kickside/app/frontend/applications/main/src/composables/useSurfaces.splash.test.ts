import { beforeEach, describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('./useWippy', () => ({ useApi: () => api }))
vi.mock('@wippy-fe/proxy', () => ({ on: () => () => {} }))

import { useSurfaces } from './useSurfaces'
import { completeSplashNavigation } from '../app/splashNavigation'

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('dismissSplash', () => {
  const surfaces = useSurfaces()
  const splash = { id: 'workspace-setup', title: 'Welcome' }

  beforeEach(() => {
    api.get.mockReset()
    api.post.mockReset()
    surfaces.splash.value = splash
    surfaces.splashError.value = ''
    surfaces.splashSaving.value = false
  })

  it('keeps the wizard open until the seen save succeeds', async () => {
    const request = deferred<{ data: { success: boolean } }>()
    api.post.mockReturnValueOnce(request.promise)

    const dismissing = surfaces.dismissSplash()
    const openBeforeSaveCompletes = surfaces.splash.value?.id === splash.id
    request.resolve({ data: { success: true } })
    await dismissing

    expect(api.post).toHaveBeenCalledWith('/api/v1/ui/splash/workspace-setup/seen')
    expect(openBeforeSaveCompletes).toBe(true)
    expect(surfaces.splash.value).toBeNull()
  })

  it('does not restore a dismissed splash from an earlier navigation response', async () => {
    const request = deferred<{ data: { success: boolean; splash: typeof splash } }>()
    api.get.mockReturnValueOnce(request.promise)
    const loading = surfaces.reloadNav()
    api.post.mockResolvedValueOnce({ data: { success: true } })
    await surfaces.dismissSplash()
    request.resolve({ data: { success: true, splash } })
    await loading
    expect(surfaces.splash.value).toBeNull()
  })

  it('retains an active first-agent splash during eligibility refresh until its chat intent completes', async () => {
    const personal = { id: 'first_agent', component_tag: 'kickside-agent-onboarding' }
    surfaces.splash.value = personal
    api.get.mockResolvedValueOnce({ data: { success: true, splash: null } })
    await surfaces.reloadNav()
    expect(surfaces.splash.value).toEqual(personal)

    api.post.mockResolvedValueOnce({ data: { success: true } })
    const navigate = vi.fn(async () => {})
    const startChat = vi.fn()
    await completeSplashNavigation({ path: '/sessions', startToken: 'created-agent-token' }, {
      dismiss: surfaces.dismissSplash,
      isSplashActive: () => !!surfaces.splash.value,
      navigate, startChat,
    })
    expect(api.post).toHaveBeenCalledWith('/api/v1/ui/splash/first_agent/seen')
    expect(surfaces.splash.value).toBeNull()
    expect(navigate).toHaveBeenCalledWith('/sessions')
    expect(startChat).toHaveBeenCalledWith('created-agent-token')
  })

  it('keeps setup open when the server rejects completion in a successful HTTP response', async () => {
    api.post.mockResolvedValueOnce({ data: { success: false, error: 'admin required' } })
    await surfaces.dismissSplash()
    expect(surfaces.splash.value).toEqual(splash)
    expect(surfaces.splashError.value).toBe('admin required')
  })

  it('keeps the wizard open and exposes the save failure for retry', async () => {
    api.post.mockRejectedValueOnce(new Error('network unavailable'))

    await surfaces.dismissSplash()

    expect.soft(surfaces.splash.value).toEqual(splash)
    expect.soft(surfaces.splashError.value).toMatch(/could not save/i)

    api.post.mockResolvedValueOnce({ data: { success: true } })
    await surfaces.dismissSplash()

    expect(api.post).toHaveBeenCalledTimes(2)
    expect(surfaces.splash.value).toBeNull()
    expect(surfaces.splashError.value).toBe('')
  })
})


describe('advanceSplash', () => {
  it('resolves the next eligible splash after persisting the current one', async () => {
    const surfaces = useSurfaces()
    const next = { id: 'personal-setup', title: 'Personal setup' }
    surfaces.splash.value = { id: 'workspace-setup', title: 'Welcome' }
    api.post.mockResolvedValueOnce({ data: { success: true } })
    api.get.mockResolvedValueOnce({ data: { success: true, splash: next } })
    await surfaces.advanceSplash()
    expect(api.post).toHaveBeenCalledWith('/api/v1/ui/splash/workspace-setup/seen')
    expect(api.get).toHaveBeenCalledWith('/api/v1/nav/list')
    expect(surfaces.splash.value).toEqual(next)
  })

  it('keeps a retry surface when resolving the next splash fails', async () => {
    const surfaces = useSurfaces()
    const current = { id: 'workspace-setup', title: 'Welcome' }
    surfaces.splash.value = current
    api.post.mockResolvedValueOnce({ data: { success: true } })
    api.get.mockRejectedValueOnce(new Error('next setup unavailable'))
    await surfaces.advanceSplash()
    expect(surfaces.splash.value).toEqual(current)
    expect(surfaces.splashError.value).toContain('next setup unavailable')
  })
})


describe('splash presentation selection', () => {
  it.each(['dialog', 'fullscreen', undefined])('preserves %s from navigation', async (presentation) => {
    const surfaces = useSurfaces()
    surfaces.splash.value = null
    api.get.mockResolvedValueOnce({ data: { success: true, splash: { id: 'first_agent', presentation } } })
    await surfaces.reloadNav()
    expect(surfaces.splash.value).toEqual({ id: 'first_agent', presentation })
  })
})
