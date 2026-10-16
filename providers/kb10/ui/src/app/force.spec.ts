import { describe, it, expect } from 'vitest'
import { ForceSim, type SimNode, type SimLink } from './force'

function node(id: string, x: number, y: number): SimNode {
  return { id, x, y, vx: 0, vy: 0, fx: null, fy: null } as SimNode
}

describe('ForceSim', () => {
  it('separates two coincident nodes over ticks (repulsion/collision)', () => {
    const a = node('a', 100, 100)
    const b = node('b', 100, 100)
    const sim = new ForceSim([a, b], [], 400, 400, -200)
    for (let i = 0; i < 60; i++) sim.tick()
    const dist = Math.hypot(a.x - b.x, a.y - b.y)
    expect(dist).toBeGreaterThan(0)
  })

  it('cools down: tick eventually returns false as alpha decays', () => {
    const sim = new ForceSim([node('a', 0, 0)], [], 300, 300, -100)
    let cooling = true
    for (let i = 0; i < 2000 && cooling; i++) cooling = sim.tick()
    expect(cooling).toBe(false)
  })

  it('reheat raises alpha so the sim runs again', () => {
    const sim = new ForceSim([node('a', 0, 0)], [], 300, 300, -100)
    while (sim.tick()) { /* cool fully */ }
    sim.reheat(0.5)
    expect(sim.tick()).toBe(true)
  })

  it('honors a fixed node (fx/fy pins position)', () => {
    const a = node('a', 50, 50); a.fx = 50; a.fy = 50
    const b = node('b', 55, 55)
    const link: SimLink = { source: 'a', target: 'b' } as unknown as SimLink
    const sim = new ForceSim([a, b], [link], 400, 400, -150)
    for (let i = 0; i < 40; i++) sim.tick()
    expect(a.x).toBe(50)
    expect(a.y).toBe(50)
  })
})
