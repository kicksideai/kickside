// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Onboard from './Onboard.vue'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post } }))
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon' } }))
vi.mock('./shared', () => Object.fromEntries(
  ['Avatar', 'Button', 'Notice', 'SelectField', 'Spinner', 'Toggle'].map(name => [name, { name }]),
))
vi.mock('./ModelEditor.vue', () => ({ default: { name: 'ModelEditor' } }))
vi.mock('./ProviderProfileEditor.vue', () => ({ default: { name: 'ProviderProfileEditor' } }))
vi.mock('./ExternalProviderEditor.vue', () => ({ default: { name: 'ExternalProviderEditor' } }))
vi.mock('../constants.ts', () => ({ useComponentEvents: () => vi.fn() }))

describe('onboarding provider checks', () => {
  it.each([false, true])('uses the creation check once with generation set to %s', async generation => {
    const provider = 'wippy.llm.claude:provider'
    const profile = { id: 'created', provider_id: provider, name: 'Claude', status: generation ? 'unhealthy' : 'healthy' }
    get.mockResolvedValue({ data: { presets: [{ id: 'claude', title: 'Claude', provider_id: provider }] } })
    post.mockReset().mockImplementation(async (path: string) => {
      if (path.endsWith('/discover')) return { data: { success: true } }
      return { data: { profile, connection_test: { success: !generation, error_type: generation ? 'rate_limited' : undefined } } }
    })
    const wrapper = shallowMount(Onboard)
    await flushPromises()
    await wrapper.get('.ob-tile').trigger('click')
    if (generation) wrapper.getComponent({ name: 'Toggle' }).vm.$emit('update:modelValue', true)
    wrapper.getComponent({ name: 'ProviderProfileEditor' }).vm.$emit('save', { name: 'Claude', provider_id: provider })
    await flushPromises()
    expect(post.mock.calls.map(([path]) => path)).toEqual(generation
      ? ['/api/v1/models/provider-profiles']
      : ['/api/v1/models/provider-profiles', '/api/v1/models/provider-profiles/created/discover'])
    expect(post.mock.calls[0][1].test_generation).toBe(generation || undefined)
    if (generation) expect(wrapper.text()).toContain('rate limiting')
    wrapper.unmount()
  })
})
