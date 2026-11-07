// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { componentMetaEvent, subscribeComponentMeta, componentDeletionEvent } from './componentRealtime'
import { on } from '@wippy-fe/proxy'

vi.mock('@wippy-fe/proxy', () => ({ on: vi.fn(() => vi.fn()) }))

it('discovers component identities from direct and wrapped deliveries', () => {
  for (const message of [
    { event: 'component.meta.changed', component_id: 'new', meta: { count: '2' } },
    { topic: 'component.new', data: { event: 'component.meta.changed', meta: { count: '2' } } },
    { payload: { event: 'component.meta.changed', component_id: 'new', meta: { count: '2' } } },
  ]) {
    expect(componentMetaEvent(message, undefined, { count: 'integer' })).toMatchObject({
      component_id: 'new', meta: { count: 2 },
    })
  }
})

it('retains addressed filtering and rejects deliveries without a component identity', () => {
  expect(componentMetaEvent({ event: 'component.meta.changed', component_id: 'other' }, 'selected')).toBeNull()
  for (const message of [
    { event: 'component.meta.changed' },
    { topic: 'component.', data: { event: 'component.meta.changed' } },
    { topic: 'session.new', data: { event: 'component.meta.changed' } },
    { topic: 'component.new', data: { event: 'session.changed' } },
  ]) expect(componentMetaEvent(message)).toBeNull()
  expect(componentMetaEvent({ topic: 'component.selected', data: { event: 'component.meta.changed' } }, 'selected'))
    .toMatchObject({ component_id: 'selected' })
})

it('preserves addressed subscriptions and delivers the typed component identity', () => {
  const callback = vi.fn()
  const off = subscribeComponentMeta('selected', callback, { count: 'integer' })
  expect(on).toHaveBeenCalledWith('component.selected', expect.any(Function))
  const receive = vi.mocked(on).mock.calls.at(-1)?.[1] as (message: unknown) => void
  receive({ event: 'component.meta.changed', component_id: 'selected', meta: { count: '2' } })
  expect(callback).toHaveBeenCalledWith(expect.objectContaining({ component_id: 'selected', meta: { count: 2 } }))
  expect(off).toEqual(expect.any(Function))
})

it('delivers deleting and deleted with addressed identity filtering', () => {
  for (const event of ['component.deleting', 'component.deleted'] as const) {
    for (const message of [
      { event, component_id: 'selected' },
      { topic: 'component.selected', data: { event } },
      { payload: { event, component_id: 'selected' } },
    ]) expect(componentDeletionEvent(message, 'selected')).toEqual({event, component_id: 'selected'})
    expect(componentDeletionEvent({event, component_id: 'other'}, 'selected')).toBeNull()
    expect(componentMetaEvent({event, component_id: 'selected'}, 'selected')).toBeNull()
  }
  expect(componentDeletionEvent({event: 'component.deleted'})).toBeNull()
})

it('carries the accepted deletion job of a deleting event', () => {
  expect(componentDeletionEvent({event: 'component.deleting', component_id: 'selected', deletion_job_id: 'job'}, 'selected'))
    .toStrictEqual({event: 'component.deleting', component_id: 'selected', deletion_job_id: 'job'})
  expect(componentDeletionEvent({topic: 'component.selected', data: {event: 'component.deleted', deletion_job_id: 'job'}}, 'selected'))
    .toStrictEqual({event: 'component.deleted', component_id: 'selected'})
})
