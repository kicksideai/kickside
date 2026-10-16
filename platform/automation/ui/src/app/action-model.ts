// The action model combines server-owned drive controls and type-declared actions
// plus the shell operations the manager owns (reconfigure
// through the kind's manage view, share, export, delete). A method maps to a label, a one-line description, a group and a
// dispatch kind here, so the row menu and the detail drawer render the SAME set —
// An unfamiliar catalog method renders with a generic label.

import { manageTagOf } from './custom-view'
import type { AutomationType } from './automation-types'

export type ActionGroup = 'run' | 'recovery' | 'edit' | 'delete'
// How the manager dispatches the item: `call` posts /actions/{method}; the others
// route to the shell flow that owns them.
export type ActionKind = 'call' | 'reconfigure' | 'share' | 'export' | 'delete'

export interface ActionItem {
  method: string
  label: string
  description: string
  group: ActionGroup
  icon: string
  kind: ActionKind
  // A recovery action that re-processes data warns before it runs.
  warn?: boolean
  danger?: boolean
  disabled?: boolean
}

interface MethodMeta {
  label: string
  description: string
  group: ActionGroup
  icon: string
  warn?: boolean
}

// pause/resume are the row's primary control, never a menu item.
const PRIMARY_METHODS = new Set(['pause', 'resume'])
// A declared reconfigure is served by the kind's manage view (the edit item),
// never posted as a bare action.
const MANAGED_METHODS = new Set(['reconfigure'])
// Kind manual-run aliases collapse when the catalog has no generic drive wakeup.
const RUN_METHODS = new Set(['run_now', 'trigger', 'execute', 'run'])

const METHOD_META: Record<string, MethodMeta> = {
  run_now: { label: 'Run now', description: 'Wake the drive to process available work. Paused drives stay paused.', group: 'run', icon: 'tabler:player-play' },
  discard: { label: 'Discard', description: 'Select uncertain item keys to discard them.', group: 'recovery', icon: 'tabler:trash' },
  trigger: { label: 'Run now', description: 'Run this automation immediately.', group: 'run', icon: 'tabler:player-play' },
  execute: { label: 'Run now', description: 'Run this automation immediately.', group: 'run', icon: 'tabler:player-play' },
  run: { label: 'Run now', description: 'Run this automation immediately.', group: 'run', icon: 'tabler:player-play' },
  rewind: { label: 'Rewind & reprocess', description: 'Reset progress to the start and re-drain every item.', group: 'recovery', icon: 'tabler:rotate-clockwise-2', warn: true },
  resync: { label: 'Resync', description: 'Reset source progress and reconcile from scratch.', group: 'recovery', icon: 'tabler:refresh', warn: true },
  replay: { label: 'Replay', description: 'Retry failed, uncertain, or waiting items.', group: 'recovery', icon: 'tabler:player-track-next', warn: true },
  reconcile: { label: 'Reconcile', description: 'Recompute state against the source of truth.', group: 'recovery', icon: 'tabler:adjustments-check' },
  status: { label: 'Refresh status', description: 'Fetch the latest run status now.', group: 'recovery', icon: 'tabler:activity-heartbeat' },
}

// Prefer the engine drive wakeup; kinds may also offer a manual action.
export function runNowMethod(actions: Set<string>): string {
  if (actions.has('run_now')) return 'run_now'
  if (actions.has('trigger')) return 'trigger'
  if (actions.has('execute')) return 'execute'
  return ''
}

