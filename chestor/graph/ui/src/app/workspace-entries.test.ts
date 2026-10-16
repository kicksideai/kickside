import { describe, expect, it } from 'vitest'
import { canDrillInto, entryLabel, entryUrl, listEntriesUrl } from './workspace-entries'

describe('workspace entry helpers', () => {
  it('builds root and child list URLs', () => {
    expect(listEntriesUrl(null)).toBe('/api/v1/workspace/entries')
    expect(listEntriesUrl('folder one')).toBe('/api/v1/workspace/entries?parent_id=folder%20one')
  })

  it('builds encoded entry URLs', () => {
    expect(entryUrl('a/b')).toBe('/api/v1/workspace/entries/a%2Fb')
  })

  it('labels entries by display name before id', () => {
    expect(entryLabel({ id: 'cmp-1', name: 'Spec' })).toBe('Spec')
    expect(entryLabel({ id: 'cmp-1' })).toBe('cmp-1')
    expect(entryLabel(null, 'missing')).toBe('missing')
  })

  it('drills into containers or entries with children', () => {
    expect(canDrillInto({ id: 'folder', container: true })).toBe(true)
    expect(canDrillInto({ id: 'bundle', children_count: 2 })).toBe(true)
    expect(canDrillInto({ id: 'leaf' })).toBe(false)
  })
})
