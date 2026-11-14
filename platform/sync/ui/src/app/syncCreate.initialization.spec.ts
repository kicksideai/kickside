import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, loadByTagName } from '@wippy-fe/proxy'
import SyncCreate from './SyncCreate.vue'

function preset(input: string) {
  ;(globalThis as any).__props__ = { input }
}

async function failedForm(message: string) {
  const wrapper = mount(SyncCreate)
  await flushPromises()
  expect(wrapper.find('[role="alert"]').text()).toContain(message)
  await wrapper.find('form').trigger('submit')
  expect(api.post).not.toHaveBeenCalled()
  wrapper.unmount()
}

describe('SyncCreate initialization failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    preset('{}')
    ;(globalThis as any).__api__ = {
      '/automations/sources': { sources: [] },
      '/automations/sinks': { sinks: [] },
    }
  })

  it('shows a component preload failure and prevents installation', async () => {
    vi.mocked(loadByTagName).mockRejectedValueOnce(new Error('Schema form unavailable'))
    await failedForm('Schema form unavailable')
  })

  it('shows invalid preset JSON and prevents installation', async () => {
    preset('{')
    await failedForm('JSON')
  })

  it('refuses a preset whose destination is absent from the catalog', async () => {
    preset(JSON.stringify({ sink_port: 'missing:sink' }))
    await failedForm('selected destination is unavailable')
  })
})
