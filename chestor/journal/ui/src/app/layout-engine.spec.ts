import { describe, expect, it } from 'vitest'
import { LayoutEngine } from './layout-engine'
import { solveLayout } from './layout-protocol'
import type { LayoutRequest } from './layout-protocol'
import type { GraphNode } from './types'

const node = (id: string): GraphNode => ({ id, kind: 'evidence', label: id, child_count: 0, revision: 1, created_at: 1, updated_at: 1 })

/**
 * A worker double the engine drives exactly like the real one: requests are
 * answered asynchronously with the same projection, so the busy/pending
 * coalescing paths actually run. `broken` makes it raise instead of answer.
 */
class WorkerDouble {
  requests: LayoutRequest[] = []
  private listeners = new Map<string, Array<(event: unknown) => void>>()
  constructor(private readonly broken = false) {}
  addEventListener(type: string, handler: (event: unknown) => void) {
    const held = this.listeners.get(type) || []
    held.push(handler)
    this.listeners.set(type, held)
  }
  removeEventListener(type: string, handler: (event: unknown) => void) {
    this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== handler))
  }
  postMessage(request: LayoutRequest) {
    this.requests.push(request)
    setTimeout(() => {
      if (this.broken) {
        for (const handler of this.listeners.get('error') || []) handler({})
        return
      }
      const data = solveLayout(request)
      for (const handler of this.listeners.get('message') || []) handler({ data })
    }, 0)
  }
  terminate() {}
}

const input = (overrides: Record<string, unknown> = {}) => ({
  nodes: [node('a'), node('b'), node('c')],
  edges: [],
  width: 800,
  height: 600,
  emphasis: new Set<string>(),
  held: new Map<string, { px: number; py: number }>(),
  ...overrides,
})

describe('layout engine', () => {
  it('carries a superseded re-layout request into the solve that reaches the screen', async () => {
    const double = new WorkerDouble()
    const engine = new LayoutEngine(() => double as unknown as Worker)
    const first = engine.solve(input())
    // The re-layout arrives while the first solve runs, then a routine refresh
    // replaces it in the queue before anything finishes.
    const relayout = engine.solve(input({ fresh: true, unpin: true }))
    const routine = engine.solve(input())
    const [a, b, c] = await Promise.all([first, relayout, routine])
    expect(a).toBeNull()
    expect(b).toBeNull()
    expect(c).not.toBeNull()
    const delivered = double.requests[double.requests.length - 1]
    expect(delivered.unpin).toBe(true)
    expect(delivered.previous).toEqual([])
    engine.dispose()
  })

  it('delivers the re-layout once and lets later refreshes keep their memory', async () => {
    const double = new WorkerDouble()
    const engine = new LayoutEngine(() => double as unknown as Worker)
    await engine.solve(input({ fresh: true, unpin: true }))
    await engine.solve(input())
    const later = double.requests[double.requests.length - 1]
    expect(later.unpin).toBeFalsy()
    expect(later.previous.length).toBeGreaterThan(0)
    engine.dispose()
  })

  it('answers from the reading thread when the worker breaks instead of answering nothing', async () => {
    const engine = new LayoutEngine(() => new WorkerDouble(true) as unknown as Worker)
    const placement = await engine.solve(input())
    expect(placement).not.toBeNull()
    expect(placement!.ids.sort()).toEqual(['a', 'b', 'c'])
    engine.dispose()
  })
})
