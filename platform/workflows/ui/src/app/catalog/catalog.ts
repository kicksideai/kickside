// Executable palette entries come only from the canonical Block catalog. Workflows
// contributes structural control and boundary nodes; it never rediscovers functions,
// tools, agents, or sinks as a second executable vocabulary.

import { api } from '@wippy-fe/proxy'
import type { NodeKind } from '../types'
import { KINDS, registerBlocks, type BlockDef, type ExtPort } from '../domain/node-policy'
import { titleCase } from '../domain/labels'

export interface CatalogItem {
  paletteId: string
  kind: NodeKind
  category: string
  title: string
  subtitle: string
  icon: string
  ref?: string
  input_schema?: unknown
  output_schema?: unknown
  config_schema?: unknown
  config_wc?: string
  error_schema?: unknown
  source_kind?: 'block' | 'tool'
  tool?: boolean
}

export interface CatalogResult {
  items: CatalogItem[]
  errors: string[]
}

function asArray(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? (v as Record<string, unknown>[]) : []
}

function str(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const shaped = v as Record<string, unknown>
    return str(shaped.message ?? shaped.error ?? shaped.code)
  }
  return ''
}

interface SweepResult {
  rows: Record<string, unknown>[]
  error?: string
}

async function sweep(path: string, key: string): Promise<SweepResult> {
  try {
    const rows: Record<string, unknown>[] = []
    let offset: number | undefined = 0
    do {
      const separator = path.includes('?') ? '&' : '?'
      const response = await api.get(`${path}${separator}limit=100&offset=${offset}`) as { data?: Record<string, unknown> }
      const data = response.data
      if (data && data.success === false) return { rows: [], error: str(data.error) || `${path} failed` }
      rows.push(...asArray(data?.[key]))
      const next: unknown = data?.next_offset
      if (next != null && (typeof next !== 'number' || !Number.isSafeInteger(next) || next <= offset)) return { rows: [], error: `${path} returns an invalid offset` }
      offset = next == null ? undefined : next
    } while (offset !== undefined)
    return { rows }
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : `couldn’t load ${path}` }
  }
}

// Canonical Blocks are executable registry identities shared with headless Flow
// composition. Workflows adds no second declaration or lowering vocabulary.
function toBlockDef(r: Record<string, unknown>): BlockDef {
  return {
    id: str(r.id),
    label: str(r.label) || str(r.id),
    category: r.category ? str(r.category) : undefined,
    icon: r.icon ? str(r.icon) : undefined,
    hue: r.hue ? str(r.hue) : undefined,
    blurb: str(r.blurb),
    waits: r.waits === true,
    ports: Array.isArray(r.ports)
      ? (r.ports as Record<string, unknown>[]).map((p): ExtPort => ({
          id: str(p.id),
          label: str(p.label) || titleCase(str(p.id)) || 'Output',
          condition: p.condition != null ? str(p.condition) : undefined,
          direction: p.direction != null ? str(p.direction) : undefined,
          schema: p.schema,
        }))
      : undefined,
    input_schema: r.input_schema,
    config_schema: r.config_schema,
    config_wc: r.config_wc ? str(r.config_wc) : undefined,
    output_schema: r.output_schema,
    error_schema: r.error_schema,
    source_kind: str(r.source_kind) === 'tool' ? 'tool' : 'block',
    tool: r.tool === true || str(r.source_kind) === 'tool',
    public: r.public === true,
  }
}

export function mapBlock(d: BlockDef): CatalogItem {
  return {
    paletteId: `block:${d.id}`,
    kind: 'block',
    category: d.category || 'Blocks',
    title: d.label,
    subtitle: d.blurb || '',
    icon: d.icon || 'tabler:puzzle',
    ref: d.id,
    config_schema: d.config_schema,
    config_wc: d.config_wc,
    input_schema: d.input_schema,
    output_schema: d.output_schema,
    error_schema: d.error_schema,
    source_kind: d.source_kind,
    tool: d.tool,
  }
}

// The static, deterministic entries: workflow-native logic nodes. Component-owned
// integration nodes arrive exclusively through the declared node catalog.
// user vocabulary (Condition / Loop / For each / Combine) — never raw engine nouns.
export const STATIC_ITEMS: CatalogItem[] = [
  { paletteId: 'logic:branch', kind: 'branch', category: 'Logic', title: KINDS.branch.label, subtitle: 'Choose a path from a condition', icon: KINDS.branch.icon },
  { paletteId: 'logic:combine', kind: 'combine', category: 'Logic', title: KINDS.combine.label, subtitle: 'Bring several paths back into one', icon: KINDS.combine.icon },
  { paletteId: 'logic:for-each', kind: 'for_each', category: 'Logic', title: KINDS.for_each.label, subtitle: 'Run the same steps once per array item', icon: KINDS.for_each.icon },
  { paletteId: 'logic:cycle', kind: 'cycle', category: 'Logic', title: KINDS.cycle.label, subtitle: 'Repeat while a condition holds', icon: KINDS.cycle.icon },
  {
    paletteId: 'flow:published',
    kind: 'flow',
    category: 'Workflows',
    title: KINDS.flow.label,
    subtitle: 'Compose an exact published Workflow',
    icon: KINDS.flow.icon,
  },
]

