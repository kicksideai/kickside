import { describe, expect, it } from 'vitest'
import {
  BRIDGE_S, GAP_SHARE, JOURNAL_LANE, LANE_MIN_WINDOW_S, MAX_ACTIVE_SEGMENTS,
  buildLanes, buildTimeScale, humanDuration, scaleExtent, scaleOffset, spanTarget,
} from './lanes'
import type { ActivityBucket, WorkSpan } from './types'

const NOW = 1_700_000_000
const HOUR = 3600
const DAY = 86400

const span = (id: string, extra: Partial<WorkSpan> = {}): WorkSpan => ({
  span_id: id,
  agent_id: 'ana',
  cursor_id: 'jc_ana',
  origin: 'auto',
  state: 'sealed',
  started_at: NOW - 3600,
  last_activity_at: NOW - 3000,
  ended_at: NOW - 3000,
  started_seq: 1,
  last_seq: 8,
  fact_count: 5,
  duration_s: 600,
  ...extra,
})

const bucket = (at: number, events: number, agent_id?: string): ActivityBucket => ({
  bucket_at: at, agent_id, events, first_seq: 1, last_seq: 9, last_ts: at + 30,
})

describe('activity-shaped time scale', () => {
  it('folds an idle stretch to a labelled sliver instead of spending the chart on it', () => {
    // Two bursts three days apart. Linear time would give the idle stretch
    // ~96% of the chart; the scale folds it to one fixed sliver.
    const scale = buildTimeScale([], [
      bucket(NOW - 3 * DAY - HOUR, 40, 'ana'),
      bucket(NOW - 3 * DAY, 25, 'ana'),
      bucket(NOW - HOUR, 30, 'ana'),
    ], HOUR, NOW)
    expect(scale.gaps).toHaveLength(1)
    const [gap] = scale.gaps
    expect(gap.width).toBe(GAP_SHARE)
    expect(gap.seconds).toBeGreaterThan(2 * DAY)
    expect(gap.label).toMatch(/d idle$/)
    // The two bursts share the rest of the chart, both at reading size.
    const active = scale.segments.filter(segment => !segment.idle)
    expect(active).toHaveLength(2)
    for (const segment of active) expect(segment.x1 - segment.x0).toBeGreaterThan(0.2)
  })

  it('keeps time linear and monotonic inside and across segments', () => {
    const scale = buildTimeScale([], [
      bucket(NOW - 3 * DAY, 40, 'ana'),
      bucket(NOW - HOUR, 30, 'ana'),
    ], HOUR, NOW)
    let previous = -1
    for (let step = 0; step <= 40; step++) {
      const at = NOW - 3 * DAY + step * ((3 * DAY) / 40)
      const offset = scaleOffset(at, scale)
      expect(offset).toBeGreaterThanOrEqual(previous)
      previous = offset
    }
    expect(scaleOffset(scale.from - DAY, scale)).toBe(0)
    expect(scaleOffset(NOW + DAY, scale)).toBe(1)
  })

  it('ends a quiet journal in an explicit idle break with now on the right edge', () => {
    const scale = buildTimeScale([], [bucket(NOW - 4 * DAY, 40, 'ana')], HOUR, NOW)
    const last = scale.segments[scale.segments.length - 1]
    expect(last.idle).toBe(false)
    expect(last.to).toBe(NOW)
    expect(scale.gaps.some(gap => gap.seconds > 3 * DAY)).toBe(true)
    expect(scale.to).toBe(NOW)
  })

  it('never splinters a spiky history into more stretches than a reader can follow', () => {
    // 30 one-hour bursts, each separated by 2h of quiet — more idle stretches
    // than the chart can label, so the bridge widens until they merge.
    const spiky = Array.from({ length: 30 }, (_, index) => bucket(NOW - index * 3 * HOUR, 10, 'ana'))
    const scale = buildTimeScale([], spiky, HOUR, NOW)
    expect(scale.segments.filter(segment => !segment.idle).length).toBeLessThanOrEqual(MAX_ACTIVE_SEGMENTS)
  })

  it('bridges quiet shorter than the bridge into the burst around it', () => {
    const scale = buildTimeScale([], [
      bucket(NOW - 2 * HOUR, 10, 'ana'),
      bucket(NOW - 2 * HOUR + BRIDGE_S, 10, 'ana'),
    ], HOUR, NOW)
    expect(scale.gaps).toHaveLength(0)
  })

  it('dates the ruler when the chart crosses days and never overlaps two marks', () => {
    const scale = buildTimeScale([], [
      bucket(NOW - 5 * DAY, 40, 'ana'),
      bucket(NOW - HOUR, 30, 'ana'),
    ], HOUR, NOW)
    expect(scale.marks.length).toBeGreaterThanOrEqual(2)
    for (const mark of scale.marks) expect(mark.label).toMatch(/[A-Za-z]{3}/)
    // Dated labels are wide blocks; a bare-clock clearance would overlap them.
    for (let index = 1; index < scale.marks.length; index++) {
      expect(scale.marks[index].offset - scale.marks[index - 1].offset).toBeGreaterThanOrEqual(0.105)
    }
  })

  it('always ends the ruler with a mark at the right edge naming now', () => {
    // A burst ending just before now would otherwise crowd the final mark out.
    const scale = buildTimeScale([], [bucket(NOW - HOUR, 12, 'ana')], HOUR, NOW)
    const last = scale.marks[scale.marks.length - 1]
    expect(last.offset).toBe(1)
    expect(last.at).toBe(scale.to)
  })

  it('never lets a bucket still in progress stretch the chart past now', () => {
    // At a quarter past, the current hour bucket nominally ends in the future.
    const scale = buildTimeScale([], [bucket(NOW - 900, 6, 'ana')], HOUR, NOW)
    expect(scale.to).toBe(NOW)
    expect(scaleOffset(NOW, scale)).toBe(1)
  })

  it('still draws a readable chart for a journal minutes old', () => {
    const scale = buildTimeScale([], [], HOUR, NOW)
    expect(scale.to).toBe(NOW)
    expect(scale.to - scale.from).toBeGreaterThanOrEqual(60)
    expect(Number.isFinite(scaleOffset(NOW - LANE_MIN_WINDOW_S, scale))).toBe(true)
  })

  it('names idle durations at human size', () => {
    expect(humanDuration(240)).toBe('4m')
    expect(humanDuration(6 * HOUR)).toBe('6h')
    expect(humanDuration(2.5 * DAY)).toBe('2.5d')
  })
})

