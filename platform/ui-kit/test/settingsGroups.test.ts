// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it } from 'vitest'
import { groupByCategory, listNames } from '../package/settingsGroups'

const row = (name: string, category?: string, on = false) => ({ name, category, on })
const names = (groups: ReturnType<typeof groupByCategory<ReturnType<typeof row>>>) => groups.map(group => [group.title, group.rows.map(r => r.name)])

it('groups rows by category in title order, enabled rows first, uncategorized last', () => {
  const groups = groupByCategory([
    row('Search', 'Search'), row('Notes'), row('Sprints', 'Planning and tracking'), row('Index', 'Search', true), row('Milestones', 'Planning and tracking', true),
  ], r => r.category, r => r.on)
  expect(names(groups)).toEqual([
    ['Planning and tracking', ['Milestones', 'Sprints']],
    ['Search', ['Index', 'Search']],
    ['Other', ['Notes']],
  ])
})

it('keeps one untitled group when no row declares a category', () => {
  expect(names(groupByCategory([row('A'), row('B', ' ', true)], r => r.category, r => r.on))).toEqual([['', ['B', 'A']]])
})

it('joins names as prose', () => {
  expect([listNames([]), listNames(['A']), listNames(['A', 'B']), listNames(['A', 'B', 'C'])]).toEqual(['', 'A', 'A and B', 'A, B and C'])
})
