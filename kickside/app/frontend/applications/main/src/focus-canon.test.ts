/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// Focus canon guardrail.
//
// The rule (app/src/app/docs/kickside-development/frontend/best-practices.md):
// the platform contract is a token set - `--p-focus-ring-{width,style,color,
// offset}` and `--p-focus-ring-shadow` - and everything that draws a focus ring
// reads those tokens. Changing the ring anywhere is a change to a token.
//
// A component MAY own focus selectors for its own structure; that is the
// documented Wippy model, because the theme cannot know whether a given class
// draws a border, and a wrong guess is a doubled ring. What a component may NOT
// do is hardcode the values - which is how four idioms drifted apart at 18%,
// 22% and 45% alpha before this existed.
//
// So this fails on LITERALS inside a focus rule, not on the rule itself.
//
// An earlier version did the opposite: it failed on any module focus rule at
// all, which forced a global class-name exception list into the theme - the
// pattern the Wippy frontend guidance names as wrong. Do not reintroduce it.

/** A colour or length written out instead of read from the contract. */
const LITERAL = /(#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\b\d*\.?\d+(px|rem|em)\b|\b(red|blue|green|black|white|orange)\b)/i
/** Properties that draw the ring. `border-color` counts - it is the bordered treatment. */
const RING_PROP = /^(outline(-[a-z]+)?|box-shadow|border-color)$/i
/** Values that are not literals even though they carry no `var()`. */
const ALLOWED_KEYWORDS = /^(none|0|inherit|initial|unset|transparent|currentcolor|solid|dashed|dotted|auto)$/i

interface Ctx { file: string, selector: string, decl: string }

// Sanctioned local exceptions.
const ALLOW: { reason: string, ok: (c: Ctx) => boolean }[] = []

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..', '..', '..', '..')
const SKIP = new Set(['node_modules', 'dist', 'coverage', '.vite', 'static'])

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.css') || p.endsWith('.vue')) out.push(p)
  }
  return out
}

/** This app, every module's web components, the vendored replacements we ship,
 * and the facade itself. One test beats 27 copies - and the dashboard
 * replacement is why the replacements are in scope: it sat outside the scan
 * carrying a 28% halo against the canon's 18%. The facade is in scope for the
 * same reason, having been the one layer that wrote the canon and was never
 * held to it. */
function sources(): string[] {
  const files = [...walk(HERE), ...walk(join(REPO, 'app', 'facade-src'))]
  // kickside/ui-kit publishes the shared vocabulary as an artifact. It is the one
  // place a focus rule reaches many modules at once, so it is the last place
  // that should be exempt.
  for (const [dir, leaf] of [[join(REPO, 'platform'), ['ui', 'src']], [join(REPO, 'platform'), ['package']], [join(REPO, 'app', 'replacements'), ['ui', 'src']]] as const) {
    if (!existsSync(dir)) continue
    for (const mod of readdirSync(dir)) files.push(...walk(join(dir, mod, ...leaf)))
  }
  return files
}

/**
 * Rule bodies whose selector carries `:focus`, `:focus-visible` or
 * `:focus-within`.
 *
 * `:focus-within` used to be skipped outright, on the reasoning that revealing
 * a row's actions is behaviour rather than a ring. That stopped being true the
 * moment the canon started using it deliberately: where the focusable node is
 * an inner input and the box that shows focus is its wrapper - a search shell,
 * the chat composer card - `:focus-within` IS the ring. Skipping it also let
 * three rings drift unseen, one of them to a 22% halo.
 *
 * Behaviour rules stay exempt without a selector carve-out, because RING_PROP
 * only matches the properties that draw a ring: `opacity: 1` on a revealed
 * action row is not one of them.
 */
function* focusRules(css: string): Generator<{ selector: string, body: string }> {
  const rule = /([^{}]*?)\{([^{}]*?)\}/gs
  let m: RegExpExecArray | null
  while ((m = rule.exec(css))) {
    const selector = m[1].replace(/\s+/g, ' ').trim()
    if (!selector.includes(':focus')) continue
    yield { selector, body: m[2] }
  }
}

/**
 * Custom properties that stand in for the contract.
 *
 * A rule reading `box-shadow: var(--km-ring)` passes every check above while
 * `--km-ring` quietly holds a hand-written halo - which is exactly how the
 * models module sat at 22% after the canon moved to 18%. A local name for the
 * ring is fine; it has to be an alias, not a copy.
 */
function* ringTokenDefs(css: string): Generator<{ name: string, value: string }> {
  const decl = /(--[a-z0-9-]*(?:focus|ring)[a-z0-9-]*)\s*:\s*([^;}]+)/gi
  let m: RegExpExecArray | null
  while ((m = decl.exec(css))) yield { name: m[1], value: m[2].replace(/\s+/g, ' ').trim() }
}

describe('focus canon', () => {
  const files = sources()
  const violations: string[] = []

  for (const f of files) {
    // A .vue file is CSS and JavaScript together; only its <style> blocks are
    // CSS, or `const x: Record<string, y> = {}` parses as an empty rule.
    const txt = readFileSync(f, 'utf8')
    const css = f.endsWith('.vue')
      ? [...txt.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n')
      : txt
    if (!css.trim()) continue

    for (const { selector, body } of focusRules(css)) {
      for (const raw of body.split(';')) {
        const idx = raw.indexOf(':')
        if (idx < 0) continue
        const name = raw.slice(0, idx).trim()
        const value = raw.slice(idx + 1).trim()
        if (!RING_PROP.test(name)) continue
        if (!value || ALLOWED_KEYWORDS.test(value)) continue
        // A value built from the contract is fine however long it is.
        if (value.includes('var(--')) continue
        if (!LITERAL.test(value)) continue
        const ctx: Ctx = { file: relative(REPO, f).replaceAll(String.fromCharCode(92), '/'), selector, decl: `${name}: ${value}` }
        if (ALLOW.some(a => a.ok(ctx))) continue
        violations.push(`${ctx.file}  {${ctx.selector}}  ${ctx.decl}`)
      }
    }

    for (const { name, value } of ringTokenDefs(css)) {
      // The contract's own tokens are declared in css-variables.facade.json,
      // which is JSON and not scanned; anything here naming itself after the
      // ring has to defer to them.
      if (value.includes('var(--p-focus-ring')) continue
      if (ALLOWED_KEYWORDS.test(value) || !LITERAL.test(value)) continue
      const ctx: Ctx = { file: relative(REPO, f).replaceAll(String.fromCharCode(92), '/'), selector: name, decl: value }
      if (ALLOW.some(a => a.ok(ctx))) continue
      violations.push(`${ctx.file}  {${ctx.selector}}  ${ctx.decl}`)
    }
  }

  it('has sources to scan', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('scans the platform modules, not just this package', () => {
    expect(files.some(f => f.includes('platform'))).toBe(true)
  })

  it('draws focus rings from the token contract, never from literals', () => {
    expect(
      violations,
      'A focus ring must read --p-focus-ring-* rather than hardcode a value. '
      + 'See app/src/app/docs/kickside-development/frontend/best-practices.md "Focus canon".\n'
      + `${violations.join('\n')}`,
    ).toEqual([])
  })
})
