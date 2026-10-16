import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { reactive } from 'vue'
import { api } from '@wippy-fe/proxy'
const pickerStyles = readFileSync(resolve(process.cwd(), 'src/trait-picker.css'), 'utf8')
const toneStyles = readFileSync(resolve(process.cwd(), '../../ui-kit/package/kx-tone.css'), 'utf8')
vi.mock('@widgets/app/AnchoredPanel.vue', () => ({
  default: { props: ['open'], template: '<div v-if="open"><slot /></div>' },
}))
vi.mock('@widgets/app/WcMount.vue', () => ({
  default: {
    props: ['tag', 'config', 'provider'],
    emits: ['change'],
    template: '<div data-testid="trait-settings" :data-tag="tag"><button data-testid="trait-settings-update" @click="$emit(\'change\', { limit: 12 })">Update</button></div>',
  },
}))
import AgentTraitPicker from './AgentTraitPicker.vue'

describe('AgentTraitPicker', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = {
      value: JSON.stringify({ traits: [], trait_contexts: {} }),
    }
    ;(globalThis as any).__events__ = []
    ;(globalThis as any).__api__ = {
      '/agents/traits': {
        success: true,
        traits: [
          {
            id: 'kickside.test:search',
            title: 'Search',
            description: 'Search public sources.',
            icon: 'tabler:search',
            affects: { tools: true, behavior: true },
            web_component: 'wc-test-trait-settings',
          },
          { id: 'kickside.test:memory', title: 'Memory', affects: { memory: true } },
        ],
      },
    }
  })

  it('loads the public trait catalog and emits the selected value and configured context', async () => {
    const callsBefore = (api.get as any).mock.calls.length
    const wrapper = mount(AgentTraitPicker)
    await flushPromises()

    expect((api.get as any).mock.calls.slice(callsBefore).map((call: any[]) => call[0]))
      .toContain('/api/v1/agents/traits')

    const search = wrapper.get('input[aria-label="Search capabilities to add"]')
    await search.trigger('focus')
    await search.setValue('Search')
    const option = wrapper.get('[role="option"]')
    expect(option.text()).toContain('Search')
    expect(option.text()).toContain('tools')
    expect(option.text()).toContain('behavior')
    await option.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('1 active')
    expect(search.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.kx-tint-behavior').exists()).toBe(true)
    expect(wrapper.find('[data-testid="trait-settings"]').exists()).toBe(true)

    await wrapper.get('[data-testid="trait-settings-update"]').trigger('click')
    await flushPromises()
    expect((globalThis as any).__events__).toContainEqual({
      name: 'change',
      detail: {
        traits: ['kickside.test:search'],
        trait_contexts: { 'kickside.test:search': { limit: 12 } },
      },
    })

    await wrapper.get('[aria-label="Hide settings"]').trigger('click')
    expect(wrapper.find('[data-testid="trait-settings"]').exists()).toBe(false)
    await wrapper.get('[aria-label="Remove Search capability"]').trigger('click')
    expect((globalThis as any).__events__).toContainEqual({
      name: 'change',
      detail: { traits: [], trait_contexts: {} },
    })
    wrapper.unmount()
  })

  it('keeps the add menu open when keep-menu-open-on-add is enabled', async () => {
    ;(globalThis as any).__props__ = {
      value: JSON.stringify({ traits: [], trait_contexts: {} }),
      keepMenuOpenOnAdd: true,
    }
    const wrapper = mount(AgentTraitPicker)
    await flushPromises()

    const search = wrapper.get('input[aria-label="Search capabilities to add"]')
    await search.trigger('focus')
    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    expect(search.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    wrapper.unmount()
  })

  it.each([
    ['blank', ''],
    ['missing', undefined],
    ['whitespace-only', '   '],
  ])('uses the neutral label when a selected trait has a %s title', async (_case, title) => {
    const id = 'kickside.test:untitled'
    const trait: Record<string, unknown> = { id }
    if (title !== undefined) trait.title = title
    ;(globalThis as any).__api__ = { '/agents/traits': { success: true, traits: [trait] } }
    ;(globalThis as any).__props__ = {
      value: JSON.stringify({ traits: [id], trait_contexts: {} }),
    }

    const wrapper = mount(AgentTraitPicker)
    await flushPromises()

    expect(wrapper.get('.kx-trait-name').text()).toContain('Unknown capability')
    expect(wrapper.get('.kx-trait-id').text()).toBe(id)
    wrapper.unmount()
  })

  it('keeps the established category tones and light/dark token pairs', () => {
    const lightTokens = toneStyles.match(/:host,\s*:root\s*\{([^}]*)\}/)?.[1] || ''
    const darkTokens = toneStyles.match(/:host\(\.w-theme-dark\),\s*:root\.w-theme-dark\s*\{([^}]*)\}/)?.[1] || ''
    for (const [tone, light, dark] of [
      ['blue', '#2563eb', '#60a5fa'],
      ['violet', '#7c3aed', '#a78bfa'],
      ['amber', '#b45309', '#fbbf24'],
    ]) {
      expect(lightTokens).toContain(`--kx-tone-${tone}: ${light};`)
      expect(darkTokens).toContain(`--kx-tone-${tone}: ${dark};`)
    }

    expect(pickerStyles).toMatch(/\.kx-tint-tools\s*\{\s*--kx-cap:\s*var\(--kx-tone-blue\);\s*\}/)
    expect(pickerStyles).toMatch(/\.kx-tint-behavior\s*\{\s*--kx-cap:\s*var\(--kx-tone-violet\);\s*\}/)
    expect(pickerStyles).toMatch(/\.kx-tint-memory\s*\{\s*--kx-cap:\s*var\(--kx-tone-amber\);\s*\}/)
    expect(pickerStyles).toMatch(/\.kx-badge-tools\s*\{[^}]*var\(--kx-tone-blue\)[^}]*13%, transparent\)/)
    expect(pickerStyles).toMatch(/\.kx-badge-behavior\s*\{[^}]*var\(--kx-tone-violet\)[^}]*13%, transparent\)/)
    expect(pickerStyles).toMatch(/\.kx-badge-memory\s*\{[^}]*var\(--kx-tone-amber\)[^}]*15%, transparent\)/)
    expect(pickerStyles).toMatch(/\.kx-trait-icon\s*\{\s*color:\s*var\(--kx-cap\);\s*background:\s*color-mix\(in srgb, var\(--kx-cap\) 14%, transparent\);\s*\}/)
  })

  it('reloads the catalog when the host increments refresh-key without remounting', async () => {
    ;(globalThis as any).__props__ = reactive({
      value: JSON.stringify({ traits: [], trait_contexts: {} }),
      refreshKey: 0,
    })
    const callsBefore = (api.get as any).mock.calls.filter((call: any[]) => call[0] === '/api/v1/agents/traits').length
    const wrapper = mount(AgentTraitPicker)
    const root = wrapper.element
    await flushPromises()
    expect((api.get as any).mock.calls.filter((call: any[]) => call[0] === '/api/v1/agents/traits')).toHaveLength(callsBefore + 1)

    ;(globalThis as any).__props__.refreshKey = 1
    await flushPromises()
    expect((api.get as any).mock.calls.filter((call: any[]) => call[0] === '/api/v1/agents/traits')).toHaveLength(callsBefore + 2)
    expect(wrapper.element).toBe(root)
    wrapper.unmount()
  })
})
