import { describe, it, expect, vi } from 'vitest'
// The realtime seam pulls in the host proxy; stub it so importing the composable
// stays a pure unit under test (subscriptions are injected below).
vi.mock('@wippy-fe/proxy', () => ({ on: () => () => {} }))

import type { ComponentMetaEvent } from '@widgets/app/componentRealtime'
import {
  badgeVisible,
  badgeStyle,
  applyBadgeMeta,
  rollupBadge,
  installBadgeSubscriptions,
  type NavBadge,
  type NavItem,
  type NavCategory,
} from './useSurfaces'

function badge(over: Partial<NavBadge> = {}): NavBadge {
  return {
    value: 3,
    component_id: 'c1',
    field: 'pending_count',
    field_type: 'integer',
    style: 'count',
    hide_zero: true,
    tone: 'accent',
    base_tone: 'accent',
    ...over,
  }
}

function item(id: string, b?: NavBadge): NavItem {
  return { id, label: id, icon: 'i', path: '/' + id, route_name: id, category: 'work', order: 0, badge: b }
}

describe('badgeVisible', () => {
  it('count: shows a positive value, hides 0 under hide_zero', () => {
    expect(badgeVisible(badge({ value: 3 }))).toBe(true)
    expect(badgeVisible(badge({ value: 0 }))).toBe(false)
    expect(badgeVisible(badge({ value: 0, hide_zero: false }))).toBe(true)
  })
  it('count: no numeric value renders nothing (field absent)', () => {
    expect(badgeVisible(badge({ value: undefined }))).toBe(false)
  })
  it('dot: shows on presence, hides an explicit 0 under hide_zero', () => {
    expect(badgeVisible(badge({ style: 'dot', value: undefined }))).toBe(true)
    expect(badgeVisible(badge({ style: 'dot', value: 0 }))).toBe(false)
  })
})

describe('badgeStyle', () => {
  it('maps a tone to token vars, falling back to neutral', () => {
    expect(badgeStyle(badge({ tone: 'accent' })).background).toBe('var(--kx-wash-primary)')
    expect(badgeStyle(badge({ tone: 'danger' })).background).toBe('var(--kx-wash-danger)')
    expect(badgeStyle(badge({ tone: 'bogus' })).background).toBe('var(--kx-surface-2)')
  })
})

describe('applyBadgeMeta', () => {
  it('updates the bound field value from a coerced meta payload', () => {
    const b = badge({ value: 1 })
    applyBadgeMeta(b, { pending_count: 5 })
    expect(b.value).toBe(5)
  })
  it('re-evaluates tone from a truthy boolean tone_field (never from the count)', () => {
    const b = badge({ tone: 'accent', base_tone: 'accent', active_tone: 'danger', tone_field: 'has_urgent' })
    applyBadgeMeta(b, { has_urgent: true })
    expect(b.tone).toBe('danger')
    applyBadgeMeta(b, { has_urgent: false })
    expect(b.tone).toBe('accent')
  })
})

describe('rollupBadge', () => {
  it('sums the count children', () => {
    const r = rollupBadge([item('a', badge({ value: 2 })), item('b', badge({ value: 3, component_id: 'c2' }))])
    expect(r).not.toBeNull()
    expect(r!.style).toBe('count')
    expect(r!.value).toBe(5)
  })
  it('hides when the children sum to 0 (hide_zero on the sum)', () => {
    const r = rollupBadge([item('a', badge({ value: 0 })), item('b', badge({ value: 0, component_id: 'c2' }))])
    expect(r).not.toBeNull()
    expect(badgeVisible(r!)).toBe(false)
  })
  it('bubbles an active child tone up to the category', () => {
    const active = badge({ value: 1, tone: 'danger', base_tone: 'accent', active_tone: 'danger', tone_field: 'x' })
    const calm = badge({ value: 2, component_id: 'c2' })
    const r = rollupBadge([item('a', active), item('b', calm)])
    expect(r!.tone).toBe('danger')
  })
  it('is a dot when only dot children are present', () => {
    const r = rollupBadge([item('a', badge({ style: 'dot', value: undefined }))])
    expect(r!.style).toBe('dot')
  })
  it('is null when no child carries a badge (no affordance)', () => {
    expect(rollupBadge([item('a'), item('b')])).toBeNull()
  })
})

describe('installBadgeSubscriptions', () => {
  function fakeSubscribe() {
    const calls: Array<{ id: string; cb: (e: ComponentMetaEvent) => void; fieldTypes?: Record<string, string> }> = []
    const fn = (id: string, cb: (e: ComponentMetaEvent) => void, fieldTypes?: Record<string, string>) => {
      calls.push({ id, cb, fieldTypes })
      return () => {}
    }
    return { fn, calls }
  }

  it('dedupes subscriptions by component_id and updates every sharing badge', () => {
    const a = badge({ value: 1, component_id: 'shared', field: 'pending_count' })
    const b = badge({ value: 2, component_id: 'shared', field: 'item_count' })
    const c = badge({ value: 9, component_id: 'other', field: 'pending_count' })
    const cats: NavCategory[] = [
      { key: 'work', label: 'Work', order: 0, collapsed: false, items: [item('a', a), item('b', b)] },
      { key: 'ops', label: 'Ops', order: 1, collapsed: false, items: [item('c', c)] },
    ]
    const { fn, calls } = fakeSubscribe()
    installBadgeSubscriptions(cats, fn)

    // One handler per unique component_id, not per badge.
    expect(calls.length).toBe(2)
    const shared = calls.find(x => x.id === 'shared')!
    expect(shared.fieldTypes).toEqual({ pending_count: 'integer', item_count: 'integer' })

    // A meta change on the shared component updates both badges bound to it.
    shared.cb({ event: 'component.meta.changed', component_id: 'shared', meta: { pending_count: 7, item_count: 4 }, deleted: [] })
    expect(a.value).toBe(7)
    expect(b.value).toBe(4)
    expect(c.value).toBe(9)
  })

  it('skips items without a badge (no subscription, no affordance)', () => {
    const cats: NavCategory[] = [
      { key: 'work', label: 'Work', order: 0, collapsed: false, items: [item('a'), item('b')] },
    ]
    const { fn, calls } = fakeSubscribe()
    const unsubs = installBadgeSubscriptions(cats, fn)
    expect(calls.length).toBe(0)
    expect(unsubs.length).toBe(0)
  })
})
