// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CapabilityPicker from './CapabilityPicker.vue'

const traits = [
  { id: 'test:memory', title: 'Memory', description: 'Remember useful context.', prompt: 'Consult memory.',
    web_component: 'wc-memory-settings', tools: ['test:recall'],
    tool_details: [{ id: 'test:recall', title: 'Recall memory', llm_description: 'Search the selected memory.' }] },
  { id: 'test:search', title: 'Search', description: 'Search documents.' },
]
describe('selected capability details', () => {
  it('consumes Escape while the capability menu is open and bubbles it when closed', async () => {
    const wrapper = mount(CapabilityPicker, { props: { traits, tools: [], selected: [] } })
    let escaped = 0
    wrapper.element.addEventListener('keydown', () => { escaped += 1 })
    const input = wrapper.get('[role="combobox"]')
    await input.trigger('focus')
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    input.element.dispatchEvent(escape)
    await wrapper.vm.$nextTick()
    expect(escape.defaultPrevented).toBe(true)
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(escaped).toBe(0)
    await input.trigger('keydown', { key: 'Escape' })
    expect(escaped).toBe(1)
    wrapper.unmount()
  })

  it('returns focus to the search input with the add menu closed', async () => {
    const wrapper = mount(CapabilityPicker, { attachTo: document.body,
      props: { traits, tools: [], selected: [] } })
    const input = wrapper.get<HTMLInputElement>('[role="combobox"]')
    input.element.focus()
    await input.trigger('input')
    const option = wrapper.findAll<HTMLElement>('[role="option"]')[0]
    option.element.focus()
    await option.trigger('click')
    expect(document.activeElement).toBe(input.element)
    expect(input.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })
  it('starts folded per capability and keeps required configuration mounted across toggles', async () => {
    const wrapper = mount(CapabilityPicker, { props: { traits, tools: [], selected: traits.map(t => t.id) },
      slots: { config: '<input v-if="params.trait.web_component" aria-label="Memory selection" />' } })
    const rows = wrapper.findAll('.kx-trait')
    expect(rows[0].text()).not.toContain(traits[0].description)
    expect(rows[0].find('[aria-label="Declared tools"]').exists()).toBe(false)
    const input = rows[0].get('input')
    await input.setValue('Project memory')
    await rows[0].get('.kx-trait-fold').trigger('click')
    expect(rows[0].text()).toContain(traits[0].description)
    expect(rows[0].text()).toContain(traits[0].prompt)
    expect(rows[0].get('[data-declared-tool-id="test:recall"]').text()).toContain('Search the selected memory.')
    expect(rows[1].text()).not.toContain(traits[1].description)
    await rows[0].get('.kx-trait-fold').trigger('click')
    expect(rows[0].get('input').element).toBe(input.element)
    expect((input.element as HTMLInputElement).value).toBe('Project memory')
    await rows[0].get('.kx-trait-fold').trigger('click')
    await rows[0].get('[aria-label="Remove Memory capability"]').trigger('click')
    await wrapper.setProps({ selected: ['test:search'] })
    await wrapper.setProps({ selected: traits.map(t => t.id) })
    expect(wrapper.findAll('.kx-trait')[0].get('.kx-trait-fold').attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })
})
