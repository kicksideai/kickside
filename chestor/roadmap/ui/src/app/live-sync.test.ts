import { describe, expect, it } from 'vitest'
import { placeInitiative, updateInitiative } from './commands'
import { initiative, roadmap } from './fixtures'
import { forgetPendingRevision, projectionTopic, reconcilePendingMoves, rememberPendingMoves, type PendingMoves } from './live-sync'
import { PROJECTION_KIND } from './types'

function state(patch: Partial<ReturnType<typeof initiative>>) {
  return roadmap({ initiatives: [initiative('i1', patch)] })
}

describe('roadmap live synchronization', () => {
  it('subscribes to committed projection state, never the raw thread', () => {
    expect(projectionTopic('thread-1', PROJECTION_KIND)).toBe('kickside.thread.thread-1.projection.chestor.roadmap:state')
  })

  it('remembers only the fields a drag actually writes', () => {
    const pending: PendingMoves = new Map()
    rememberPendingMoves(pending, [updateInitiative('i1', { title: 'renamed' })], 1)
    expect(pending.size).toBe(0)

    rememberPendingMoves(pending, [placeInitiative('i1', { startPeriod: '2027-Q1', span: 2, layerId: 'cloud' })], 2)
    expect(pending.get('i1')?.placement).toEqual({ start_period: '2027-Q1', span: 2, layer_id: 'cloud' })
  })

  it('keeps the latest local drag over an older committed projection', () => {
    const pending: PendingMoves = new Map()
    rememberPendingMoves(pending, [placeInitiative('i1', { startPeriod: '2027-Q1' })], 1)

    const reconciled = reconcilePendingMoves(state({ start_period: '2026-Q3' }), pending, true)

    expect(reconciled.initiatives[0].start_period).toBe('2027-Q1')
    expect(pending.has('i1')).toBe(true)
  })

  it('acknowledges a drag only when the committed projection reaches it', () => {
    const pending: PendingMoves = new Map()
    rememberPendingMoves(pending, [placeInitiative('i1', { startPeriod: '2027-Q1', span: 2 })], 1)

    const partial = reconcilePendingMoves(state({ start_period: '2027-Q1', span: 1 }), pending, true)
    expect(partial.initiatives[0].span).toBe(2)
    expect(pending.size).toBe(1)

    const full = reconcilePendingMoves(state({ start_period: '2027-Q1', span: 2 }), pending, true)
    expect(full.initiatives[0].span).toBe(2)
    expect(pending.size).toBe(0)
  })

  it('never acknowledges from an optimistic apply response', () => {
    const pending: PendingMoves = new Map()
    rememberPendingMoves(pending, [placeInitiative('i1', { startPeriod: '2027-Q1' })], 1)
    reconcilePendingMoves(state({ start_period: '2027-Q1' }), pending, false)
    expect(pending.size).toBe(1)
  })

  it('does not let an older failed save erase a newer drag', () => {
    const pending: PendingMoves = new Map()
    rememberPendingMoves(pending, [placeInitiative('i1', { startPeriod: '2026-Q4' })], 1)
    rememberPendingMoves(pending, [placeInitiative('i1', { startPeriod: '2027-Q2' })], 2)

    forgetPendingRevision(pending, 1)

    expect(pending.get('i1')).toMatchObject({ revision: 2, placement: { start_period: '2027-Q2' } })
  })

  it('drops a pending move when the initiative was removed', () => {
    const pending: PendingMoves = new Map()
    rememberPendingMoves(pending, [placeInitiative('i1', { startPeriod: '2027-Q1' })], 1)

    const reconciled = reconcilePendingMoves(roadmap({ initiatives: [] }), pending, true)

    expect(reconciled.initiatives).toEqual([])
    expect(pending.size).toBe(0)
  })

  it('passes a snapshot through untouched when nothing is pending', () => {
    const snapshot = state({ start_period: '2026-Q3' })
    expect(reconcilePendingMoves(snapshot, new Map(), true)).toBe(snapshot)
  })
})
