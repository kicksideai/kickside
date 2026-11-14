import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8')

describe('Hub theme tokens', () => {
  it('uses the canonical warn token family', () => {
    expect(css).not.toMatch(/--p-(?:yellow|warning)-/)
    expect(css).toContain('--p-warn-500')
  })

  it('uses the canonical primary contrast token', () => {
    expect(css).not.toContain('--p-button-primary-color')
    expect(css).toContain('--p-primary-contrast-color')
  })

  it('takes onboarding status colours from the theme and the shared washes', () => {
    // Ink is the theme's own severity ramp; the tint behind it is the shared
    // wash. hub used to redeclare both under --rdb/--rds and friends, which is
    // the alias habit the token sheet exists to end.
    expect(css).not.toMatch(/var\(--(?:danger|success)\)/)
    expect(css).not.toMatch(/--(?:rd|gn|am|bl|pu)[bs]?\s*:/)
    for (const token of ['--p-danger-700', '--p-success-700', '--p-warn-700']) {
      expect(css).toContain(token)
    }
    for (const token of ['--kx-wash-danger', '--kx-wash-success', '--kx-wash-warn']) {
      expect(css).toContain(token)
    }
  })
})
