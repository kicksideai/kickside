import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import About from './about.vue'

const info = {
  success: true,
  version: '1.2.3',
  runtime_version: 'v0.3.47a',
  notices: 'Third-party notices\nA dependency — MIT\nCopyright its authors',
}

beforeEach(() => {
  ;(globalThis as any).__api__ = { '/api/v1/settings/about': info }
  ;(globalThis as any).__hostVisibility__.value = false
  vi.mocked(api.get).mockClear()
})

describe('About in Settings', () => {
  it('renders the installed app and running runtime versions with licence and shipped notices', async () => {
    const wrapper = mount(About)
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/settings/about')
    expect(wrapper.get('h1').text()).toBe('About KickSide')
    expect(wrapper.text()).toContain('1.2.3')
    expect(wrapper.text()).toContain('Runs on the Wippy runtime (MPL-2.0)')
    expect(wrapper.text()).toContain('v0.3.47a')
    const licence = wrapper.get('a')
    expect(licence.text()).toBe('KickSide Community License')
    expect(licence.attributes('href')).toBe('https://wippy.ai/license')
    expect(wrapper.get('pre').text()).toBe(info.notices)
    wrapper.unmount()
  })

  it('labels an unpackaged source application without inventing a release version', async () => {
    ;(globalThis as any).__api__['/api/v1/settings/about'] = { ...info, version: null }
    const wrapper = mount(About)
    await flushPromises()
    expect(wrapper.text()).toContain('Development build')
    expect(wrapper.text()).not.toContain('1.2.3')
    wrapper.unmount()
  })

  it('shows server failures and retries when the retained surface becomes visible', async () => {
    ;(globalThis as any).__api__['/api/v1/settings/about'] = { success: false, error: 'Notices are unavailable' }
    const wrapper = mount(About)
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Notices are unavailable')
    expect(wrapper.find('pre').exists()).toBe(false)
    ;(globalThis as any).__api__['/api/v1/settings/about'] = info
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('pre').text()).toBe(info.notices)
    wrapper.unmount()
  })
})
