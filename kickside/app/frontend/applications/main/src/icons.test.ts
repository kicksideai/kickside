import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'

vi.unmock('@iconify/vue')
import { getIcon, listIcons } from '@iconify/vue'
import tabler from '@iconify-json/tabler/icons.json'
import { registerShellIcons } from './icons'

function referencedIcons(directory: string): Set<string> {
  const icons = new Set<string>()
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      for (const icon of referencedIcons(path)) icons.add(icon)
    } else if (/\.(vue|ts)$/.test(entry.name) && !/\.(test|spec|d)\.ts$/.test(entry.name)) {
      for (const match of readFileSync(path, 'utf8').matchAll(/tabler:[a-z0-9-]+/g)) icons.add(match[0])
    }
  }
  return icons
}

describe('local shell icons', () => {
  it('resolves every canonical icon referenced by shell source from registered data', () => {
    registerShellIcons()
    const icons = new Set(Object.keys(tabler.icons).map(name => 'tabler:' + name))
    for (const name of Object.keys(tabler.aliases ?? {})) icons.add('tabler:' + name)
    expect(icons.size).toBeGreaterThan(30)
    expect(listIcons('', 'tabler').sort()).toEqual([...icons].sort())
    for (const icon of referencedIcons(fileURLToPath(new URL('.', import.meta.url)))) icons.add(icon)
    for (const icon of icons) expect(getIcon(icon), icon).not.toBeNull()
  })

  it('preserves configured custom icon bodies and geometry', () => {
    const icon = { body: '<path d="M0 0h16v16H0z" />', width: 16, height: 16, hFlip: true }
    registerShellIcons({ 'tenant-glyph': icon })
    expect(getIcon('custom:tenant-glyph')).toMatchObject(icon)
  })
})
