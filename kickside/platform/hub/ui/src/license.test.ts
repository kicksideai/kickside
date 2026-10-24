// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it } from 'vitest'
import { formatLicense } from './lib.ts'

describe('formatLicense', () => {
  it.each([
    ['LicenseRef-KickSide-Community-1.0', 'KickSide Community 1.0'],
    ['LicenseRef-Example-Research-License-2.3.4', 'Example Research License 2.3.4'],
    ['LicenseRef-Example-1.0', 'Example 1.0'],
    ['LicenseRef-Custom', 'Custom'],
  ])('formats %s as %s', (raw, label) => {
    expect(formatLicense(raw)).toBe(label)
  })

  it.each(['MIT', 'Apache-2.0', 'MPL-2.0', 'BSD-3-Clause', 'GPL-2.0-or-later', 'GPL-2.0+'])('preserves %s', raw => {
    expect(formatLicense(raw)).toBe(raw)
  })

  it.each([
    ['MIT OR LicenseRef-Example-Community-1.0', 'MIT OR Example Community 1.0'],
    ['LicenseRef-Example-1.0 AND Apache-2.0', 'Example 1.0 AND Apache-2.0'],
    ['GPL-2.0-only WITH Classpath-exception-2.0', 'GPL-2.0-only WITH Classpath-exception-2.0'],
    ['MIT WITH LicenseRef-Example-Exception-1.0', 'MIT WITH Example Exception 1.0'],
    ['(LicenseRef-Example-1.0 OR MIT) AND LicenseRef-Other-License-2.0', '(Example 1.0 OR MIT) AND Other License 2.0'],
    ['MIT  OR\n(LicenseRef-Example-1.0)', 'MIT  OR\n(Example 1.0)'],
    ['DocumentRef-example:LicenseRef-Custom-1.0', 'DocumentRef-example:LicenseRef-Custom-1.0'],
  ])('formats expression %s', (raw, label) => {
    expect(formatLicense(raw)).toBe(label)
  })

  it.each(['', undefined, null])('returns empty for %s', raw => {
    expect(formatLicense(raw)).toBe('')
  })
})
