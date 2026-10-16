import { describe, it, expect, vi } from 'vitest'
import { on } from '@wippy-fe/proxy'
import { componentMetaEvent, subscribeComponentMeta } from './componentRealtime'

describe('componentMetaEvent typed delivery', () => {
  it('coerces raw TEXT meta to declared field types', () => {
    const event = componentMetaEvent(
      {
        event: 'component.meta.changed',
        component_id: 'a1',
        meta: { accepted_count: '9', enabled: 'false', payload: '{"x":1}' },
      },
      'a1',
      { accepted_count: 'integer', enabled: 'boolean', payload: 'object' },
    )
    expect(event).not.toBeNull()
    expect(event?.meta.accepted_count).toBe(9)
    expect(typeof event?.meta.accepted_count).toBe('number')
    expect(event?.meta.enabled).toBe(false)
    expect(event?.meta.payload).toEqual({ x: 1 })
  })

  it('leaves values untouched for keys absent from the schema', () => {
    const event = componentMetaEvent(
      { event: 'component.meta.changed', component_id: 'a1', meta: { status: 'idle', accepted_count: '3' } },
      'a1',
      { accepted_count: 'integer' },
    )
    expect(event?.meta.status).toBe('idle')
    expect(event?.meta.accepted_count).toBe(3)
  })

  it('passes raw meta through when no schema is supplied', () => {
    const event = componentMetaEvent(
      { event: 'component.meta.changed', component_id: 'a1', meta: { accepted_count: '9' } },
      'a1',
    )
    expect(event?.meta.accepted_count).toBe('9')
  })
})

describe('subscribeComponentMeta', () => {
  it('coerces the payload before invoking the callback', () => {
    vi.mocked(on).mockClear()
    const received: unknown[] = []
    const unsub = subscribeComponentMeta('a1', (e) => received.push(e.meta), { accepted_count: 'integer' })
    expect(typeof unsub).toBe('function')

    const calls = vi.mocked(on).mock.calls
    const handler = calls[calls.length - 1]?.[1] as ((msg: unknown) => void) | undefined
    handler?.({ event: 'component.meta.changed', component_id: 'a1', meta: { accepted_count: '5' } })
    expect(received).toEqual([{ accepted_count: 5 }])
  })
})
