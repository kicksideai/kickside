/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

describe('compact application shell', () => {
  it('automatically gives content the icon rail at phone widths without overwriting the saved preference', () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'app/app.vue'), 'utf8')
    expect(source).toContain("window.matchMedia('(max-width: 640px)')")
    expect(source).toContain('const railCollapsed = computed(() => collapsed.value || narrowSidebar.value)')
    expect(source).toContain(":class=\"railCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'\"")
    expect(source).toMatch(/function expand\(\)\s*\{[\s\S]*if \(narrowSidebar\.value\) return/)
    expect(source).not.toContain('localStorage.setItem(COLLAPSE_KEY, narrowSidebar')
  })
})
