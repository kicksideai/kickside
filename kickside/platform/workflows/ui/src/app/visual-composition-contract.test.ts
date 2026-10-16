import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const css = (name: string) => fs.readFileSync(new URL(`../styles/${name}`, import.meta.url), 'utf8')
const component = (name: string) => fs.readFileSync(new URL(`./canvas/${name}`, import.meta.url), 'utf8')

describe('workflow visual composition contract', () => {
  it('wraps long intent identifiers instead of clipping them', () => {
    const canvas = css('canvas.css')
    expect(canvas).toMatch(/\.wf-intent-(?:src|tgt)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s)
  })

  it('keeps the minimap compact and removes it from constrained canvases', () => {
    const flow = css('vueflow.css')
    expect(component('WorkflowCanvasView.vue')).toMatch(/<MiniMap[^>]*:width="150"[^>]*:height="96"/s)
    expect(flow).toMatch(/@container \(max-width:\s*1180px\)[\s\S]*\.vue-flow__minimap\s*\{[^}]*display:\s*none/s)
  })

  it('uses a stronger neutral edge in dark mode without turning valid topology into status color', () => {
    const flow = css('vueflow.css')
    expect(flow).toContain('[data-theme="dark"] .vue-flow__edge-path')
  })

  it('renders AI schema review as an inline state instead of a rounded tinted card', () => {
    const schema = css('schema.css')
    expect(schema).toMatch(/\.wf-sed-draft\s*\{[^}]*border-radius:\s*0/s)
    expect(schema).not.toMatch(/\.wf-sed-(?:undo|accept)\s*\{[^}]*border(?:-color)?:/s)
  })

  it('does not recreate standard checkbox interaction states in module CSS', () => {
    const nodes = css('nodes.css')
    expect(nodes).not.toMatch(/\.wf-setup-check\s+input/)
    expect(nodes).not.toContain('appearance:')
  })

  it('does not recreate failure-route checkbox appearance in module CSS', () => {
    const panels = css('panels.css')
    expect(panels).not.toMatch(/\.wf-failroute\s+input/)
    expect(panels).not.toContain('appearance:')
  })

  it('keeps the PrimeVue inspector close button pinned to the panel corner', () => {
    const panels = css('panels.css')
    expect(panels).toMatch(/\.wf-panel\s*>\s*\.wf-panel-close\s*\{[^}]*position:\s*absolute[^}]*top:\s*10px[^}]*right:\s*10px/s)
  })

  it('renders editor command failures as a flush top strip', () => {
    const controls = css('controls.css')
    expect(controls).toMatch(/\.wf-banner\.wf-banner--error\s*\{[^}]*margin:\s*0\s*;/s)
    expect(controls).toMatch(/\.wf-banner\.wf-banner--error\s*\{[^}]*border-radius:\s*0\s*;/s)
  })

  it('scrolls the past runs list instead of shrinking its rows over each other', () => {
    const runs = css('runs.css')
    expect(runs).toMatch(/\.wf-runs-list\s*\{[^}]*overflow-y:\s*auto/s)
    expect(runs).toMatch(/\.wf-runs-row\s*\{[^}]*flex:\s*none/s)
  })

  it('contains the step search within the palette rail', () => {
    const list = css('list.css')
    const palette = css('palette.css')
    expect(list).not.toContain('.wf-palette-search')
    expect(list).not.toMatch(/\.wf-search(?:\s+input)?\s*\{[^}]*width:\s*100%/s)
    expect(palette).toMatch(/\.wf-palette-search\s*\{[^}]*display:\s*flex[^}]*margin:\s*10px\s*;/s)
    expect(palette).toMatch(/\.wf-palette-search\s*>\s*input\s*\{[^}]*flex:\s*1 1 auto[^}]*min-width:\s*0/s)
    expect(palette).not.toMatch(/\.wf-palette-search(?:\s*>\s*input)?\s*\{[^}]*width:\s*100%/s)
    expect(palette).toMatch(/button\.wf-palette-cat\s*\{[^}]*grid-template-columns:\s*13px minmax\(0, 1fr\) auto/s)
    expect(palette).toMatch(/button\.wf-palette-subcat\s*\{[^}]*grid-template-columns:\s*12px minmax\(0, 1fr\) auto/s)
    expect(palette).toMatch(/\.wf-palette-count\s*\{[^}]*justify-self:\s*end/s)
    expect(palette).toMatch(/button\.wf-palette-item\s*\{[^}]*justify-content:\s*flex-start/s)
    expect(palette).toMatch(/\.wf-palette-ico\s*\{[^}]*width:\s*30px[^}]*flex:\s*none/s)
    expect(palette).toMatch(/\.wf-palette-item-body\s*\{[^}]*flex:\s*1/s)
  })

  it('keeps dialog errors separated without flattening PrimeVue message corners', () => {
    const runs = css('runs.css')
    expect(runs).toMatch(/\.wf-sim-err\s*\{[^}]*margin:\s*8px 0 0/s)
    expect(runs).not.toMatch(/\.wf-sim-err\s*\{[^}]*border-radius:\s*0/s)
  })

  it('keeps canvas cards quiet, hue-led, and topology-aware', () => {
    const nodes = css('nodes.css')
    expect(nodes).toMatch(/\.wfn\s*\{[^}]*border:\s*1\.5px solid[^}]*background:\s*color-mix/s)
    expect(nodes).toMatch(/\.wfn--selected\s*\{[^}]*box-shadow:[^}]*var\(--wf-elev-2\)/s)
    expect(nodes).not.toContain('repeating-linear-gradient(90deg')
    // Start/Finish/Error read as locked (lock badge + muted contract palette), never as
    // a half-pill shape — no boundary selector overrides the card's own border-radius.
    expect(nodes).not.toMatch(/\.wfn--boundary-(?:start|finish|error)[^{]*\{[^}]*border-radius:\s*999px/s)
    expect(nodes).toMatch(/\.wfn-await\s*\{[^}]*right:\s*12px[^}]*background:\s*var\(--wf-panel\)/s)
    // A run-result mark is a badge on the icon tile (an avatar presence dot), not a
    // detached bubble floating over the card's own header/lock area.
    expect(nodes).toMatch(/\.wfn-well\s*\{[^}]*position:\s*relative/s)
    expect(nodes).toMatch(/\.wfn-status\s*\{[^}]*position:\s*absolute[^}]*bottom:\s*-4px[^}]*right:\s*-4px/s)
    expect(nodes).not.toMatch(/\.wfn-check\b/)
    expect(nodes).not.toMatch(/\.wfn-fail\b/)
  })
})
