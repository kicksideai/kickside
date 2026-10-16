// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { RunRow } from '../api/api'
import type { NodeRunStatus } from './run-overlay'
import type { WfNode } from '../types'
import agentRaw from '../__fixtures__/run-88444c66-agent-node.json'

// Self-review: mount the run drawer against the REAL captured failed-run node data and
// assert the directed-failure presentation renders end to end — the honest no-detail
// fallback, the input it received, the produced answer, and the agent trace. The API is
// mocked to hand back the exact fixture body the live endpoint returned.

const get = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
  loadByTagName: vi.fn(async () => {}),
}))
// Stub the icon element so the drawer renders without the iconify API network fetch.
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i class="ic" :data-icon="icon" />' } }))

const RunNodeOutput = (await import('./RunNodeOutput.vue')).default

const run: RunRow = {
  run_id: '88444c66-2df2-4f5d-8ced-3a87e44ea534',
  flow_ref: { kind: 'flow', id: '019f487a-472e-74d2-927a-a2a1fe92130e', version: 1 },
  origin: 'published',
  status: 'failed',
  error: 'Node [7ad0f448-f846-4fb0-a9e9-ba165ed66d99] failed: Failed',
  started_at: '2026-07-09T16:56:42-04:00',
  finished_at: '2026-07-09T16:56:46-04:00',
}
const agentNode = {
  id: 'e4ad0b36-9f1a-4f48-bc6a-cc80ceb4feee',
  kind: 'block',
  title: 'Refund Triage',
  ref: 'userspace.agent:refund_triage',
} as unknown as WfNode

function mountDrawer(props: { node: WfNode | null; nodeStatus?: NodeRunStatus }) {
  return mount(RunNodeOutput, { props: { workflowId: run.flow_ref!.id, run, ...props } })
}

describe('RunNodeOutput — real failed-agent run', () => {
  beforeEach(() => {
    // Set the fixture date so relativeTime renders deterministically for the snapshot.
    vi.setSystemTime(new Date('2026-07-09T17:20:00-04:00'))
    get.mockReset()
    get.mockResolvedValue({ data: agentRaw })
  })

  it('renders the run summary and re-run affordance with no step selected', () => {
    const w = mountDrawer({ node: null })
    expect(w.text()).toContain('Viewing run')
    expect(w.text()).toContain('Re-run with same input')
    expect(w.text()).toContain('Click a step on the canvas')
  })

  it('renders the failed step as a directed failure with the honest no-detail fallback', async () => {
    const w = mountDrawer({ node: agentNode, nodeStatus: 'failed' })
    await flushPromises()
    const text = w.text()
    expect(text).toContain('Refund Triage')
    expect(text).toContain('Failed')
    expect(text).toContain('This step failed.')
    expect(text).toContain('No further detail was recorded for this failure.')
  })

  it('shows the input it received, the produced answer and the agent trace', async () => {
    const w = mountDrawer({ node: agentNode, nodeStatus: 'failed' })
    await flushPromises()
    const html = w.html()
    expect(html).toContain('Input')
    expect(html).toContain('industrial automation trends')
    expect(html).toContain('Output')
    expect(html).toContain('Agent trace')
    expect(w.text()).toContain('No tools were called')
  })

  it('uses a tool registry title in the agent trace while retaining its short alias', async () => {
    get.mockImplementation((url: string) => {
      if (url.startsWith('/api/v1/agents/tools?')) {
        return Promise.resolve({ data: { tools: [{ id: 'keeper.agents.tools:data', title: 'Data Inspector' }] } })
      }
      return Promise.resolve({
        data: {
          data: [{
            data_id: 'call-1', node_id: agentNode.id, type: 'agent.action', content_type: 'application/json',
            content: JSON.stringify({ result: 'done', tool_calls: [{ name: 'data', registry_id: 'keeper.agents.tools:data', arguments: { action: 'list_dbs' } }] }),
          }],
        },
      })
    })
    const w = mountDrawer({ node: agentNode, nodeStatus: 'completed' })
    await flushPromises()
    await flushPromises()
    expect(w.text()).toContain('Data Inspector')
    expect(w.text()).toContain('data')
    expect(w.text()).toContain('keeper.agents.tools:data')
  })

  it('emits rerun and exit-run from the header actions', async () => {
    const w = mountDrawer({ node: null })
    const chips = w.findAll('.wf-run-actions button')
    await chips[0].trigger('click')
    await chips[1].trigger('click')
    expect(w.emitted('rerun')).toHaveLength(1)
    expect(w.emitted('exit-run')).toHaveLength(1)
  })

  it('matches the captured drawer snapshot', async () => {
    const w = mountDrawer({ node: agentNode, nodeStatus: 'failed' })
    await flushPromises()
    // PrimeVue measures this decoration asynchronously; its transient pixel
    // geometry is not part of the drawer's rendered-content contract.
    w.find('.p-tablist-active-bar').element.removeAttribute('style')
    expect(w.html()).toMatchSnapshot()
  })
})
