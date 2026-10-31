// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it } from 'vitest'
import styles from './styles.css?inline'

describe('hub stylesheet', () => {
  it('carries the PickerSelect rules the install dialog mounts in its shadow root', () => {
    expect(styles).toContain('.kx-ps {')
    expect(styles).toContain('.kx-ps-val {')
    expect(styles).toContain('.anchored-panel > .p-select-overlay.kx-ps-panel {')
    expect(styles).toContain('--kx-picker-option-icon-size:')
  })
})
