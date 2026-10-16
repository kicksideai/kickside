import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.hoisted(() => vi.fn())
vi.mock('@wippy-fe/proxy', () => ({ api: { get } }))

import { groupCatalog, loadCatalog, mapBlock, moduleLabel, subgroupByModule } from './catalog'

const block = {
  id: 'kickside.agents:block.agent',
  label: 'Agent',
  category: 'Agents',
  icon: 'tabler:robot',
  blurb: 'Run an Agent',
  waits: false,
  public: true,
  config_schema: { type: 'object' },
  ports: [{ id: 'result', label: 'Result' }],
}

const tool = {
  id: 'keeper.files:count_files',
  label: 'Count Files',
  category: 'Tools',
  icon: 'tabler:tool',
  blurb: 'Count files matching a path and pattern.',
  public: true,
  source_kind: 'tool',
  tool: true,
  input_schema: {
    type: 'object',
    required: ['path'],
    properties: { path: { type: 'string' }, pattern: { type: 'string' } },
  },
  config_schema: {
    type: 'object',
    properties: { path: { type: 'string' }, pattern: { type: 'string' } },
  },
  output_schema: { type: 'object', properties: { count: { type: 'integer' } } },
  error_schema: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' } } },
  ports: [{ id: 'result', label: 'Result' }, { id: 'failed', label: 'Failed' }],
}

describe('canonical Block catalog', () => {
  beforeEach(() => get.mockReset())

  it('loads only the Workflows Block endpoint', async () => {
    get.mockResolvedValue({ data: { success: true, blocks: [block] } })
    const result = await loadCatalog()
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('/api/v1/workflows/blocks?fields=blurb,input_schema,config_schema,config_wc,output_schema,error_schema,ports&limit=100&offset=0')
    expect(result.errors).toEqual([])
    expect(result.items.some(item => item.ref === block.id && item.kind === 'block')).toBe(true)
    expect(result.items.some(item => ['tool', 'agent', 'func', 'signal'].includes(String(item.kind)))).toBe(false)
  })

  it('maps declaration presentation without changing executable identity', () => {
    const item = mapBlock(block)
    expect(item.paletteId).toBe(`block:${block.id}`)
    expect(item.ref).toBe(block.id)
    expect(item.kind).toBe('block')
    expect(item.config_schema).toBe(block.config_schema)
  })

  it('presents public tools as exact canonical Blocks distinct from Run Code', async () => {
    const runCode = { ...block, id: 'kickside.code_execution:block.run_code', label: 'Run Code' }
    get.mockResolvedValue({ data: { success: true, blocks: [runCode, tool] } })

    const result = await loadCatalog()
    const countFiles = result.items.find(item => item.ref === tool.id)
    const code = result.items.find(item => item.ref === runCode.id)

    expect(countFiles).toMatchObject({
      paletteId: `block:${tool.id}`,
      kind: 'block',
      category: 'Tools',
      title: 'Count Files',
      ref: tool.id,
      source_kind: 'tool',
      tool: true,
    })
    expect(countFiles?.input_schema).toBe(tool.input_schema)
    expect(countFiles?.output_schema).toBe(tool.output_schema)
    expect(countFiles?.config_schema).toBe(tool.config_schema)
    expect(code?.paletteId).toBe(`block:${runCode.id}`)
    expect(code?.paletteId).not.toBe(countFiles?.paletteId)
  })

  it('groups searchable declared categories and stable module subgroups', () => {
    const items = [mapBlock(block)]
    expect(groupCatalog(items, 'agent', ['Blocks', 'Agents'])).toEqual([{ cat: 'Agents', items }])
    expect(moduleLabel(block.id)).toBe('Agents')
    expect(subgroupByModule(items)[0].module).toBe('Agents')
  })
})
