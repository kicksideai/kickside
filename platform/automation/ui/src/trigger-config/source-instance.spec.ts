// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it } from 'vitest'
import { primaryPicker } from '@widgets/app/ports'
import { pickerMetaOf } from './source-instance'

describe('component picker source instance metadata', () => {
  it('uses the picker field thread class instead of the catalog category', () => {
    const primary = primaryPicker({ config_schema: {
      thread_id: { picker: 'wc-component-picker', class: 'kickside.knowledge.injection', title: 'Knowledge base' },
    } })

    expect(primary).not.toBeNull()
    expect(pickerMetaOf({ class: 'knowledge' }, primary)).toMatchObject({
      thread_class: 'kickside.knowledge.injection',
    })
  })
})
