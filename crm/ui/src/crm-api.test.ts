import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()
const post = vi.fn()
const put = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args), put: (...args: unknown[]) => put(...args) } }))
const crm = await import('./crm-api')

describe('shared CRM API client', () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); put.mockReset() })

  it('returns the normal empty state from a successful not-provisioned response', async () => {
    get.mockResolvedValueOnce({ data: { success: true, provisioned: false, can_create: false } })
    await expect(crm.bootstrap()).resolves.toEqual({ success: true, provisioned: false, can_create: false })
  })

  it('uses explicit component context for bootstrap', async () => {
    get.mockResolvedValueOnce({ data: { success: true, crm_id: 'crm-1', workspace_label: 'GTM CRM', can_write: false, objects: [], attributes: [], pipelines: [], views: [] } })
    await expect(crm.bootstrap('crm-1')).resolves.toMatchObject({ crm_id: 'crm-1', can_write: false })
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1')
  })

  it('raises a typed workspace choice from a 409 body instead of a bare error', async () => {
    const candidates = [{ crm_id: 'crm-1', component_id: 'crm-1', label: 'GTM' }, { crm_id: 'crm-2', component_id: 'crm-2', label: 'Ops' }]
    get.mockResolvedValueOnce({ data: { success: false, code: 'multiple_crm_components', candidates } })
    await expect(crm.bootstrap()).rejects.toBeInstanceOf(crm.CrmWorkspaceChoice)
    get.mockRejectedValueOnce({ response: { status: 409, data: { success: false, code: 'multiple_crm_components', candidates } } })
    const raised = await crm.bootstrap().catch((error) => error)
    expect(raised).toBeInstanceOf(crm.CrmWorkspaceChoice)
    expect((raised as InstanceType<typeof crm.CrmWorkspaceChoice>).candidates).toEqual(candidates)
  })

  it('rejects bootstrap responses that omit the explicit write capability', async () => {
    get.mockResolvedValueOnce({ data: { success: true, crm_id: 'crm-1', workspace_label: 'GTM CRM', objects: [], attributes: [], pipelines: [], views: [] } })
    await expect(crm.bootstrap('crm-1')).rejects.toThrow('invalid bootstrap')
  })

  it('sends the canonical paginated records query and returns the page envelope', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: { rows: [{ record_id: 'p1', object_type: 'person', values: { name: 'Ada' } }], total: 42, limit: 50, offset: 0 } } })
    const page = await crm.listRecords('crm-1', 'person', { filters: [{ attr: 'name', op: 'contains', value: 'Ada' }], sort: { attr: 'name', dir: 'asc' }, limit: 50, offset: 0 })
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/query', {
      kind: 'records', object_type: 'person', filters: [{ attr: 'name', op: 'contains', value: 'Ada' }], sort: { attr: 'name', dir: 'asc' }, limit: 50, offset: 0,
    })
    expect(page.total).toBe(42)
    expect(page.rows).toEqual([{ record_id: 'p1', object_type: 'person', values: { name: 'Ada' } }])
  })

  it('sends quick search through the records query contract', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: { rows: [], total: 0, limit: 0, offset: 0 } } })
    await crm.listRecords('crm-1', 'person', { search: '  ada love  ' })
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/query', { kind: 'records', object_type: 'person', filters: [], search: 'ada love' })
  })

  it('rejects partial projection rows instead of inventing values', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: { rows: [{ record_id: 'p1', object_type: 'person' }, { bad: true }], total: 1, limit: 50, offset: 0 } } })
    await expect(crm.listRecords('crm-1', 'person')).rejects.toThrow('invalid record')
  })

  it('rejects a bare-array reader response', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: [{ record_id: 'p1', object_type: 'person' }] } })
    await expect(crm.listRecords('crm-1', 'person')).rejects.toThrow('invalid record page')
  })

  it('hydrates a bounded record set by id', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: [{ record_id: 'c1', object_type: 'company', values: { name: 'Acme' } }] } })
    const rows = await crm.recordsByIds('crm-1', ['c1', 'p1'])
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/query', { kind: 'records_by_ids', ids: ['c1', 'p1'] })
    expect(rows[0].record_id).toBe('c1')
    expect(await crm.recordsByIds('crm-1', [])).toEqual([])
  })

  it('keeps the canonical flat association set returned by the read model', async () => {
    const associations = {
      outgoing: [{ attr: 'company', source: { kind: 'record', type: 'person', id: 'p1' }, target: { kind: 'record', type: 'company', id: 'c1' } }],
      incoming: [],
    }
    post.mockResolvedValueOnce({ data: { success: true, data: { record_id: 'p1', object_type: 'person', values: { company: [{ kind: 'record', type: 'company', id: 'c1' }] }, associations } } })
    await expect(crm.getRecord('crm-1', 'p1')).resolves.toMatchObject({ associations })
  })

  it('reads the explicit membership board', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: { Lead: { records: [{ record_id: 'o1', position: 1 }], total: 3 } } } })
    const board = await crm.getBoard('crm-1', 'sales_pipeline', { limit: 50 })
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/query', { kind: 'board', collection_id: 'sales_pipeline', limit: 50 })
    expect(board.Lead.total).toBe(3)
  })

  it('reads merge suggestions as a page', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: { rows: [{ left_id: 'p1', right_id: 'p2', object_type: 'person', decision: 'pending', confidence: 0.93 }], total: 1, limit: 50, offset: 0 } } })
    const merges = await crm.mergeReviews('crm-1')
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/query', { kind: 'merge_reviews' })
    expect(merges.rows[0].confidence).toBe(0.93)
  })

  it('reads and writes per-user list views through the profile store', async () => {
    get.mockResolvedValueOnce({ data: { success: true, value: { 'crm-1': { person: { columns: ['name'] } } } } })
    const state = await crm.readListViews()
    expect(get).toHaveBeenCalledWith('/api/v1/profile?namespace=crm&key=list_views')
    expect(state).toEqual({ 'crm-1': { person: { columns: ['name'] } } })
    put.mockResolvedValueOnce({ data: { success: true } })
    await crm.writeListViews({ 'crm-1': { person: { columns: ['name', 'email'] } } })
    expect(put).toHaveBeenCalledWith('/api/v1/profile', { namespace: 'crm', key: 'list_views', value: { 'crm-1': { person: { columns: ['name', 'email'] } } } })
  })

  it('surfaces profile read failures instead of inventing empty preferences', async () => {
    get.mockRejectedValueOnce(new Error('nope'))
    await expect(crm.readListViews()).rejects.toThrow('nope')
  })

  it('rejects profile writes the service did not commit', async () => {
    put.mockResolvedValueOnce({ data: { success: false, error: 'profile store unavailable' } })
    await expect(crm.writeListViews({})).rejects.toThrow('profile store unavailable')
  })

  it('keeps all writes on the typed command endpoint', async () => {
    post.mockResolvedValueOnce({ data: { success: true } })
    const commands = [{ type: 'kickside.crm.events:record.deleted', body: { record_id: 'p1' } }]
    await crm.applyCommands('crm-1', commands)
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/apply', { commands })
  })

  it('reads the object total through the count query kind', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: 25 } })
    await expect(crm.countRecords('crm-1', 'person')).resolves.toBe(25)
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/query', { kind: 'count', object_type: 'person' })
  })

  it('surfaces backend errors instead of substituting fake state', async () => {
    post.mockResolvedValueOnce({ data: { success: false, error: 'access denied' } })
    await expect(crm.getTimeline('crm-1')).rejects.toThrow('access denied')
  })

  it('returns null for a missing record', async () => {
    post.mockResolvedValueOnce({ data: { success: true, data: null } })
    await expect(crm.getRecord('crm-1', 'missing')).resolves.toBeNull()
  })

  it('reads validated record-panel declarations for one object type', async () => {
    const panels = [{ tag: 'wc-deal-room', title: 'Deal room', order: 20, object_types: ['opportunity'] }]
    get.mockResolvedValueOnce({ data: { success: true, panels } })
    await expect(crm.getRecordPanels('crm-1', 'opportunity')).resolves.toEqual(panels)
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/panels/opportunity')
  })

  it('reads and atomically replaces the full schema declaration', async () => {
    const declaration = { objects: [], attributes: [], pipelines: [], views: [] }
    get.mockResolvedValueOnce({ data: { success: true, revision: 7, declaration } })
    await expect(crm.getSchema('crm-1')).resolves.toEqual({ revision: '7', declaration })
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/schema')

    post.mockResolvedValueOnce({ data: { success: true, revision: '8', declaration } })
    await expect(crm.applySchema('crm-1', '7', declaration)).resolves.toEqual({ revision: '8', declaration })
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/schema', { expected_revision: '7', declaration })
  })

  it('reads the portable schema export from the config endpoint', async () => {
    const config = { apiVersion: 'kickside.crm/config.v1', kind: 'CRMConfig', metadata: { portableKey: 'crm/default' }, spec: {} }
    get.mockResolvedValueOnce({ data: { success: true, config } })
    await expect(crm.exportConfig('crm-1')).resolves.toEqual(config)
    expect(get).toHaveBeenCalledWith('/api/v1/workspace/crm/crm-1/config/export')
  })

  it('surfaces an export failure instead of returning empty config', async () => {
    get.mockResolvedValueOnce({ data: { success: false, error: 'export denied' } })
    await expect(crm.exportConfig('crm-1')).rejects.toThrow('export denied')
  })

  it('writes CRM settings through the platform settings endpoint', async () => {
    put.mockResolvedValueOnce({ data: { success: true } })
    await crm.writeSetting('thread_event_retention_days', 90)
    expect(put).toHaveBeenCalledWith('/api/v1/settings', { namespace: 'kickside.crm', key: 'thread_event_retention_days', value: 90 })
  })
})
