import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const get = vi.fn()
const post = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...a: any[]) => get(...a), post: (...a: any[]) => post(...a) } }))
let lastConfig: any = null
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: { config: lastConfig } }),
  useEvents: () => vi.fn(),
}))

import JiraPicker from './JiraPicker.vue'
import ConfluencePicker from './ConfluencePicker.vue'

describe('Atlassian pickers (PickerBody)', () => {
  beforeEach(() => {
    lastConfig = null
    get.mockReset(); post.mockReset()
    get.mockResolvedValue({ data: { connections: [{ id: 'c1', name: 'Acme Jira' }] } })
    post.mockResolvedValue({ data: { resources: [{ key: 'PROJ', name: 'Project' }] } })
  })

  it('JiraPicker loads atlassian connections on mount', async () => {
    const w = mount(JiraPicker)
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/connections?provider=atlassian')
    expect(w.html()).toContain('Acme Jira')
    w.unmount()
  })

  it('discovers resources once a connection is preselected via config', async () => {
    lastConfig = { connection_id: 'c1' }
    const w = mount(JiraPicker)
    await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/connections/c1/discover_resources', {})
    w.unmount()
  })

  it('ConfluencePicker mounts and loads connections (space kind)', async () => {
    const w = mount(ConfluencePicker)
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/connections?provider=atlassian')
    w.unmount()
  })

  it('shows a hint when no connections exist', async () => {
    get.mockResolvedValue({ data: { connections: [] } })
    const w = mount(JiraPicker)
    await flushPromises()
    expect(w.find('.atl-hint').exists()).toBe(true)
    w.unmount()
  })
})
