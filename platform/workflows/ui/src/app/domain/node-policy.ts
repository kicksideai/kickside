// Semantic identity per node kind: a functional hue (canvas-only accent, fixed
// anchor), an icon, a human label, and its palette category. Hues are the one place
// fixed color values are sanctioned — they encode meaning, not brand. Chrome never
// hardcodes these; it derives from the host --p-* layer through --wf-*.
//
// The engine nouns (cycle/for_each/combine) never reach the UI: every surface
// reads the human label and the "how this works" blurb below. Logic blocks are
// productized — Condition, Loop, Combine, For each — never their raw kind string.

import type { RetryFields, NodeKind } from '../types'

export interface OutPort {
  // Handle id — becomes the edge's source_port. A Branch's arms are 'true'/'false';
  // a bare first port is the default for an ordinary step.
  id: string
  label: string
}

export function isFlowKind(kind: string | undefined): boolean {
  return kind === 'flow'
}

export function isForEachKind(kind: string | undefined): boolean {
  return kind === 'for_each'
}

export const FAILED_PORT: OutPort = { id: 'failed', label: 'Failed' }

export const FAILED_PAYLOAD_SCHEMA = {
  type: 'object',
  required: ['code', 'message'],
  additionalProperties: false,
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
  },
} as const

export function isFailedSourcePort(port: string | undefined): boolean {
  return port === FAILED_PORT.id
}

export interface KindDef {
  kind: NodeKind
  label: string
  // CSS custom-property name carrying this kind's hue.
  hueVar: string
  icon: string
  category: string
  // One plain sentence explaining the block, shown at the top of its config panel.
  blurb: string
  // Runtime status semantics. Extension kinds derive this capability from their declared
  // Human category at registration, so run surfaces never special-case component ids.
  waits?: boolean
  // Named source ports rendered on the card. When absent, the node has one default
  // outgoing port (bottom/right handles).
  outPorts?: OutPort[]
  // The out port a step hands its route on through when it is inserted into an existing
  // connection. When absent, the first out port carries the continuation.
  continuation?: string
}

export const KINDS: Record<NodeKind, KindDef> = {
  block: {
    kind: 'block', label: 'Block', hueVar: '--wf-violet', icon: 'tabler:box', category: 'Blocks',
    blurb: 'Runs a typed reusable Block and continues with its result.',
  },
  branch: {
    kind: 'branch', label: 'Condition', hueVar: '--wf-teal', icon: 'tabler:arrows-split-2', category: 'Logic',
    blurb: 'Chooses between two paths: True runs when the condition holds, False otherwise.',
    // Compiler contract: the condition lives on the node (config.predicate) and the arms
    // leave the true/false ports (graph.lua rewrites them to the predicate and its negation).
    outPorts: [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }],
  },
  cycle: {
    kind: 'cycle', label: 'Loop', hueVar: '--wf-teal', icon: 'tabler:rotate', category: 'Logic',
    blurb: 'Repeats the steps inside its body while its condition holds, then continues when it stops.',
    // Body wires the repeated subgraph (rendered as the loop container); done is the exit.
    // Directional labels so a first-timer sees which port is the loop and which is the exit.
    outPorts: [{ id: 'body', label: 'each pass →' }, { id: 'done', label: '→ when done' }],
    continuation: 'done',
  },
  // Combine is the one convergence kind, carrying both semantics through a mode toggle:
  // wait_all waits for every incoming path, first_wins continues on the first to arrive.
  combine: {
    kind: 'combine', label: 'Combine', hueVar: '--wf-teal', icon: 'tabler:arrow-merge', category: 'Logic',
    blurb: 'Brings several incoming paths back into one — either waiting for every path or continuing on the first to arrive.',
  },
  // For-each runs the body once per array item and continues with the collected results.
  for_each: {
    kind: 'for_each', label: 'For each', hueVar: '--wf-teal', icon: 'tabler:arrows-split', category: 'Logic',
    blurb: 'Runs the steps inside its body once per array item, then continues with the collected results.',
    // Body wires the per-item subgraph (rendered as the container); the default continuation
    // carries the results array. Directional labels keep the per-item body apart from it.
    outPorts: [{ id: 'body', label: 'each item →' }, { id: 'done', label: '→ all results' }],
    continuation: 'done',
  },
  flow: {
    kind: 'flow', label: 'Workflow', hueVar: '--wf-violet', icon: 'tabler:route', category: 'Workflows',
    blurb: 'Expands an exact published Workflow into this Workflow and continues with its result.',
  },
  // Boundary nodes: the pinned workflow contract. Start declares the run input,
  // Finish the successful output, Error the failure output. These three — never
  // definition params — are the sole source of a workflow's interface.
  // Boundary nodes carry the "contract" palette (--wf-contract-*): a calm, desaturated
  // family set apart from the punchy per-kind data hues, so they read as the workflow's
  // interface, not another data step.
  start: {
    kind: 'start', label: 'Start', hueVar: '--wf-contract-in', icon: 'tabler:player-play', category: 'Structure',
    blurb: 'Sets the input for each run. One Start step per Workflow.',
  },
  finish: {
    kind: 'finish', label: 'Finish', hueVar: '--wf-contract-out', icon: 'tabler:circle-check', category: 'Structure',
    blurb: 'Sets the result when a run succeeds.',
  },
  error: {
    kind: 'error', label: 'Error', hueVar: '--wf-contract-err', icon: 'tabler:circle-x', category: 'Structure',
    blurb: 'Sets the result when a run fails.',
  },
}

