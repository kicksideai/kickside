import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { loadByTagName } from '@wippy-fe/proxy'
import ExternalProviderEditor from './ExternalProviderEditor.vue'

vi.mock('@wippy-fe/proxy', () => ({
  loadByTagName: vi.fn(),
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  host: { toast: vi.fn(), confirm: vi.fn(), handleError: vi.fn() },
}))

describe('external provider editor', () => {
  beforeEach(() => {
    vi.mocked(loadByTagName).mockReset()
    vi.mocked(loadByTagName).mockResolvedValue(undefined)
  })

  it('loads the declared tag and relays the provider-owned save contract', async () => {
    const wrapper = mount(ExternalProviderEditor, {
      props: {
        tag: 'codex-personal-provider-editor',
        mode: 'create',
        preset: { id: 'codex', key: 'codex', title: 'Codex', provider_id: 'example.codex:provider' },
      },
    })
    await flushPromises()
    expect(loadByTagName).toHaveBeenCalledWith('codex-personal-provider-editor', { timeoutMs: 8000 })
    const editor = wrapper.element.querySelector('codex-personal-provider-editor') as HTMLElement
    expect(editor).toBeTruthy()
    editor.dispatchEvent(new CustomEvent('save', { detail: { name: 'Personal Codex' } }))
    expect(wrapper.emitted('save')?.[0]).toEqual([{ name: 'Personal Codex' }])
  })
})
