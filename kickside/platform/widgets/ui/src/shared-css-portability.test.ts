import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// Files under this package that other modules pull in through the `@widgets`
// path alias are compiled as if they were the consumer's own source. A bare
// package specifier in one of them therefore has to resolve from every
// consumer's tree, which it does not: vite resolves the nested @import against
// the consuming package's root, not against this one, and the build dies with
// ENOENT.
//
// Shared sheets may only @import relative paths or the `@widgets` alias itself.
// Anything a shared sheet needs from a package (the spinner rule, say) is the
// consumer's import to make, into the same shadow root.

const SRC = dirname(fileURLToPath(import.meta.url))
const REPO = join(SRC, '..', '..', '..', '..')

function walk(dir: string, hit: (p: string) => void) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === 'dist' || e === '.wippy') continue
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, hit)
    else hit(p)
  }
}

/** Every `@widgets/...` specifier any other module in the repo imports. */
function aliasConsumedFiles(): Set<string> {
  const out = new Set<string>()
  const ref = /@widgets\/([A-Za-z0-9_/.-]+\.css)/g
  const platform = join(REPO, 'platform')
  for (const mod of readdirSync(platform)) {
    if (mod === 'widgets') continue
    const src = join(platform, mod, 'ui', 'src')
    try { if (!statSync(src).isDirectory()) continue } catch { continue }
    walk(src, (p) => {
      if (!/\.(css|ts|vue)$/.test(p)) return
      for (const m of readFileSync(p, 'utf8').matchAll(ref)) out.add(m[1])
    })
  }
  return out
}

describe('css shared through the @widgets alias', () => {
  it('imports no bare package specifiers', () => {
    const shared = aliasConsumedFiles()
    expect(shared.size).toBeGreaterThan(0)

    const offenders: string[] = []
    for (const rel of shared) {
      let css: string
      try { css = readFileSync(join(SRC, rel), 'utf8') } catch { continue }
      for (const m of css.matchAll(/@import\s+["']([^"']+)["']/g)) {
        const spec = m[1]
        if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('@widgets/')) continue
        offenders.push(`${relative(REPO, join(SRC, rel))} imports "${spec}"`)
      }
    }
    expect(offenders).toEqual([])
  })
})
