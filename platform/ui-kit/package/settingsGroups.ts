// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

export interface SettingsGroupRows<T> { title: string; rows: T[] }

// Groups rows under their declared category. Groups order by title with uncategorized
// rows last under "Other"; when nothing declares a category the result is one untitled
// group. Rows that are on lead their group and otherwise keep their input order.
export function groupByCategory<T>(rows: readonly T[], category: (row: T) => string | undefined, on: (row: T) => boolean): SettingsGroupRows<T>[] {
  const buckets = new Map<string, T[]>()
  for (const row of rows) {
    const title = category(row)?.trim() ?? ''
    const bucket = buckets.get(title)
    if (bucket) bucket.push(row)
    else buckets.set(title, [row])
  }
  const ordered = [...buckets].map(([title, entries]) => ({
    title,
    rows: [...entries.filter(on), ...entries.filter(row => !on(row))],
  }))
  if (ordered.length === 1 && ordered[0]!.title === '') return ordered
  return ordered
    .map(group => group.title ? group : { ...group, title: 'Other' })
    .sort((a, b) => a.title === 'Other' ? 1 : b.title === 'Other' ? -1 : a.title.localeCompare(b.title))
}

// Joins names as prose: "A", "A and B", "A, B and C".
export function listNames(names: readonly string[]): string {
  if (names.length < 2) return names[0] ?? ''
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
}
