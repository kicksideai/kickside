import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

// appearance.vue talks to the authenticated API through the synchronous
// `@wippy-fe/proxy` `api` import. Mock it here with vitest spies driven by
// `globalThis.__api__` (first key that is a substring of the url wins), so the
// spec seeds responses per-URL and asserts on the same spies the component uses.
// The mock is defined via vi.hoisted so it's available to the hoisted vi.mock
// factory. loadByTagName would hit the host registry; stub it so mount stays offline.
const { api } = vi.hoisted(() => {
  function resp(url: string) {
    const o = (globalThis as any).__api__ || {}
    for (const k of Object.keys(o)) if (url.includes(k)) return o[k]
    return { success: true }
  }
  return {
    api: {
      get: vi.fn((u: string) => {
        if ((globalThis as any).__getError__) return Promise.reject({ response: { data: { error: 'load boom' } } })
        return Promise.resolve({ data: resp(u) })
      }),
      post: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
      put: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
      delete: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
    },
  }
})
// appearance.vue also reads the host theme mode and subscribes to '@theme'.
// The harness lets a spec drive that subscription without a real host.
const themeHarness = vi.hoisted(() => ({
  mode: 'auto' as string,
  emit: undefined as undefined | ((mode: string) => void),
}))
vi.mock('@wippy-fe/proxy', () => ({
  api,
  loadByTagName: () => Promise.resolve(),
  host: {
    getThemeMode: () => themeHarness.mode,
    setThemeMode: vi.fn((mode: string) => { themeHarness.mode = mode }),
  },
  on: (event: string, callback: (mode: string) => void) => {
    if (event === '@theme') themeHarness.emit = callback
    return () => { themeHarness.emit = undefined }
  },
}))
const visibilityHarness = vi.hoisted(() => ({
  setVisible: undefined as undefined | ((visible: boolean) => Promise<void>),
}))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { nextTick, onMounted, ref, watch } = await import('vue')
  const visible = ref<boolean | null>(null)
  visibilityHarness.setVisible = async (next: boolean) => {
    visible.value = next
    await nextTick()
  }
  return {
    useHostVisibilityRefresh: (callback: () => unknown) => {
      onMounted(callback)
      watch(visible, (next, previous) => {
        if (previous === false && next === true) return callback()
      })
      return visible
    },
  }
})

import Appearance from './appearance.vue'
import ColorPicker from 'primevue/colorpicker'

