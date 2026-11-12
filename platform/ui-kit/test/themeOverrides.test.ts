// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

const read = (name: string) => readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../package', name), 'utf8')

it.each(['before', 'after'])('keeps decorative tag colors when theme CSS loads %s', (order) => {
  const kit = document.createElement('style')
  kit.textContent = read('kx-tone.css')
  const theme = document.createElement('style')
  theme.textContent = '.p-tag { color: rgb(0, 0, 0); background: transparent; }'
  document.head.append(...(order === 'before' ? [theme, kit] : [kit, theme]))
  const root = document.createElement('div')
  root.style.cssText = '--p-text-muted-color: rgb(90, 90, 90); --p-text-color: rgb(30, 30, 30);'
  document.body.append(root)
  try {
    for (const tone of ['blue', 'violet', 'amber', 'neutral']) {
      root.innerHTML = `<span class="kx-tone-${tone}">Category</span><span class="p-tag kx-tone-${tone}">Category</span>`
      const [native, tag] = Array.from(root.children).map(el => getComputedStyle(el))
      expect(tag.color).toBe(native.color)
    }
  } finally {
    root.remove()
    kit.remove()
    theme.remove()
  }
})

// Happy DOM drops color-mix() declarations; keep the derived-fill contract here.
it.each(['blue', 'violet', 'amber', 'neutral'])('keeps the %s tone fill with its foreground override', (tone) => {
  const css = read('kx-tone.css')
  const selector = `.kx-tone-${tone}.kx-tone-${tone}`
  const rule = css.slice(css.indexOf(selector)).split('}')[0]
  expect(rule.startsWith(`${selector} {`)).toBe(true)
  const ink = tone === 'neutral' ? '--p-text-muted-color' : `--kx-tone-${tone}`
  const fill = tone === 'neutral' ? '--p-text-color' : ink
  const weight = tone === 'neutral' ? 10 : 13
  expect(rule).toContain(`color: var(${ink});`)
  expect(rule).toContain(`background-color: color-mix(in srgb, var(${fill}) ${weight}%, transparent);`)
})
