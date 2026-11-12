// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, it, expect, vi } from 'vitest'
import { installBadgeSubscriptions, useSurfaces, type NavCategory } from './useSurfaces'

const ports = vi.hoisted(() => ({ api: { get: vi.fn() }, on: vi.fn((_topic: string, _cb: () => void) => vi.fn()) }))
vi.mock('./useWippy', () => ({ useApi: () => ports.api, useWippy: () => ({ on: ports.on }) }))
vi.mock('@kickside/ui-kit/componentRealtime', () => ({ subscribeComponentMeta: vi.fn() }))

describe('viewer badge invalidation', () => {
  it('subscribes once per declared topic, reloads through navigation and tears down', () => {
    const subscribe = vi.fn(() => vi.fn())
    const on = vi.fn((_topic: string, _cb: () => void) => vi.fn())
    const reload = vi.fn()
    const badge = { source: 'viewer_function', invalidation_topic: 'inbox.changed', value: 2 }
    const cats = [{ items: [{ badge }, { badge: { ...badge } }] }] as unknown as NavCategory[]
    const unsubs = installBadgeSubscriptions(cats, subscribe, on, reload)
    expect(subscribe).not.toHaveBeenCalled()
    expect(on).toHaveBeenCalledOnce()
    expect(on.mock.calls[0][0]).toBe('inbox.changed')
    on.mock.calls[0][1]()
    expect(reload).toHaveBeenCalledOnce()
    for (const off of unsubs) off()
    expect(on.mock.results[0].value).toHaveBeenCalledOnce()
  })
  it('reloads again when an invalidation arrives during an outstanding navigation read', async () => {
    const badge = { source: 'viewer_function', invalidation_topic: 'inbox.changed', value: 2 }
    const response = { data: { success: true, categories: [{ items: [{ badge }] }], items: [] } }
    ports.api.get.mockResolvedValue(response)
    const nav = useSurfaces()
    await nav.loadNav()
    let finish!: (response: unknown) => void
    ports.api.get.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const inFlight = nav.reloadNav()
    const callback = ports.on.mock.calls[0][1] as () => void
    callback()
    finish(response)
    await inFlight
    await Promise.resolve()
    expect(ports.api.get).toHaveBeenCalledTimes(3)
  })
  it('keeps personal component metadata subscriptions alongside viewer invalidations', () => {
    const subscribe = vi.fn((_id: string, _cb: (event: any) => void) => vi.fn())
    const on = vi.fn(() => vi.fn())
    const badge = { component_id: 'personal', field: 'pending_count', field_type: 'integer', value: 1 }
    const cats = [{ items: [{ badge }] }] as unknown as NavCategory[]
    installBadgeSubscriptions(cats, subscribe, on, vi.fn())
    subscribe.mock.calls[0][1]({ meta: { pending_count: 3 } })
    expect(badge.value).toBe(3)
    expect(on).not.toHaveBeenCalled()
  })
})
