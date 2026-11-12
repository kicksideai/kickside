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

it.each(['before', 'after'])('keeps the requested focus treatment when theme CSS loads %s', (order) => {
  const kit = document.createElement('style')
  kit.textContent = read('focus.css')
  const theme = document.createElement('style')
  theme.textContent = '.p-button:focus-visible { outline: 1px solid red; box-shadow: 0 0 0 3px red; }'
  document.head.append(...(order === 'before' ? [theme, kit] : [kit, theme]))
  const button = document.createElement('button')
  button.style.cssText = '--p-focus-ring-color: blue; --p-focus-ring-shadow: 0 0 0 2px blue; --p-focus-ring-width: 2px; --p-focus-ring-style: solid; --p-focus-ring-offset: 2px;'
  document.body.append(button)
  try {
    button.className = 'p-button kx-focus-halo'
    button.focus()
    expect(getComputedStyle(button).outlineStyle).toBe('none')
    expect(getComputedStyle(button).boxShadow).toBe('0 0 0 2px blue')
    button.className = 'p-button kx-focus-outline'
    expect(getComputedStyle(button).outlineWidth).toBe('2px')
    expect(getComputedStyle(button).boxShadow).toBe('none')
  } finally {
    button.remove()
    kit.remove()
    theme.remove()
  }
})
