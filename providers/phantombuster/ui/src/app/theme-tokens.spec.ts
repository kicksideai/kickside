import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8')

describe('PhantomBuster theme tokens', () => {
  it('uses the canonical host theme vocabulary', () => {
    expect(css).not.toContain('--wippy-')
    expect(css).not.toMatch(/--p-(?:yellow|warning)-/)
    expect(css).toContain('--p-content-background')
    expect(css).toContain('--p-warn-500')
  })
})
