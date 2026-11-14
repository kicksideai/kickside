/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Shared border-radius canon guardrail. Every border-radius in a package's CSS/SFC
// sources must resolve to a sanctioned value; anything else fails here rather than
// drifting into the UI. Canon table: app/src/app/docs/kickside-development/frontend/best-practices.md "Radius canon" —
//   8px controls · 6px chips/badges · 999px pills/switches/round dots · 14px cards ·
//   10px alerts · 11px icon tiles · 50% circles · 2px/4px small structural (focus/grips).
// Each package's radius-canon.test.ts calls registerRadiusCanon() with its own source
// root (and any documented local exceptions), so the scanning logic lives once here.
// Never widen SANCTIONED_PX to silence a value — fix the element to a canon radius instead.

const SANCTIONED_PX = new Set([0, 2, 4, 6, 8, 10, 11, 14, 999])
const SANCTIONED_OTHER = new Set(['50%'])

export interface RadiusCtx { file: string; selector: string; raw: string; resolved: string }

export interface RequiredRadius { selector: string; value: string }

export interface RadiusCanonOptions {
  // Absolute path to the package source root to scan (usually the test file's dirname).
  srcDir: string
  // Sanctioned local exceptions for this package.
  allow?: { reason: string; ok: (c: RadiusCtx) => boolean }[]
  required?: RequiredRadius[]
  sharedFiles?: string[]
}

const SKIP = new Set(['node_modules', 'dist', 'coverage', '.vite'])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (p.endsWith('.css') || p.endsWith('.vue')) out.push(p)
  }
  return out
}

// The shared radius scale lives in @kickside/ui-kit, materialized into the
// consuming package rather than written in its sources, so token collection has
// to reach it too. Without this every `var(--kx-radius-*)` reads as an
// unresolvable token and the canon check degrades into "is it a literal".
function uiKitSheets(srcDir: string): string[] {
  const dir = join(srcDir, '..', '.wippy', 'npm', '@kickside', 'ui-kit')
  try {
    return readdirSync(dir).filter(f => f.endsWith('.css')).map(f => join(dir, f))
  } catch {
    return []
  }
}

function collectTokens(files: string[]): Map<string, string> {
  const tokens = new Map<string, string>()
  const def = /--([\w-]+)\s*:\s*([^;{}]+?)\s*(?:;|})/g
  for (const f of files) {
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

const ACTION_SELECTOR = /(?:^|[\s>+~,])(?:button\b|\.[\w-]*(?:btn|button|action|retry|control)[\w-]*)/i

// Numeric allow-listing is not enough: 999px is valid for a genuine pill/switch but
// wrong for ordinary actions. Keep this role check separate and exported so the
// negative tests can prove a sanctioned number still fails in the wrong place.
export function semanticRadiusViolation(ctx: RadiusCtx): string | null {
  const cleaned = ctx.resolved.replace(/!important/g, '').trim()
  if (cleaned.split(/\s+/).includes('999px') && ACTION_SELECTOR.test(ctx.selector)) {
    return 'ordinary action controls must use the 8px control radius, not 999px'
  }
  return null
}

export function registerRadiusCanon(options: RadiusCanonOptions): void {
  const SRC = options.srcDir
  const ALLOW = options.allow ?? []

  describe('border-radius canon', () => {
    const files = [...walk(SRC), ...(options.sharedFiles ?? [])]
    const tokens = collectTokens([...uiKitSheets(SRC), ...files])
    const decl = /border-radius\s*:\s*([^;}{]+)/g

    const violations: string[] = []
    const declarations: RadiusCtx[] = []
    for (const f of files) {
      const txt = readFileSync(f, 'utf8')
      let m: RegExpExecArray | null
      while ((m = decl.exec(txt))) {
        const raw = m[1].trim()
        const resolved = resolve(raw, tokens)
        const ctx: RadiusCtx = { file: f.slice(SRC.length + 1), selector: selectorAt(txt, m.index), raw, resolved }
        declarations.push(ctx)
        const semantic = semanticRadiusViolation(ctx)
        if (semantic) {
          violations.push(`${ctx.file}  {${ctx.selector}}  border-radius: ${raw}  -> ${resolved} (${semantic})`)
          continue
        }
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

    it('keeps required control radii', () => {
      for (const required of options.required ?? []) {
        const matches = declarations.filter((declaration) => declaration.selector.split(',').map((selector) => selector.trim()).includes(required.selector))
        expect(matches, `Missing border-radius for ${required.selector}`).not.toEqual([])
        expect(matches.some((declaration) => declaration.resolved.replace(/!important/g, '').trim() === required.value), `Unexpected border-radius for ${required.selector}`).toBe(true)
      }
    })
  })
}
