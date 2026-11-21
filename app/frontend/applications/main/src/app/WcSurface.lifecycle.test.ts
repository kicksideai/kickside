// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import WcSurface from './WcSurface.vue'

vi.mock('../composables/useWippy', () => ({
  useWippy: () => ({ loadByTagName: vi.fn().mockResolvedValue(undefined) }),
}))
vi.mock('@wippy-fe/proxy', () => ({ on: vi.fn() }))

customElements.define('test-agent-editor', class extends HTMLElement {})

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()))

async function editor() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
  })
  await router.push('/agents')
  const wrapper = mount(WcSurface, {
    props: { tag: 'test-agent-editor', path: '/agents' },
    global: { plugins: [router] }, attachTo: document.body,
  })
  wrappers.push(wrapper)
  await flushPromises()
  const element = wrapper.get('test-agent-editor').element
  const root = element.attachShadow({ mode: 'open' })
  const draft = document.createElement('textarea')
  draft.value = 'Unsaved agent prompt'
  const picker = document.createElement('test-model-picker')
  picker.attachShadow({ mode: 'open' })!.innerHTML = '<span role="alert">Could not load models</span>'
  root.append(draft, picker)
  return { wrapper, element, draft, picker }
}

it('preserves the editor and draft when a nested picker emits a composed load error', async () => {
  const { wrapper, element, draft, picker } = await editor()
  picker.dispatchEvent(new CustomEvent('error', { bubbles: true, composed: true, detail: { message: 'Chunk failed' } }))
  await flushPromises()
  expect(wrapper.find('test-agent-editor').element).toBe(element)
  expect(draft.isConnected).toBe(true)
  expect(draft.value).toBe('Unsaved agent prompt')
  expect(picker.shadowRoot!.querySelector('[role="alert"]')!.textContent).toBe('Could not load models')
  expect(wrapper.emitted('error')).toBeUndefined()
})

it('reports readiness only for the surface itself', async () => {
  const { wrapper, element, picker } = await editor()
  picker.dispatchEvent(new CustomEvent('load', { bubbles: true, composed: true }))
  expect(wrapper.emitted('ready')).toBeUndefined()
  element.dispatchEvent(new CustomEvent('load', { bubbles: true, composed: true }))
  expect(wrapper.emitted('ready')).toHaveLength(1)
})

it('still removes a surface whose own load fails', async () => {
  const { wrapper, element } = await editor()
  element.dispatchEvent(new CustomEvent('error', { bubbles: true, composed: true }))
  await flushPromises()
  expect(wrapper.find('test-agent-editor').exists()).toBe(false)
  expect(wrapper.text()).toContain('Component is not available')
  expect(wrapper.emitted('error')).toHaveLength(1)
})
