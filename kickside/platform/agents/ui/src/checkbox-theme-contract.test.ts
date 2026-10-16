import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The contract holds over what the element actually ships, which since the
// button vocabulary moved to @kickside/ui-kit is the module sheet plus the
// packages it imports. Reading styles.css alone would pass or fail on where a
// rule happens to live rather than on whether the contract is met.
function sheet(rel: string): string {
  const src = readFileSync(resolve(process.cwd(), rel), 'utf8')
  const imports = [...src.matchAll(/@import\s+["']([^"']+)["']/g)].map(m => m[1])
  const pkgs = imports
    .filter(i => i.startsWith('@kickside/ui-kit/'))
    .map(i => readFileSync(resolve(process.cwd(), 'node_modules', i), 'utf8'))
  return [src, ...pkgs].join('\n')
}

const css = sheet('src/styles.css')

describe('agent checkbox theme contract', () => {
  it('does not restyle native checkbox internals', () => {
    expect(css).not.toMatch(/\.kx-toggle input/)
    expect(css).not.toMatch(/\.kx-toggle input::before/)
  })

  // Destructive actions are PrimeVue Buttons with severity="danger" since the
  // button vocabulary moved to the theme, so the module sheet no longer carries
  // the contrast rule. What it must still do is not restyle them back.
  it('leaves destructive button contrast to the theme', () => {
    expect(css).not.toMatch(/\.kx-btn-danger/)
    expect(css).not.toMatch(/\.p-button-danger\s*\{/)
  })
})
