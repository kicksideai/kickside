import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8')
const form = readFileSync(resolve(process.cwd(), 'src/app/AgentForm.vue'), 'utf8')

describe('agent dialog content geometry contract', () => {
  it('makes panes own spacing instead of inheriting the generic dialog gutter', () => {
    expect(css).toMatch(/\.kx-modal-agent\s*\{[^}]*--p-dialog-content-padding:\s*0;/s)
    expect(css).toMatch(/\.kx-modal\.kx-modal-agent\s*>\s*\.kx-modal-content\s*\{[^}]*padding:\s*0;/s)
    expect(form).toContain("content: { class: 'kx-modal-content' }")
  })

  it('does not reach into PrimeVue internals to override the wrapper', () => {
    expect(css).not.toMatch(/\.p-dialog-content\s*\{/)
    expect(css).not.toMatch(/!important\s*[;}]/)
  })
})
