import { describe, expect, it } from 'vitest'
import { dependency, initiative, milestone, roadmap } from './fixtures'
import { buildTimeline, columnDelta, laneAt, periodPosition, resolveDrag, timelineConnectors } from './timeline'
import { indexDependencies, traceSelection } from './trace'
import type { Rect } from './types'

describe('buildTimeline columns', () => {
  it('lays the window out from origin and column count', () => {
    const model = buildTimeline(roadmap())
    expect(model.columns.map(c => c.key)).toEqual(['2026-Q3', '2026-Q4', '2027-Q1', '2027-Q2', '2027-Q3'])
    expect(model.columns[0].label).toBe('Q3 ’26')
    expect(model.columns[0].current).toBe(true)
    expect(model.columns[1].current).toBe(false)
  })

  it('answers a lane per layer in the roadmap order', () => {
    expect(buildTimeline(roadmap()).lanes.map(l => l.layer.id)).toEqual(['platform', 'kickside', 'cloud'])
  })
})

describe('bar placement', () => {
  it('places a bar on the column of its start period with its stored span', () => {
    const state = roadmap({ initiatives: [initiative('a', { start_period: '2026-Q4', span: 2 })] })
    const bar = buildTimeline(state).lanes[0].rows[0][0]
    expect(bar.colStart).toBe(2)
    expect(bar.span).toBe(2)
    expect(bar.clippedStart).toBe(false)
    expect(bar.clippedEnd).toBe(false)
  })

  it('packs overlapping bars into sub-rows and keeps disjoint ones together', () => {
    const state = roadmap({
      initiatives: [
        initiative('a', { start_period: '2026-Q3', span: 2 }),
        initiative('b', { start_period: '2026-Q4', span: 2 }),
        initiative('c', { start_period: '2027-Q2', span: 1 }),
      ],
    })
    const rows = buildTimeline(state).lanes[0].rows
    expect(rows.length).toBe(2)
    expect(rows[0].map(b => b.initiative.id)).toEqual(['a', 'c'])
    expect(rows[1].map(b => b.initiative.id)).toEqual(['b'])
  })

  it('clips a bar that reaches past the window and flags both ends', () => {
    const state = roadmap({ initiatives: [initiative('a', { start_period: '2026-Q1', span: 12 })] })
    const bar = buildTimeline(state).lanes[0].rows[0][0]
    expect(bar.colStart).toBe(1)
    expect(bar.span).toBe(5)
    expect(bar.clippedStart).toBe(true)
    expect(bar.clippedEnd).toBe(true)
  })

  it('separates unscheduled work from work that is merely off-window', () => {
    const state = roadmap({
      initiatives: [
        initiative('idea', { start_period: '', status: 'idea' }),
        initiative('past', { start_period: '2024-Q1' }),
      ],
    })
    const lane = buildTimeline(state).lanes[0]
    expect(lane.unscheduled.map(i => i.id)).toEqual(['idea'])
    expect(lane.offscreen.map(i => i.id)).toEqual(['past'])
    expect(lane.rows).toEqual([])
  })

  it('hides dropped work unless it is asked for', () => {
    const state = roadmap({ initiatives: [initiative('a', { status: 'dropped' })] })
    expect(buildTimeline(state).lanes[0].rows).toEqual([])
    expect(buildTimeline(state, { includeDropped: true }).lanes[0].rows[0].length).toBe(1)
  })
})

