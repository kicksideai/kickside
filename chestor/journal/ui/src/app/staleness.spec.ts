import { describe, expect, it } from 'vitest'
import { ageOf, dormantSubtrees, DORMANT_AFTER_S, isEnded, splitByActivity } from './staleness'
import type { TaskLike } from './staleness'

const NOW = 1_700_000_000

const task = (id: string, updated_at: number, extra: Partial<TaskLike> = {}): TaskLike => ({
  id, title: id, status: 'in_progress', updated_at, ...extra,
})

describe('task age', () => {
  it('separates the current hour from the working week and from abandonment', () => {
    expect(ageOf(NOW - 600, NOW).tier).toBe('live')
    expect(ageOf(NOW - 7200, NOW).tier).toBe('recent')
    expect(ageOf(NOW - DORMANT_AFTER_S, NOW).tier).toBe('dormant')
    expect(ageOf(NOW - 4 * 86400, NOW).label).toBe('4d ago')
    expect(ageOf(NOW + 60, NOW).seconds).toBe(0)
  })
})

describe('ended work', () => {
  it('reads a folded task as ended as finally as a completed one', () => {
    expect(isEnded('done')).toBe(true)
    expect(isEnded('folded')).toBe(true)
    expect(isEnded('superseded')).toBe(true)
    expect(isEnded('in_progress')).toBe(false)
    expect(isEnded('blocked')).toBe(false)
  })
})

describe('dormancy', () => {
  it('reads a program by its newest work, so a live child keeps an old parent awake', () => {
    const tasks = [
      task('program', NOW - 20 * 86400),
      task('step', NOW - 1800, { parent_task_id: 'program' }),
    ]
    expect(dormantSubtrees(tasks, NOW)).toEqual([])
    const { worked, dormant } = splitByActivity(tasks, NOW)
    expect(worked.map(item => item.id)).toEqual(['program', 'step'])
    expect(dormant).toEqual([])
  })

  it('proposes the whole program once instead of every task inside it', () => {
    const tasks = [
      task('program', NOW - 20 * 86400),
      task('step', NOW - 19 * 86400, { parent_task_id: 'program' }),
      task('detail', NOW - 18 * 86400, { parent_task_id: 'step' }),
    ]
    const subtrees = dormantSubtrees(tasks, NOW)
    expect(subtrees).toHaveLength(1)
    expect(subtrees[0].root.id).toBe('program')
    expect(subtrees[0].members.map(item => item.id)).toEqual(['step', 'detail'])
    expect(subtrees[0].lastActivityAt).toBe(NOW - 18 * 86400)
    expect(subtrees[0].age.tier).toBe('dormant')
  })

  it('counts an ended task as settled however it ended, and blocked work as its own state', () => {
    const tasks = [
      task('program', NOW - 10 * 86400),
      task('shipped', NOW - 10 * 86400, { parent_task_id: 'program', status: 'done' }),
      task('folded', NOW - 10 * 86400, { parent_task_id: 'program', status: 'folded' }),
      task('waiting', NOW - 10 * 86400, { parent_task_id: 'program', status: 'blocked' }),
    ]
    const [subtree] = dormantSubtrees(tasks, NOW)
    expect(subtree.doneCount).toBe(2)
    expect(subtree.blockedCount).toBe(1)
    expect(subtree.openCount).toBe(1)
  })

  it('offers the most dormant program first', () => {
    const tasks = [
      task('newer', NOW - 5 * 86400),
      task('oldest', NOW - 40 * 86400),
      task('middle', NOW - 12 * 86400),
    ]
    expect(dormantSubtrees(tasks, NOW).map(item => item.root.id)).toEqual(['oldest', 'middle', 'newer'])
  })

  it('walks a parent chain that points back at itself without hanging', () => {
    const tasks = [
      task('left', NOW - 10 * 86400, { parent_task_id: 'right' }),
      task('right', NOW - 10 * 86400, { parent_task_id: 'left' }),
      task('own-parent', NOW - 10 * 86400, { parent_task_id: 'own-parent' }),
    ]
    const subtrees = dormantSubtrees(tasks, NOW)
    expect(subtrees.map(item => item.root.id)).toEqual(['own-parent'])
    expect(splitByActivity(tasks, NOW).dormant).toHaveLength(3)
  })

  it('carries the newest fact all the way up a deep program', () => {
    const depth = 40
    const tasks = Array.from({ length: depth }, (_, index) => task(
      `t${index}`,
      index === depth - 1 ? NOW - 600 : NOW - 30 * 86400,
      index ? { parent_task_id: `t${index - 1}` } : {},
    ))
    expect(dormantSubtrees(tasks, NOW)).toEqual([])
    expect(splitByActivity(tasks, NOW).dormant).toEqual([])
  })

  it('reads a task list in one pass, whatever the depth of the work', () => {
    // The deepest task sits under every ancestor. A reading that descends from
    // each task in turn re-reads it once per ancestor and costs the square of
    // the program; one post-order pass reads it once.
    const depth = 40
    const tasks = Array.from({ length: depth }, (_, index) => task(
      `t${index}`, NOW - 600, index ? { parent_task_id: `t${index - 1}` } : {},
    ))
    let reads = 0
    Object.defineProperty(tasks[depth - 1], 'updated_at', {
      get() { reads++; return NOW - 600 },
      configurable: true,
      enumerable: true,
    })
    splitByActivity(tasks, NOW)
    expect(reads).toBe(1)
  })

  it('keeps the shape it read until the projection replaces the list', () => {
    // A clock tick re-runs every reading over the same list. Nothing about the
    // shape of the work changed, so nothing about it is walked again.
    const tasks = Array.from({ length: 12 }, (_, index) => task(
      `t${index}`, NOW - 600, index ? { parent_task_id: `t${index - 1}` } : {},
    ))
    let reads = 0
    Object.defineProperty(tasks[11], 'updated_at', {
      get() { reads++; return NOW - 600 },
      configurable: true,
      enumerable: true,
    })
    splitByActivity(tasks, NOW)
    const afterFirstReading = reads
    splitByActivity(tasks, NOW + 30)
    dormantSubtrees(tasks, NOW + 30)
    expect(reads).toBe(afterFirstReading)

    // A re-projected list is new data, and every reading follows it.
    const reprojected = Array.from({ length: 12 }, (_, index) => task(
      `t${index}`, index === 11 ? NOW : NOW - 40 * 86400, index ? { parent_task_id: `t${index - 1}` } : {},
    ))
    expect(splitByActivity(reprojected, NOW).dormant).toEqual([])
    expect(dormantSubtrees(reprojected, NOW)).toEqual([])
  })

  it('splits the list without losing a task', () => {
    const tasks = [
      task('live', NOW - 60),
      task('paused', NOW - 2 * 86400),
      task('gone', NOW - 30 * 86400),
    ]
    const { worked, dormant } = splitByActivity(tasks, NOW)
    expect(worked.map(item => item.id)).toEqual(['live', 'paused'])
    expect(dormant.map(item => item.id)).toEqual(['gone'])
    expect(worked.length + dormant.length).toBe(tasks.length)
  })
})