describe('agent lanes', () => {
  it('gives every agent identity one lane, newest writer first', () => {
    const lanes = buildLanes([
      span('sp_ana', { agent_id: 'ana', cursor_id: 'jc_ana', last_activity_at: NOW - 3000, ended_at: NOW - 3000 }),
      span('sp_ana_2', { agent_id: 'ana', cursor_id: 'jc_ana', last_activity_at: NOW - 60, ended_at: NOW - 60 }),
      span('sp_bo', { agent_id: 'bo', cursor_id: 'jc_bo', last_activity_at: NOW - 600, ended_at: NOW - 600 }),
    ], [], NOW)
    expect(lanes.map(lane => lane.agentId)).toEqual(['ana', 'bo'])
    expect(lanes[0].spans.map(item => item.spanId)).toEqual(['sp_ana', 'sp_ana_2'])
    expect(lanes[0].lastActivityAt).toBe(NOW - 60)
  })

  it('carries unattributed activity in the journal lane instead of dropping it', () => {
    const lanes = buildLanes([span('sp_1')], [
      bucket(NOW - 3600, 12),
      bucket(NOW - 3600, 5, 'ana'),
    ], NOW)
    expect(lanes).toHaveLength(2)
    const journal = lanes.find(lane => lane.agentId === JOURNAL_LANE)!
    expect(journal.unattributed).toBe(true)
    expect(journal.ticks).toEqual([{ at: NOW - 3600, events: 12 }])
    const ana = lanes.find(lane => lane.agentId === 'ana')!
    expect(ana.ticks).toEqual([{ at: NOW - 3600, events: 5 }])
    expect(ana.events).toBe(5)
  })

  it('keeps the journal lane last however fresh its activity is', () => {
    const lanes = buildLanes([span('sp_1', { last_activity_at: NOW - 9000, ended_at: NOW - 9000 })], [
      bucket(NOW - 60, 12),
    ], NOW)
    expect(lanes[lanes.length - 1].agentId).toBe(JOURNAL_LANE)
  })

  it('draws an open span up to the present while still reporting it open', () => {
    const [lane] = buildLanes([
      span('sp_open', { state: 'open', ended_at: undefined, last_activity_at: NOW - 120 }),
    ], [], NOW)
    expect(lane.spans[0].open).toBe(true)
    expect(lane.spans[0].endedAt).toBe(NOW)
    expect(lane.spans[0].outcome).toBe('open')
  })

  it('names a sealed span by the reason it closed', () => {
    const [lane] = buildLanes([span('sp_1', { closed_reason: 'idle' })], [], NOW)
    expect(lane.spans[0].outcome).toBe('idle')
    expect(lane.spans[0].open).toBe(false)
  })

  it('names a lane by its cursor when the protocol never learned an agent id', () => {
    const [lane] = buildLanes([span('sp_1', { agent_id: '', cursor_id: 'jc_bare' })], [], NOW)
    expect(lane.agentId).toBe('cursor:jc_bare')
    expect(lane.label).toBe('Jc bare')
  })
})

