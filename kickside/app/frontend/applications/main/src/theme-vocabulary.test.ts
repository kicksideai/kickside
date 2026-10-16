/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// Theme-vocabulary guardrail.
//
// The rule: `--p-*` is the platform's namespace, not ours. A module may READ any
// token the platform publishes, and may SET a PrimeVue component token on its own
// component class. What it may not do is read a `--p-*` name that nothing
// publishes - because CSS has no error for that. `color: var(--p-red-500)` is
// invalid-at-computed-value: the declaration drops and the element silently
// inherits, so an alert renders muted grey instead of red and nothing fails.
// With a fallback it is worse in a quieter way: `var(--p-border-radius-md, 6px)`
// renders fine forever while no longer tracking the theme it appears to follow.
//
// That is not hypothetical. This guard exists because a sweep found five of them
// at once: `--p-red-500` (workflows, and the plugin scaffold every new module is
// cut from), `--p-overlay-popover-shadow` twice (a real name exists -
// `--p-popover-shadow` - and two surfaces lost their elevation to the typo),
// `--p-border-radius-md`/`-sm` (Aura names this theme never adopted), and
// `--p-border-radius`.
//
// The published vocabulary is machine-readable, so the check is cheap.

/** The two files that between them define what `--p-*` means here. */
const FACADE_JSON = ['app', 'static', 'css-variables.facade.json']
const THEME_CSS = ['node_modules', '@wippy-fe', 'theme', 'theme-config.css']

interface Violation { file: string, token: string, fallback: boolean }

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..', '..', '..', '..')
const SKIP = new Set(['node_modules', 'dist', 'coverage', '.vite', 'static'])

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    // .ts is in scope because tokens are read from TS too: a stroke colour
    // returned as a string, or a whole stylesheet in a template literal. Specs
    // are not - they quote token names in prose and in their own assertions,
    // which is a mention, not a read.
    else if (p.endsWith('.css') || p.endsWith('.vue')
      || (p.endsWith('.ts') && !p.endsWith('.test.ts') && !p.endsWith('.spec.ts'))) out.push(p)
  }
  return out
}

/** Walk up for a node_modules copy of the theme; the monorepo hoists unevenly. */
function findThemeConfig(): string | null {
  let dir = HERE
  for (let i = 0; i < 8; i++) {
    const p = join(dir, ...THEME_CSS)
    if (existsSync(p)) return p
    const up = dirname(dir)
    if (up === dir) break
    dir = up
  }
  return null
}

/**
 * Everything the platform publishes: the facade's resolved variables plus the
 * theme package's own declarations. Neither is a superset of the other -
 * `--p-popover-shadow` is facade-only, `--p-danger-500` is theme-only - so a
 * check against either one alone produces false positives.
 */
function publishedVocabulary(): Set<string> {
  const names = new Set<string>()

  const facade = join(REPO, ...FACADE_JSON)
  if (existsSync(facade)) {
    // Read every level, not just the top: the file nests an "@dark" branch whose
    // --p-* names would otherwise be absent from the published set (and the key
    // "@dark" itself would be added as if it were a token).
    for (const m of readFileSync(facade, 'utf8').matchAll(/"(--p-[a-z0-9-]+)"\s*:/gi)) names.add(m[1])
  }

  const theme = findThemeConfig()
  if (theme) {
    const css = readFileSync(theme, 'utf8')
    for (const m of css.matchAll(/(--p-[a-z0-9-]+)\s*:/gi)) names.add(m[1])
  }

  return names
}

/** Every module surface a `--p-*` read can hide in. */
function sources(): string[] {
  const files = [...walk(HERE), ...walk(join(REPO, 'app', 'facade-src')), ...walk(join(REPO, '..', 'components', 'sso', 'ui', 'src'))]
  // platform/*/ui/src is the modules; platform/*/package is ui-kit's shipped
  // sheets; app/templates is the scaffold new modules are cut from, which is the
  // one place a bad token name propagates by copy rather than by import.
  const roots: [string, string[]][] = [
    [join(REPO, 'platform'), ['ui', 'src']],
    [join(REPO, 'platform'), ['package']],
    [join(REPO, 'app', 'replacements'), ['ui', 'src']],
    [join(REPO, 'app', 'templates'), ['ui', 'src']],
  ]
  for (const [dir, leaf] of roots) {
    if (!existsSync(dir)) continue
    for (const mod of readdirSync(dir)) files.push(...walk(join(dir, mod, ...leaf)))
  }
  return files
}

describe('theme vocabulary', () => {
  const published = publishedVocabulary()

  // A guard that cannot see the vocabulary would pass on everything. Two guards
  // in this repo were already found passing vacuously; this one says so instead.
  it('resolves the published vocabulary', () => {
    expect(findThemeConfig(), '@wippy-fe/theme/theme-config.css not found - run npm install').not.toBeNull()
    expect(existsSync(join(REPO, ...FACADE_JSON)), 'css-variables.facade.json missing').toBe(true)
    expect(published.size).toBeGreaterThan(300)
    // Without this the guard is green on an empty corpus: walk() returns [] for a
    // missing directory and sources() skips a missing root, so a moved root or a
    // wrong REPO would silently scan nothing and pass.
    expect(sources().length, 'no source files scanned - a root moved or REPO resolved wrong').toBeGreaterThan(200)
  })

  it('reads only --p-* tokens the platform publishes', () => {
    const violations: Violation[] = []

    for (const file of sources()) {
      const css = readFileSync(file, 'utf8')

      // A module may set a PrimeVue component token on its own class (the
      // documented way to size a component); reading back what it just set is
      // fine, so same-file definitions count as published for that file.
      const local = new Set<string>()
      for (const m of css.matchAll(/(--p-[a-z0-9-]+)\s*:/gi)) local.add(m[1])

      for (const m of css.matchAll(/var\(\s*(--p-[a-z0-9-]+)\s*(,)?/gi)) {
        const token = m[1]
        if (published.has(token) || local.has(token)) continue
        violations.push({ file: relative(REPO, file), token, fallback: Boolean(m[2]) })
      }
    }

    const report = violations
      .map(v => `${v.file}: var(${v.token})${v.fallback ? ' [has a fallback, so it renders - and silently stops tracking the theme]' : ' [no fallback: the declaration drops]'}`)
      .join('\n')

    expect(report, `--p-* tokens nothing publishes:\n${report}`).toBe('')
  })
})