const navPayload = {
  success: true,
  logo_upload: {
    max_bytes: 2097152,
    formats: [
      { label: 'PNG', mime: 'image/png', extensions: ['png'] },
      { label: 'JPG', mime: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
      { label: 'WebP', mime: 'image/webp', extensions: ['webp'] },
      { label: 'GIF', mime: 'image/gif', extensions: ['gif'] },
    ],
  },
  layout: 'vertical',
  items: [
    { id: 'home', label: 'Home', icon: 'tabler:home', path: '/', route_name: 'home', category: '', order: 0 },
    { id: 'sys', label: 'System', icon: 'tabler:settings', path: '/system', route_name: 'system', category: '', order: 10 },
  ],
  config: { categories: [], overrides: {}, title: 'KickSide', logo_url: '' },
}

const stubs = { Icon: true, 'wc-icon-picker': true }
const global = { stubs, plugins: [PrimeVuePlugin] }

describe('appearance.vue (mounted)', () => {
  beforeEach(() => {
    const fetchMock = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ '--p-primary': '#22c55e' }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(window, 'fetch').mockImplementation(fetchMock as unknown as typeof window.fetch)
    ;(api.get as any).mockClear()
    ;(api.put as any).mockClear()
    ;(api.post as any).mockClear()
    ;(api.delete as any).mockClear()
    ;(globalThis as any).__getError__ = false
    ;(globalThis as any).__api__ = {
      '/nav/list': navPayload,
      '/nav/logo': { success: true, url: '/api/public/branding/logo' },
    }
    void visibilityHarness.setVisible?.(true)
  })
  afterEach(async () => {
    await (window as any).happyDOM.waitUntilComplete()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete (globalThis as any).__api__
    delete (globalThis as any).__getError__
  })

  it('stores and previews the PrimeVue picker hex value with a hash prefix', async () => {
    const tones: string[] = []
    const onTone = (event: Event) => tones.push(String((event as CustomEvent).detail.hostCss))
    window.addEventListener('kickside:tone-apply', onTone)
    const w = mount(Appearance, { global })
    await flushPromises()
    const picker = w.getComponent(ColorPicker)
    expect(picker.props('format')).toBe('hex')
    expect(picker.props('modelValue')).not.toContain('#')
    picker.vm.$emit('update:modelValue', '2563eb')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(100)
    expect((w.get('input[aria-label="Base tone hex"]').element as HTMLInputElement).value).toBe('#2563eb')
    expect(tones.at(-1)).toContain('#2563eb')
    w.unmount()
    window.removeEventListener('kickside:tone-apply', onTone)
  })

  it('loads nav config and renders the Branding + Structure cards', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    const html = w.html()
    expect(html).toContain('Branding')
    expect(html).toContain('Structure')
    expect(w.find('.ap-binput').exists()).toBe(true)
    expect(api.get).toHaveBeenCalled()
    w.unmount()
  })

  it('reopens instance setup only after a confirmed reset', async () => {
    const changed = vi.fn()
    window.addEventListener('kickside:nav-changed', changed)
    const w = mount(Appearance, { global })
    await flushPromises()
    const reset = w.findAll('button').find(b => b.text().includes('Show setup again'))!
    api.delete.mockResolvedValueOnce({ data: undefined } as any)
    await reset.trigger('click')
    await flushPromises()
    expect(changed).not.toHaveBeenCalled()
    expect(w.text()).toContain('could not reset setup')
    api.delete.mockResolvedValueOnce({ data: { success: true } })
    await reset.trigger('click')
    await flushPromises()
    expect(api.delete).toHaveBeenCalledWith('/api/v1/ui/splash/seen')
    expect(changed).toHaveBeenCalledTimes(1)
    window.removeEventListener('kickside:nav-changed', changed)
    w.unmount()
  })

  it('marks dirty and saves title via PUT /nav/config', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    // Save disabled until dirty
    expect(w.find('.ap-btn-primary').attributes('disabled')).toBeDefined()
    await w.find('.ap-binput').setValue('Acme')
    expect(w.find('.ap-btn-primary').attributes('disabled')).toBeUndefined()
    await w.find('.ap-btn-primary').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/nav/config', expect.objectContaining({ title: 'Acme' }))
    w.unmount()
  })

  it('clears dirty state after each of two consecutive saves', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    const save = w.get('.ap-btn-primary')
    const discard = w.get('.ap-btn-ghost')
    for (const title of ['First title', 'Second title']) {
      await w.get('input[placeholder="KickSide"]').setValue(title)
      expect(w.text()).toContain('Unsaved changes')
      expect(save.attributes('disabled')).toBeUndefined()
      await save.trigger('click')
      await flushPromises()
      expect(api.put).toHaveBeenLastCalledWith('/api/v1/nav/config', expect.objectContaining({ title }))
      expect(w.text()).not.toContain('Unsaved changes')
      expect(save.attributes('disabled')).toBeDefined()
      expect(discard.attributes('disabled')).toBeDefined()
    }
    expect(api.put).toHaveBeenCalledTimes(2)
    w.unmount()
  })

  it('keeps edits made during a pending save dirty', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    let complete!: (response: any) => void
    api.put.mockReturnValueOnce(new Promise(resolve => { complete = resolve }))
    const title = w.get('input[placeholder="KickSide"]')
    await title.setValue('Submitted title')
    await w.get('.ap-btn-primary').trigger('click')
    await title.setValue('New draft')
    complete({ data: { success: true } })
    await flushPromises()
    expect(w.text()).toContain('Unsaved changes')
    expect(w.get('.ap-btn-primary').attributes('disabled')).toBeUndefined()
    await title.setValue('Submitted title')
    expect(w.text()).not.toContain('Unsaved changes')
    w.unmount()
  })

  it.each(['hide after save', 'hide during save', 'unmount during save'])(
    'restores the submitted tone when leaving: %s', async leave => {
      const tones: string[] = []
      const onTone = (event: Event) => tones.push(String((event as CustomEvent).detail?.hostCss || ''))
      window.addEventListener('kickside:tone-apply', onTone)
      const w = mount(Appearance, { global })
      let unmounted = false
      try {
        await flushPromises()
        let complete!: (response: any) => void
        api.put.mockReturnValueOnce(new Promise(resolve => { complete = resolve }))
        const tone = w.get('input[aria-label="Base tone hex"]')
        await tone.setValue('#2563eb')
        await w.get('.ap-btn-primary').trigger('click')
        await tone.setValue('#7c3aed')
        await vi.advanceTimersByTimeAsync(100)
        if (leave === 'hide during save') await visibilityHarness.setVisible?.(false)
        if (leave === 'unmount during save') { w.unmount(); unmounted = true }
        complete({ data: { success: true } })
        await flushPromises()
        if (leave === 'hide after save') {
          expect(w.text()).toContain('Unsaved changes')
          expect(tones.at(-1)).toContain('#7c3aed')
          await visibilityHarness.setVisible?.(false)
        }
        expect(tones.at(-1)).toContain('#2563eb')
        expect(tones.at(-1)).not.toContain('#7c3aed')
      } finally {
        if (!unmounted) w.unmount()
        window.removeEventListener('kickside:tone-apply', onTone)
      }
    })

  it('keeps the draft dirty when the server refuses a save', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    await w.get('input[placeholder="KickSide"]').setValue('Draft title')
    api.put.mockResolvedValueOnce({ data: { success: false, error: 'Save refused' } } as any)
    await w.get('.ap-btn-primary').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Save refused')
    expect(w.text()).toContain('Unsaved changes')
    expect(w.get('.ap-btn-primary').attributes('disabled')).toBeUndefined()
    w.unmount()
  })

  it('uploads a logo as multipart and adopts the returned url', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    const file = new File(['png'], 'logo.png', { type: 'image/png' })
    const input = w.find('input.ap-file')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/nav/logo', expect.any(FormData), expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }))
    expect(w.find('.ap-logo-prev img').exists()).toBe(true)
    w.unmount()
  })

  it.each([
    navPayload.logo_upload,
    { max_bytes: 1048576, formats: [{ label: 'WebP', mime: 'image/webp', extensions: ['webp'] }] },
  ])('derives the file picker and hint from the server upload contract', async contract => {
    ;(globalThis as any).__api__['/nav/list'] = { ...navPayload, logo_upload: contract }
    const w = mount(Appearance, { global })
    await flushPromises()
    const accept = contract.formats.flatMap(f => [f.mime, ...f.extensions.map(ext => `.${ext}`)])
    expect(w.get('input.ap-file').attributes('accept')?.split(',')).toEqual(accept)
    const hint = w.get('.ap-logo + .ap-hint').text()
    for (const format of contract.formats) expect(hint).toContain(format.label)
    expect(hint).toContain(`up to ${contract.max_bytes / 1048576} MB`)
    expect(hint).not.toContain('SVG')
    if (contract.formats.length === 1) expect(hint).not.toContain('PNG')
    w.unmount()
  })

  it('rejects a non-image logo client-side without calling the api', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    const file = new File(['x'], 'note.txt', { type: 'text/plain' })
    const input = w.find('input.ap-file')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await flushPromises()
    expect(api.post).not.toHaveBeenCalled()
    expect(w.html()).toContain('Logo must be an image')
    w.unmount()
  })

  it('surfaces the server error message on load failure', async () => {
    ;(globalThis as any).__getError__ = true
    const w = mount(Appearance, { global })
    await flushPromises()
    expect(w.html()).toContain('load boom')
    w.unmount()
  })

  it('retries an initial load failure when the retained surface is revealed', async () => {
    ;(globalThis as any).__getError__ = true
    const w = mount(Appearance, { global })
    await flushPromises()
    const failedRequests = (api.get as any).mock.calls.length
    expect(w.html()).toContain('load boom')

    ;(globalThis as any).__getError__ = false
    await visibilityHarness.setVisible?.(false)
    await visibilityHarness.setVisible?.(true)
    await flushPromises()

    expect((api.get as any).mock.calls.length).toBe(failedRequests + 1)
    expect(w.html()).not.toContain('load boom')
    expect(w.get('input[placeholder="KickSide"]').element).toHaveProperty('value', 'KickSide')
    w.unmount()
  })

  it('refreshes a clean retained surface only on an exact false-to-true reveal', async () => {
    const w = mount(Appearance, { global })
    await flushPromises()
    const root = w.element
    const before = (api.get as any).mock.calls.length
    await visibilityHarness.setVisible?.(true)
    await flushPromises()
    expect((api.get as any).mock.calls.length).toBe(before)
    await visibilityHarness.setVisible?.(false)
    await visibilityHarness.setVisible?.(true)
    await flushPromises()
    expect((api.get as any).mock.calls.length).toBe(before + 1)
    expect(w.element).toBe(root)
    w.unmount()
  })

  it('preserves a dirty draft across hide/reveal and scopes its tone preview to visibility', async () => {
    const tones: string[] = []
    const onTone = (event: Event) => {
      const css = String((event as CustomEvent).detail?.hostCss || '')
      tones.push(css)
    }
    window.addEventListener('kickside:tone-apply', onTone)
    const w = mount(Appearance, { global })
    await flushPromises()
    const root = w.element
    const titleInput = w.find('input[placeholder="KickSide"]')
    const toneInput = w.find('input[aria-label="Base tone hex"]')
    await titleInput.setValue('Unsaved title')
    await toneInput.setValue('#2563eb')
    await vi.advanceTimersByTimeAsync(100)
    expect(tones.at(-1)).toContain('#2563eb')

    const requestsBeforeHide = (api.get as any).mock.calls.length
    await visibilityHarness.setVisible?.(false)
    expect(tones.at(-1)).not.toContain('#2563eb')
    await visibilityHarness.setVisible?.(true)
    await flushPromises()

    expect((api.get as any).mock.calls.length).toBe(requestsBeforeHide)
    expect((titleInput.element as HTMLInputElement).value).toBe('Unsaved title')
    expect((toneInput.element as HTMLInputElement).value).toBe('#2563eb')
    expect(tones.at(-1)).toContain('#2563eb')
    expect(w.element).toBe(root)
    w.unmount()
    window.removeEventListener('kickside:tone-apply', onTone)
  })
})
