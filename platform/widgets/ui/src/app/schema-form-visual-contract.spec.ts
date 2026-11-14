import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('schema form visual contract', () => {
  it('themes native intrinsic controls and contains structured values', () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/multiselect/styles.css'), 'utf8')
    expect(css).toMatch(/\.sf-input\s*\{[^}]*background:\s*var\(--p-content-background\)/s)
    expect(css).toMatch(/\.sf-input\s*\{[^}]*border-radius:\s*8px/s)
    expect(css).toMatch(/\.sf-structured\s*\{[^}]*max-width:\s*100%[^}]*overflow:\s*auto/s)
  })
})
