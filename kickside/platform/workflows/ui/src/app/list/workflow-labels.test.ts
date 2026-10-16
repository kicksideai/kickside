import { describe, expect, it } from 'vitest'
import type { WorkflowRow } from './workflow-row'
import {
  addLabel,
  allLabels,
  filterByLabel,
  groupByLabel,
  hasLabel,
  removeLabel,
  NO_LABEL_HEADER,
  NO_LABEL_KEY,
} from './workflow-labels'
import { normalizeLabels } from '../domain/workflow-labels'

// Minimal WorkflowRow builder — only id + labels matter to these transforms.
function row(id: string, labels: string[] = []): WorkflowRow {
  return {
    id,
    title: id,
    steps: 0,
    runs: 0,
    labels,
    location: { present: false, label: '', title: '' },
    subline: '',
    status: { published: false, publishedVersion: 0, version: null, hasDraft: true, label: 'Draft', tone: 'draft' },
    lastRun: { present: false, tone: 'pending', icon: 'tabler:minus', label: 'No runs', status: '', cause: '', title: 'No runs yet' },
    updated: 'No edits',
  }
}

describe('normalizeLabels', () => {
  it('trims, drops empties, and de-duplicates case-insensitively (first casing wins)', () => {
    expect(normalizeLabels([' Sales ', 'sales', '', 'Ops', '  '])).toEqual(['Sales', 'Ops'])
  })
  it('returns an empty array for a non-array', () => {
    expect(normalizeLabels(undefined)).toEqual([])
    expect(normalizeLabels(null)).toEqual([])
    expect(normalizeLabels('sales')).toEqual([])
  })
})

describe('allLabels', () => {
  it('collects a case-insensitively unique vocabulary sorted alphabetically', () => {
    const rows = [row('a', ['Sales', 'Ops']), row('b', ['sales', 'Billing']), row('c', [])]
    expect(allLabels(rows)).toEqual(['Billing', 'Ops', 'Sales'])
  })
})

describe('addLabel / removeLabel', () => {
  it('appends a new label in its typed casing', () => {
    expect(addLabel(['Sales'], 'Ops')).toEqual(['Sales', 'Ops'])
  })
  it('is a no-op on a blank or an already-present tag (case-insensitive), returning the same reference', () => {
    const existing = ['Sales']
    expect(addLabel(existing, '  ')).toBe(existing)
    expect(addLabel(existing, 'sales')).toBe(existing)
  })
  it('removes a label case-insensitively', () => {
    expect(removeLabel(['Sales', 'Ops'], 'sales')).toEqual(['Ops'])
  })
})

describe('hasLabel / filterByLabel', () => {
  const rows = [row('a', ['Sales']), row('b', ['Ops']), row('c', [])]
  it('matches a label case-insensitively', () => {
    expect(hasLabel(rows[0], 'sales')).toBe(true)
    expect(hasLabel(rows[0], 'ops')).toBe(false)
  })
  it('filters to rows carrying a label', () => {
    expect(filterByLabel(rows, 'sales').map((r) => r.id)).toEqual(['a'])
  })
  it('selects the un-labeled rows for the NO_LABEL_KEY sentinel', () => {
    expect(filterByLabel(rows, NO_LABEL_KEY).map((r) => r.id)).toEqual(['c'])
  })
})

describe('groupByLabel', () => {
  it('places a multi-label workflow under each of its labels, alphabetical, No label last', () => {
    const rows = [row('a', ['Sales', 'Ops']), row('b', ['Ops']), row('c', [])]
    const groups = groupByLabel(rows)
    expect(groups.map((g) => g.header)).toEqual(['Ops', 'Sales', NO_LABEL_HEADER])
    expect(groups[0].rows.map((r) => r.id)).toEqual(['a', 'b'])
    expect(groups[1].rows.map((r) => r.id)).toEqual(['a'])
    expect(groups[2].key).toBe(NO_LABEL_KEY)
    expect(groups[2].rows.map((r) => r.id)).toEqual(['c'])
  })
  it('folds differently-cased labels into one group', () => {
    const groups = groupByLabel([row('a', ['Sales']), row('b', ['sales'])])
    expect(groups).toHaveLength(1)
    expect(groups[0].rows.map((r) => r.id)).toEqual(['a', 'b'])
  })
  it('omits the No label group when every workflow is labeled', () => {
    const groups = groupByLabel([row('a', ['Sales'])])
    expect(groups.map((g) => g.key)).toEqual(['Sales'])
  })
  it('preserves incoming row order within a group', () => {
    const groups = groupByLabel([row('b', ['Ops']), row('a', ['Ops'])])
    expect(groups[0].rows.map((r) => r.id)).toEqual(['b', 'a'])
  })
})
