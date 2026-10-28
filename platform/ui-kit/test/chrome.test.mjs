// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../', import.meta.url)
const sheets = ['kx-shell.css', 'kx-controls.css', 'kx-overlay.css', 'kx-state.css']
const read = name => readFileSync(new URL(`package/${name}`, root), 'utf8')

test('chrome sheets ship as package exports and files', () => {
  const pkg = JSON.parse(read('package.json'))
  for (const sheet of sheets) {
    assert.equal(pkg.exports[`./${sheet}`], `./${sheet}`)
    assert.ok(pkg.files.includes(sheet))
    assert.ok(read(sheet).length > 0)
  }
})

test('chrome colors and focus use the theme contract', () => {
  for (const sheet of sheets) {
    const css = read(sheet).replace(/\/\*[\s\S]*?\*\//g, '')
    assert.doesNotMatch(css, /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:white|black|red|blue|green)(?![\w-])/i, sheet)
    assert.doesNotMatch(css, /--kb-/, sheet)
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
      if (!selector.includes(':focus')) continue
      for (const [, property, value] of body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
        if (!/^(outline(?:-\w+)?|box-shadow|border-color)$/.test(property)) continue
        assert.ok(/^(none|0)$/.test(value.trim()) || value.includes('var(--p-focus-ring-'), `${sheet}: ${property}: ${value}`)
      }
    }
  }
})

test('surface state defaults remain available alongside opt-in layouts', () => {
  const css = read('kx-state.css')
  assert.match(css, /\.kx-empty\s*\{[^}]*padding:\s*44px 24px/s)
  assert.match(css, /\.kx-loading\s*\{[^}]*padding:\s*24px/s)
  assert.match(css, /\.kx-empty\.kx-empty-spacious/)
  assert.match(css, /\.kx-loading\.kx-loading-centered/)
  assert.doesNotMatch(css, /\.kc-|\.es(?:[\s.{:-])/)
})

test('native primary action states use paired palette tokens', () => {
  const css = read('kx-controls.css')
  assert.match(css, /\.kx-btn-primary\s*\{[^}]*background:\s*var\(--p-primary-color\);[^}]*color:\s*var\(--p-button-primary-color\);/s)
  assert.match(css, /\.kx-btn-primary:hover:not\(:disabled\)\s*\{[^}]*background:\s*var\(--p-primary-hover-color\);[^}]*color:\s*var\(--p-button-primary-hover-color\);/s)
  assert.match(css, /\.kx-btn-primary:active:not\(:disabled\)\s*\{[^}]*background:\s*var\(--p-primary-active-color\);[^}]*color:\s*var\(--p-button-primary-active-color\);/s)
  const primaryRules = css.match(/\.kx-btn-primary[^}]*\{[^}]*\}/gs)?.join('') ?? ''
  assert.doesNotMatch(primaryRules, /brightness\(/)
})
