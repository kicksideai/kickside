// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import WcSurface from './WcSurface.vue'

vi.mock('../composables/useWippy', () => ({
  useWippy: () => ({ loadByTagName: vi.fn().mockResolvedValue(undefined) }),
}))
vi.mock('@wippy-fe/proxy', () => ({ on: vi.fn() }))

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()))

class ContextSurface extends HTMLElement {
  contextAtConnect: { basePath: string | null; route: string | null } | null = null

  connectedCallback() {
    this.contextAtConnect = {
      basePath: this.getAttribute('base-path'),
      route: this.getAttribute('route'),
    }
  }
}
customElements.define('test-surface-context', ContextSurface)

async function surface(props: { tag?: string; basePath?: string; path: string } = { path: '/agents' }) {
  const tag = props.tag ?? 'test-agent-editor'
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
  })
  await router.push(props.path)
  const wrapper = mount(WcSurface, {
    props: { ...props, tag },
    global: { plugins: [router] }, attachTo: document.body,
  })
  wrappers.push(wrapper)
  await flushPromises()
  const element = wrapper.get(tag).element
  return { wrapper, element }
}

async function editor() {
  const { wrapper, element } = await surface()
  const root = element.attachShadow({ mode: 'open' })
  const draft = document.createElement('textarea')
  draft.value = 'Unsaved agent prompt'
  const picker = document.createElement('test-model-picker')
  picker.attachShadow({ mode: 'open' })!.innerHTML = '<span role="alert">Could not load models</span>'
  root.append(draft, picker)
  return { wrapper, element, draft, picker }
}

it.each([
  { name: 'a missing base', basePath: undefined, path: '/agents', base: '/', route: 'agents' },
  { name: 'an empty base', basePath: '', path: '/', base: '/', route: '' },
  { name: 'a normalized base', basePath: '  workspace/first  ', path: '/workspace/first', base: '/workspace/first', route: '' },
  { name: 'a nested route', basePath: '/workspace/first', path: '/workspace/first/details?view=source#section', base: '/workspace/first', route: 'details?view=source#section' },
])('sets surface context before connection for $name', async ({ basePath, path, base, route }) => {
  const { element } = await surface({ tag: 'test-surface-context', basePath, path })
  expect((element as ContextSurface).contextAtConnect).toEqual({ basePath: base, route })
  expect(element.getAttribute('base-path')).toBe(base)
  expect(element.getAttribute('route')).toBe(route)
})

it('keeps the base path when the route changes in place', async () => {
  const { wrapper, element } = await surface({
    tag: 'test-surface-context', basePath: '/workspace/first', path: '/workspace/first',
  })
  await wrapper.setProps({ path: '/workspace/first/details' })
  await flushPromises()
  expect(wrapper.get('test-surface-context').element).toBe(element)
  expect(element.getAttribute('base-path')).toBe('/workspace/first')
  expect(element.getAttribute('route')).toBe('details')
})

it('remounts with the new base path and route when the same tag serves another base', async () => {
  const { wrapper, element } = await surface({
    tag: 'test-surface-context', basePath: '/workspace/first', path: '/workspace/first',
  })
  await wrapper.setProps({ basePath: ' workspace/second ', path: '/workspace/second/details' })
  await flushPromises()
  const replacement = wrapper.get('test-surface-context').element as ContextSurface
  expect(replacement).not.toBe(element)
  expect(element.isConnected).toBe(false)
  expect(replacement.contextAtConnect).toEqual({ basePath: '/workspace/second', route: 'details' })
  expect(replacement.getAttribute('base-path')).toBe('/workspace/second')
  expect(replacement.getAttribute('route')).toBe('details')
})

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
