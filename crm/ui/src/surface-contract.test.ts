import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(process.cwd(), 'src/surface.css'), 'utf8')
const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8')
const syncScript = readFileSync(resolve(process.cwd(), 'scripts/sync-static.mjs'), 'utf8')
const surfaceEntry = readFileSync(resolve(process.cwd(), 'src/surface.ts'), 'utf8')
const settingsEntry = readFileSync(resolve(process.cwd(), 'src/settings.ts'), 'utf8')

describe('CRM surface contract', () => {
  it('gives standalone admin settings an explicit bounded scroll chain', () => {
    expect(css).toMatch(/:host\s*\{[^}]*height:\s*100%[^}]*min-height:\s*0/s)
    expect(css).toMatch(/\.crm-admin-root\s*\{[^}]*height:\s*100%[^}]*min-height:\s*0[^}]*overflow:\s*hidden/s)
    expect(css).toMatch(/\.crm-settings\s*\{[^}]*height:\s*100%[^}]*min-height:\s*0[^}]*overflow:\s*auto/s)
  })

  it('uses the shared radius canon for controls and cards', () => {
    expect(css).toMatch(/\.crm-button\s*\{[^}]*border-radius:\s*8px/s)
    expect(css).toMatch(/\.crm-card\s*\{[^}]*border-radius:\s*14px/s)
    expect(css).toMatch(/\.crm-chip[^}]*border-radius:\s*6px/s)
  })

  it('does not introduce fixed brand-color hex values', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('builds and packages every registered CRM web-component entry', () => {
    for (const entry of ['create', 'settings', 'picker', 'merge', 'surface']) {
      expect(viteConfig).toContain(`${entry}: resolve`)
      expect(syncScript).toContain(`'${entry}.js'`)
    }
  })

  it('uses the shadow-safe PrimeVue dialog contract without a custom mask', () => {
    for (const entry of [surfaceEntry, settingsEntry]) {
      expect(entry).toContain('PrimeVuePlugin')
      expect(entry).toContain("'primeVueCssUrl'")
    }
    expect(css).not.toContain('.crm-mask')
    for (const component of ['RecordEditor.vue', 'SettingsFieldDialog.vue', 'SettingsObjectDialog.vue', 'SettingsPipelineDialog.vue']) {
      expect(readFileSync(resolve(process.cwd(), 'src/app', component), 'utf8')).toContain("from 'primevue/dialog'")
    }
  })
})
