import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = (name: string) => readFileSync(join(process.cwd(), 'src/styles', name), 'utf8')

describe('machine-derived text containment', () => {
  it('bounds long intent expressions and registry field names', () => {
    const css = styles('canvas.css')
    expect(css).toMatch(/\.wf-intent-needs[^}]*overflow-wrap:\s*anywhere/s)
    expect(css).toMatch(/\.wf-intent-err[^}]*overflow-wrap:\s*anywhere/s)
    expect(css).toMatch(/\.wf-intent-raw[^}]*max-height:\s*180px[^}]*overflow:\s*auto[^}]*overflow-wrap:\s*anywhere/s)
  })

  it('contains workflow error text in panels, banners, and embedded hosts', () => {
    expect(styles('nodes.css')).toMatch(/\.wf-setup-error\s*\{\s*margin[^}]*overflow-wrap:\s*anywhere/s)
    expect(styles('controls.css')).toMatch(/\.wf-banner[^}]*overflow-wrap:\s*anywhere/s)
    expect(styles('embed.css')).toMatch(/\.wf-embed-err[^}]*overflow-wrap:\s*anywhere/s)
  })
})