describe('markers', () => {
  it('places today where the snapshot says now sits inside the current period', () => {
    // Q3 is column 1 of 5, so a third of the way in reads (0 + 1/3) / 5.
    expect(buildTimeline(roadmap({ current_position: 1 / 3 })).todayPosition).toBeCloseTo(1 / 15)
    expect(buildTimeline(roadmap({ current_period: '2026-Q4', current_position: 0 })).todayPosition).toBeCloseTo(0.2)
  })

  it('places today in the middle of the current period column', () => {
    expect(buildTimeline(roadmap()).todayPosition).toBeCloseTo(0.1)
  })

  it('falls back to the column centre when the snapshot carries no position', () => {
    const state = roadmap()
    delete state.current_position
    expect(buildTimeline(state).todayPosition).toBeCloseTo(0.1)
  })

  it('drops the today marker when the current period is outside the window', () => {
    expect(buildTimeline(roadmap({ current_period: '2030-Q1' })).todayPosition).toBeNull()
  })

  it('places milestones on their period and drops the ones off-window', () => {
    const state = roadmap({ milestones: [milestone('m1', 'GA', '2026-Q4'), milestone('m2', 'Later', '2031-Q1')] })
    const model = buildTimeline(state)
    expect(model.milestones.map(m => m.milestone.id)).toEqual(['m1'])
    expect(model.milestones[0].period).toBe('2026-Q4')
    expect(model.milestones[0].row).toBe(0)
    expect(model.milestones[0].left).toBeCloseTo(0.3)
    expect(model.milestoneRows).toBe(1)
  })

  it('stacks milestones that share a period into rows ordered by title', () => {
    const state = roadmap({
      milestones: [
        milestone('m1', 'Roadmap GA', '2026-Q4'),
        milestone('m2', 'KickSide 1.0', '2026-Q4'),
        milestone('m3', 'Cloud beta', '2027-Q1'),
      ],
    })
    const model = buildTimeline(state)
    const q4 = model.milestones.filter(m => m.period === '2026-Q4')
    expect(q4.map(m => m.milestone.title)).toEqual(['KickSide 1.0', 'Roadmap GA'])
    expect(q4.map(m => m.row)).toEqual([0, 1])
    // Sharing a period means sharing the column, so both keep the same left.
    expect(q4[0].left).toBeCloseTo(q4[1].left)
    expect(model.milestones.find(m => m.period === '2027-Q1')?.row).toBe(0)
    expect(model.milestoneRows).toBe(2)
  })

  it('keeps the rail one row deep while every period holds at most one', () => {
    const state = roadmap({ milestones: [milestone('m1', 'GA', '2026-Q4'), milestone('m2', 'Beta', '2027-Q1')] })
    const model = buildTimeline(state)
    expect(model.milestones.every(m => m.row === 0)).toBe(true)
    expect(model.milestoneRows).toBe(1)
  })

  it('reports one rail row when the roadmap states no milestone', () => {
    expect(buildTimeline(roadmap()).milestoneRows).toBe(1)
  })

  it('periodPosition refuses a key outside the window', () => {
    expect(periodPosition('2020-Q1', 2026 * 4 + 2, 5, 'quarter')).toBeNull()
  })
})

describe('connectors', () => {
  const rect = (id: string, x: number, y: number): Rect => ({ id, x, y, width: 100, height: 24 })

  it('draws nothing without a selection', () => {
    expect(timelineConnectors([dependency('d1', 'a', 'b')], new Map(), null)).toEqual([])
  })

  it('draws only the edges touching the selection', () => {
    const deps = [dependency('d1', 'a', 'b'), dependency('d2', 'c', 'd')]
    const rects = new Map([['a', rect('a', 0, 0)], ['b', rect('b', 200, 40)], ['c', rect('c', 0, 80)], ['d', rect('d', 200, 80)]])
    const drawn = timelineConnectors(deps, rects, 'b', traceSelection('b', indexDependencies(deps)).chain)
    expect(drawn.map(c => c.id)).toEqual(['d1'])
    expect(drawn[0].hot).toBe(true)
    expect(drawn[0].d.startsWith('M100,12 C')).toBe(true)
  })

  it('skips an edge whose end was never measured', () => {
    const rects = new Map([['a', rect('a', 0, 0)]])
    expect(timelineConnectors([dependency('d1', 'a', 'b')], rects, 'a')).toEqual([])
  })
})

describe('drag resolution', () => {
  const base = { startIndex: 2026 * 4 + 2, span: 2, columnWidth: 100, windowStart: 2026 * 4 + 2, windowEnd: 2026 * 4 + 6 }

  it('lands a move on whole periods', () => {
    expect(resolveDrag({ ...base, mode: 'move', dx: 140 }).startIndex).toBe(base.startIndex + 1)
    expect(resolveDrag({ ...base, mode: 'move', dx: 40 }).startIndex).toBe(base.startIndex)
    expect(columnDelta(250, 100)).toBe(3)
  })

  it('keeps a moved bar inside the window', () => {
    expect(resolveDrag({ ...base, mode: 'move', dx: -500 }).startIndex).toBe(base.windowStart)
    expect(resolveDrag({ ...base, mode: 'move', dx: 900 }).startIndex).toBe(base.windowEnd - 1)
  })

  it('resizes by whole periods and never below one', () => {
    expect(resolveDrag({ ...base, mode: 'resize', dx: 100 }).span).toBe(3)
    expect(resolveDrag({ ...base, mode: 'resize', dx: -500 }).span).toBe(1)
    expect(resolveDrag({ ...base, mode: 'resize', dx: 100 }).startIndex).toBe(base.startIndex)
  })

  it('stops a resize at the window edge', () => {
    expect(resolveDrag({ ...base, mode: 'resize', dx: 900 }).span).toBe(5)
  })

  it('is inert when the column width was never measured', () => {
    expect(columnDelta(300, 0)).toBe(0)
  })
})

describe('laneAt', () => {
  const bands = [
    { layerId: 'platform', top: 0, bottom: 50 },
    { layerId: 'kickside', top: 50, bottom: 100 },
  ]

  it('answers the band the pointer is inside', () => {
    expect(laneAt(bands, 10)).toBe('platform')
    expect(laneAt(bands, 60)).toBe('kickside')
  })

  it('answers the nearest band when the pointer leaves the lanes', () => {
    expect(laneAt(bands, -40)).toBe('platform')
    expect(laneAt(bands, 400)).toBe('kickside')
    expect(laneAt([], 10)).toBeNull()
  })
})
