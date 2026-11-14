import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { webComponent } from '../agent_picker'
import WcMount from '@widgets/app/WcMount.vue'

vi.mock('@wippy-fe/webcomponent-vue', async importOriginal => ({
  ...await importOriginal<typeof import('@wippy-fe/webcomponent-vue')>(),
  define: vi.fn(),
}))
vi.mock('@wippy-fe/proxy', () => ({
  loadByTagName: vi.fn(async () => {}),
  addIcons: vi.fn(),
  applyThemeMode: vi.fn(),
  define: vi.fn(),
  config: {},
  host: {},
  on: vi.fn(() => vi.fn()),
  hostCss: { themeConfigUrl: '/theme.css', primeVueCssUrl: '/primevue.css' },
  loadCss: vi.fn(async () => ''),
}))

vi.mock('@iconify/vue', () => ({ addCollection: vi.fn(), Icon: { template: '<span />' } }))

const AgentPickerElement = await webComponent()
// happy-dom omits ElementInternals; the picker uses only its state set.
customElements.define('wc-agent-picker', class extends AgentPickerElement {
  attachInternals(): ElementInternals { return { states: new Set<string>() } as unknown as ElementInternals }
})
customElements.define('wc-multiselect', class extends HTMLElement {})

const agentId = 'user_agent:example-agent'
const schema = { properties: { agent_id: { type: 'string', required: true, picker: 'wc-agent-picker' } } }

async function mountPicker(config: Record<string, unknown>, pickerSchema: { properties: Record<string, { type: string; required: boolean; picker: string }> } = schema) {
  const wrapper = mount(WcMount, { attachTo: document.body, props: { tag: 'wc-agent-picker', config, schema: pickerSchema } })
  await flushPromises()
  const element = wrapper.get('wc-agent-picker').element
  const select = element.shadowRoot?.querySelector('wc-multiselect')
  expect(select).toBeTruthy()
  return { wrapper, element, select: select! }
}

function choose(select: Element, selected: string[]) {
  select.dispatchEvent(new CustomEvent('change', { detail: { selected, labels: ['Example agent'] }, bubbles: true, composed: true }))
}

describe('AgentPicker config-host contract', () => {
  it('uses single selection and merges only the keyed agent reference into host config', async () => {
    const { wrapper, element, select } = await mountPicker({})
    expect(element.getAttribute('config')).toBe('{}')
    expect(JSON.parse(element.getAttribute('schema')!)).toEqual(schema)
    expect(select.getAttribute('multi')).toBe('false')
    choose(select, [agentId])
    await flushPromises()
    expect(wrapper.emitted('change')).toEqual([[{ agent_id: agentId }]])
    expect({ ...{}, ...wrapper.emitted('change')![0][0] as object }).toEqual({ agent_id: agentId })
    wrapper.unmount()
  })

  it('preselects the stored agent and follows config updates on the same element', async () => {
    const { wrapper, element, select } = await mountPicker({ agent_id: agentId })
    expect(JSON.parse(select.getAttribute('selected')!)).toEqual([agentId])
    await wrapper.setProps({ config: { agent_id: 'fixture.agents:another' } })
    await flushPromises()
    expect(wrapper.get('wc-agent-picker').element).toBe(element)
    expect(JSON.parse(select.getAttribute('selected')!)).toEqual(['fixture.agents:another'])
    choose(select, [])
    await flushPromises()
    expect(wrapper.emitted('change')).toEqual([[{ agent_id: '' }]])
    wrapper.unmount()
  })

  it('uses the declared picker field key', async () => {
    const { wrapper, select } = await mountPicker({ reviewer: agentId }, {
      properties: { reviewer: { type: 'string', required: true, picker: 'wc-agent-picker' } },
    })
    expect(JSON.parse(select.getAttribute('selected')!)).toEqual([agentId])
    choose(select, [agentId])
    await flushPromises()
    expect(wrapper.emitted('change')).toEqual([[{ reviewer: agentId }]])
    wrapper.unmount()
  })

  it('preserves the standalone multi-select contract', async () => {
    const element = document.createElement('wc-agent-picker')
    element.setAttribute('selected', JSON.stringify([agentId]))
    document.body.appendChild(element)
    await flushPromises()
    const select = element.shadowRoot!.querySelector('wc-multiselect')!
    expect(select.getAttribute('multi')).toBe('true')
    expect(JSON.parse(select.getAttribute('selected')!)).toEqual([agentId])
    const listener = vi.fn()
    element.addEventListener('change', event => { if (event.composedPath()[0] === element) listener((event as CustomEvent).detail) })
    choose(select, [agentId])
    expect(listener).toHaveBeenCalledExactlyOnceWith({ selected: [agentId], labels: ['Example agent'] })
    element.remove()
  })
})