function humanize(name: string): string {
  return name.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// An unfamiliar method the manager has no copy for still renders, so no control a
// type offers is ever unreachable. It reads as a recovery-group action by default.
function genericMeta(name: string): MethodMeta {
  return { label: humanize(name), description: 'Run this action.', group: 'recovery', icon: 'tabler:bolt' }
}

export interface ActionContext {
  declared: string[]
  requiresKeys?: string[]
  runNow: string
  canReconfigure: boolean
  canShare: boolean
  canExport: boolean
  canDelete: boolean
}

// The context both the row and the drawer build their action list from — one
// source of truth for what a type can do, derived from its declaration.
export function catalogActionNames(type: AutomationType | undefined): Set<string> {
  return new Set([...(type?.controls || []), ...(type?.actions || [])].map(a => a.name).filter(Boolean))
}

export function actionContextFor(type: AutomationType | undefined): ActionContext {
  const declared = [...catalogActionNames(type)]
  // Reconfigure mounts the kind's declared manage view.
  const canReconfigure = !!manageTagOf(type)
  return {
    declared,
    requiresKeys: type?.controls?.filter(c => c.keys_required).map(c => c.name),
    runNow: runNowMethod(new Set(declared)),
    canReconfigure,
    // An automation is a component, so it shares through the generic component
    // access endpoints; the server is the authority on who may grant.
    canShare: true,
    canExport: type?.exportable === true,
    canDelete: true,
  }
}

// The recovery method the row's one-click Recover CTA fires: rewind first (it
// resets and re-drains), else resync. Empty when the type declares neither.
export function recoverMethod(declared: Iterable<string>): string {
  const set = declared instanceof Set ? declared : new Set(declared)
  if (set.has('rewind')) return 'rewind'
  if (set.has('resync')) return 'resync'
  return ''
}

// Every action of a type, in menu order: Run, Recovery, Edit, Delete. The declared
// controls and actions drive Run and Recovery; the shell owns Edit and Delete.
export function buildActionItems(ctx: ActionContext): ActionItem[] {
  const items: ActionItem[] = []

  if (ctx.runNow) {
    const meta = METHOD_META[ctx.runNow] || METHOD_META.trigger
    items.push({ method: ctx.runNow, ...meta, kind: 'call' })
  }

  const seen = new Set<string>()
  for (const name of ctx.declared) {
    if (PRIMARY_METHODS.has(name) || name === ctx.runNow ||
      (ctx.runNow !== 'run_now' && RUN_METHODS.has(name)) || MANAGED_METHODS.has(name) || seen.has(name)) continue
    seen.add(name)
    const meta = ctx.runNow === 'run_now' && RUN_METHODS.has(name)
      ? { ...genericMeta(name), group: 'run' as const }
      : METHOD_META[name] || genericMeta(name)
    items.push({ method: name, ...meta, kind: 'call', disabled: ctx.requiresKeys?.includes(name) })
  }

  if (ctx.canReconfigure) {
    items.push({ method: 'reconfigure', label: 'Reconfigure', description: 'Change how this automation is set up.', group: 'edit', icon: 'tabler:settings', kind: 'reconfigure' })
  }
  if (ctx.canShare) {
    items.push({ method: 'share', label: 'Share', description: 'Give other people access to this automation.', group: 'edit', icon: 'tabler:users', kind: 'share' })
  }
  if (ctx.canExport) {
    items.push({ method: 'export', label: 'Export', description: 'Download a portable copy to import elsewhere.', group: 'edit', icon: 'tabler:download', kind: 'export' })
  }
  if (ctx.canDelete) {
    items.push({ method: 'delete', label: 'Delete', description: 'Stop it and remove its setup. This cannot be undone.', group: 'delete', icon: 'tabler:trash', kind: 'delete', danger: true })
  }

  return items
}

const GROUP_ORDER: ActionGroup[] = ['run', 'recovery', 'edit', 'delete']
const GROUP_LABEL: Record<ActionGroup, string> = {
  run: 'Run',
  recovery: 'Recovery',
  edit: 'Edit',
  delete: '',
}

export interface ActionGroupView { group: ActionGroup; label: string; items: ActionItem[] }

// Items grouped for display, in canonical order, skipping empty groups.
export function groupActionItems(items: ActionItem[]): ActionGroupView[] {
  return GROUP_ORDER
    .map(group => ({ group, label: GROUP_LABEL[group], items: items.filter(i => i.group === group) }))
    .filter(g => g.items.length > 0)
}

// The accessible name for an action control, stable across the row menu and the
// drawer so a name reads the same wherever the action appears.
export function actionAriaLabel(item: ActionItem, name: string): string {
  if (item.group === 'run') return `Run ${name} now`
  if (item.method === 'reconfigure') return `Edit ${name}`
  return `${item.label} ${name}`
}
