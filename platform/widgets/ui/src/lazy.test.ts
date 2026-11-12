// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onMounted } from 'vue'
import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { Component } from 'vue'
import { lazyControl, lazyPage } from './lazy'
import { lazyPage as templatePage } from '../../../../app/templates/plugin/ui/src/lazy'

vi.mock('@iconify/vue', () => ({ Icon: { render: () => h('svg') }, addCollection: vi.fn() }))

vi.mock('@wippy-fe/proxy', () => ({
  addIcons: vi.fn(), applyThemeMode: vi.fn(),
  define: (url: string, element: CustomElementConstructor) => {
    const tag = new URL(url).searchParams.get('declare-tag')
    if (tag && !customElements.get(tag)) customElements.define(tag, element)
  },
  config: {}, host: {}, on: () => () => {}, hostCss: {}, loadCss: vi.fn(),
}))

Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
  configurable: true, value: () => ({ states: new Set() }),
})

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail })
  return { promise, resolve, reject }
}

const message = 'Could not load. Reload the page to try again.'
const factories = {
  page: (load: () => Promise<Component>) => ({ lazyConfig: lazyPage(async () => ({ rootComponent: await load() }), message, useEvents) }),
  template: (load: () => Promise<Component>) => ({ lazyConfig: templatePage(async () => ({ rootComponent: await load() }), message, useEvents) }),
  control: (load: () => Promise<Component>) => ({ rootComponent: lazyControl(async () => ({ __esModule: true as const, default: await load() }), { loading: 'Loading control', failed: message }, useEvents) }),
}

function fixture(kind: keyof typeof factories) {
  const pending = deferred<Component>()
  const load = vi.fn(() => pending.promise)
  const mounted = vi.fn()
  const root = defineComponent(() => {
    onMounted(mounted)
    return () => h('button', 'Loaded content')
  })
  class Surface extends WippyVueElement {
    static get wippyConfig() { return { propsSchema: { properties: {} }, hostCssKeys: [] as const, customCss: false } }
    static get vueConfig() { return factories[kind](load) }
  }
  customElements.define(`lazy-test-${crypto.randomUUID()}`, Surface)
  const element = new Surface()
  const error = vi.fn()
  element.addEventListener('error', error)
  return { element, error, load, mounted, resolve: () => pending.resolve(root), reject: pending.reject }
}

for (const kind of Object.keys(factories) as (keyof typeof factories)[]) {
  describe(kind, () => {
    it('imports only on connection and mounts the resolved component', async () => {
      const f = fixture(kind)
      expect(f.load).not.toHaveBeenCalled()
      document.body.append(f.element)
      expect(f.load).toHaveBeenCalledOnce()
      f.resolve()
      await vi.advanceTimersByTimeAsync(0)
      expect(f.element.shadowRoot?.textContent).toContain('Loaded content')
      expect(f.mounted).toHaveBeenCalledOnce()
      expect(f.error).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(30000)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('renders rejection and emits the declared message and original error', async () => {
      const f = fixture(kind)
      document.body.append(f.element)
      const error = new Error('Chunk request failed')
      f.reject(error)
      await vi.advanceTimersByTimeAsync(0)
      expect(f.error).toHaveBeenCalledOnce()
      expect(f.error.mock.calls[0]![0].detail).toEqual({ message, error })
      const failure = f.element.shadowRoot?.querySelector('wippy-error, [role="alert"]')
      expect(failure).not.toBeNull()
      expect(failure?.getAttribute('message') || failure?.textContent).toBe(message)
      await vi.advanceTimersByTimeAsync(30000)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('fails at the 30 second deadline', async () => {
      const f = fixture(kind)
      document.body.append(f.element)
      await vi.advanceTimersByTimeAsync(29999)
      expect(f.error).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(f.error).toHaveBeenCalledOnce()
      const detail = f.error.mock.calls[0]![0].detail
      expect(detail.message).toBe(message)
      expect(detail.error).toBeInstanceOf(Error)
      expect(detail.error.message).toContain('30000')
      expect(f.element.shadowRoot?.querySelector('wippy-error, [role="alert"]')).not.toBeNull()
      await vi.advanceTimersByTimeAsync(30000)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('does not mount after disconnect when the import resolves and clears its timer', async () => {
      const f = fixture(kind)
      document.body.append(f.element)
      f.element.remove()
      f.resolve()
      await vi.advanceTimersByTimeAsync(0)
      expect(f.mounted).not.toHaveBeenCalled()
      expect(f.error).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(30000)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('does not mount or emit after disconnect when the timeout fires', async () => {
      const f = fixture(kind)
      document.body.append(f.element)
      f.element.remove()
      await vi.advanceTimersByTimeAsync(30000)
      expect(f.mounted).not.toHaveBeenCalled()
      expect(f.error).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(30000)
      expect(vi.getTimerCount()).toBe(0)
      f.resolve()
      await vi.advanceTimersByTimeAsync(0)
      expect(f.mounted).not.toHaveBeenCalled()
    })

    it('loads on reconnect and mounts once', async () => {
      const f = fixture(kind)
      document.body.append(f.element)
      f.element.remove()
      document.body.append(f.element)
      f.resolve()
      await vi.advanceTimersByTimeAsync(0)
      expect(f.load).toHaveBeenCalledTimes(2)
      expect(f.mounted).toHaveBeenCalledOnce()
      expect(f.element.shadowRoot?.textContent).toContain('Loaded content')
      expect(f.error).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(30000)
      expect(vi.getTimerCount()).toBe(0)
    })
  })
}

it('registers an entry requested with declare-tag only once', async () => {
  const { webComponent } = await import('./index')
  const Element = await webComponent()
  const tag = `lazy-entry-${crypto.randomUUID()}`
  define(`https://example.test/index.js?declare-tag=${tag}`, Element)
  define(`https://example.test/index.js?declare-tag=${tag}`, Element)
  expect(customElements.get(tag)).toBe(Element)
})