// Boundary nodes — the pinned workflow interface. Placed like any step,
// but each is a base kind (start/finish/error) whose schema is edited by kind in the
// config panel, so it carries no ref and no config_schema. Grouped under "Structure".
export const STRUCTURE_ITEMS: CatalogItem[] = [
  { paletteId: 'boundary:start', kind: 'start', category: 'Structure', title: KINDS.start.label, subtitle: 'Declares the run input', icon: KINDS.start.icon },
  { paletteId: 'boundary:finish', kind: 'finish', category: 'Structure', title: KINDS.finish.label, subtitle: 'Declares the successful output', icon: KINDS.finish.icon },
  { paletteId: 'boundary:error', kind: 'error', category: 'Structure', title: KINDS.error.label, subtitle: 'Declares the failed output', icon: KINDS.error.icon },
]

export interface CatalogGroup {
  cat: string
  items: CatalogItem[]
}

// A category with at least this many swept items is dense enough to sub-group by owning
// module, so the ~120-entry Tools list reads as a short set of module headings instead of
// one flat wall (W12 calm). Smaller categories stay flat.
export const PALETTE_SUBGROUP_MIN = 12

// The owning module of a swept item, derived from its ref id. Refs are `vendor.module.role:
// leaf` (e.g. `kickside.google.traits:docs_write_tool` -> "Google",
// `kickside.atlassian.jira.traits:jira_write` -> "Atlassian"); the module segment sits just
// after the vendor prefix, so jira/confluence fold under one Atlassian heading and hub.scan/
// hub.tools under one Hub. An unnamespaced or ref-less item falls back to "Other".
export function moduleLabel(ref?: string): string {
  const ns = (ref || '').split(':')[0]
  const segs = ns.split('.').filter(Boolean)
  const mod = segs.length >= 2 ? segs[1] : segs[0]
  return mod ? titleCase(mod) : 'Other'
}

export interface CatalogSubgroup {
  module: string
  items: CatalogItem[]
}

// Fold a category's items into module sub-groups, modules sorted alphabetically and items
// by title within each. Pure so the palette's two-level rendering is unit-tested.
export function subgroupByModule(items: CatalogItem[]): CatalogSubgroup[] {
  const byMod = new Map<string, CatalogItem[]>()
  for (const it of items) {
    const mod = moduleLabel(it.ref)
    if (!byMod.has(mod)) byMod.set(mod, [])
    byMod.get(mod)!.push(it)
  }
  return [...byMod.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([module, group]) => ({ module, items: [...group].sort((a, b) => a.title.localeCompare(b.title)) }))
}

// The palette's Notes group is the one category whose entries (Sticky Note, Frame) the
// palette adds synthetically rather than sweeping from a registry, so it holds no catalog
// items yet is never empty from the user's view — it always renders.
const SYNTHETIC_CATEGORY = 'Notes'

// Group catalog items by category for the palette. Categories lead in the known order, then
// any module-declared category the sweep surfaced follows in encounter order so a new node
// kind is never silently dropped. A category renders only when it holds at least one item —
// an empty group never shows a header — the sole exception being the synthetic Notes group.
// Search covers every field a kind is identified by — title, subtitle, ref, kind string and
// category — so nothing is unsearchable and search leaves no stray empty sections.
export function groupCatalog(items: CatalogItem[], query: string, knownOrder: readonly string[]): CatalogGroup[] {
  const ql = query.trim().toLowerCase()
  const byCat = new Map<string, CatalogItem[]>()
  const order: string[] = [...knownOrder]
  for (const cat of knownOrder) byCat.set(cat, [])
  for (const it of items) {
    if (ql && !`${it.title} ${it.subtitle} ${it.ref || ''} ${it.kind} ${it.category}`.toLowerCase().includes(ql)) continue
    if (!byCat.has(it.category)) { byCat.set(it.category, []); order.push(it.category) }
    byCat.get(it.category)!.push(it)
  }
  return order
    .filter((cat) => cat === SYNTHETIC_CATEGORY || (byCat.get(cat)?.length ?? 0) > 0)
    .map((cat) => ({ cat, items: byCat.get(cat) || [] }))
}

export async function loadCatalog(): Promise<CatalogResult> {
  const blocks = await sweep('/api/v1/workflows/blocks?fields=blurb,input_schema,config_schema,config_wc,output_schema,error_schema,ports', 'blocks')

  const blockDefs = blocks.rows.map(toBlockDef).filter((d) => d.id && d.public === true)
  registerBlocks(blockDefs)
  const items: CatalogItem[] = [
    ...STRUCTURE_ITEMS,
    ...blockDefs.map(mapBlock),
    ...STATIC_ITEMS,
  ]
  return { items, errors: blocks.error ? [blocks.error] : [] }
}
