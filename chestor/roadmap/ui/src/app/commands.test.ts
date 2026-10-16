import { describe, expect, it } from 'vitest'
import * as C from './commands'
import { EV } from './types'

describe('command builders', () => {
  it('mints an id for every add', () => {
    expect(typeof C.addLayer({ title: 'Platform' }).body.id).toBe('string')
    expect(typeof C.addOutcome({ title: 'Make it pay' }).body.id).toBe('string')
    expect(typeof C.addInitiative({ title: 'Mesh', layerId: 'l1' }).body.id).toBe('string')
    expect(typeof C.addDependency({ fromId: 'a', toId: 'b' }).body.id).toBe('string')
    expect(typeof C.addMilestone({ title: 'GA', period: '2026-Q4' }).body.id).toBe('string')
  })

  it('omits optional keys it was not given', () => {
    const cmd = C.addLayer({ title: 'Cloud' })
    expect(cmd.type).toBe(EV.LAYER_ADDED)
    expect(cmd.body).toEqual({ id: cmd.body.id, title: 'Cloud' })
  })

  it('carries every layer field it was given', () => {
    const cmd = C.addLayer({ id: 'l1', title: 'Cloud', description: 'hosted', color: '#2563eb', icon: 'tabler:cloud', sortOrder: 2 })
    expect(cmd.body).toEqual({ id: 'l1', title: 'Cloud', description: 'hosted', color: '#2563eb', icon: 'tabler:cloud', sort_order: 2 })
  })

  it('maps initiative options onto snake_case bodies', () => {
    const cmd = C.addInitiative({
      id: 'i1', title: 'Mesh runtime', layerId: 'l1', outcomeId: 'o1', status: 'planned',
      confidence: 'low', size: 'L', startPeriod: '2027-Q1', span: 2, progress: 0, owner: 'example-user', tags: ['infra'], sortOrder: 3,
    })
    expect(cmd.type).toBe(EV.INITIATIVE_ADDED)
    expect(cmd.body).toMatchObject({
      id: 'i1', title: 'Mesh runtime', layer_id: 'l1', outcome_id: 'o1', status: 'planned',
      confidence: 'low', size: 'L', start_period: '2027-Q1', span: 2, progress: 0, owner: 'example-user', tags: ['infra'], sort_order: 3,
    })
  })

  it('placeInitiative sends only the keys a drag actually changed', () => {
    expect(C.placeInitiative('i1', { startPeriod: '2026-Q4' })).toEqual({ type: EV.INITIATIVE_UPDATED, body: { id: 'i1', start_period: '2026-Q4' } })
    expect(C.placeInitiative('i1', { layerId: 'l2' }).body).toEqual({ id: 'i1', layer_id: 'l2' })
  })

  it('placeInitiative floors span at one whole period', () => {
    expect(C.placeInitiative('i1', { span: 0 }).body.span).toBe(1)
    expect(C.placeInitiative('i1', { span: 2.4 }).body.span).toBe(2)
  })

  it('updates wrap id plus patch', () => {
    expect(C.updateInitiative('i1', { title: 'X' })).toEqual({ type: EV.INITIATIVE_UPDATED, body: { id: 'i1', title: 'X' } })
    expect(C.updateDependency('d1', { kind: 'informs' }).type).toBe(EV.DEPENDENCY_UPDATED)
    expect(C.updateMilestone('m1', { period: '2027-Q1' }).type).toBe(EV.MILESTONE_UPDATED)
    expect(C.updateOutcome('o1', { title: 'Y' }).type).toBe(EV.OUTCOME_UPDATED)
    expect(C.updateLayer('l1', { color: '#000' }).type).toBe(EV.LAYER_UPDATED)
  })

  it('removals carry the id alone', () => {
    expect(C.removeInitiative('i1')).toEqual({ type: EV.INITIATIVE_REMOVED, body: { id: 'i1' } })
    expect(C.removeDependency('d1')).toEqual({ type: EV.DEPENDENCY_REMOVED, body: { id: 'd1' } })
    expect(C.removeMilestone('m1')).toEqual({ type: EV.MILESTONE_REMOVED, body: { id: 'm1' } })
    expect(C.removeLayer('l1')).toEqual({ type: EV.LAYER_REMOVED, body: { id: 'l1' } })
    expect(C.removeOutcome('o1')).toEqual({ type: EV.OUTCOME_REMOVED, body: { id: 'o1' } })
  })

  it('dependency add maps direction onto from/to', () => {
    const cmd = C.addDependency({ fromId: 'a', toId: 'b', kind: 'requires', note: 'hard' })
    expect(cmd.body).toMatchObject({ from_id: 'a', to_id: 'b', kind: 'requires', note: 'hard' })
  })

  it('settings and lens state carry their own envelopes', () => {
    expect(C.updateSettings({ columns: 7 })).toEqual({ type: EV.SETTINGS_UPDATED, body: { settings: { columns: 7 } } })
    expect(C.setLensState('strata', { critical: true })).toEqual({ type: EV.LENS_STATE_SET, body: { lens: 'strata', state: { critical: true } } })
  })

  it('uid returns unique strings', () => {
    expect(C.uid()).not.toBe(C.uid())
  })
})
