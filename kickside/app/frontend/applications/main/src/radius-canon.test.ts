/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Radius canon guardrail. Every border-radius in this package's CSS/SFC sources must
// resolve to a sanctioned value; anything else fails here rather than drifting into the
// UI. Canon table (this comment is the source of truth; there is no local
// best-practices doc - app/src/app/docs/.../best-practices.md defers to the
// wippy.frontend KB) —
//   8px controls · 6px chips/badges · 999px pills/switches/round dots · 14px cards ·
//   10px alerts · 11px icon tiles · 50% circles · 2px/4px small structural (focus/grips).
// Deliberate exceptions go in ALLOW with a reason. Never widen SANCTIONED_PX to silence a
// value — fix the element to a canon radius instead.

const SANCTIONED_PX = new Set([0, 2, 4, 6, 8, 10, 11, 14, 999])
const SANCTIONED_OTHER = new Set(['50%'])

interface Ctx { file: string; selector: string; raw: string; resolved: string }

// Sanctioned local exceptions for this package.
const ALLOW: { reason: string; ok: (c: Ctx) => boolean }[] = [
  {
    reason: 'Oversized non-interactive brand/hero marks (splash logo preview, done hero) ' +
      'carry a proportional 16px radius, not the ~11px icon-tile canon.',
    ok: (c) => c.resolved.replace(/!important/g, '').trim() === '16px' &&
      /brand-mark|sp-logo-prev|sp-done-hero/.test(c.selector),
  },
]

const SRC = dirname(fileURLToPath(import.meta.url))
const SKIP = new Set(['node_modules', 'dist', 'coverage', '.vite'])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    // .ts too: CSS handed to a component as a template literal (chatAppearance)
    // is still CSS, and was drifting past this guard unchecked. Specs are not
    // shipped styling, and this file would otherwise match its own patterns.
    else if (p.endsWith('.css') || p.endsWith('.vue')) out.push(p)
    else if (p.endsWith('.ts') && !/\.(?:test|spec)\.ts$/.test(p)) out.push(p)
  }
  return out
}

// The shared scale lives in @kickside/ui-kit, materialized into this package
// rather than written here, so the guard has to read it too - otherwise every
// `var(--kx-radius-*)` looks like an unresolvable token and the canon check
// degrades into "is it a literal".
function uiKitSheets(): string[] {
  const dir = join(SRC, '..', '.wippy', 'npm', '@kickside', 'ui-kit')
  try {
    return readdirSync(dir).filter(f => f.endsWith('.css')).map(f => join(dir, f))
  } catch {
    return []
  }
}

function collectTokens(files: string[]): Map<string, string> {
  const tokens = new Map<string, string>()
  const def = /--([\w-]+)\s*:\s*([^;{}]+?)\s*(?:;|})/g
  for (const f of [...uiKitSheets(), ...files]) {
    const txt = readFileSync(f, 'utf8')
    let m: RegExpExecArray | null
    while ((m = def.exec(txt))) tokens.set(m[1], m[2].trim())
  }
  return tokens
}

function resolve(value: string, tokens: Map<string, string>, depth = 0): string {
  if (depth > 8) return value
  return value.replace(/var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_all, name, fb) => {
    if (tokens.has(name)) return resolve(tokens.get(name)!, tokens, depth + 1)
    if (fb) return resolve(String(fb).trim(), tokens, depth + 1)
    return `var(--${name})`
  })
}

// Nearest selector text preceding a declaration index (for reporting + allow-list keys).
function selectorAt(text: string, idx: number): string {
  const open = text.lastIndexOf('{', idx)
  if (open < 0) return '(unknown)'
  const prev = Math.max(text.lastIndexOf('}', open), text.lastIndexOf('{', open - 1))
  return text.slice(prev + 1, open).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim()
}

function isSanctioned(resolved: string): boolean {
  const cleaned = resolved.replace(/!important/g, '').trim()
  if (/var\(|calc\(|color-mix\(/.test(cleaned)) return false // unresolved / computed -> ALLOW only
  for (const tok of cleaned.split(/\s+/)) {
    if (SANCTIONED_OTHER.has(tok)) continue
    const px = /^(\d+(?:\.\d+)?)px$/.exec(tok)
    if (px) { if (SANCTIONED_PX.has(Number(px[1]))) continue; return false }
    if (/^(\d+(?:\.\d+)?)$/.test(tok)) { if (SANCTIONED_PX.has(Number(tok))) continue; return false }
    return false
  }
  return true
}

describe('border-radius canon', () => {
  const files = walk(SRC)
  const tokens = collectTokens(files)
  const decl = /border-radius\s*:\s*([^;}{]+)/g

  const violations: string[] = []
  for (const f of files) {
    const txt = readFileSync(f, 'utf8')
    let m: RegExpExecArray | null
    while ((m = decl.exec(txt))) {
      const raw = m[1].trim()
      const resolved = resolve(raw, tokens)
      const ctx: Ctx = { file: f.slice(SRC.length + 1), selector: selectorAt(txt, m.index), raw, resolved }
      if (isSanctioned(resolved)) continue
      if (ALLOW.some((a) => a.ok(ctx))) continue
      violations.push(`${ctx.file}  {${ctx.selector}}  border-radius: ${raw}  -> ${resolved}`)
    }
  }

  it('has CSS sources to scan', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('uses only sanctioned radii (or a documented ALLOW exception)', () => {
    expect(violations, `Non-canon border-radius (see app/src/app/docs/kickside-development/frontend/best-practices.md):\n${violations.join('\n')}`).toEqual([])
  })
})
