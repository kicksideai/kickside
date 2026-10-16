import { describe, expect, it } from 'vitest'
import { healPlan } from './heal'

const e = (id: string, s: string, t: string, type = 'leads-to') => ({ id, type, source_id: s, target_id: t })

describe('delete heals wires', () => {
  it('bridges through a removed middle node with the outgoing type', () => {
    const bridges = healPlan(['b'], [e('1', 'a', 'b'), e('2', 'b', 'c', 'depends-on')])
    expect(bridges).toEqual([{ source_id: 'a', target_id: 'c', type: 'depends-on' }])
  })

  it('heals across a whole removed chain', () => {
    const bridges = healPlan(['b', 'c'], [e('1', 'a', 'b'), e('2', 'b', 'c'), e('3', 'c', 'd')])
    expect(bridges).toEqual([{ source_id: 'a', target_id: 'd', type: 'leads-to' }])
  })

  it('fans out to every reachable exit', () => {
    const bridges = healPlan(['b'], [e('1', 'a', 'b'), e('2', 'b', 'c'), e('3', 'b', 'd')])
    expect(bridges.map(b => b.target_id).sort()).toEqual(['c', 'd'])
  })

  it('never duplicates an existing edge or bridges to itself', () => {
    const withExisting = healPlan(['b'], [e('1', 'a', 'b'), e('2', 'b', 'c'), e('3', 'a', 'c')])
    expect(withExisting).toEqual([])
    const loop = healPlan(['b'], [e('1', 'a', 'b'), e('2', 'b', 'a')])
    expect(loop).toEqual([])
  })

  it('bridges nothing for leaf or source removals', () => {
    expect(healPlan(['c'], [e('1', 'a', 'b'), e('2', 'b', 'c')])).toEqual([])
    expect(healPlan(['a'], [e('1', 'a', 'b'), e('2', 'b', 'c')])).toEqual([])
  })

  it('handles a removed diamond without duplicate bridges', () => {
    const edges = [e('1', 'a', 'x'), e('2', 'x', 'y'), e('3', 'x', 'z'), e('4', 'y', 'd'), e('5', 'z', 'd')]
    const bridges = healPlan(['x', 'y', 'z'], edges)
    expect(bridges).toEqual([{ source_id: 'a', target_id: 'd', type: 'leads-to' }])
  })
})
