/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Radius canon guardrail. Every border-radius in this package's CSS/SFC sources must
// resolve to a sanctioned value; anything else fails here rather than drifting into the
// UI. Canon table: app/src/app/docs/kickside-development/frontend/best-practices.md "Radius canon" —
//   8px controls · 6px chips/badges · 999px pills/switches/round dots · 14px cards ·
//   10px alerts · 11px icon tiles · 50% circles · 2px/4px small structural (focus/grips).
// Deliberate exceptions go in ALLOW with a reason. Never widen SANCTIONED_PX to silence a
// value — fix the element to a canon radius instead.

const SANCTIONED_PX = new Set([0, 2, 4, 6, 8, 10, 11, 14, 999])
const SANCTIONED_OTHER = new Set(['50%'])

interface Ctx { file: string; selector: string; raw: string; resolved: string }

// High-risk custom visual roles need the correct sanctioned value, not merely any sanctioned
// value. PrimeVue-owned standard controls and overlays are intentionally excluded: this module
// may compose their layout, but must not redefine their radii.
const ROLE_RADII: { selector: string; expected: string; role: string }[] = [
  { selector: '.wf-sed-draft', expected: '0', role: 'inline assist review' },
  { selector: '.wf-automap-why', expected: '14px', role: 'mapping explanation popover' },
  { selector: '.wf-timeline-event', expected: '14px', role: 'timeline event card' },
  { selector: '.wf-callpick-selected', expected: '14px', role: 'selected workflow card' },
  { selector: '.wf-setup-trigger', expected: '14px', role: 'trigger setup card' },
  { selector: '.wf-flow .vue-flow__nodes > .vue-flow__node', expected: '0', role: 'VueFlow positioning wrapper' },
  { selector: '.wfn', expected: '14px', role: 'workflow node card' },
  { selector: '.wf-automap-src', expected: '6px', role: 'mapping field tag' },
  { selector: '.wf-automap-tgt', expected: '6px', role: 'mapping field tag' },
  { selector: '.wf-intent-src', expected: '6px', role: 'mapping field tag' },
  { selector: '.wf-intent-tgt', expected: '6px', role: 'mapping field tag' },
  { selector: '.wf-automap-trace', expected: '6px', role: 'mapping trace tag' },
]

// Sanctioned local exceptions for this package.
const ALLOW: { reason: string; ok: (c: Ctx) => boolean }[] = [
  {
    reason: 'Node selection ring / focus ring / nested segment radius derived from the ' +
      '14px card (--wf-radius) or 8px control (--wf-radius-sm) canon token via calc().',
    ok: (c) => /calc\(\s*var\(--wf-radius/.test(c.raw),
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
    else if (p.endsWith('.css') || p.endsWith('.vue')) out.push(p)
  }
  return out
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

describe('border-radius canon', () => {
  const files = walk(SRC)
  const tokens = collectTokens(files)
  const decl = /border-radius\s*:\s*([^;}{]+)/g

  const violations: string[] = []
  const roleViolations: string[] = []
  const seenRoles = new Set<string>()
  for (const f of files) {
    const txt = readFileSync(f, 'utf8')
    let m: RegExpExecArray | null
    while ((m = decl.exec(txt))) {
      const raw = m[1].trim()
      const resolved = resolve(raw, tokens)
      const ctx: Ctx = { file: f.slice(SRC.length + 1), selector: selectorAt(txt, m.index), raw, resolved }
      // A numeric allow-list alone cannot detect the bug this guardrail is meant to
      // prevent: 999px is valid for switches and dots, but wrong for an action button.
      // Catch action-like selectors using the pill radius even though 999 is otherwise
      // sanctioned. Keep true circular swatches/switches/dots out of this role check.
      const actionSelector = /(?:btn|button|action|retry|reset|clear|trace|payload|label-(?:add|x))/i.test(ctx.selector)
      const circularRole = /(?:swatch|switch|toggle|dot|pulse)/i.test(ctx.selector)
      if (actionSelector && !circularRole && /(?:^|\s)999px(?:\s|$)/.test(resolved.replace(/!important/g, '').trim())) {
        roleViolations.push(`${ctx.file}  {${ctx.selector}}  action control uses pill radius: ${raw} -> ${resolved}`)
      }
      for (const rule of ROLE_RADII) {
        if (!ctx.selector.split(',').map((part) => part.trim()).includes(rule.selector)) continue
        seenRoles.add(rule.selector)
        const cleaned = resolved.replace(/!important/g, '').trim()
        if (cleaned !== rule.expected) roleViolations.push(`${ctx.file}  {${ctx.selector}}  ${rule.role} must use ${rule.expected}: ${raw} -> ${resolved}`)
      }
      if (isSanctioned(resolved)) continue
      if (ALLOW.some((a) => a.ok(ctx))) continue
      violations.push(`${ctx.file}  {${ctx.selector}}  border-radius: ${raw}  -> ${resolved}`)
    }
  }
  for (const rule of ROLE_RADII) {
    if (!seenRoles.has(rule.selector)) roleViolations.push(`missing explicit border-radius declaration for ${rule.selector} (${rule.role}, expected ${rule.expected})`)
  }

  it('has CSS sources to scan', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('uses only sanctioned radii (or a documented ALLOW exception)', () => {
    expect(violations, `Non-canon border-radius (see app/src/app/docs/kickside-development/frontend/best-practices.md):\n${violations.join('\n')}`).toEqual([])
  })

  it('does not style action controls as pills', () => {
    expect(roleViolations, `Action controls using the 999px pill radius:\n${roleViolations.join('\n')}`).toEqual([])
  })
})

describe('focus radius cascade', () => {
  it('never changes a control radius merely because the control has focus', () => {
    const files = walk(SRC)
    const offenders: string[] = []
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      const blocks = text.matchAll(/([^{}]*:focus(?:-visible)?[^{}]*)\{([^{}]*)\}/g)
      for (const block of blocks) {
        if (/border-radius\s*:/.test(block[2])) offenders.push(`${file.slice(SRC.length + 1)}: ${block[1].trim()}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
