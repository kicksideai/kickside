import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import KbCreateConfig from './KbCreateConfig.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import KbTabs from './shared/KbTabs.vue'

beforeEach(() => {
  ;(globalThis as any).__kbProps__ = { config: { kb_id: 'kb1' } }
  ;(globalThis as any).__kbApi__ = {
    '/graph': { success: true, nodes: [{ id: 'root', label: 'Root', is_root: true, node_type: 'concept' }], edges: [] },
  }
})

describe('KbCreateConfig', () => {
  it('mounts the create-config form', async () => {
    ;(globalThis as any).__kbProps__ = { config: { config_schema: { fields: [] } } }
    const w = mount(KbCreateConfig)
    await flushPromises()
    expect(w.html().length).toBeGreaterThan(0)
    w.unmount()
  })
})

describe('KbTabs', () => {
  it('renders tabs and emits select on click', async () => {
    const tabs = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] as any
    const w = mount(KbTabs, { props: { tabs, active: 'a' } })
    const btns = w.findAll('button')
    expect(btns.length).toBeGreaterThanOrEqual(2)
    await btns[1].trigger('click')
    expect(w.emitted('select')?.[0]).toEqual(['b'])
    w.unmount()
  })
})

describe('ToggleSwitch', () => {
  it('emits update:modelValue when toggled', async () => {
    const w = mount(ToggleSwitch, { props: { modelValue: false } })
    await w.find('button, input, [role=switch], .ts-track, *').trigger('click').catch(() => {})
    // Click the root toggle element.
    await w.find('*').trigger('click')
    expect(w.emitted('update:modelValue')).toBeTruthy()
    w.unmount()
  })
  it('does not emit when disabled', async () => {
    const w = mount(ToggleSwitch, { props: { modelValue: false, disabled: true } })
    await w.find('*').trigger('click')
    expect(w.emitted('update:modelValue')).toBeFalsy()
    w.unmount()
  })
})
