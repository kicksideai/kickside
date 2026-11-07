// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'

// Shared components render inside other modules' shadow roots, which load only the
// consumer's inline stylesheet; their rules ship as app/*.css files the consumer imports.
it('keeps shared widget component styles out of single-file component style blocks', () => {
  const dir = join(__dirname)
  const withStyle = readdirSync(dir)
    .filter(name => name.endsWith('.vue'))
    .filter(name => /<style[\s>]/.test(readFileSync(join(dir, name), 'utf8')))
  expect(withStyle).toEqual([])
})
