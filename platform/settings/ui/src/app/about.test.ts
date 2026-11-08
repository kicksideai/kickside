// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, loadByTagName } from '@wippy-fe/proxy'
import About from './about.vue'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() }, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (load: () => unknown) => { void load() } }))

const notices = '# Third-Party Notices\n\n## Browser packages\n\n- @fontsource-variable/inter: OFL-1.1.\n'
const mountAbout = () => mount(About, {
  global: { config: { compilerOptions: { isCustomElement: (tag: string) => tag.startsWith('wc-') } } },
})

describe('About third-party notices', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, version: '1.0.0', runtime_version: 'v0.3.59a', notices } })
    vi.mocked(loadByTagName).mockResolvedValue(undefined as never)
  })

  it('renders the notices as markdown through the shared renderer', async () => {
    const wrapper = mountAbout()
    await flushPromises()
    expect(loadByTagName).toHaveBeenCalledWith('wc-render-markdown', expect.anything())
    const rendered = wrapper.get('section wc-render-markdown')
    expect(rendered.attributes('source')).toBe(notices)
    expect(wrapper.find('pre').exists()).toBe(false)
  })

  it('names a renderer that fails to load', async () => {
    vi.mocked(loadByTagName).mockRejectedValue(new Error('wc-render-markdown did not load'))
    const wrapper = mountAbout()
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('wc-render-markdown did not load')
  })
})
