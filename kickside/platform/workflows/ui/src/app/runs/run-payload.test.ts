// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import completedDetail from '../__fixtures__/run-e754dc50-completed-detail.json'
import { runView } from '../embed/embed-run'
import type { RunRow } from '../api/api'

// The embed's result surface renders a completed run's Finish output through RunPayload — the
// same read-only payload view the run inspector uses. This mounts it against the REAL Finish
// output of live run e754dc50 (adv-runner-contract) and asserts the payload renders, so the
// embed's "show result" path is verified end to end, not just its pure fold.

vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i class="ic" :data-icon="icon" />' } }))

const RunPayload = (await import('./RunPayload.vue')).default

describe('RunPayload rendering a real completed run output', () => {
  it('renders the Finish output payload the embed shows on completion', () => {
    const view = runView(completedDetail.run as unknown as RunRow)
    expect(view.hasOutput).toBe(true)

    const wrapper = mount(RunPayload, { props: { value: view.output, label: 'Result' } })
    expect(wrapper.text()).toContain('Result')
    const pre = wrapper.find('pre')
    expect(pre.exists()).toBe(true)
    // The real Finish payload {"x":"ok"} is pretty-printed as JSON in the read-only block.
    expect(pre.text()).toContain('"x": "ok"')
  })
})
