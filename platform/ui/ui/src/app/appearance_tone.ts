// Base-tone helpers for the Appearance editor.
//
// The canonical --p-primary variable drives @wippy-fe/theme's palette and
// KickSide's intentional step overrides through static color-mix() expressions.
// The former dark-mode brightened output is a separate derived variable, so the
// editor only validates, previews, and persists the selected --p-primary color.

export const DEFAULT_TONE_FALLBACK = '#22c55e'
export const PRIMARY_VARIABLE = '--p-primary'

type RGB = { r: number; g: number; b: number }

export function rgbStringToHex(rgb: string): string | null {
  const m = /^rgba?\(([^)]+)\)/i.exec((rgb || '').trim())
  if (!m) return null
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()))
  if (parts.length < 3 || parts.slice(0, 3).some((n) => Number.isNaN(n))) return null
  const byte = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${byte(parts[0])}${byte(parts[1])}${byte(parts[2])}`
}

function normalizeHex(hex: string): string | null {
  let value = (hex || '').trim().replace(/^#/, '')
  if (value.length === 3) value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2]
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null
  return `#${value.toLowerCase()}`
}

function hexToRgb(hex: string): RGB | null {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  const value = normalized.slice(1)
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

// The same canonical variable is repeated only where the theme's forced mode
// selectors require equal specificity. No palette values are generated here.
export function buildToneCss(hex: string, root: ':root' | ':host'): string {
  const value = normalizeHex(hex)
  if (!value) return ''
  const declaration = `${PRIMARY_VARIABLE}: ${value};`
  if (root === ':host') return `:host { ${declaration} }`
  return [
    `:root { ${declaration} }`,
    `@media (prefers-color-scheme: dark) { :root:not(.w-theme-light) { ${declaration} } }`,
    `:root.w-theme-dark, .w-theme-dark { ${declaration} }`,
    `@media (prefers-color-scheme: light) { :root:not(.w-theme-dark) { ${declaration} } }`,
    `:root.w-theme-light, .w-theme-light { ${declaration} }`,
  ].join('\n')
}

export function buildDefaultToneCss(
  vars: Record<string, unknown> | null | undefined,
  root: ':root' | ':host',
): string {
  if (!vars || typeof vars !== 'object') return ''
  const value = vars[PRIMARY_VARIABLE]
  return typeof value === 'string' ? buildToneCss(value, root) : ''
}

const LIGHT_SURFACE: RGB = { r: 255, g: 255, b: 255 }
const DARK_SURFACE: RGB = { r: 12, g: 14, b: 18 }
const MIN_ON_LIGHT = 2.0
const MIN_ON_DARK = 2.0

function relLuminance(c: RGB): number {
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
}

function contrastRatio(a: RGB, b: RGB): number {
  const la = relLuminance(a)
  const lb = relLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function resolvePrimaryColor(
  hex: string,
  doc: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): RGB | null {
  const value = normalizeHex(hex)
  if (!value) return null
  if (!doc || !doc.body || !doc.defaultView) return hexToRgb(value)

  const probe = doc.createElement('span')
  probe.style.setProperty(PRIMARY_VARIABLE, value)
  probe.style.color = 'var(--p-primary-color)'
  probe.style.display = 'none'
  doc.body.appendChild(probe)
  const computed = doc.defaultView.getComputedStyle(probe).color
  probe.remove()
  return hexToRgb(rgbStringToHex(computed) || value)
}

export type ToneLegibility = { ok: boolean; onLight: number; onDark: number; reason: string }

export function evaluateTone(hex: string): ToneLegibility | null {
  const accent = resolvePrimaryColor(hex)
  if (!accent) return null
  const onLight = contrastRatio(accent, LIGHT_SURFACE)
  const onDark = contrastRatio(accent, DARK_SURFACE)
  const okLight = onLight >= MIN_ON_LIGHT
  const okDark = onDark >= MIN_ON_DARK
  let reason = ''
  if (!okLight && !okDark) reason = 'This tone is too low-contrast - buttons and accents would be unreadable in both light and dark mode.'
  else if (!okLight) reason = 'This tone is too light - white button text and accents would be unreadable in light mode.'
  else if (!okDark) reason = 'This tone is too dark - accents would be invisible against the dark background.'
  return { ok: okLight && okDark, onLight, onDark, reason }
}
