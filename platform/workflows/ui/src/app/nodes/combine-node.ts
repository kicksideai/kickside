// Combine is the one convergence
// kind: it either waits for every incoming path (wait_all) or continues on the first to
// arrive (first_wins).

import type { WfDoc, WfNode } from '../types'

export type CombineMode = 'wait_all' | 'first_wins'
export type CombineOutputMode = 'object' | 'array'

export function isCombineKind(kind: string | undefined): boolean {
  return kind === 'combine'
}

function cfgOf(config: unknown): Record<string, unknown> {
  return config && typeof config === 'object' && !Array.isArray(config) ? (config as Record<string, unknown>) : {}
}

// An explicit first_wins mode continues on the first arrival; everything else waits for all.
export function combineModeFromConfig(config: unknown): CombineMode {
  const c = cfgOf(config)
  return c.mode === 'first_wins' ? 'first_wins' : 'wait_all'
}

export function readCombineMode(_kind: string | undefined, config: unknown): CombineMode {
  return combineModeFromConfig(config)
}

// output_mode defaults to object (materialize.lua). array collects each path's output as
// a list instead of merging by key.
export function readCombineOutputMode(config: unknown): CombineOutputMode {
  return cfgOf(config).output_mode === 'array' ? 'array' : 'object'
}

// The node patch a Combine edit commits: kind plus its explicit convergence/output modes.
export function combineNodePatch(config: unknown, mode: CombineMode, outputMode: CombineOutputMode): Partial<WfNode> {
  const next: Record<string, unknown> = { ...cfgOf(config), mode, output_mode: outputMode }
  return { kind: 'combine', config: next }
}

// Guard rail: the branch node id whose true AND false arms are the combine's only inputs,
// or null. Both arms of one Branch are mutually exclusive — only one ever runs — so a
// wait_all combine fed only by them waits forever for the arm that never fires. This is
// the direct-arm case the panel discourages up front; the compiler
// (combine_wait_all_exclusive_paths) remains the final enforcement across intermediate
// steps too.
export function combineExclusiveBranchConflict(doc: WfDoc, nodeId: string): string | null {
  const node = doc.nodes[nodeId]
  if (!node || !isCombineKind(node.kind)) return null
  const incoming = Object.values(doc.edges).filter((e) => e.target_id === nodeId)
  if (incoming.length < 2) return null
  let branchId: string | null = null
  const arms = new Set<string>()
  for (const e of incoming) {
    const src = doc.nodes[e.source_id]
    if (!src || src.kind !== 'branch') return null
    const port = e.source_port
    if (port !== 'true' && port !== 'false') return null
    if (branchId === null) branchId = e.source_id
    else if (branchId !== e.source_id) return null
    arms.add(port)
  }
  return branchId && arms.has('true') && arms.has('false') ? branchId : null
}

// The directed warning the panel shows when wait_all meets that exclusive-arm conflict,
// naming the Branch and steering to first_wins — the same resolution the compiler names.
export function combineExclusiveWarning(branchTitle: string): string {
  return `These are the True and False arms of “${branchTitle}” — only one ever runs, so wait-all would wait forever for the other. Use first-wins here.`
}
