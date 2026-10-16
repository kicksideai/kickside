import { describe, it, expect } from 'vitest'
import { rgbStringToHex, DEFAULT_TONE_FALLBACK, buildToneCss, buildDefaultToneCss, evaluateTone } from './appearance_tone'

describe('rgbStringToHex', () => {
  it('converts an rgb() color to #rrggbb', () => {
    expect(rgbStringToHex('rgb(34, 197, 94)')).toBe('#22c55e')
  })

  it('handles rgba(), spacing and clamps out-of-range channels', () => {
    expect(rgbStringToHex('rgba(0,0,0,1)')).toBe('#000000')
    expect(rgbStringToHex('  rgb( 255 , 255 , 255 ) ')).toBe('#ffffff')
    expect(rgbStringToHex('rgb(300, -5, 128)')).toBe('#ff0080')
  })

  it('returns null for a non-rgb color', () => {
    expect(rgbStringToHex('')).toBeNull()
    expect(rgbStringToHex('var(--p-primary-color)')).toBeNull()
    expect(rgbStringToHex('transparent')).toBeNull()
  })
})

describe('buildToneCss canonical primary seed override', () => {
  const css = buildToneCss('#c4214a', ':root')

  it('sets only the seed and leaves palette formulas facade-owned', () => {
    expect(css).toContain('--p-primary: #c4214a;')
    expect(css).not.toMatch(/--p-primary-(?:50|100|200|300|400|500|600|700|800|900|950):/)
    expect(css).not.toContain('--p-primary-color:')
  })

  it('repeats the same seed in specificity-matched forced-mode blocks', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark) { :root:not(.w-theme-light) {')
    expect(css).toContain('.w-theme-dark {')
    expect(css.match(/--p-primary: #c4214a;/g)).toHaveLength(5)
  })

  it('never redeclares the facade-owned contrast token', () => {
    expect(css).not.toContain('--p-primary-contrast-color')
    expect(buildToneCss('#c4214a', ':host')).not.toContain('--p-primary-contrast-color')
  })

  it('scopes the same seed to :host for a shadow', () => {
    expect(buildToneCss('#c4214a', ':host')).toBe(':host { --p-primary: #c4214a; }')
  })

  it('returns empty for a non-hex value', () => {
    expect(buildToneCss('not-a-color', ':root')).toBe('')
    expect(buildToneCss('', ':host')).toBe('')
  })
})

describe('buildDefaultToneCss static facade seed', () => {
  const vars = {
    '--p-primary': '#22c55e',
    '--p-primary-contrast-color': '#ffffff',
  }

  it('emits only the static seed so existing color-mix formulas recalculate', () => {
    const css = buildDefaultToneCss(vars, ':root')
    expect(css).toContain('--p-primary: #22c55e;')
    expect(css).not.toContain('--p-primary-500:')
    expect(css).not.toContain('--p-primary-contrast-color')
  })

  it('returns empty for a null map or a map without the canonical seed', () => {
    expect(buildDefaultToneCss(null, ':root')).toBe('')
    expect(buildDefaultToneCss({ '--p-primary-500': '#22c55e' }, ':root')).toBe('')
  })
})

describe('evaluateTone legibility guard', () => {
  it('admits real, saturated brand tones', () => {
    for (const hex of ['#22c55e', '#14b8a6', '#2563eb', '#c4214a', '#8b5cf6', '#ef4444']) {
      expect(evaluateTone(hex)?.ok, hex).toBe(true)
    }
  })

  it('blocks near-white tones', () => {
    for (const hex of ['#ffffff', '#f2f2f2', '#eae7dd']) {
      const result = evaluateTone(hex)
      expect(result?.ok, hex).toBe(false)
      expect(result?.reason, hex).toMatch(/too light|both/i)
    }
  })

  it('blocks near-black tones', () => {
    for (const hex of ['#000000', '#0a0a0a']) {
      const result = evaluateTone(hex)
      expect(result?.ok, hex).toBe(false)
      expect(result?.reason, hex).toMatch(/too dark|both/i)
    }
  })

  it('returns null for an empty or invalid value', () => {
    expect(evaluateTone('')).toBeNull()
    expect(evaluateTone('nope')).toBeNull()
  })
})
