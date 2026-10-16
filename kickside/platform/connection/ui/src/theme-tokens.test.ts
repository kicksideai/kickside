import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8')

describe('Connection theme tokens', () => {
  it('uses the canonical warn token family', () => {
    expect(css).not.toMatch(/--p-(?:yellow|warning)-/)
    expect(css).toContain('--p-warn-500')
  })
})
