import { describe, expect, it } from 'vitest'
import { assemblyDetail, assemblySummary, isAssemblyRunning, relativeAge } from './assembly'
import type { AssemblyRun } from './assembly'

const run = (patch: Partial<AssemblyRun>): AssemblyRun => ({ status: 'completed', ...patch })

describe('map assembly reading', () => {
  it('treats every stage before the result as running', () => {
    expect(isAssemblyRunning(null)).toBe(false)
    expect(isAssemblyRunning(run({ status: 'queued' }))).toBe(true)
    expect(isAssemblyRunning(run({ status: 'dispatched' }))).toBe(true)
    expect(isAssemblyRunning(run({ status: 'running' }))).toBe(true)
    expect(isAssemblyRunning(run({ status: 'completed' }))).toBe(false)
    expect(isAssemblyRunning(run({ status: 'failed' }))).toBe(false)
  })

  it('names what the pass changed, separating derived relations from suggestions', () => {
    const summary = assemblySummary(
      run({ edges_added: 34, suggested_added: 9, finished_at: 1000 }), 1120,
    )
    expect(summary).toBe('+34 structural · +9 suggested · 2m ago')
  })

  it('reports retirement and says plainly when nothing changed', () => {
    expect(assemblySummary(run({ edges_added: 0, edges_removed: 2, finished_at: 100 }), 100))
      .toBe('−2 retired · just now')
    expect(assemblySummary(run({ finished_at: 100 }), 100)).toBe('No change · just now')
  })

  it('distinguishes a map that has never been assembled from one under way', () => {
    expect(assemblySummary(null, 0)).toBe('Not assembled yet')
    expect(assemblySummary(run({ status: 'never' }), 0)).toBe('Not assembled yet')
    expect(assemblySummary(run({ status: 'running' }), 0)).toBe('Assembling the map…')
    expect(assemblySummary(run({ status: 'failed' }), 0)).toBe('Last assembly failed')
  })

  it('ages in whole units and stays silent without a timestamp', () => {
    expect(relativeAge(undefined, 10)).toBe('')
    expect(relativeAge(100, 130)).toBe('just now')
    expect(relativeAge(100, 100 + 3 * 3600)).toBe('3h ago')
    expect(relativeAge(100, 100 + 2 * 86400)).toBe('2d ago')
  })

  it('surfaces a lost refine pass in the detail without hiding the derived result', () => {
    const detail = assemblyDetail(run({
      events_replayed: 110, candidates_judged: 24, model: 'class:nano',
      refine_error: 'no models found for class: nano',
    }))
    expect(detail).toContain('Replayed 110 records.')
    expect(detail).toContain('Judged 24 candidate pairs on class:nano.')
    expect(detail).toContain('Suggestions unavailable: no models found for class: nano')
  })

  it('reports a failed run by its own reason', () => {
    expect(assemblyDetail(run({ status: 'failed', error: 'journal thread not found' })))
      .toBe('journal thread not found')
  })
})
