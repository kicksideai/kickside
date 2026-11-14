// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() } }))
const Palette = (await import('./Palette.vue')).default

describe('Palette disclosure semantics', () => {
  it('exposes its stable id and category expanded state', async () => {
    const wrapper = mount(Palette, { props: { items: [{
      paletteId: 'block:test.blocks:search', kind: 'block', category: 'Blocks', title: 'Search', subtitle: '', icon: 'tabler:search',
    }], loading: false, errors: [] } })
    expect(wrapper.find('#workflow-step-palette').exists()).toBe(true)
    const blocks = wrapper.findAll('.wf-palette-cat').find((button) => button.text().includes('Blocks'))!
    expect(blocks.attributes('aria-expanded')).toBe('true')
    expect(blocks.attributes('data-p')).toContain('text')
    expect(blocks.attributes('data-p-severity')).toBe('secondary')
    const item = wrapper.get('.wf-palette-item')
    expect(item.attributes('data-p')).toContain('text')
    expect(item.attributes('data-p-severity')).toBe('secondary')
    await blocks.trigger('click')
    expect(blocks.attributes('aria-expanded')).toBe('false')
  })
})
