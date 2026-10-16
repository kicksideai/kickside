import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ModelPicker from './ModelPicker.vue'

describe('ModelPicker placement', () => {
  it('delegates overlay placement to the host-configured PrimeVue Select', () => {
    const w = mount(ModelPicker)
    expect(w.findComponent({ name: 'Select' }).exists()).toBe(true)
    expect(w.find('.mp-pop').exists()).toBe(false)
    w.unmount()
  })

  it('needs no host z-index workaround — the platform top layer owns stacking', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/model-picker/styles.css'), 'utf8')
    // The overlay escapes via the browser top layer (@wippy-fe/theme PrimeVuePlugin),
    // so the host carries no z-index elevation and no data-overlay-open bridge.
    expect(css).not.toMatch(/data-overlay-open/)
    expect(css).not.toMatch(/:host[^{]*\{[^}]*z-index:/s)
  })

  it('owns the spacing between each option icon and its title stack', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/model-picker/styles.css'), 'utf8')
    expect(css).toMatch(/\.mp-opt\s*\{[^}]*display:\s*flex[^}]*gap:\s*var\(--kx-picker-option-icon-gap\)/s)
  })
})
