import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { expect, it, vi } from 'vitest'

// Capture the system Date before the setup's per-test clock is installed.
const SystemDate = Date

it('delivers mounted clicks when the system wall clock moves backwards', async () => {
  const clicked = vi.fn()
  const wallClock = vi.spyOn(SystemDate, 'now').mockReturnValue(2_000_000_000_000)
  try {
    const wrapper = mount(defineComponent({
      setup: () => () => h('button', { onClick: clicked }, 'Preview changes'),
    }))
    // Reproduce the clock rollback that made Vue reject Hub preview/uninstall
    // events as older than their listeners. The test clock must stay isolated.
    wallClock.mockReturnValue(1_999_999_999_000)
    await wrapper.get('button').trigger('click')
    expect(clicked).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  } finally {
    wallClock.mockRestore()
  }
})
