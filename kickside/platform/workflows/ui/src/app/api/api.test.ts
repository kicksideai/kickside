import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()
const post = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post } }))

const { listWorkflows, createWorkflow, setWorkflowLabels, listRuns, getRun, getRunTimeline, getRunNodeData, exportRun, listWorkflowVersions, getWorkflowVersion, getWorkflowVersionDiff, restoreWorkflowVersion, exportWorkflow, importWorkflow, publishWorkflow, PublishError } = await import('./api')

describe('workflow api client', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('continues across an empty filtered page and includes every workflow', async () => {
    get.mockResolvedValueOnce({ data: { success: true, workflows: [], next_offset: 100 } })
    get.mockResolvedValueOnce({ data: { success: true, workflows: [{ id: 'wf-last', title: 'Last' }] } })
    await expect(listWorkflows({ filter: 'published' })).resolves.toMatchObject([{id: 'wf-last'}])
    expect(get).toHaveBeenNthCalledWith(1, '/api/v1/workflows?published=true&fields=labels%2Chead_seq%2Cinterface%2Cpublished_interface%2Cpublished_def_seq%2Chas_draft_changes%2Cparent_id%2Cparent_name%2Cbreadcrumb%2Clast_run%2Cnode_count%2Crun_count&limit=100&offset=0')
    expect(get).toHaveBeenNthCalledWith(2, '/api/v1/workflows?published=true&fields=labels%2Chead_seq%2Cinterface%2Cpublished_interface%2Cpublished_def_seq%2Chas_draft_changes%2Cparent_id%2Cparent_name%2Cbreadcrumb%2Clast_run%2Cnode_count%2Crun_count&limit=100&offset=100')
  })

  it('lists workflows from the canonical wrapper', async () => {
    get.mockResolvedValueOnce({ data: { success: true, workflows: [{ id: 'wf-1', title: 'Flow' }] } })
    await expect(listWorkflows()).resolves.toMatchObject([{ id: 'wf-1', title: 'Flow' }])
  })

  it('rejects a response without the canonical workflow rows', async () => {
    get.mockResolvedValueOnce({ data: { success: true, components: [{ component_id: 'wf-2', name: 'Recovered' }] } })
    await expect(listWorkflows()).rejects.toThrow('no workflow page')
  })

  it('passes the published filter and maps interface metadata', async () => {
    get.mockResolvedValueOnce({
      data: {
        success: true,
        workflows: [{
          id: 'wf-3',
          title: 'Callable',
          published_version: 4,
          interface: { input_count: 2, output_count: 1, input_keys: ['lead_id'], output_keys: ['score'] },
          last_run: { run_id: 'run-1', status: 'completed', started_at: '2026-01-01T00:00:00Z' },
        }],
      },
    })
    const rows = await listWorkflows({ filter: 'published' })
    expect(get).toHaveBeenCalledWith('/api/v1/workflows?published=true&fields=labels%2Chead_seq%2Cinterface%2Cpublished_interface%2Cpublished_def_seq%2Chas_draft_changes%2Cparent_id%2Cparent_name%2Cbreadcrumb%2Clast_run%2Cnode_count%2Crun_count&limit=100&offset=0')
    expect(rows[0]).toMatchObject({
      id: 'wf-3',
      published_version: 4,
      interface: { input_count: 2, output_count: 1, input_keys: ['lead_id'], output_keys: ['score'] },
      last_run: { run_id: 'run-1', status: 'completed' },
    })
    // The retired list-level partial markers are no longer read off the row.
    expect('is_partial' in rows[0]).toBe(false)
    expect('is_published_partial' in rows[0]).toBe(false)
  })

  it('folds access-checked placement onto placed rows and omits it when unplaced', async () => {
    get.mockResolvedValueOnce({
      data: {
        success: true,
        workflows: [
          { id: 'wf-placed', title: 'In a folder', parent_id: 'folder-9', parent_name: 'Sales', breadcrumb: 'Sales' },
          { id: 'wf-root', title: 'At root' },
        ],
      },
    })
    const rows = await listWorkflows()
    expect(rows[0]).toMatchObject({ id: 'wf-placed', parent_id: 'folder-9', parent_name: 'Sales', breadcrumb: 'Sales' })
    expect(rows[1].parent_id).toBeUndefined()
    expect(rows[1].breadcrumb).toBeUndefined()
  })

  it('maps flat organization labels from the list read', async () => {
    get.mockResolvedValueOnce({ data: { success: true, workflows: [{ id: 'wf-1', title: 'Flow', labels: [' Sales ', 42, ''] }] } })
    const rows = await listWorkflows()
    expect(rows[0].labels).toEqual(['Sales', '42'])
  })

  it('defaults labels to an empty array when absent', async () => {
    get.mockResolvedValueOnce({ data: { success: true, workflows: [{ id: 'wf-1', title: 'Flow' }] } })
    const rows = await listWorkflows()
    expect(rows[0].labels).toEqual([])
  })

  it('threads parent_id into the create call (host placement, W18)', async () => {
    post.mockResolvedValueOnce({ data: { success: true, flow_id: 'wf-new' } })
    const id = await createWorkflow('Qualify lead', 'folder-42')
    expect(post).toHaveBeenCalledWith('/api/v1/workflows', { title: 'Qualify lead', parent_id: 'folder-42' })
    expect(id).toBe('wf-new')
  })

  it('omits parent_id when no placement is passed', async () => {
    post.mockResolvedValueOnce({ data: { success: true, flow_id: 'wf-new' } })
    await createWorkflow('Standalone')
    expect(post).toHaveBeenCalledWith('/api/v1/workflows', { title: 'Standalone', parent_id: undefined })
  })

  it('sets workflow labels, de-duplicating and returning the folded set', async () => {
    post.mockResolvedValueOnce({ data: { success: true, state: { labels: ['Sales', 'Ops'] } } })
    const saved = await setWorkflowLabels('wf-1', [' Sales ', 'sales', 'Ops'])
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/wf-1/labels', { labels: ['Sales', 'Ops'] })
    expect(saved).toEqual(['Sales', 'Ops'])
  })

  it('maps the exact Flow reference pinned by published and simulated runs', async () => {
    // Shape from GET /workflows/{id}/runs — a published run (v1) and a simulation (v0).
    get.mockResolvedValueOnce({
      data: {
        success: true,
        runs: [
          { run_id: '88444c66', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, origin: 'published', status: 'failed' },
          { run_id: 'e3bc833e', draft_ref: { kind: 'flow', id: 'wf-3', def_seq: 42 }, origin: 'simulation', status: 'failed' },
        ],
      },
    })
    const rows = await listRuns('wf-3')
    expect(rows[0]).toMatchObject({ run_id: '88444c66', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, origin: 'published' })
    expect(rows[1]).toMatchObject({ run_id: 'e3bc833e', draft_ref: { kind: 'flow', id: 'wf-3', def_seq: 42 }, origin: 'simulation' })
  })

  it('carries the engine status the runs list reports for an active run', async () => {
    get.mockResolvedValueOnce({ data: { success: true, runs: [
      { run_id: 'parked', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, status: 'running', dataflow_status: 'waiting' },
      { run_id: 'done', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, status: 'completed' },
    ] } })
    const rows = await listRuns('wf-3')
    expect(rows[0].dataflow_status).toBe('waiting')
    expect(rows[1].dataflow_status).toBeUndefined()
  })

  it('retains the parked status when selecting a run fetches its detail', async () => {
    get.mockResolvedValueOnce({ data: { success: true,
      run: { run_id: 'parked', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, status: 'running', dataflow_status: 'waiting' }, nodes: [],
    } })
    const detail = await getRun('wf-3', 'parked')
    expect(detail.run.dataflow_status).toBe('waiting')
  })

  it('maps a completed run detail carrying its Finish output (the embed read seam)', async () => {
    get.mockResolvedValueOnce({
      data: {
        success: true,
        run: { run_id: 'e754dc50', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, status: 'completed', output: { x: 'ok' } },
        input: { query: 'same input' },
        error_routed: true,
        nodes: [{ engine_node_id: 'n', def_node_id: 'finish', type: 't', status: 'completed', title: 'Finish' }],
      },
    })
    const { run, input, errorRouted } = await getRun('wf-3', 'e754dc50')
    expect(get).toHaveBeenCalledWith('/api/v1/workflows/wf-3/runs/e754dc50')
    expect(run).toMatchObject({ run_id: 'e754dc50', status: 'completed' })
    expect(run.output).toEqual({ x: 'ok' })
    expect(input).toEqual({ query: 'same input' })
    expect(errorRouted).toBe(true)
  })

  it('omits output on a run detail that has none (running/failed)', async () => {
    get.mockResolvedValueOnce({
      data: { success: true, run: { run_id: 'r2', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, status: 'failed', error: 'Node [x] failed: Failed' }, nodes: [] },
    })
    const { run } = await getRun('wf-3', 'r2')
    expect('output' in run).toBe(false)
    expect(run.error).toBe('Node [x] failed: Failed')
  })

  it('maps Keeper linkage, engine ids, timeline paging and the redacted run export', async () => {
    get.mockResolvedValueOnce({ data: {
      success: true,
      run: { run_id: 'r2', flow_ref: { kind: 'flow', id: 'wf-3', version: 1 }, status: 'running', dataflow_id: 'df-9' },
      execution: { dataflow_id: 'df-9', process: { id: 'p1', host: 'worker', pid: 7 } },
      nodes: [{ engine_node_id: 'eng-2', parent_engine_node_id: 'eng-1', def_node_id: 'node-2', status: 'running' }],
    } })
    const detail = await getRun('wf-3', 'r2')
    expect(detail.run.dataflow_id).toBe('df-9')
    expect(detail.nodes[0]).toMatchObject({ engine_node_id: 'eng-2', parent_engine_node_id: 'eng-1' })
    get.mockResolvedValueOnce({ data: { success: true, timeline: { events: [{ seq: 1, source: 'flow_run', type: 'flow.started', raw: { safe: true } }], count: 1, limit: 100, offset: 0, next_offset: null } } })
    await expect(getRunTimeline('wf-3', 'r2')).resolves.toMatchObject({ count: 1, events: [{ type: 'flow.started' }] })
    expect(get).toHaveBeenLastCalledWith('/api/v1/workflows/wf-3/runs/r2/events?limit=100&offset=0')
    get.mockResolvedValueOnce({ data: { success: true, export: { kind: 'flow_run_export', data: [] } } })
    await expect(exportRun('wf-3', 'r2')).resolves.toMatchObject({ kind: 'flow_run_export' })
  })

  it('decodes a routed step value with its completion references', async () => {
    get.mockResolvedValueOnce({ data: { success: true, data: [
      { data_id: 'completion', node_id: 'step', type: 'node.result', content_type: 'application/json',
        content: '{"success":true,"data_ids":["target-input"],"output":{"passages":"found"}}' },
    ] } })
    const rows = await getRunNodeData('wf-3', 'run', 'code')
    expect(rows[0].content).toEqual({ success: true, data_ids: ['target-input'], output: { passages: 'found' } })
  })

  it('lists published versions newest-first and drops any version-0 row', async () => {
    get.mockResolvedValueOnce({
      data: {
        success: true,
        versions: [
          { version: 1, def_seq: 41, created_by: 'admin@wippy.local', created_at: '2026-07-09T16:33:50-04:00' },
          { version: 0, def_seq: 0 },
        ],
      },
    })
    const rows = await listWorkflowVersions('019f487a')
    expect(get).toHaveBeenCalledWith('/api/v1/workflows/019f487a/versions')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({ version: 1, def_seq: 41, created_by: 'admin@wippy.local', created_at: '2026-07-09T16:33:50-04:00' })
  })

  it('maps a frozen version to its read-only interface summary', async () => {
    // Shape from GET /workflows/{id}/versions/{n} — the full row; the client keeps the
    // interface (input/output/error keys + counts), input schema, and provenance.
    get.mockResolvedValueOnce({
      data: {
        success: true,
        version: {
          workflow_id: '019f487a',
          version: 1,
          def_seq: 41,
          created_by: 'admin@wippy.local',
          created_at: '2026-07-09T16:33:50-04:00',
          input_schema: { type: 'object', properties: { topic: {}, audience: {} } },
          interface: {
            input_count: 2,
            output_count: 2,
            error_count: 2,
            input_keys: ['audience', 'topic'],
            output_keys: ['content', 'source_url'],
            error_keys: ['error_message', 'step_name'],
          },
          document: { nodes: {} },
          compiled_commands: [],
        },
      },
    })
    const v = await getWorkflowVersion('019f487a', 1)
    expect(get).toHaveBeenCalledWith('/api/v1/workflows/019f487a/versions/1')
    expect(v).toMatchObject({ version: 1, def_seq: 41, created_by: 'admin@wippy.local' })
    expect(v.interface).toMatchObject({
      input_keys: ['audience', 'topic'],
      output_keys: ['content', 'source_url'],
      error_keys: ['error_message', 'step_name'],
      input_count: 2,
      error_count: 2,
    })
    expect(v.input_schema).toBeTruthy()
  })

  it('reads a graph/interface diff and restores a distinct draft without mutating history', async () => {
    get.mockResolvedValueOnce({ data: { success: true, diff: { from_version: 1, to_version: 2, interface: { changes: [{ field: 'input.topic', type: 'required_added' }] }, graph: { nodes: { added: [{ id: 'n2', after: { title: 'New node' } }], removed: [], changed: [] }, edges: { added: [], removed: [], changed: [] } } } } })
    await expect(getWorkflowVersionDiff('wf-3', 1, 2)).resolves.toMatchObject({ from_version: 1, to_version: 2, graph: { nodes: { added: [{ id: 'n2' }] } } })
    expect(get).toHaveBeenLastCalledWith('/api/v1/workflows/wf-3/versions/diff?from_version=1&to_version=2')
    post.mockResolvedValueOnce({ data: { success: true, flow: { flow_id: 'wf-restored', status: 'draft', published: false, restored_from: { flow_id: 'wf-3', version: 2 } } } })
    await expect(restoreWorkflowVersion('wf-3', 2)).resolves.toBe('wf-restored')
    expect(post).toHaveBeenLastCalledWith('/api/v1/workflows/wf-3/versions/2/restore', {})
  })

  it('reads a portable Flow export, exposing its title and raw artifact', async () => {
    const flow = {
      api_version: 'kickside.flow/v1',
      key: 'ns/qualify_lead',
      kind: 'flow',
      title: 'Qualify Lead',
      version: 3,
      refs: [],
      document: { params: { title: 'Qualify Lead' }, nodes: [], edges: [] },
      checksum: 'a'.repeat(64),
    }
    get.mockResolvedValueOnce({ data: { success: true, flow } })
    const p = await exportWorkflow('wf-9')
    expect(get).toHaveBeenCalledWith('/api/v1/workflows/wf-9/export')
    expect(p).toMatchObject({ title: 'Qualify Lead', key: 'ns/qualify_lead', kind: 'flow', version: 3 })
    expect(p).toEqual(flow)
  })

  it('imports the exact Flow artifact and returns the new draft id + title', async () => {
    const flow = { api_version: 'kickside.flow/v1', key: 'ns/x', kind: 'flow', title: 'X', version: 1, refs: [], document: { params: { title: 'X' }, nodes: [], edges: [] }, checksum: 'a'.repeat(64) }
    post.mockResolvedValueOnce({ data: { success: true, flow: { flow_id: 'wf-imp', title: 'Copy of X', status: 'draft', published: false } } })
    const res = await importWorkflow(flow)
    expect(post).toHaveBeenCalledWith('/api/v1/workflows/import', { flow, bindings: {} })
    expect(res).toEqual({ flowId: 'wf-imp', title: 'Copy of X' })
  })

  it('surfaces the backend directed message on a malformed import (portable_invalid)', async () => {
    post.mockRejectedValueOnce({ response: { data: { success: false, code: 'portable_invalid', error: 'portable workflow definition JSON object is required' } } })
    await expect(importWorkflow('not json')).rejects.toThrow('portable workflow definition JSON object is required')
  })

  it('throws a PublishError carrying the per-node config-gate issues', async () => {
    post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          errors: [
            { code: 'node_config_missing', message: 'node knowledge_sink config.kb_id is required; bind it or declare it as a slot', node_id: 'knowledge_sink' },
          ],
        },
      },
    })
    const err = await publishWorkflow('wf-1').catch((e) => e)
    expect(err).toBeInstanceOf(PublishError)
    expect(err.message).toContain('Not publishable')
    expect(err.issues).toEqual([
      { code: 'node_config_missing', message: 'node knowledge_sink config.kb_id is required; bind it or declare it as a slot', nodeId: 'knowledge_sink' },
    ])
  })
})
