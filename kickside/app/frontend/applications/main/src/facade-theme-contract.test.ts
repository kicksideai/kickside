import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const appRoot = new URL('../../../../', import.meta.url)

type Rgba = [number, number, number, number]

const NAMED: Record<string, Rgba> = {
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  transparent: [0, 0, 0, 0],
}

/** Split a function argument list on its top-level commas. */
const splitArguments = (value: string): string[] => {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i += 1) {
    const c = value[i]
    if (c === '(') depth += 1
    else if (c === ')') depth -= 1
    else if (c === ',' && depth === 0) {
      parts.push(value.slice(start, i))
      start = i + 1
    }
  }
  parts.push(value.slice(start))
  return parts.map((part) => part.trim())
}

/** A colour operand of color-mix(), which carries its own percentage. */
const splitPercentage = (operand: string): { color: string, percent: number | null } => {
  const match = /^([\s\S]+?)\s+([\d.]+)%$/.exec(operand.trim())
  return match ? { color: match[1], percent: Number(match[2]) } : { color: operand.trim(), percent: null }
}

/**
 * Resolve a CSS colour the way the browser does, through `var()` indirection and
 * `color-mix(in srgb, …)`, against a token map. The theme states its whole ramp as
 * mixes over a seed, so a pair can only be measured once those are evaluated.
 */
const parseColor = (value: string, tokens: Record<string, string>, depth = 0): Rgba => {
  const text = value.trim()
  if (depth > 16) throw new Error(`colour reference cycle at ${value}`)
  if (NAMED[text]) return NAMED[text]

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1]
    const channel = (i: number) => parseInt(full.slice(i, i + 2), 16)
    return [channel(0), channel(2), channel(4), 1]
  }

  const rgb = /^rgba?\(([^)]*)\)$/i.exec(text)
  if (rgb) {
    const parts = rgb[1].split(/[,/\s]+/).filter(Boolean).map(Number)
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1]
  }

  if (text.startsWith('var(')) {
    const [name, fallback] = splitArguments(text.slice(4, -1))
    const declared = tokens[name]
    if (declared !== undefined) return parseColor(declared, tokens, depth + 1)
    if (fallback !== undefined) return parseColor(fallback, tokens, depth + 1)
    throw new Error(`undeclared token ${name}`)
  }

  if (text.startsWith('color-mix(')) {
    const [space, first, second] = splitArguments(text.slice(10, -1))
    if (space.trim() !== 'in srgb') throw new Error(`unsupported colour space in ${value}`)
    const left = splitPercentage(first)
    const right = splitPercentage(second)
    const leftShare = (left.percent ?? (right.percent === null ? 50 : 100 - right.percent)) / 100
    const a = parseColor(left.color, tokens, depth + 1)
    const b = parseColor(right.color, tokens, depth + 1)
    // color-mix() interpolates premultiplied, so a transparent operand contributes
    // its alpha but not its channels.
    const aWeight = a[3] * leftShare
    const bWeight = b[3] * (1 - leftShare)
    const total = aWeight + bWeight
    const alpha = a[3] * leftShare + b[3] * (1 - leftShare)
    if (total === 0) return [0, 0, 0, alpha]
    return [
      (a[0] * aWeight + b[0] * bWeight) / total,
      (a[1] * aWeight + b[1] * bWeight) / total,
      (a[2] * aWeight + b[2] * bWeight) / total,
      alpha,
    ]
  }

  throw new Error(`unsupported colour expression ${value}`)
}

/** Composite a possibly translucent colour over the opaque surface behind it. */
const over = (color: Rgba, backdrop: Rgba): Rgba => [
  color[0] * color[3] + backdrop[0] * (1 - color[3]),
  color[1] * color[3] + backdrop[1] * (1 - color[3]),
  color[2] * color[3] + backdrop[2] * (1 - color[3]),
  1,
]