const HUE_CLASSES: Record<string, string> = {
  '--wf-amber': 'wf-hue--amber',
  '--wf-violet': 'wf-hue--violet',
  '--wf-blue': 'wf-hue--blue',
  '--wf-teal': 'wf-hue--teal',
  '--wf-rose': 'wf-hue--rose',
  '--wf-muted': 'wf-hue--slate',
  '--p-success-500': 'wf-hue--ok',
  '--wf-danger': 'wf-hue--danger',
  '--wf-contract-in': 'wf-hue--contract-in',
  '--wf-contract-out': 'wf-hue--contract-out',
  '--wf-contract-err': 'wf-hue--contract-err',
}

export function hueClass(hueVar: string): string {
  return HUE_CLASSES[hueVar] || 'wf-hue--violet'
}

// The boundary kinds that declare a workflow's interface — pinned on the canvas, never
// deletable, and the config key each edits.
export const BOUNDARY_KINDS: Record<string, 'input_schema' | 'output_schema' | 'error_schema'> = {
  start: 'input_schema',
  finish: 'output_schema',
  error: 'error_schema',
}
export function isBoundaryKind(kind: string): boolean {
  return kind === 'start' || kind === 'finish' || kind === 'error'
}

// Structure leads, followed by declared Blocks, nested Flows, and structural controls.
export const CATEGORY_ORDER = ['Structure', 'Blocks', 'Workflows', 'Logic', 'Notes'] as const

// ── Canonical Blocks ─────────────────────────────────────────────────────────────
// Workflows projects the same Block declarations that headless agents and Flow
// builders use. The stored node kind is always `block`; the exact registry id is
// node.ref.

export interface ExtPort {
  id: string
  label: string
  condition?: string
  direction?: string
  schema?: unknown
}

export interface BlockExecution extends RetryFields {
  kind: string
}

export interface BlockDef {
  execution?: BlockExecution
  id: string
  label: string
  category?: string
  icon?: string
  hue?: string
  blurb?: string
  waits?: boolean
  ports?: ExtPort[]
  input_schema?: unknown
  config_schema?: unknown
  config_wc?: string
  output_schema?: unknown
  error_schema?: unknown
  public?: boolean
  source_kind?: 'block' | 'tool'
  tool?: boolean
}

const HUE_VARS: Record<string, string> = {
  amber: '--wf-amber',
  violet: '--wf-violet',
  blue: '--wf-blue',
  teal: '--wf-teal',
  rose: '--wf-rose',
  emerald: '--p-success-500',
  green: '--p-success-500',
  red: '--wf-danger',
}

function hueVarFor(hue: string | undefined): string {
  return (hue && HUE_VARS[hue]) || '--wf-violet'
}

// Registered Block presentation keyed by exact registry id.
export const blockKinds: Record<string, KindDef> = {}
export const blockDefs: Record<string, BlockDef> = {}

export function registerBlocks(defs: BlockDef[]): void {
  for (const key of Object.keys(blockDefs)) delete blockDefs[key]
  for (const key of Object.keys(blockKinds)) delete blockKinds[key]
  for (const d of defs) {
    if (!d || !d.id) continue
    blockDefs[d.id] = d
    blockKinds[d.id] = {
      kind: 'block',
      label: d.label || d.id,
      hueVar: hueVarFor(d.hue),
      icon: d.icon || 'tabler:puzzle',
      category: d.category || 'Blocks',
      waits: d.waits === true,
      blurb: d.blurb || '',
      outPorts: d.ports?.length ? d.ports.map((p) => ({ id: p.id, label: p.label })) : undefined,
    }
  }
}

export function blockConfigSchema(ref: string | undefined): unknown {
  return ref ? blockDefs[ref]?.config_schema : undefined
}

export function blockConfigWc(ref: string | undefined): string | undefined {
  return ref ? blockDefs[ref]?.config_wc : undefined
}

export function isToolBlock(ref: string | undefined): boolean {
  const block = ref ? blockDefs[ref] : undefined
  return block?.tool === true || block?.source_kind === 'tool'
}

export function blockPortSchema(ref: string | undefined, port: string | undefined): unknown {
  if (!ref || !port) return undefined
  return blockDefs[ref]?.ports?.find((candidate) => candidate.id === port)?.schema
}

export function kindDef(kind: NodeKind, ref?: string): KindDef {
  if (kind === 'block' && ref && blockKinds[ref]) return blockKinds[ref]
  return KINDS[kind] || KINDS.block
}

export function kindWaits(kind: NodeKind, ref?: string): boolean {
  return kindDef(kind, ref).waits === true
}

// The named outgoing ports for a kind, or a single unnamed default port.
export function outPortsFor(kind: NodeKind, ref?: string): OutPort[] {
  const block = kind === 'block' && ref ? blockDefs[ref] : undefined
  if (block?.ports?.length) {
    const outputs = block.ports.filter((port) => !port.direction || port.direction === 'out')
    return outputs.length ? outputs.map(({ id, label }) => ({ id, label })) : [{ id: '', label: '' }]
  }
  return kindDef(kind, ref).outPorts || [{ id: '', label: '' }]
}
