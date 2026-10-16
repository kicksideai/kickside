import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

// A contract holds over what the element actually ships. Since the button
// vocabulary moved to @kickside/ui-kit that is the module sheet plus the
// packages it imports, so reading styles.css alone would pass or fail on where
// a rule happens to live rather than on whether the contract is met.
function sheet(path: string): string {
  const src = read(path)
  const pkgs = [...src.matchAll(/@import\s+["']([^"']+)["']/g)]
    .map(m => m[1])
    .filter(i => i.startsWith('@kickside/ui-kit/'))
    .map(i => read(`node_modules/${i}`))
  return [src, ...pkgs].join('\n')
}

describe('automation checkbox theme contract', () => {
  it.each([
    ['manager', read('src/styles.css'), '.kx-check'],
    ['trigger editor', read('src/trigger-config/styles.css'), '.kx-tc-check input'],
  ])('%s owns the complete native checkbox appearance', (_name, css, selector) => {
    expect(css).toContain('appearance: none')
    expect(css).toContain('width: 18px')
    expect(css).toContain(`${selector}:checked`)
    expect(css).toContain(`${selector}:focus-visible`)
    expect(css).toContain(`${selector}:disabled`)
    expect(css).toContain('var(--p-button-primary-color)')
  })

  // Destructive actions are PrimeVue Buttons with severity="danger" now, so the
  // contrast is the theme's to hold; the module must simply not override it.
  it('leaves destructive button contrast to the theme', () => {
    const css = sheet('src/styles.css')
    expect(css).not.toMatch(/\.kx-btn-danger/)
    expect(css).not.toMatch(/\.p-button-danger\s*\{/)
  })
})
