import { describe, expect, it } from 'vitest'
import {
  actionAriaLabel, actionContextFor, buildActionItems, groupActionItems, recoverMethod, runNowMethod,
} from './action-model'
import type { AutomationType } from './automation-types'

const FULL_TYPE: AutomationType = {
  id: 'sync',
  title: 'Data Sync',
  exportable: true,
  component: { create_ui: { tag_name: 'wc-sync-create' }, manage_ui: { tag_name: 'wc-sync-manage' } },
  actions: [
    { name: 'trigger' }, { name: 'pause' }, { name: 'resume' }, { name: 'status' },
    { name: 'rewind' }, { name: 'resync' }, { name: 'replay' }, { name: 'reconcile' },
  ],
}

describe('action model', () => {
  it('surfaces every declared method plus the shell operations, never a hardcoded subset', () => {
    const items = buildActionItems(actionContextFor(FULL_TYPE))
    const methods = items.map(i => i.method)
    // Run-now, all four recovery actions, refresh status, and the shell ops.
    expect(methods).toEqual([
      'trigger', 'status', 'rewind', 'resync', 'replay', 'reconcile',
      'reconfigure', 'share', 'export', 'delete',
    ])
    // pause/resume are the primary control, never a menu item.
    expect(methods).not.toContain('pause')
    expect(methods).not.toContain('resume')
  })

  it('keeps the run-now alias whichever name the type gives it', () => {
    const items = buildActionItems(actionContextFor({ id: 'b', actions: [{ name: 'execute' }, { name: 'pause' }] }))
    expect(items.find(i => i.group === 'run')?.method).toBe('execute')
  })

  it('renders an undeclared method generically rather than dropping it', () => {
    const items = buildActionItems(actionContextFor({ id: 'x', actions: [{ name: 'defrost' }] }))
    const item = items.find(i => i.method === 'defrost')
    expect(item).toBeTruthy()
    expect(item?.group).toBe('recovery')
    expect(item?.label).toBe('Defrost')
  })

  it('marks re-processing recovery actions with a warning', () => {
    const items = buildActionItems(actionContextFor(FULL_TYPE))
    expect(items.find(i => i.method === 'rewind')?.warn).toBe(true)
    expect(items.find(i => i.method === 'resync')?.warn).toBe(true)
    expect(items.find(i => i.method === 'reconcile')?.warn).toBeFalsy()
  })

  it('offers share for every automation, since an automation is a component', () => {
    const plain = buildActionItems(actionContextFor({ id: 'plain', title: 'Plain' }))
    const share = plain.find(i => i.method === 'share')
    expect(share?.kind).toBe('share')
    expect(share?.group).toBe('edit')
  })

  it('renders a declared reconfigure method only as the manage-view edit item', () => {
    const items = buildActionItems(actionContextFor({ ...FULL_TYPE, actions: [...(FULL_TYPE.actions || []), { name: 'reconfigure' }] }))
    const recon = items.filter(i => i.method === 'reconfigure')
    expect(recon).toHaveLength(1)
    expect(recon[0].kind).toBe('reconfigure')
    expect(recon[0].group).toBe('edit')
  })

  it('offers reconfigure only for a type that declares a manage view', () => {
    const plain = buildActionItems(actionContextFor({ id: 'plain', title: 'Plain' }))
    expect(plain.map(i => i.method)).toEqual(['share', 'delete'])
    const createOnly = buildActionItems(actionContextFor({ id: 'c', component: { create_ui: { tag_name: 'wc-c' } } }))
    expect(createOnly.map(i => i.method)).not.toContain('reconfigure')
  })

  it('groups items in canonical order and drops empty groups', () => {
    const groups = groupActionItems(buildActionItems(actionContextFor(FULL_TYPE)))
    expect(groups.map(g => g.group)).toEqual(['run', 'recovery', 'edit', 'delete'])
  })

  it('picks rewind for recovery, then resync, then nothing', () => {
    expect(recoverMethod(['resync', 'rewind'])).toBe('rewind')
    expect(recoverMethod(['resync'])).toBe('resync')
    expect(recoverMethod(['pause'])).toBe('')
  })

  it('names the run action and reconfigure item the way the row and drawer expect', () => {
    const run = buildActionItems(actionContextFor(FULL_TYPE)).find(i => i.group === 'run')!
    expect(actionAriaLabel(run, 'My Sync')).toBe('Run My Sync now')
    const recon = buildActionItems(actionContextFor(FULL_TYPE)).find(i => i.method === 'reconfigure')!
    expect(actionAriaLabel(recon, 'My Sync')).toBe('Edit My Sync')
  })

  it('accepts a declared execute or trigger action as the run-now control', () => {
    expect(runNowMethod(new Set(['execute', 'pause', 'resume']))).toBe('execute')
    expect(runNowMethod(new Set(['trigger', 'status']))).toBe('trigger')
    expect(runNowMethod(new Set(['pause']))).toBe('')
  })
})
