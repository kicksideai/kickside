/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Border-radius canon guardrail for the CRM surface. Every border-radius in this
// package's CSS/SFC sources must resolve to a sanctioned value; anything else fails
// here rather than drifting into the UI. This mirrors the kickside shared canon
// (platform/widgets/ui/src/app/radiusCanon) which a standalone package cannot import.
//   8px controls · 6px chips/badges · 999px pills/switches/round avatars · 14px cards ·
//   10px alerts · 11px icon tiles · 50% dots · 0/2/4 small structural.
// Never widen SANCTIONED to silence a value — fix the element to a canon radius instead.

const SANCTIONED_PX = new Set([0, 2, 4, 6, 8, 10, 11, 14, 999])
const SANCTIONED_OTHER = new Set(['50%'])
const SKIP = new Set(['node_modules', 'dist', 'coverage', '.vite'])
const SRC = dirname(fileURLToPath(import.meta.url))

interface RadiusCtx { file: string; selector: string; raw: string; resolved: string }

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (path.endsWith('.css') || path.endsWith('.vue')) out.push(path)
  }
  return out
}

function collectTokens(files: string[]): Map<string, string> {
  const tokens = new Map<string, string>()
  const def = /--([\w-]+)\s*:\s*([^;{}]+?)\s*(?:;|})/g
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    let match: RegExpExecArray | null
    while ((match = def.exec(text))) tokens.set(match[1], match[2].trim())
  }
  return tokens
}

function resolveValue(value: string, tokens: Map<string, string>, depth = 0): string {
  if (depth > 8) return value
  return value.replace(/var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_all, name, fallback) => {
    if (tokens.has(name)) return resolveValue(tokens.get(name)!, tokens, depth + 1)
    if (fallback) return resolveValue(String(fallback).trim(), tokens, depth + 1)
    return `var(--${name})`
  })
}

function selectorAt(text: string, index: number): string {
  const open = text.lastIndexOf('{', index)
  if (open < 0) return '(unknown)'
  const prev = Math.max(text.lastIndexOf('}', open), text.lastIndexOf('{', open - 1))
  return text.slice(prev + 1, open).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim()
}

function isSanctioned(resolved: string): boolean {
  const cleaned = resolved.replace(/!important/g, '').trim()
  if (/var\(|calc\(|color-mix\(/.test(cleaned)) return false
  for (const token of cleaned.split(/\s+/)) {
    if (SANCTIONED_OTHER.has(token)) continue
    const px = /^(\d+(?:\.\d+)?)px$/.exec(token)
    if (px) { if (SANCTIONED_PX.has(Number(px[1]))) continue; return false }
    if (/^(\d+(?:\.\d+)?)$/.test(token)) { if (SANCTIONED_PX.has(Number(token))) continue; return false }
    return false
  }
  return true
}

// 999px is valid for a genuine pill/switch/avatar but wrong for ordinary action
// controls, which must use the 8px control radius.
const ACTION_SELECTOR = /(?:^|[\s>+~,])(?:button\b|\.[\w-]*(?:btn|button|action|retry|control)[\w-]*)/i
function semanticViolation(ctx: RadiusCtx): string | null {
  const cleaned = ctx.resolved.replace(/!important/g, '').trim()
  if (cleaned.split(/\s+/).includes('999px') && ACTION_SELECTOR.test(ctx.selector)) {
    return 'ordinary action controls must use the 8px control radius, not 999px'
  }
  return null
}

describe('CRM border-radius canon', () => {
  const files = walk(SRC)
  const tokens = collectTokens(files)
  const decl = /border-radius\s*:\s*([^;}{]+)/g
  const violations: string[] = []
  const declarations: RadiusCtx[] = []
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    let match: RegExpExecArray | null
    while ((match = decl.exec(text))) {
      const raw = match[1].trim()
      const ctx: RadiusCtx = { file: file.slice(SRC.length + 1), selector: selectorAt(text, match.index), raw, resolved: resolveValue(raw, tokens) }
      declarations.push(ctx)
      const semantic = semanticViolation(ctx)
      if (semantic) { violations.push(`${ctx.file}  {${ctx.selector}}  border-radius: ${raw}  -> ${ctx.resolved} (${semantic})`); continue }
      if (isSanctioned(ctx.resolved)) continue
      violations.push(`${ctx.file}  {${ctx.selector}}  border-radius: ${raw}  -> ${ctx.resolved}`)
    }
  }

  it('has CSS sources to scan', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('uses only sanctioned radii', () => {
    expect(violations, `Non-canon border-radius:\n${violations.join('\n')}`).toEqual([])
  })

  it('keeps required control and container radii', () => {
    const required = [
      { selector: '.crm-button', value: '8px' },
      { selector: '.crm-icon-button', value: '8px' },
      { selector: '.crm-segment', value: '8px' },
      { selector: '.crm-card', value: '14px' },
      { selector: '.crm-board-card', value: '14px' },
      { selector: '.crm-activity-icon', value: '11px' },
      { selector: '.crm-object-icon', value: '11px' },
      { selector: '.crm-picker-menu', value: '14px' },
      { selector: '.crm-colmenu', value: '14px' },
    ]
    for (const need of required) {
      const matches = declarations.filter((declaration) => declaration.selector.split(',').map((selector) => selector.trim()).includes(need.selector))
      expect(matches, `Missing border-radius for ${need.selector}`).not.toEqual([])
      expect(matches.some((declaration) => declaration.resolved.replace(/!important/g, '').trim() === need.value), `Unexpected border-radius for ${need.selector}`).toBe(true)
    }
  })
})
