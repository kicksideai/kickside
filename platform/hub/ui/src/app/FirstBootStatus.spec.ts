// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import FirstBootStatus from './FirstBootStatus.vue'

const get = vi.hoisted(() => vi.fn())
vi.mock('@wippy-fe/proxy', () => ({ api: { get } }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<svg />' } }))
afterEach(() => { get.mockReset(); vi.useRealTimers() })

it('keeps a failed install visible through a temporary status outage and observes recovery', async () => {
  vi.useFakeTimers()
  const data = { success: true, configured: true, status: 'failed', message: 'Setup failed', modules: [] }
  get.mockResolvedValueOnce({ data }).mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ data: { ...data, status: 'completed' } })
  const changed = vi.fn()
  window.addEventListener('kickside:modules-changed', changed)
  const wrapper = mount(FirstBootStatus)
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(wrapper.text()).toContain('Setup failed')
    await vi.advanceTimersToNextTimerAsync()
    expect(wrapper.text()).toContain('Setup failed')
    await vi.advanceTimersToNextTimerAsync()
    expect(wrapper.text()).toBe('')
    expect(changed).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(60000)
    expect(get).toHaveBeenCalledTimes(3)
  } finally {
    wrapper.unmount()
    window.removeEventListener('kickside:modules-changed', changed)
  }
})

it('shows malformed configuration and stops polling it', async () => {
  vi.useFakeTimers()
  get.mockResolvedValue({ data: { success: true, configured: true, status: 'failed',
    message: 'invalid module id: acme/crm@1', retryable: false, modules: [] } })
  const wrapper = mount(FirstBootStatus)
  try {
    await vi.advanceTimersByTimeAsync(60000)
    expect(wrapper.text()).toContain('invalid module id: acme/crm@1')
    expect(get).toHaveBeenCalledTimes(1)
  } finally {
    wrapper.unmount()
  }
})
