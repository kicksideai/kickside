import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/agent-block-config.css'), 'utf8')
const component = readFileSync(resolve(process.cwd(), 'src/app/AgentBlockConfig.vue'), 'utf8')
const entry = readFileSync(resolve(process.cwd(), 'src/agent_block_config.ts'), 'utf8')

describe('Agent Block shadow-root style contract', () => {
  it('injects the configuration layout rules with the custom-element stylesheet', () => {
    expect(entry).toContain("import stylesText from './agent-block-config.css?inline'")
    expect(entry).toContain('inlineCss: stylesText')
    expect(css).toMatch(/\.kx-agent-block\s*\{[^}]*display:\s*grid;/s)
    expect(css).toMatch(/\.kx-agent-block__field\s*\{[^}]*display:\s*grid;/s)
    expect(css).toMatch(/\.kx-agent-block__control\s*\{[^}]*width:\s*100%;/s)
    expect(component).toContain("from 'primevue/radiobutton'")
    expect(component).toContain("from 'primevue/inputtext'")
    expect(component).toContain("from 'primevue/textarea'")
    expect(component).toContain("from 'primevue/select'")
    expect(component).not.toMatch(/<input\b|<textarea\b|<select\b/)
  })

  it('does not leave the shadow-root layout in extracted SFC CSS', () => {
    expect(component).not.toContain('<style')
  })
})