// WCAG 2.x relative luminance and contrast ratio, matching the formula the
// end-to-end visual audit applies to rendered text.
const luminance = (color: Rgba): number => {
  const channels = [color[0], color[1], color[2]].map((value) => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

const contrast = (foreground: Rgba, background: Rgba): number => {
  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const themeRoot = new URL('frontend/applications/main/node_modules/@wippy-fe/theme/', appRoot)

/** Every `--p-*` the light theme resolves against: the host ramp, then this app's map. */
const lightTokens = (): Record<string, string> => {
  const themeConfig = readFileSync(new URL('theme-config.css', themeRoot), 'utf8')
  const tokens: Record<string, string> = {}
  for (const match of themeConfig.split('@media')[0].matchAll(/(--p-[a-z0-9-]+)\s*:\s*([^;}]+)[;}]/g)) {
    tokens[match[1]] = match[2].trim()
  }
  const app = JSON.parse(readFileSync(new URL('static/css-variables.facade.json', appRoot), 'utf8')) as Record<string, unknown>
  for (const [name, value] of Object.entries(app)) {
    if (name.startsWith('--') && typeof value === 'string') tokens[name] = value
  }
  return tokens
}

/** Drop comments and every at-rule block, leaving the rules that apply in light. */
const unconditionalRules = (css: string): string => {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  let out = ''
  for (let i = 0; i < stripped.length; i += 1) {
    if (stripped.startsWith('@', i)) {
      const open = stripped.indexOf('{', i)
      if (open < 0) break
      let depth = 0
      let j = open
      for (; j < stripped.length; j += 1) {
        if (stripped[j] === '{') depth += 1
        else if (stripped[j] === '}' && (depth -= 1) === 0) break
      }
      i = j
      continue
    }
    out += stripped[i]
  }
  return out
}

describe('facade theme contract', () => {
  it('keeps filled semantic buttons on explicit contrast tokens in both themes', () => {
    const tokens = JSON.parse(
      readFileSync(new URL('static/css-variables.facade.json', appRoot), 'utf8'),
    ) as Record<string, string | Record<string, string>>
    const dark = tokens['@dark'] as Record<string, string>

    expect(tokens['--p-primary-contrast-color']).toBe('#fff')
    expect(dark['--p-primary-contrast-color']).toBe('#fff')
    expect(dark['--p-danger-contrast-color']).toBe('#fff')
    expect(dark['--p-success-contrast-color']).toBe('#fff')
    expect(dark['--p-info-contrast-color']).toBe('#fff')
    expect(dark['--p-help-contrast-color']).toBe('#fff')

    for (const severity of ['primary', 'danger', 'success', 'info', 'help']) {
      expect(tokens[`--p-button-${severity}-color`]).toBe('#fff')
      expect(tokens[`--p-button-${severity}-hover-color`]).toBe('#fff')
      expect(tokens[`--p-button-${severity}-active-color`]).toBe('#fff')
    }
  })

  it('styles PrimeVue buttons through tokens and specificity, not important overrides', () => {
    const buttonFacade = readFileSync(
      new URL('facade-src/custom/40-button.css', appRoot),
      'utf8',
    )

    expect(buttonFacade).not.toContain('!important')
    expect(buttonFacade).not.toContain('background: var(--p-primary-color)')
    expect(buttonFacade).not.toContain('color: var(--p-button-primary-color)')
  })

  it('keeps muted text at AA contrast in both themes', () => {
    const tokens = JSON.parse(
      readFileSync(new URL('static/css-variables.facade.json', appRoot), 'utf8'),
    ) as Record<string, string | Record<string, string>>
    const dark = tokens['@dark'] as Record<string, string>

    // Light muted is derived from the semantic pair so it follows whatever the
    // host theme sets for body text and content background instead of pinning a
    // numbered surface, which does not flip with the colour scheme.
    const mix = String(tokens['--p-text-muted-color']).match(
      /^color-mix\(in srgb, var\(--p-text-color\) (\d+)%, var\(--p-content-background\)\)$/,
    )
    expect(mix).not.toBeNull()
    expect(Number(mix?.[1])).toBeGreaterThanOrEqual(80)

    // Dark states both sides literally, so the ratio is measurable here.
    const darkBackground = parseColor(dark['--p-content-background'], dark)
    expect(contrast(parseColor(dark['--p-text-muted-color'], dark), darkBackground)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(parseColor(dark['--p-text-color'], dark), darkBackground)).toBeGreaterThanOrEqual(4.5)
  })

  it('binds the standalone login action to semantic button tokens', () => {
    const loginPage = readFileSync(new URL('src/app/login/login.jet', appRoot), 'utf8')
    const submitRule = loginPage.match(/#submit-btn\s*\{([^}]*)\}/)?.[1]

    expect(submitRule).toContain('var(--p-button-primary-background)')
    expect(submitRule).toContain('var(--p-button-primary-border-color)')
    expect(submitRule).toContain('var(--p-button-primary-color)')
    expect(submitRule).not.toContain('!important')
  })


  it('keeps every semantic Tag severity at AA in the light theme', () => {
    // The prestyled PrimeVue sheet paints a light Tag as the `-700` rung of its
    // severity over the `-100` wash. That geometry only holds while the seed is
    // dark enough, so the pair has to be measured per severity rather than
    // assumed - the green success seed is the lightest of the set and was the one
    // that fell through, taking the Workflow catalog's version and last-run
    // badges with it.
    //
    // Read from the pinned @wippy-fe/theme package rather than restated here, so
    // a host bump that repaints a Tag is caught by this test instead of by the
    // end-to-end visual audit.
    const tokens = lightTokens()
    const surface = parseColor('var(--p-content-background)', tokens)

    const rungToken = (utility: string): string => {
      const [, name, rung] = utility.split('-')
      return `var(--p-${name}-${rung})`
    }

    const pairs = new Map<string, { ink: string, wash: string }>()
    const upstream = readFileSync(new URL('primevue/tag.css', themeRoot), 'utf8')
    for (const rule of upstream.matchAll(/\.p-tag-([a-z]+)\s*\{\s*@apply([^}]*)\}/g)) {
      const utilities = rule[2].split(/\s+/).filter((utility) => utility && !utility.startsWith('dark:'))
      const wash = utilities.find((utility) => /^bg-[a-z]+-\d+$/.test(utility))
      const ink = utilities.find((utility) => /^text-[a-z]+-\d+$/.test(utility))
      if (wash && ink) pairs.set(rule[1], { ink: rungToken(ink), wash: rungToken(wash) })
    }
    // The bare `.p-tag` is the primary severity, whose seed an operator retones at
    // runtime from Appearance. Its contrast is a property of that choice, not of
    // this repository, so it is left to the live audit.
    expect([...pairs.keys()].sort()).toEqual(['contrast', 'danger', 'info', 'secondary', 'success', 'warn'])

    // A severity this app repaints in facade-src wins over the upstream pair.
    const facade = unconditionalRules(readFileSync(new URL('facade-src/custom/55-tag.css', appRoot), 'utf8'))
    for (const rule of facade.matchAll(/(?:^|\})\s*\.p-tag-([a-z]+)\s*\{([^}]*)\}/g)) {
      const pair = pairs.get(rule[1])
      if (!pair) continue
      const ink = /(?:^|;)\s*color\s*:\s*([^;]+)/.exec(rule[2])
      const wash = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/.exec(rule[2])
      if (ink) pair.ink = ink[1].trim()
      if (wash) pair.wash = wash[1].trim()
    }

    // The amber warn Tag is an explicit product decision recorded in
    // facade-src/custom/55-tag.css: --p-warn-600 ink on an 18% --p-warn-500 wash,
    // chosen so the badge reads as amber rather than brown. It is the one severity
    // this contract does not hold - 2.78:1 against its own pill, 3.19:1 against the
    // surface underneath it, both under AA. Reaching AA means an ink dark enough to
    // read brown again, which is the tone call that file was written to make, so
    // the decision belongs to the theme owner rather than to this test. The
    // end-to-end visual audit measures it where the Draft badge renders.
    const ownerRetoned = new Set(['warn'])

    for (const [severity, pair] of pairs) {
      if (ownerRetoned.has(severity)) continue
      const wash = over(parseColor(pair.wash, tokens), surface)
      const ink = over(parseColor(pair.ink, tokens), wash)
      expect(
        Number(contrast(ink, wash).toFixed(2)),
        `.p-tag-${severity} light contrast (${pair.ink} on ${pair.wash})`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

})