describe('pressing a lane bar', () => {
  const spans = [
    span('sp_stated', { task_id: 'migrate-ledger' }),
    span('sp_declared', { task_id: '', working_on: { kind: 'task', text: 'audit-slots' } }),
    span('sp_untasked', { task_id: '', agent_id: 'bo', cursor_id: 'jc_bo', working_on: { kind: 'note', text: 'reading' } }),
    span('sp_nameless', { task_id: '', agent_id: '', cursor_id: '' }),
  ]

  it('names the task a span was worked on, stated or declared', () => {
    expect(spanTarget(spans, 'sp_stated')).toEqual({ taskId: 'migrate-ledger', agentId: 'ana' })
    expect(spanTarget(spans, 'sp_declared')).toEqual({ taskId: 'audit-slots', agentId: 'ana' })
  })

  it('falls back to the identity when the span never named a task', () => {
    expect(spanTarget(spans, 'sp_untasked')).toEqual({ taskId: '', agentId: 'bo' })
  })

  it('answers nothing for a bar that leads nowhere rather than inventing a target', () => {
    expect(spanTarget(spans, 'sp_nameless')).toEqual({ taskId: '', agentId: '' })
    expect(spanTarget(spans, 'sp_missing')).toBeNull()
  })
})

describe('lane geometry', () => {
  it('gives a span its true share of the burst it lives in', () => {
    const scale = buildTimeScale([span('sp_1', { started_at: NOW - 3600, ended_at: NOW, state: 'open' })], [], HOUR, NOW)
    const [lane] = buildLanes([span('sp_1', { started_at: NOW - 3600, ended_at: NOW, state: 'open', last_activity_at: NOW })], [], NOW)
    const extent = scaleExtent(lane.spans[0], scale)
    expect(extent.start).toBe(0)
    expect(extent.start + extent.width).toBeCloseTo(1, 6)
  })

  it('answers a zero width for a blink of a span and leaves visibility to the bar itself', () => {
    const blink = span('sp_blink', { started_at: NOW - 1800, ended_at: NOW - 1800, last_activity_at: NOW - 1800 })
    const scale = buildTimeScale([span('sp_1', { started_at: NOW - 3600, ended_at: NOW, state: 'open' })], [], HOUR, NOW)
    const [lane] = buildLanes([blink], [], NOW)
    const extent = scaleExtent(lane.spans[0], scale)
    expect(extent.width).toBe(0)
    expect(extent.start).toBeGreaterThan(0)
    expect(extent.start).toBeLessThan(1)
  })
})
