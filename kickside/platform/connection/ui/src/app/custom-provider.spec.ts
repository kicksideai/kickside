import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { loadByTagName } from '@wippy-fe/proxy'
import ConnectionPicker from './ConnectionPicker.vue'

const github = {
  provider: 'github',
  title: 'GitHub',
  description: 'Connect repositories and pull requests.',
  create_ui_id: 'kickside-github-connect',
}

describe('provider-owned connection setup UI', () => {
  beforeEach(() => {
    vi.mocked(loadByTagName).mockReset()
    vi.mocked(loadByTagName).mockResolvedValue(undefined)
  })

  it('loads and mounts the provider web component into the configuration pane', async () => {
    const wrapper = mount(ConnectionPicker, { props: { providers: [github], provider: 'github' } })
    await flushPromises()

    expect(loadByTagName).toHaveBeenCalledWith('kickside-github-connect', { timeoutMs: 8000 })
    const host = wrapper.get('.kx-engine-host').element
    expect(host.firstElementChild?.tagName.toLowerCase()).toBe('kickside-github-connect')
    expect(host.firstElementChild?.getAttribute('provider-id')).toBe('github')
  })

  it('shows a recoverable error instead of leaving a blank configuration pane', async () => {
    vi.mocked(loadByTagName).mockRejectedValueOnce(new Error('bundle unavailable'))
    const wrapper = mount(ConnectionPicker, { props: { providers: [github], provider: 'github' } })
    await flushPromises()

    expect(wrapper.get('.kx-engine-error').text()).toContain('bundle unavailable')
    vi.mocked(loadByTagName).mockResolvedValue(undefined)
    await wrapper.get('.kx-engine-error button').trigger('click')
    await flushPromises()
    expect(wrapper.get('.kx-engine-host').element.firstElementChild?.tagName.toLowerCase()).toBe('kickside-github-connect')
  })
})
